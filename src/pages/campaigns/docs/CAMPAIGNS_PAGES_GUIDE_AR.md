# دليل فولدر `pages/campaigns`

هذا الملف دليل عملي لكل ملف داخل `src/pages/campaigns/` تحديدًا — أي "أين أجد كذا ولماذا هو هنا". القواعد المعمارية الأعمق (Provider pattern، تسلسل القرار module→capability→permission، مفاتيح React Query، خطوات إضافة منصة جديدة...) موثّقة في `src/features/campaigns/docs/CAMPAIGN_CENTER_ARCHITECTURE_AR.md` ولا تُكرَّر هنا بالتفصيل — هذا الملف يشير إليها عند الحاجة بدل نسخها.

تذكير سريع: `/campaigns` = مركز الحملات الإعلانية (Meta/Google/TikTok/Snapchat). هذا **مختلف تمامًا** عن Outreach Campaigns (`/outreach-campaigns`, `src/pages/outreach-campaigns/`) الذي يرسل رسائل لجهات اتصال CRM. لا تخلط بين المجلدين رغم تشابه الاسم.

## البنية الكاملة

```text
pages/campaigns/
├── CampaignsPage.jsx                    الـ shell العام: Sub Sidebar + Header + Outlet + Mobile Drawer
├── docs/
│   └── CAMPAIGNS_PAGES_GUIDE_AR.md      (هذا الملف)
├── components/
│   ├── CampaignSubSidebar.jsx           قائمة المنصات + عناصر التنقل + حالة الاتصال لكل منصة
│   ├── CampaignCenterHeader.jsx         شريط علوي: أيقونة المنصة + حالة الاتصال + اختيار الحساب الإعلاني + Sync
│   ├── CampaignUnavailableState.jsx     حالات عدم التوفر المشتركة (disconnected/permission/package/unavailable)
│   ├── CampaignPageHeading.jsx          عنوان + وصف + actions موحّدة لكل صفحة فرعية
│   └── CampaignListTable.jsx            جدول الحملات (DataTable) المستخدم في Overview وList
├── pages/
│   ├── CampaignOverviewPage.jsx         بطاقات مقاييس + أحدث 10 حملات
│   ├── CampaignCreatePage/              wizard إنشاء حملة من 5 مراحل — تفاصيله في CAMPAIGN_CENTER_ARCHITECTURE_AR.md
│   ├── CampaignListPage.jsx             كل الحملات (DataTable كامل + Sync)
│   ├── CampaignAnalyticsPage.jsx        shell فقط — "Not configured" لحين توفر عقد analytics
│   ├── CampaignBillingPage.jsx          shell فقط — "Not configured" لحين توفر عقد billing
│   └── CampaignDetailsPage/             صفحة حملة واحدة بنظام 4 مراحل — تفاصيله في CAMPAIGN_CENTER_ARCHITECTURE_AR.md
└── utils/
    └── campaignFormatters.js            تنسيق موحّد للعملة/الأرقام/النسب/التاريخ (locale-aware)
```

## شرح كل ملف

### `CampaignsPage.jsx`
نقطة الدخول لكل مسارات `/campaigns/*`. تحل الـ platform الحالية من الـ URL param، تجلب تكاملات Meta (`useFacebookIntegrations`) لتحديد `connectionStatus`، وتبني كائن `context` واحد (`{ tenantId, platform, provider, accountId, accounts, connectionStatus, integrations, permissions }`) يُمرَّر عبر `CampaignCenterProvider` لكل الصفحات الفرعية عن طريق `useCampaignCenter()`. أي صفحة تحت `pages/campaigns/pages/` تعتمد على هذا الـ context بدل جلب البيانات بنفسها من جديد.

تعرض أيضًا: Sub Sidebar (ديسكتوب) أو `AppDrawer` (موبايل)، و`CampaignCenterHeader` أعلى المحتوى. التوجيه غير المتاح في الباقة أو بدون صلاحية يُعرض عبر `CampaignUnavailableState` بدل تخطي الفحص.

