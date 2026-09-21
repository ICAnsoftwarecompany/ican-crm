# Campaign Center Architecture

## الهدف والحدود

`/campaigns` هو مركز الحملات الإعلانية متعددة المنصات. يختلف عن Outreach Campaigns (`/outreach-campaigns`): الأول يتعامل مع منصات الإعلان والحسابات الإعلانية، والثاني يرسل رسائل إلى جهات اتصال CRM. لا يجوز دمج النموذجين بسبب تشابه الاسم.

البنية الحالية توسّع النظام القائم ولا تنشئ HTTP client أو DataTable أو permission system جديدًا. كل طلب tenant يمر عبر `services/httpClient.js` ويحصل تلقائيًا على bearer token و`api_password`. لا يتصل المتصفح مباشرة بـMeta أو Google أو TikTok أو Snapchat.

## طبقات النظام

```text
pages/campaigns                 Route composition + workspace UI
        ↓
features/campaigns              Domain registry, context, hooks
        ↓
providers/<platform>            Provider adapter
        ↓
facebook-campaign/api           ICAN tenant API contracts
        ↓
services/httpClient             Tenant transport/authentication
```

- `config/platformRegistry.js`: مصدر الحقيقة للمنصات، الأيقونات، modules، capabilities، والـprovider.
- `config/campaignCapabilities.js`: أسماء capabilities وعناصر التنقل المشتركة.
- `providers/campaignProvider.js`: الشكل الافتراضي للـadapter. الدوال غير الموصولة تظل `null` و`configured=false`.
- `providers/meta/metaCampaignProvider.js`: يربط Meta بالدوال الفعلية فقط.
- `facebook-campaign/`: كل عقود Facebook Campaigns المأخوذة من Postman، مع hooks ومفاتيح cache.
- `context/CampaignCenterContext.jsx`: platform/account/provider الحالي للصفحات العامة.
- `pages/campaigns/components`: Sub Sidebar وHeader وجدول الحملات وحالات عدم التوفر.
- `pages/campaigns/pages`: Overview/Create/List/Analytics/Billing/Details العامة.

## Platform Registry وCapabilities

الـregistry لا يضع شروطًا من نوع `if (platform === 'meta')` داخل كل صفحة. تعريف المنصة يحمل:

- `id` ثابتًا لا يُترجم ولا يُرسل بدل backend values.
- `labelKey` للعرض بالعربية والإنجليزية.
- `icon`.
- `moduleKeys` الممكنة في بيانات الباقة.
- `capabilities`.
- `provider` adapter.

عناصر Sub Sidebar تُشتق من تقاطع capability مع permission. إضافة capability جديدة تبدأ من `CAMPAIGN_CAPABILITIES` ثم تُضاف لتعريف المنصة، وإلى `CAMPAIGN_NAV_ITEMS` فقط إذا كانت صفحة مشتركة في التنقل.

## Package وPermissions

المشروع لا يملك حتى الآن API مكتملًا للباقة أو route guards عامة. اتُّبع نفس سلوك `app/navigation`:

- إذا لم يرسل backend `user.modules` أو `user.permissions`، لا يختلق frontend قيودًا.
- إذا وُجد `user.modules`، تظهر المنصات التي يطابق أحد `moduleKeys` الخاص بها.
- إذا وُجد `user.permissions`، يظهر nav item فقط عند امتلاك permission، والوصول اليدوي للمسار يعرض Permission Required.
- إخفاء الواجهة ليس authorization. يجب أن يرفض backend أي طلب غير مصرح به.

تسلسل القرار:

```text
module/package → platform capability → user permission → navigation/page
```

## Routing

```text
/campaigns                              يعيد لآخر منصة متاحة
/campaigns/:platform                    Overview
/campaigns/:platform/create             Create
/campaigns/:platform/list               List
/campaigns/:platform/analytics          Analytics
/campaigns/:platform/billing            Billing
/campaigns/:platform/:campaignId        Details
```

تعريف route واحد يستخدم `:platform`، ولا تتكرر route definitions لكل provider. المسار غير الموجود أو غير المتاح في الباقة يعرض Feature Not Included. آخر منصة تُحفظ كتفضيل UI في `localStorage` تحت `ican-campaign-center-platform`.

## Account Context وحالة الاتصال

