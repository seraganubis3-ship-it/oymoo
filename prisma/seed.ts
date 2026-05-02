import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Super Admin ────────────────────────────────────────────────────────────
  const superAdmin = await prisma.admin.upsert({
    where: { phone: '0500000000' },
    update: {},
    create: {
      phone: '0500000000',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'Super Admin',
      role: 'super_admin',
    },
  })
  console.log('✅ Super admin created')

  // ─── AppSettings ────────────────────────────────────────────────────────────
  const settings = [
    // ── التطبيق (app) ──────────────────────────────────────────────────────
    { key: 'app_name',                    label: 'اسم التطبيق',                                      type: 'text',     section: 'التطبيق',          value: 'OYMO' },
    { key: 'app_tagline',                 label: 'الشعار الرئيسي',                                   type: 'text',     section: 'التطبيق',          value: 'تابعي رحلتك لإزالة الشعر بالليزر' },
    { key: 'app_badge_text',              label: 'نص الشارة السفلية',                                type: 'text',     section: 'التطبيق',          value: 'مبني على ضمان SFDA' },
    { key: 'maintenance_mode',            label: 'وضع الصيانة',                                      type: 'toggle',   section: 'التطبيق',          value: 'false' },
    { key: 'maintenance_message',         label: 'رسالة الصيانة',                                    type: 'textarea', section: 'التطبيق',          value: 'الموقع تحت الصيانة، سنعود قريباً' },
    { key: 'allow_new_registrations',     label: 'السماح بتسجيل مستخدمات جديدات',                   type: 'toggle',   section: 'التطبيق',          value: 'true' },
    { key: 'registration_closed_message', label: 'رسالة إغلاق التسجيل',                             type: 'textarea', section: 'التطبيق',          value: 'التسجيل مغلق مؤقتاً، تواصلي معنا' },

    // ── صفحة الدخول (login) ────────────────────────────────────────────────
    { key: 'login_title',                 label: 'عنوان صفحة الدخول',                               type: 'text',     section: 'صفحة الدخول',      value: 'أهلاً بيكِ 👋' },
    { key: 'login_subtitle',              label: 'وصف صفحة الدخول',                                 type: 'text',     section: 'صفحة الدخول',      value: 'سجّلي دخولك لمتابعة رحلتك' },
    { key: 'login_phone_label',           label: 'تسمية حقل الجوال',                                type: 'text',     section: 'صفحة الدخول',      value: 'رقم الجوال' },
    { key: 'login_phone_placeholder',     label: 'placeholder الجوال',                              type: 'text',     section: 'صفحة الدخول',      value: '05XXXXXXXX' },
    { key: 'login_password_label',        label: 'تسمية كلمة المرور',                               type: 'text',     section: 'صفحة الدخول',      value: 'كلمة المرور' },
    { key: 'login_button_text',           label: 'نص زر الدخول',                                    type: 'text',     section: 'صفحة الدخول',      value: 'تسجيل الدخول' },
    { key: 'login_wrong_credentials',     label: 'رسالة بيانات خاطئة',                              type: 'text',     section: 'صفحة الدخول',      value: 'رقم الجوال أو كلمة المرور غير صحيحة' },
    { key: 'login_blocked_message',       label: 'رسالة الحساب المحظور',                            type: 'text',     section: 'صفحة الدخول',      value: 'حسابك موقوف، تواصلي مع الإدارة' },

    // ── الصفحة الرئيسية (landing) ──────────────────────────────────────────
    { key: 'landing_cta_button',          label: 'نص زر البداية',                                   type: 'text',     section: 'الصفحة الرئيسية', value: 'ابدئي رحلتك الآن 🚀' },
    { key: 'landing_sessions_text',       label: 'نص الجلسات',                                      type: 'text',     section: 'الصفحة الرئيسية', value: 'جلسة من التحول' },

    // ── صفحة الإعداد (setup) ───────────────────────────────────────────────
    { key: 'setup_title',                 label: 'عنوان صفحة الإعداد',                              type: 'text',     section: 'صفحة الإعداد',    value: 'إعداد ملفك 🌟' },
    { key: 'setup_subtitle',              label: 'وصف صفحة الإعداد',                                type: 'text',     section: 'صفحة الإعداد',    value: 'خطوة واحدة وتبدأ رحلتك' },
    { key: 'setup_button_text',           label: 'نص زر الإعداد',                                   type: 'text',     section: 'صفحة الإعداد',    value: 'ابدئي رحلة التحول ✨' },

    // ── لوحة المستخدمة (dashboard) ─────────────────────────────────────────
    { key: 'dashboard_progress_title',    label: 'عنوان التقدم',                                    type: 'text',     section: 'لوحة المستخدمة',  value: 'تقدمك' },
    { key: 'dashboard_next_title',        label: 'عنوان الموعد القادم',                             type: 'text',     section: 'لوحة المستخدمة',  value: 'موعدك القادم 📅' },
    { key: 'dashboard_schedule_title',    label: 'عنوان الجدول',                                    type: 'text',     section: 'لوحة المستخدمة',  value: 'جدول جلساتك 📋' },
    { key: 'dashboard_complete_btn',      label: 'زر إتمام الجلسة',                                 type: 'text',     section: 'لوحة المستخدمة',  value: 'تمييز كمكتملة ✅' },
    { key: 'dashboard_upload_btn',        label: 'زر رفع الصورة',                                   type: 'text',     section: 'لوحة المستخدمة',  value: 'أضيفي صورة الجلسة 📸' },
    { key: 'dashboard_locked_text',       label: 'نص الجلسات المقفلة',                              type: 'text',     section: 'لوحة المستخدمة',  value: 'ستُفتح في موعدها' },
    { key: 'dashboard_greeting_prefix',   label: 'بادئة التحية',                                    type: 'text',     section: 'لوحة المستخدمة',  value: 'أهلاً' },
    { key: 'dashboard_challenge_text',    label: 'نص تحدي الجلسة',                                  type: 'text',     section: 'لوحة المستخدمة',  value: 'لا تفوتي التحدي' },

    // ── رسائل التحفيز (motivation) ─────────────────────────────────────────
    { key: 'motivational_messages',       label: 'الرسائل التحفيزية (كل رسالة في سطر)',             type: 'textarea', section: 'رسائل التحفيز',   value: 'أنتِ أقوى مما تتخيلين 💪\nكل جلسة خطوة نحو نسخة أجمل منك ✨\nالثبات هو سر التحول 🌟\nرحلتك تستحق كل لحظة انتظار 🦋\nجمالك في طريقه إليكِ 💛\nاستمري، النتائج قادمة 🌸\nأنتِ بطلة هذه الرحلة 👑\nالتغيير يبدأ بقرار واحد اتخذتِه 🚀\nكل جلسة تقربك من حلمك ⭐\nفخورون بك في كل خطوة 🎉' },

    // ── حالات التقدم (progress_messages) ──────────────────────────────────
    { key: 'progress_msg_0',              label: 'رسالة 0 جلسات',                                   type: 'text',     section: 'حالات التقدم',    value: 'رحلتك بدأت! استعدي للتحول 🚀' },
    { key: 'progress_msg_low',            label: 'رسالة 1-33%',                                     type: 'text',     section: 'حالات التقدم',    value: 'بداية رائعة، استمري! 💪' },
    { key: 'progress_msg_mid',            label: 'رسالة 34-66%',                                    type: 'text',     section: 'حالات التقدم',    value: 'في المنتصف، أنتِ بطلة! 🌟' },
    { key: 'progress_msg_high',           label: 'رسالة 67-99%',                                    type: 'text',     section: 'حالات التقدم',    value: 'تقريباً وصلتِ! 🎉' },
    { key: 'progress_msg_done',           label: 'رسالة 100%',                                      type: 'text',     section: 'حالات التقدم',    value: 'أتممتِ رحلتك! مبروك! 🦋' },

    // ── إعدادات الجلسات (sessions) ─────────────────────────────────────────
    { key: 'total_sessions',                 label: 'عدد الجلسات الإجمالي',                            type: 'number',   section: 'إعدادات الجلسات', value: '28' },
    { key: 'session_interval_weeks',          label: 'الفترة بين كل جلسة (أسبوع)',                      type: 'number',   section: 'إعدادات الجلسات', value: '4' },
    { key: 'challenge_failed_delete_days',    label: 'أيام قبل حذف حساب خسر التحدي',                   type: 'number',   section: 'إعدادات الجلسات', value: '7' },
    { key: 'challenge_failed_warning_msg',    label: 'رسالة الخسارة للمستخدمة',                         type: 'textarea', section: 'إعدادات الجلسات', value: 'للأسف خسرت التحدي 💔\nلم يتم رفع صورة في الموعد المحدد.\nسيُحذف حسابك خلال الأيام القادمة.' },

    // ── كلمات المرور (passwords) ───────────────────────────────────────────
    { key: 'password_min_length',         label: 'الحد الأدنى لطول كلمة المرور',                    type: 'number',   section: 'كلمات المرور',    value: '8' },
  ]

  for (const s of settings) {
    await prisma.appSettings.upsert({
      where: { key: s.key },
      update: { value: s.value, label: s.label, type: s.type, section: s.section },
      create: s,
    })
  }
  console.log(`✅ Seeded ${settings.length} AppSettings`)
  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