### `components/CampaignSubSidebar.jsx`
قائمة كل المنصات المرئية (بعد فلترة module/permission)، كل منصة قابلة للطي وتعرض عناصر تنقلها (`CAMPAIGN_NAV_ITEMS` المفلترة بـ capability/permission). نقطة ملوّنة صغيرة بجانب كل منصة تعكس `connectionByPlatform` (أخضر = متصل، أصفر = منتهي/يحتاج مراجعة، رمادي = غير متصل). يدعم collapsed mode (أيقونات فقط) عبر `onToggleCollapse`.

### `components/CampaignCenterHeader.jsx`
شريط علوي ثابت: زر فتح القائمة (موبايل فقط)، أيقونة + اسم المنصة + Badge حالة الاتصال، ثم (إن وُجدت حسابات) selector للحساب الإعلاني، وزر Sync اختياري (`showSync`). هذا الشريط **عام لكل صفحات campaigns** — لا تضِف إليه أي منطق خاص بصفحة واحدة (مثل اختيار حملة)، لأنه يظهر أيضًا في Overview/List/Analytics/Billing حيث "الحملة الحالية" مفهوم غير موجود.

### `components/CampaignUnavailableState.jsx`
مكوّن `EmptyState` مُعاد استخدامه لأربع حالات: `unavailable` (provider غير مهيأ)، `disconnected` (يحتاج ربط من التكاملات، مع زر ينقل لصفحة Integrations)، `permission` (لا يملك صلاحية)، `package` (غير مشمول في الباقة). كل صفحة تحت `pages/campaigns/pages/` تبدأ بنفس فحص `provider.configured` / `connectionStatus` وتُرجع هذا المكوّن مبكرًا بدل عرض محتوى فارغ أو خاطئ.

### `components/CampaignPageHeading.jsx`
`title` + `description` اختياري + `actions` اختيارية (أزرار على اليمين/اليسار حسب الاتجاه) — تُستخدم في أعلى كل صفحة فرعية للحفاظ على تناسق العناوين.

### `components/CampaignListTable.jsx`
`DataTable` جاهز لعرض مصفوفة حملات مُفرَّدة (flat) — الأعمدة: الحملة، الصفحة، المنصة، الحالة، الهدف، الميزانية، الإنفاق، مرات الظهور، الوصول، CTR، Results (محسوبة عبر `getCampaignResultCount`)، تاريخ البداية/النهاية، آخر مزامنة. يُستخدم في `CampaignOverviewPage` (أول 10 حملات) و`CampaignListPage` (الكل مع فلاتر/تصدير). كل التنسيق الرقمي يمر عبر `utils/campaignFormatters.js`.

### `pages/CampaignOverviewPage.jsx`
بطاقات مقاييس (إجمالي الحملات، الحملات النشطة، الإنفاق — Not available حاليًا، Results — Not available حاليًا) + جدول أحدث 10 حملات + أزرار Sync وCreate Campaign.

### `pages/CampaignCreatePage/`
Wizard من 5 مراحل (Campaign → Ad Set → Audience → Creative → Review). التفاصيل الكاملة (بنية الملفات، لماذا 3 من 5 مراحل placeholder، لماذا Save Draft = نفس API الإنشاء) في قسم "Campaign Builder" بملف `CAMPAIGN_CENTER_ARCHITECTURE_AR.md`.

### `pages/CampaignListPage.jsx`
نفس `CampaignListTable` لكن بكل الحملات (بدون قطع عند 10)، مع زر Sync، ويفتح `CampaignDetailsPage` عند الضغط على صف.

### `pages/CampaignAnalyticsPage.jsx` و `pages/CampaignBillingPage.jsx`
Shells فقط — كل منهما يعرض `EmptyState` بحالة `campaigns.states.notConfigured` لأن لا يوجد عقد API موثّق لأي منهما بعد. **لا تُضِف بيانات أو أرقامًا افتراضية هنا** حتى يصل العقد الفعلي من الباك إند — هذا قرار معماري متعمد موثّق في الملف الأكبر.

### `pages/CampaignDetailsPage/`
صفحة حملة واحدة بنظام 4 مراحل (All Details → Campaign → Ad Set → Ad) + campaign picker لتبديل الحملة من نفس الصفحة. التفاصيل الكاملة في قسم "صفحة تفاصيل الحملة" بملف `CAMPAIGN_CENTER_ARCHITECTURE_AR.md`.