Meta يعيد استخدام `features/meta-integrations` للحصول على `is_connected`, `ad_accounts`, و`facebook_pages`. Account Selector يظهر عندما توجد حسابات ويرسل `ad_account_id` إلى query أو payload. إضافة provider جديد تحتاج adapter لحالة التكامل والحسابات، ولا يجب أن يجعل Sidebar استدعاءات API مباشرة.

الحالات المدعومة في UI: connected, disconnected, expired, needs attention, no account, no permission, feature not included, provider not configured, loading, error, empty، وsyncing.

## React Query وعزل Cache

مفاتيح Facebook تتضمن:

```text
campaign-center / tenant / meta / account / resource / filters
```

وبذلك لا تختلط منصتان أو حسابان أو tenantان. mutations تمسح prefix الخاص بـtenant وMeta فقط. لا تستخدم key عامة للحملات الجديدة.

## Facebook Campaign API

المجلد `facebook-campaign/api` يحتوي الدوال الموثقة:

- حملات: get, sync, create, campaign ad sets.
- Ad Sets: create, get, sync, ads.
- Ads: insights.
- Posts: list, engagement, comments.
- Sub Login: open, create invite, revoke, list, my invites.

Endpoint فتح Sub Login موجود على main server وليس tenant server؛ لذلك يتطلب `VITE_MAIN_SERVER_URL`. لا يُنشأ client ثانٍ، ويظل `httpClient` مسؤولًا عن bearer وapi password. لا تضع server tokens في env أو components.

## Campaign Builder

صفحة Create عامة وتستخدم provider capabilities. النسخة المتصلة حاليًا هي Meta بالحقول الموثقة فقط: `ad_account_id`, `page_id`, `campaign_name`, `objective`. القيم `OUTCOME_LEADS` و`OUTCOME_TRAFFIC` تظل backend enums بينما labels مترجمة. إضافة steps مستقبلية تكون config في provider (`steps`, fields, validation, payload mapper)، وليس حقول Meta داخل builder عام.

الصفحة wizard من 5 مراحل، أُعيد تصميمها (سبتمبر 2026، Phase 1 من إعادة تصميم أوسع مبنية على مواصفة UX محلية-أولًا مستقلة عن جاهزية الباك إند) لتقترب من سلوك Meta Ads Manager الحقيقي: هدف ODAX كامل (6 قيم)، تبديل Campaign Budget/Ad Set Budget، ودليل سياقي حي جنب الفورم. الشكل الحالي (`pages/campaigns/pages/CampaignCreatePage/`):

```text
CampaignCreatePage/
├── index.js                     تصدير barrel
├── CampaignCreatePage.jsx       يركّب useCampaignWizardState() + الـshell، وينادي create API عند النشر فقط
├── CreateWizardHeader.jsx       زر رجوع + اسم المنصة + Save Draft (محلي) + "تم الحفظ HH:mm"
├── CreateWizardStepper.jsx      شريط المراحل الخمس، يقرأ STAGES من state/wizardStages.js
├── CreateWizardFooter.jsx       Cancel / Save Draft / Continue أو Publish
├── state/                       طبقة الـstate المحلي بالكامل (useReducer، لا تعتمد على API)
│   ├── initialWizardState.js    الشكل الافتراضي الكامل (objective, campaign, adSets[], meta) — متوافق مسبقًا مع مراحل Phase 2/3
│   ├── wizardReducer.js         reducer نقي + أنواع الأكشن المستخدمة فعليًا في Phase 1 فقط
│   ├── wizardLocalStorage.js    حفظ/تحميل/مسح مسودة localStorage مُنسّخة بـtenant+platform+account، بنفس نمط _version في useLocalStorage
│   └── useCampaignWizardState.js الـhook: reducer + autosave مُؤجّل + منطق "عندك مسودة، تكمل ولا تبدأ من جديد؟"
├── components/                  مكوّنات محلية للـwizard فقط (مش shared/ ومش features/)
│   ├── CardOption.jsx           بطاقة اختيار واحدة (عمّمت نمط CampaignChannelStep الموجود في outreach-campaigns)
│   ├── ToggleMode.jsx           تبديل Advantage/يدوي كصفوف radio (نفس نمط ExportDialog.jsx)
│   ├── CampaignBudgetFields.jsx حقول الميزانية/الجدولة/الـBid، بـscope قابل لإعادة الاستخدام على مستوى الحملة أو الـAd Set لاحقًا
│   ├── GuidePanel.jsx           لوحة الدليل الدائمة (مش AppDrawer قابل للإغلاق) — تتغيّر حسب meta.focusedField
│   └── guideContent.js          خريطة صغيرة لحقول "الافتراضي" لكل مرحلة فقط؛ نصوص الدليل نفسها في campaigns.create.guide.* في الترجمة
└── steps/
    ├── ObjectiveStep.jsx        المرحلة 1 — 6 بطاقات ODAX (بدل 2 فقط قديمًا)
    ├── CampaignSetupStep.jsx    المرحلة 2 — الاسم، الصفحة (مؤقتًا هنا، انظر ملاحظة أدناه)، فئة الإعلان الخاصة، تبديل مستوى الميزانية
    ├── NotConfiguredStep.jsx    placeholder مشترك لمرحلتي Ad Sets/Ads — لسه بينتظر Phase 2/3
    └── ReviewStep.jsx           ملخص قراءة فقط، مُحدَّث ليقرأ من الـstate الجديد المتداخل
```

