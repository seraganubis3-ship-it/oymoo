# الدليل الشامل لرفع مشروع OYMO على سيرفر خاص (VPS) 🚀

هذا الدليل يغطي عملية الرفع من الصفر وحتى تشغيل المشروع بدومين خاص وشهادة أمان (HTTPS) على سيرفر بنظام Ubuntu (أو Debian).

---

## 📌 المتطلبات الأساسية
1. **سيرفر VPS**: بنظام تشغيل Ubuntu 22.04 أو 24.04.
2. **دومين (Domain)**: تم ربطه بـ IP السيرفر الخاص بك من خلال إعدادات الـ DNS (سجل A).
3. **مستودع GitHub**: المشروع مرفوع على حسابك في GitHub لتسهيل سحب الكود.

---

## الخطوة 1: الدخول للسيرفر وتحديثه
افتح الـ Terminal (أو CMD / PowerShell في ويندوز) وادخل على السيرفر الخاص بك:

```bash
ssh root@رقم_الاي_بي_بتاعك
```
بعد الدخول، قم بتحديث حزم النظام لتجنب أي مشاكل:
```bash
sudo apt update && sudo apt upgrade -y
```

---

## الخطوة 2: تثبيت البرامج الأساسية
سنقوم بتثبيت Node.js (الإصدار 20)، Nginx (خادم الويب)، و Git.

```bash
# تثبيت Node.js (إصدار 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# تثبيت PM2 لإبقاء التطبيق يعمل في الخلفية حتى لو أغلقت الشاشة
sudo npm install -g pm2
```

---

## الخطوة 3: سحب كود المشروع للسيرفر
اذهب إلى مسار الويب الافتراضي واسحب المشروع من GitHub:

```bash
cd /var/www
# استبدل الرابط برابط مستودعك الفعلي
git clone https://github.com/حسابك/oymo.git oymo
cd oymo
```

---

## الخطوة 4: إعداد المتغيرات البيئية (.env)
انسخ ملف الإعدادات وقم بتعديله ليناسب بيئة الإنتاج (Production):

```bash
cp .env.local .env
nano .env
```
ستفتح لك شاشة التعديل (Nano). تأكد من إضافة وتعديل المتغيرات التالية:
```ini
# قاعدة البيانات (استخدم رابط Neon.tech الخاص بك)
DATABASE_URL="postgres://user:pass@ep-....neon.tech/neondb?sslmode=require"

# كلمات سر التشفير (اكتب حروف وأرقام عشوائية طويلة)
JWT_USER_SECRET="your-very-long-user-secret-key-here"
JWT_ADMIN_SECRET="your-very-long-admin-secret-key-here"
JWT_EXPIRES_IN="30d"

# إعدادات Backblaze لتخزين الصور
B2_ENDPOINT="https://s3.us-east-005.backblazeb2.com"
B2_REGION="us-east-005"
B2_BUCKET_NAME="اسم_البوكت"
B2_ACCESS_KEY_ID="المفتاح"
B2_SECRET_ACCESS_KEY="الرقم_السري"

# رابط موقعك الأساسي
NEXT_PUBLIC_BASE_URL="https://oymo.com"
NEXT_PUBLIC_APP_URL="https://oymo.com"
```
*(لحفظ الملف في Nano: اضغط `Ctrl + O` ثم `Enter`، وللخروج اضغط `Ctrl + X`)*

---

## الخطوة 5: تثبيت الحزم وقاعدة البيانات
```bash
# تثبيت حزم النود
npm install

# توليد Prisma Client
npx prisma generate

# رفع هيكل قاعدة البيانات لـ Neon
npx prisma db push

# (اختياري) إضافة الإعدادات الأساسية لقاعدة البيانات لأول مرة فقط
npx prisma db seed
```

---

## الخطوة 6: بناء المشروع (Build)
قم بعمل Build لنسخة الإنتاج من Next.js:
```bash
npm run build
```

---

## الخطوة 7: تشغيل المشروع باستخدام PM2
لكي يعمل المشروع كخدمة في الخلفية:
```bash
# تشغيل المشروع
pm2 start npm --name "oymo" -- start

# حفظ الإعدادات لتعمل تلقائياً عند إعادة تشغيل السيرفر
pm2 save
pm2 startup
```
*(ملاحظة: أمر `pm2 startup` سيطبع لك أمراً طويلاً يبدأ بـ `sudo env PATH...` في الشاشة. قم بنسخه ولصقه واضغط Enter لتفعيل التشغيل التلقائي)*.

---

## الخطوة 8: إعداد Nginx كـ Reverse Proxy
الآن المشروع يعمل على البورت `3000`. سنستخدم Nginx لاستقبال الزوار من البورت `80` وتحويلهم للمشروع:

افتح إعدادات Nginx:
```bash
sudo nano /etc/nginx/sites-available/default
```
امسح كل محتوى الملف، وضع الكود التالي (مع استبدال `oymo.com` بدومينك الحقيقي):
```nginx
server {
    listen 80;
    server_name oymo.com www.oymo.com; # ضع الدومين الخاص بك هنا

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
احفظ الملف واخرج (`Ctrl + O`, `Enter`, `Ctrl + X`).
ثم أعد تشغيل Nginx للتأكد من عدم وجود أخطاء:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## الخطوة 9: تأمين الموقع بشهادة SSL مجانية (HTTPS)
لجعل الموقع آمن برابط `https://`:
```bash
# تثبيت حزمة Certbot
sudo apt install certbot python3-certbot-nginx -y

# استخراج وتثبيت الشهادة (استبدل الدومين بالخاص بك)
sudo certbot --nginx -d oymo.com -d www.oymo.com
```
*سيطلب منك إدخال بريدك الإلكتروني، ثم الموافقة على الشروط (اضغط Y). سيقوم Certbot بتعديل إعدادات Nginx تلقائياً لتفعيل الـ HTTPS.*

---

## 🔄 كيفية تحديث المشروع مستقبلاً
عندما تقوم بعمل تعديلات على الكود في GitHub وتريد تحديث السيرفر، نفذ هذه الأوامر فقط:
```bash
cd /var/www/oymo
git pull origin master
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart oymo
```

---
**🎉 مبروك! المشروع الآن يعمل بالكامل على خادمك الخاص وجاهز للإنتاج.**
