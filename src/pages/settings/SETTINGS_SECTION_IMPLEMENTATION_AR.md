# توثيق تطوير قسم الإعدادات

آخر تحديث: 2026-09-17 (+03:00)

## الملخص

تم تحويل صفحة الإعدادات من صفحة واحدة بها تابات (Buttons + state) إلى قسم داخلي منظم له Layout خاص وSidebar فرعي، بنفس فكرة قسم العملاء (`/LeadsCenter`)، بحيث كل صفحة إعداد رئيسية أصبح لها مسار (route) مستقل وفولدر خاص بها.

تم الحفاظ على:

- الـ MainSidebar الرئيسي والـ Header.
- منطق جلب البيانات الحالي (React Query hooks) لكل من التعريفات والمستخدمين والتكاملات.
- رابط `/settings` في القائمة الجانبية الرئيسية كما هو.

## ما تم تنفيذه

1. إنشاء `SettingsLayout` كـ layout داخلي لقسم الإعدادات، يعرض Sidebar فرعي + `Outlet` للصفحة الحالية.
2. إنشاء `SettingsSidebar` كقائمة فرعية بعناصر: التعريفات، المستخدمون، التكاملات.
3. إنشاء `SettingsMobileSidebar` لعرض نفس القائمة داخل drawer على الموبايل والتابلت.
4. تحويل `/settings` إلى Nested Routes بدلاً من صفحة واحدة بها تابات محلية.
5. فصل كل تاب قديم إلى صفحة مستقلة لها فولدر خاص بها داخل `pages/`:
   - `pages/definitions/DefinitionsSettingsPage.jsx`
   - `pages/users/UsersSettingsPage.jsx`
   - `pages/integrations/IntegrationsSettingsPage.jsx`
6. داخل صفحة التكاملات، تم عمل تابات فرعية خاصة بها فقط (مش routes منفصلة):
   - **ميتا (Meta)**: التاب الافتراضي (أول تاب) — به زر "ربط حساب ميتا" وزر "تحديث الاتصال"، وعرض لصفحات فيسبوك المرتبطة.
   - **تكاملات أخرى**: نفس المحتوى العام القديم (قائمة التكاملات العامة من `useIntegrations`).
7. حذف `SettingsPage.jsx` القديمة بعد نقل محتواها بالكامل للصفحات الجديدة.
8. تحديث `src/app/router/index.jsx` ليستخدم `SettingsLayout` وصفحات الإعدادات الجديدة بدلاً من `SettingsPage`.

## هيكل الملفات

```
src/pages/settings/
  layout/
    SettingsLayout.jsx          # الـ layout + Outlet
    SettingsSidebar.jsx         # القائمة الجانبية لسطح المكتب
    SettingsMobileSidebar.jsx   # نفس القائمة كـ drawer للموبايل
  constants/
    settingsNavigation.js       # تعريف عناصر القائمة الجانبية
  pages/
    definitions/
      DefinitionsSettingsPage.jsx
    users/
      UsersSettingsPage.jsx
    integrations/
      IntegrationsSettingsPage.jsx      # التابات الداخلية: ميتا / تكاملات أخرى
      components/
        MetaIntegrationTab.jsx          # تاب ميتا: ربط الحساب + عرض الصفحات
        OtherIntegrationsTab.jsx        # تاب التكاملات العامة القديم
```

## المسارات النهائية

- `/settings` → تعرض تلقائيًا صفحة "التعريفات" (نفس محتوى `/settings/definitions`).
- `/settings/definitions`
- `/settings/users`
- `/settings/integrations` (تبدأ دائمًا بتاب "ميتا" كأول تاب)
- `/integrations/facebook/callback` → صفحة استقبال الرجوع من ميتا بعد الربط (راجع القسم التالي)

## Callback الرجوع من ميتا بعد الربط

الملف: `src/pages/integrations/FacebookCallbackPage.jsx`

بعد ما المستخدم يضغط "ربط حساب ميتا" في تاب ميتا، وييتم تحويله لفيسبوك لتسجيل الدخول والموافقة، الباك إند بيرجّع المتصفح لرابط من الشكل التالي (تينانت المستخدم + نفس المسار الثابت):

```text
https://{tenant}.{VITE_API_ROOT_DOMAIN}/integrations/facebook/callback?status=success&pages_saved=19&messenger_saved=7&whatsapp_saved=2#_=_
```

الصفحة بتعمل:

- تقرأ `status` من الـ query string (`success` أو أي حاجة تانية = فشل).
- تقرأ `pages_saved` / `messenger_saved` / `whatsapp_saved` وتعرضهم كأرقام سريعة عند النجاح فقط.
- تنضّف الـ hash artifact `#_=_` اللي فيسبوك بيضيفه تلقائيًا لروابط الـ OAuth.
- تعرض Toast نجاح أو فشل عبر `sonner`.
- تحوّل تلقائيًا بعد ثانيتين ونص لصفحة `/settings/integrations` (نفس تاب ميتا لأنه التاب الافتراضي)، مع زرار "الرجوع الآن" لتخطي العد التنازلي يدويًا.

المسار مضاف داخل نفس الـ Private Routes العادية في `src/app/router/index.jsx` (يحتاج تسجيل دخول موجود بالفعل، وهو متوفر لأن نفس المتصفح والجلسة اللي عمل الربط).

## تكامل ميتا (Meta) — كيف يعمل الربط

- الدوال المستخدمة من `src/features/meta-integrations/api/facebookMetaApi.js`:
  - `connect(tenant, params)` → يرجّع رابط تسجيل الدخول بحساب فيسبوك لبدء الربط (OAuth).
  - `getPages(tenant, params)` → يرجّع صفحات فيسبوك المرتبطة بالحساب، ويتم عرضها في تاب ميتا.
  - `refreshToken(tenant, params)` → تحديث بيانات الاتصال (Access Token) بعد الربط.
  - `getAssets(tenant, params)` → متاحة في الـ API جاهزة للاستخدام لاحقًا عند الحاجة لعرض أصول إضافية (Ad Accounts... إلخ).

- **معالجة رابط الربط (Connect Link):**
  الرابط الذي ترجعه `connect()` يُدمج قبل استخدامه مع متغير البيئة `VITE_API_ROOT_DOMAIN` (بنفس الطريقة المستخدمة في باقي المشروع لبناء روابط التينانت، مثل `resolveMessengerMediaUrl`)، وذلك عبر دالة جديدة:

  `src/features/meta-integrations/utils/metaConnectUrl.js`
  - `extractMetaConnectLink(response)`: تسحب الرابط من شكل الـ response القادم من الباك إند (تدعم أكثر من مفتاح محتمل: `link`, `url`, `redirect_url`, `connect_link`).
  - `resolveMetaConnectUrl(link, tenant)`: إذا كان الرابط رابطًا كاملاً (`http/https`) يتم استخدامه كما هو، وإلا يتم بناء الرابط الكامل بصيغة `scheme://{tenant}.{VITE_API_ROOT_DOMAIN}/{link}`.

- عند الضغط على "ربط حساب ميتا": يتم تحديد `tenant` الحالي من بيانات المستخدم المسجل دخوله (`resolveTenantId` من `services/tenantResolver.js`)، ثم استدعاء `connect`، ثم تحويل المتصفح (`window.location.href`) إلى الرابط النهائي بعد الدمج مع `VITE_API_ROOT_DOMAIN`.

- **ملاحظة فنية مهمة:** تم استخدام `facebookMetaApi` مباشرة مع `useQuery`/`useMutation` محليين داخل `MetaIntegrationTab.jsx`، بدلاً من المرور عبر `features/meta-integrations/hooks/useMetaIntegrations.js` أو الـ barrel file `index.js` الخاص بالـ feature. السبب: ملف `api/messengerMetaApi.js` في نفس الـ feature بالكامل معلّق (commented out) ولا يُصدّر أي شيء فعليًا (منطق الماسنجر الفعلي منقول بالفعل لـ `features/conversations`)، وأي استيراد يمر عبر `metaIntegrationsApi.js` كان يفشل عند الـ build بسبب استيراد `messengerMetaApi` غير موجود فعليًا. الاستيراد المباشر لـ `facebookMetaApi.js` تجنّب هذه المشكلة دون التأثير على أي كود آخر يعمل حاليًا بالمشروع.

## تصميم Sidebar الإعدادات

نفس تصميم Sidebar العملاء (`CustomersSidebar`) لتوحيد شكل الأقسام الداخلية بالنظام:

- الخلفية: `var(--surface)`.
- العرض عند الفتح: `260px`، وعند الغلق: `64px` (تظهر الأيقونات فقط).
- العنصر النشط: خلفية `var(--surface-2)` مع مؤشر جانبي صغير بلون العلامة `#00C2CB`.
- حالة الفتح/الغلق محفوظة في `localStorage` تحت مفتاح `settings-sidebar-collapsed`.
- على الموبايل/التابلت: نفس القائمة تظهر داخل drawer (`SettingsMobileSidebar`) بزر فتح أعلى الصفحة.