**ملاحظة مؤقتة (Phase 1):** حقل اختيار الصفحة (`page_id`) لسه موجود في `CampaignSetupStep` رغم إن التصميم المستهدف بيحطه على مستوى كل إعلان (Ad) في مرحلة `ads` — لأن مرحلة `ads` لسه مش موجودة، ومرحلة النشر (Publish) محتاجة `page_id` عشان تنادي `mutations.create` الحالية. هينقل لمكانه الصحيح لما مرحلة Ads تتبني (Phase 3).

**Save Draft بقى تخزين محلي حقيقي** (`localStorage`، مفتاح `ican-campaign-wizard-draft:{tenantId}:{platformId}:{accountId}`) — مش نداء API زي قبل كده. **Publish Now** لسه بينادي نفس `mutations.create` الموثقة (`ad_account_id`, `campaign_name`, `page_id`, `objective`) — أي بيانات Ad Set/Ad/Lead Form اللي الـwizard بيجمعها في مراحل لاحقة (Phase 2/3) بتتحفظ في المسودة المحلية بس، ومفيش عقد API لإرسالها لـMeta لحد دلوقتي؛ هذا موضّح صراحة في نص المراجعة (`campaigns.create.review.note`) عشان محدش يفتكر إن "تم النشر" يعني إن الـAd Sets والإعلانات اتبنت فعليًا.

مراحل تالية موثقة (لسه مبنيتش): Phase 2 = مرحلة Ad Sets الحقيقية (جمهور/مواضع)، Phase 3 = مرحلة Ads الحقيقية + Lead Form Builder الكامل، Phase 4 = إعادة بناء المراجعة (شجرة قابلة للطي + قائمة تحقق) وزر Schedule (هيبقى معطّل لحد ما عقد الجدولة يتأكد من الباك إند).

## صفحة تفاصيل الحملة (Campaign Details)

المسار `/campaigns/:platform/:campaignId` (`pages/campaigns/pages/CampaignDetailsPage/`) يعرض بيانات حملة واحدة عبر نظام مراحل (stages) شبيه بالـwizard لكن بدون تسلسل إجباري — كل مرحلة يمكن الوصول إليها مباشرة:

```text
CampaignDetailsPage/
├── index.js                        تصدير barrel
├── CampaignDetailsPage.jsx         يجلب الحملة (من نفس cache القائمة)، Ad Sets، insights المجموعة المختارة
├── CampaignPicker.jsx               dropdown مخصص لتبديل الحملة الحالية من نفس الصفحة (name + status + effective_status + objective + budget بجانب بعض لكل خيار)
├── StageNav.jsx                     شريط 4 مراحل: All Details → Campaign → Ad Set → Ad
├── AllDetailsSection.jsx            المرحلة الأولى — تركيب الثلاث مكونات التالية معًا في مكان واحد (بدون تكرار الكود)
├── CampaignOverviewSection.jsx      بيانات الحملة (status/objective/budget/spend/impressions/reach/ctr/results/dates)
├── AdSetsSection.jsx                بطاقات المجموعات الإعلانية القابلة للاختيار (targeting/budget_remaining/optimization_goal...)
├── AdPerformanceSection.jsx         أداء المجموعة المختارة (insights + Actions Breakdown + Cost per Action + Video Performance)
├── Metric.jsx / LatinValue.jsx / ActionList.jsx   عناصر عرض مشتركة صغيرة
```

