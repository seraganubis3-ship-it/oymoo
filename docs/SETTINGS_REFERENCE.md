# Settings (CMS) Reference

OYMO includes a dynamic Content Management System (CMS) stored in the `AppSettings` database table. These settings control the text, behavior, and configurations of the application without requiring code changes.

## 1. التطبيق (App General)

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `app_name` | text | OYMO | The name of the application displayed in headers and titles. |
| `app_tagline` | text | تابعي رحلتك لإزالة الشعر بالليزر | The subtitle/tagline shown under the app name. |
| `app_badge_text` | text | مبني على ضمان SFDA | The badge text shown at the bottom of the landing page. |
| `maintenance_mode` | toggle | false | If true, redirects all non-admin routes to `/maintenance`. |
| `maintenance_message` | textarea | الموقع تحت الصيانة، سنعود قريباً | The message displayed on the maintenance page. |
| `allow_new_registrations` | toggle | true | If false, prevents new users from signing up. |
| `registration_closed_message`| textarea | التسجيل مغلق مؤقتاً، تواصلي معنا | The message displayed when registrations are disabled. |

## 2. صفحة الدخول (Login Page)

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `login_title` | text | أهلاً بيكِ 👋 | Title of the login page. |
| `login_subtitle` | text | سجّلي دخولك لمتابعة رحلتك | Subtitle of the login page. |
| `login_phone_label` | text | رقم الجوال | The label for the phone input field. |
| `login_phone_placeholder` | text | 05XXXXXXXX | Placeholder text for the phone input. |
| `login_password_label` | text | كلمة المرور | The label for the password input field. |
| `login_button_text` | text | تسجيل الدخول | The text inside the login submit button. |
| `login_wrong_credentials` | text | رقم الجوال أو كلمة المرور غير صحيحة | Error message for invalid logins. |
| `login_blocked_message` | text | حسابك موقوف، تواصلي مع الإدارة | Error message when a blocked user attempts to log in. |

## 3. الصفحة الرئيسية (Landing Page)

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `landing_cta_button` | text | ابدئي رحلتك الآن 🚀 | The text inside the call-to-action button. |
| `landing_sessions_text` | text | جلسة من التحول | Text displayed next to the total session count on the landing page. |

## 4. صفحة الإعداد (Setup Profile)

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `setup_title` | text | إعداد ملفك 🌟 | Title of the setup profile page for new users. |
| `setup_subtitle` | text | خطوة واحدة وتبدأ رحلتك | Subtitle of the setup page. |
| `setup_button_text` | text | ابدئي رحلة التحول ✨ | Submit button text on the setup page. |

## 5. لوحة المستخدمة (Dashboard)

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `dashboard_progress_title` | text | تقدمك | Title of the progress section. |
| `dashboard_next_title` | text | موعدك القادم 📅 | Title for the next scheduled session. |
| `dashboard_schedule_title` | text | جدول جلساتك 📋 | Title for the main grid of sessions. |
| `dashboard_complete_btn` | text | تمييز كمكتملة ✅ | Text for the manual completion button (if enabled). |
| `dashboard_upload_btn` | text | أضيفي صورة الجلسة 📸 | Button text for uploading a session photo. |
| `dashboard_locked_text` | text | ستُفتح في موعدها | Text shown on a session card before its scheduled date arrives. |
| `dashboard_greeting_prefix`| text | أهلاً | Greeting prefix before the user's name (e.g., "أهلاً Sarah"). |
| `dashboard_challenge_text` | text | لا تفوتي التحدي | Motivational micro-copy in the dashboard header. |

## 6. رسائل التحفيز (Motivation)

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `motivational_messages` | textarea | (Multiple lines) | A newline-separated list of motivational quotes. The system picks one at random to display on the dashboard on every refresh. |

## 7. حالات التقدم (Progress Stages)

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `progress_msg_0` | text | رحلتك بدأت! استعدي للتحول 🚀 | Message shown when the user has 0 completed sessions. |
| `progress_msg_low` | text | بداية رائعة، استمري! 💪 | Message shown when progress is between 1% and 33%. |
| `progress_msg_mid` | text | في المنتصف، أنتِ بطلة! 🌟 | Message shown when progress is between 34% and 66%. |
| `progress_msg_high` | text | تقريباً وصلتِ! 🎉 | Message shown when progress is between 67% and 99%. |
| `progress_msg_done` | text | أتممتِ رحلتك! مبروك! 🦋 | Message shown when 100% of sessions are completed. |

## 8. إعدادات الجلسات (Session Config)

*Note: Changes to these settings only affect **newly created** profiles. Existing users' schedules are not modified unless an admin clicks "Recalculate Sessions" for that specific user.*

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `total_sessions` | number | 28 | The total number of sessions generated for a new user. |
| `session_interval_weeks` | number | 4 | The number of weeks between each scheduled session. |

## 9. كلمات المرور (Passwords)

| Key | Type | Default Value | Description |
| --- | --- | --- | --- |
| `password_min_length` | number | 8 | The minimum character length required for user passwords. |