### `utils/campaignFormatters.js`
مصدر واحد لـ: `resolveLocale(language)` (يحوّل لغة i18next إلى locale لـ `Intl`)، `formatDate`، `formatNumber`، `formatPercent`، `formatDecimal`، `formatCurrencyValue`. مستخدم في `CampaignListTable.jsx` وكل مكونات `CampaignDetailsPage/`. أي تنسيق رقم/عملة/تاريخ جديد في هذا الفولدر يجب أن يمر من هنا بدل كتابة `toLocaleString`/`Intl.NumberFormat` من جديد في كل ملف — هذا هو السبب الذي بسببه ظهرت (وانحلّت) أكثر من علّة "عملة ثابتة بلغة `ar-EG` بغض النظر عن لغة التطبيق" في هذا الفولدر تحديدًا.

## الترجمة (i18n)

كل النصوص في `src/locales/{ar,en}/campaigns.js` تحت namespace واحد `common.campaigns` (يُستدعى بـ `t('campaigns.<surface>.<concept>')`). لا نصوص مكتوبة مباشرة في JSX هنا. أمثلة على الـ namespaces المستخدمة فعليًا: `campaigns.center.*` (الـheader/sidebar)، `campaigns.states.*` (حالات عدم التوفر/غير مهيأ)، `campaigns.columns.*` (أعمدة الجدول)، `campaigns.create.*` (wizard الإنشاء)، `campaigns.details.*` / `campaigns.adSet.*` / `campaigns.insights.*` / `campaigns.video.*` / `campaigns.actionTypes.*` (صفحة التفاصيل).

قاعدة القيم التقنية: `platform.id`، `campaign.status`, `campaign.objective`, `adSet.optimization_goal`, `adSet.billing_event` كلها **enums خام من الباك إند ولا تُترجم** — فقط الـ label المجاور لها (مثل "Status:") هو المترجم. هذا يطابق ما تعيده Meta بالضبط، ويمنع اختلاف قيمة تُرسل للـ API عن القيمة المعروضة.

## Dark Mode و RTL

- لا ألوان ثابتة hex إلا لهوية العلامة (`#00C2CB` تركواز ICAN، أيقونات المنصات). كل سطح/نص يستخدم CSS tokens: `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--text-light`, `--brand-bg`.
- الاتجاه: `border-e`/`ms`/`ps` بدل `border-right`/`ml`/`mr` بشكل صريح، والـ chevrons تُختار حسب `i18n.dir() === 'rtl'` (مثال: `CampaignSubSidebar.jsx`, `CreateWizardHeader.jsx`).
- الأرقام/العملات/التواريخ تُعرض دائمًا بـ `dir="ltr"` داخل نص RTL عام (عبر `LatinValue` في `CampaignDetailsPage/` أو `dir="ltr"` مباشرة في `CampaignListTable.jsx`) حتى لا تنقلب الأرقام بصريًا.

## مرجع سريع: "عايز أعدّل كذا فين؟"

| عايز تعدّل | الملف |
| --- | --- |
| القائمة الجانبية / ترتيب المنصات | `components/CampaignSubSidebar.jsx` + `features/campaigns/config/platformRegistry.js` |
| شريط الحساب الإعلاني العلوي | `components/CampaignCenterHeader.jsx` |
| أعمدة جدول الحملات | `components/CampaignListTable.jsx` |
| حساب "Results" حسب الـ objective | `features/campaigns/facebook-campaign/utils/flattenFacebookCampaigns.js` (`getCampaignResultCount`) |
| تسمية أنواع الـ actions (`action_type`) | `features/campaigns/facebook-campaign/utils/actionTypeLabels.js` |
| خطوات إنشاء حملة | `pages/CampaignCreatePage/` |
| مراحل صفحة تفاصيل حملة | `pages/CampaignDetailsPage/` |
| تنسيق عملة/رقم/تاريخ | `utils/campaignFormatters.js` |
| نصوص عربي/إنجليزي | `src/locales/{ar,en}/campaigns.js` |
| قواعد معمارية أعمق (provider جديد، permissions، cache keys) | `features/campaigns/docs/CAMPAIGN_CENTER_ARCHITECTURE_AR.md` |