نقاط مهمة:

- **لا يوجد كيان "Ad" منفصل فعليًا بعد.** الـendpoint الوحيد الموثق (`ads/{id}/insights`) يُستدعى بمعرّف Ad Set ويُعيد أداءً مجمّعًا على مستوى المجموعة الإعلانية (`adset_id`/`adset_name` داخل الرد نفسه) — لذلك مرحلة "Ad" تعرض هذا الأداء، وليس قائمة إعلانات/كرياتيف حقيقية منفصلة. لا تُخترع endpoints جديدة لهذا الغرض حتى تصل عقود فعلية.
- الاستجابة الخام للحملات متداخلة (`ad_accounts[].pages[].campaigns[].insights.data[0]`) وليست flat — `features/campaigns/facebook-campaign/utils/flattenFacebookCampaigns.js` يفرّدها لصف واحد لكل حملة (مع رفع insights لأعلى)، و`getCampaignResultCount()` يحدد رقم "Results" حسب `objective` الحملة (نفس منطق عمود Results في Facebook Ads Manager).
- `features/campaigns/facebook-campaign/utils/actionTypeLabels.js` يترجم قيم `action_type` الخام (تحتوي نقاطًا مثل `onsite_conversion.lead`، وهو ما يمنع استخدامها مباشرة كمفتاح i18next لأن `.` تُقرأ كفاصل تداخل) — أي `action_type` غير موثّق يُعرض humanized بدل كسر الترجمة.
- `pages/campaigns/utils/campaignFormatters.js` يجمّع تنسيق العملة/الأرقام/النسب/التاريخ المستخدم في هذه الصفحة وفي `CampaignListTable.jsx` (مصدر واحد بدل تكرار).
- `features/campaigns/facebook-campaign/hooks/useFacebookAdSets.js` يضيف `useFacebookAdSets`/`useFacebookAdSetInsights` بنفس نمط مفاتيح الـcache (`campaign-center/tenant/meta/account/...`).

## List وActions

القائمة تستخدم `shared/components/data-table`. الأعمدة العامة config-driven وتعرض القيم العائدة كما هي، مع locale-aware date formatting. Actions مثل pause/activate/edit/duplicate لا تظهر حتى تصل عقود API فعلية وتُضاف capability + permission + state predicate؛ لا تنشئ endpoints تخمينية.

## Analytics وCRM Attribution

الصفحة shell حاليًا وتعرض Not Configured لأن Postman المرسل لا يحتوي campaign analytics عامة. عند توفر API، يعرّف provider metrics والfilters والمappers. CRM attribution يجب أن يكون طبقة مستقلة تربط spend بـleads/qualified/opportunities/won/revenue، ولا تحسب أرقامًا وهمية من بيانات ناقصة.

## Billing وWallet

Billing shell عامة. `billing`, `wallet`, و`invoices` capabilities مستقلة؛ لا يُفترض أن كل منصة تدعم wallet. عند وصول API تُضاف queries ومكوّنات summary/transactions باستخدام DataTable.

## RTL/LTR وDark Mode وResponsive

- النصوص كلها في `locales/{ar,en}/campaigns.js`.
- layout يستخدم `border-e`, `ms`, `ps` واتجاه i18next للـchevrons.
- الأسطح والنصوص تستخدم CSS tokens: `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`.
- Desktop يعرض Sub Sidebar بجانب المحتوى. Mobile يخفيه داخل `AppDrawer` ويعرض زر menu في header.
- أسماء providers تبقى brands؛ القيم التقنية IDs/URLs تظهر كما يعيدها backend.

## إضافة LinkedIn Ads

1. أضف translations: `campaigns.platforms.linkedin` في اللغتين.
2. أضف `linkedinCampaignProvider` باستخدام `createCampaignProvider`; لا تضع API وهميًا.
3. بعد استلام العقود، أنشئ `providers/linkedin` أو `linkedin-campaign/api` يستعمل `httpClient`.
4. أضف تعريفًا واحدًا في `platformRegistry`:

```js
{
  id: 'linkedin',
  labelKey: 'campaigns.platforms.linkedin',
  icon: Linkedin,
  moduleKeys: ['campaigns.linkedin', 'linkedin-ads'],
  capabilities: [OVERVIEW, CREATE, LIST, ANALYTICS],
  provider: linkedinCampaignProvider,
}
```

5. اربط package feature في backend ليصل ضمن `user.modules`، وأضف permissions إلى المستخدم.
6. إذا كانت الصفحات العامة مناسبة، لا تعدّل router أو sidebar. إن احتاجت LinkedIn صفحة فريدة، أضف override إلى تعريف المنصة بدل نسخ Campaign Center.
7. أضف Query keys تشمل tenant/platform/account/resource/filters واختبارات mapper.
8. تحقّق AR/EN، RTL/LTR، light/dark، desktop/mobile، lint، i18n، tests، build.

## إضافة صفحة أوCapability

- صفحة لكل المنصات: أضف capability، nav config، route عامة واحدة، ومكوّن page يقرأ `useCampaignCenter()`.
- صفحة لمنصة واحدة: capability موجودة فقط في تعريف تلك المنصة، ويمكن provider override للصفحة.
- Action جديد: capability + permission + provider function + campaign-state predicate، ثم mutation مع invalidation scoped.
- API جديد: يوضع داخل provider owner، لا داخل page، ويحافظ على endpoint/payload/response كما وثقه backend.

## Naming وExtension Points

- Platform IDs وbackend enums: lowercase/technical ثابتة وغير مترجمة.
- React components: PascalCase.
- hooks: `useX`.
- API objects: `xApi`.
- translation keys: `campaigns.<surface>.<concept>`.
- provider override، metrics config، builder config، column config، action config هي نقاط التوسعة المستقبلية.

## العمل المتبقي

- Backend package/modules and permissions contracts موحدة.
- Google/TikTok/Snapchat providers وعقود connection/account.
- Meta analytics, billing, pause/activate/edit/duplicate endpoint.
- ~~Campaign details~~ — أصبحت متاحة جزئيًا: بيانات الحملة + Ad Sets + أداء (insights/actions/cost/video) عبر `CampaignDetailsPage/`. المتبقي فعليًا: عقد creatives حقيقي (صور/فيديو الإعلان نفسه)، leads/conversions المرتبطة بـCRM، وsync log.
- إعادة تصميم صفحة Create — Phase 1 (state layer + shell + Objective/Campaign Setup) مكتملة. Phase 2 (Ad Sets: جمهور/مواضع)، Phase 3 (Ads: creative + Lead Form Builder)، وPhase 4 (Review tree + validation + Schedule) لسه مبنيينش؛ `NotConfiguredStep` لسه بيغطي مرحلتي `adSets`/`ads` مؤقتًا. عقود Ad Set/Ad/Lead Form الحقيقية من الباك إند لسه مطلوبة عشان Publish يقدر يبعت بيانات المسودة الكاملة (مش الحملة بس).
- Visual QA مصادق عليه لكل أوضاع اللغة والثيم والموبايل.

## ملاحظة تشغيلية: تحويل ملف إلى فولدر أثناء عمل dev server

عند تحويل صفحة من ملف واحد (`X.jsx`) إلى فولدر بنفس الاسم (`X/index.js`) بينما Vite dev server يعمل بالفعل، لا يعيد Vite دائمًا تحليل (`resolve`) الاستيراد في الملف المستورِد (غالبًا `app/router/index.jsx`) تلقائيًا — لأن الملف المستورِد نفسه لم يتغيّر (الاستيراد أصلاً بدون امتداد). النتيجة request حقيقي لمسار الملف القديم المحذوف يرجع `index.html` (SPA fallback) بدل JS، وتظهر في المتصفح:

```
Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html".
```

هذا ليس خطأ في الكود ولا في tenant resolution — الإصلاح: لمس (`touch`) الملف المستورِد نفسه (مثلًا `app/router/index.jsx`) لإجبار Vite على إعادة تحليل استيراداته، أو إعادة تشغيل dev server بالكامل. تحقق دائمًا من التغيير عبر طلب مباشر لمسار الملف الجديد وملاحظة أن الاستيراد في الملف المستورِد أصبح يشير للمسار الصحيح، بدل الاكتفاء بتفريغ كاش المتصفح.
