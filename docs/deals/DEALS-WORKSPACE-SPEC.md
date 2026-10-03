# الصفقات ومساحة عمل الصفقة (Deals Workspace) — المواصفة الكاملة

> **Documentation update:** 2026-10-03 23:32 (Africa/Cairo) — الملف اتعمل مع إعادة بناء الجزء بالكامل: هب الصفقات، مساحة عمل
> لكل صفقة (14 صفحة)، الكسب والخسارة والعقود، الفريق وتقسيمه، الاجتماعات والمكالمات، المهام وقائمة المهام، التقويم،
> التقارير، الأتمتة، الذكاء الاصطناعي، الإعدادات، والعقد المطلوب من الباك إند.

الملف ده بيشرح جزء **الصفقات** في ICAN CRM: الفكرة، الصفحات، القواعد، الكود، الـ API اللي شغالين عليه، والمطلوب من
الباك إند. الكود هو المرجع: لو الملف والكود اختلفوا، **الكود هو الصح** وبيتعدّل الملف في نفس التغيير.

- كود الـ frontend: [`src/features/deals/`](../../src/features/deals/README.md) (README تقني بالإنجليزي) و
  [`src/pages/deals/`](../../src/pages/deals/README.md) (الراوتس).
- الملخص في دليل المبيعات: [2-SALES.md → Deals](../2-SALES.md#deals).
- مرجع الباك إند: كولكشن Postman "Deals Workspace" (اتبعت في الشات 2026-10-03) — **هو المصدر لمسارات الـ API**، مش ملف
  الماركداون القديم (فيه مسارات `/deal-leads/...` مش موجودة في الكولكشن).

## المحتويات

1. [الفكرة في سطرين](#1-الفكرة-في-سطرين)
2. [المفاهيم والقيم](#2-المفاهيم-والقيم)
3. [دورة حياة الصفقة](#3-دورة-حياة-الصفقة)
4. [شكل الواجهة: الهب ومساحة العمل](#4-شكل-الواجهة)
5. [الصفحات واحدة واحدة](#5-الصفحات-واحدة-واحدة)
6. [القواعد (لازم تفضل صح)](#6-القواعد)
7. [الكود: فين كل حاجة](#7-الكود-فين-كل-حاجة)
8. [الـ API المستخدم حالياً (من Postman)](#8-الـ-api-المستخدم-حالياً)
9. [العقد المطلوب من الباك إند](#9-العقد-المطلوب-من-الباك-إند)
10. [ملاحظات على الباك إند الحالي](#10-ملاحظات-على-الباك-إند-الحالي)
11. [المراحل وحالتها](#11-المراحل-وحالتها)
12. [حاجات معروفة ناقصة أو ما اتجربتش](#12-حاجات-معروفة-ناقصة)
13. [سجل التغييرات](#13-سجل-التغييرات)

---

## 1. الفكرة في سطرين

**الصفقة (Deal) = حاوية عمل** (حملة مبيعات، مشروع، موسم) ليها قالب مراحل، فريق، منتجات، وعملاء جواها. كل عميل جوه
الصفقة اسمه **DealLead** وليه مرحلة (`stage`) وحالة (`status`) منفصلين. لما عميل يتكسب، الباك إند بيعمل **عقد** وخطة
دفع وأقساط ومهام متابعة في عملية واحدة.

**في الواجهة:** صفحة `/deals` فيها كل الصفقات، وكل صفقة ليها **مساحة عمل كاملة** بسايدبار فرعي (`/deals/:dealId/*`):
المراحل (لوحة أو جدول)، العقود، الفريق، الاجتماعات، المكالمات، المهام، المنتجات، التقارير، التقويم، الأتمتة، المساعد
الذكي، والإعدادات. كل صفقة بياناتها مستقلة تماماً.

## 2. المفاهيم والقيم

| المفهوم | المعنى | القيم |
|---|---|---|
| **قالب المراحل** `PipelineTemplate` | الـ blueprint للمراحل | `stages[]: { id, name, order, color, is_won_stage, is_lost_stage }` |
| **الصفقة** `Deal` | حاوية العمل | `type`: `sales` · `campaign` · `project` — `status`: `draft` · `active` · `paused` · `completed` · `cancelled` |
| **مراحل الصفقة** | نسخة من مراحل القالب وقت الإنشاء | **مستقلة** بعد النسخ: تعديل القالب ما بيغيّرش الصفقات الموجودة |
| **عميل الصفقة** `DealLead` | عميل (Lead) جوه صفقة | `stage_id` (فين في المراحل) + `status`: `open` · `won` · `lost` (مقفول ولا لأ) |
| **فريق الصفقة** `DealTeam` | مستخدم **أو** فريق بدور | `role`: `manager` · `sales_rep` · `viewer` |
| **منتجات الصفقة** | المنتجات اللي الصفقة بتبيعها | بتظهر أول حاجة في فورم الكسب |
| **منتجات العميل** `DealLeadProduct` | اللي العميل بيتفاوض عليه | `product_id, quantity, unit_price, discount` (الخصم **مبلغ** على السطر) |
| **العقد** `Contract` | بيتعمل من الكسب بس | `contract_number` (`CT-XXXXXXXX`)، `total_amount`، `down_payment`، `payment_type` |
| **خطة الدفع** + **الأقساط** | لأي دفع غير الكاش | `payment_type`: `cash` · `installment` · `installment_no_interest` · `custom_staged` |
| **سبب الخسارة** | — | `price` · `competitor` · `no_budget` · `no_response` · `not_interested` · `timing` · `other` |

## 3. دورة حياة الصفقة

```text
قالب المراحل ──نسخ المراحل──► الصفقة ──► الفريق + المنتجات ──► العملاء (موجودين / جداد / ملف)
                                                                     │
                                         change-stage (المرحلة بس) ◄─┤ status = open
                                                                     │
                                ┌────────────── Won ─────────────────┴───────── Lost ──────────┐
                                ▼                                                              ▼
           عقد + خطة دفع + أقساط + مهام متابعة (transaction واحدة)                status = lost + السبب
                                ▼
          متابعة التسليم والأقساط (مهام على العقد) ──► التقارير والتقويم
```

## 4. شكل الواجهة

```
السايدبار الرئيسي → المبيعات → الصفقات (/deals)
│
├─ هب الصفقات (سايدبار فرعي)
│   ├─ العمل:      كل الصفقات (/deals) · كل العقود (/deals/contracts)
│   ├─ المتابعة:   التقارير والإحصائيات (/deals/reports)
│   └─ الإعداد:    قوالب المراحل (/deals/pipelines)
│
└─ مساحة عمل صفقة (/deals/:dealId — سايدبار فرعي، عنوانه اسم الصفقة وحالتها)
    ├─ هيدر ثابت فوق كل صفحة: الاسم، الحالة، النوع، المدة، المسؤول، شريطين تقدم (العملاء/الهدف، المكسوب/هدف الإيراد)،
    │   وأزرار: إضافة عملاء · الأتمتة · مساعد الصفقة
    ├─ العمل:       نظرة عامة · مراحل البيع (لوحة/جدول) · العقود
    ├─ عمل الفريق:  الفريق · الاجتماعات · المكالمات · المهام وقائمة المهام
    ├─ الكتالوج:    المنتجات
    ├─ المتابعة:    التقارير والإحصائيات · التقويم
    ├─ الإعداد:     الأتمتة · مساعد الصفقة · إعداد الذكاء الاصطناعي
    └─ (تحت)        الإعدادات
```

**ليه سايدبار فرعي دايماً ومش تابات فوق؟** قاعدة المشروع رقم 10 (`CLAUDE.md`): أي تنقل داخلي لازم يتبني بـ
`shared/components/sub-sidebar`. السايدبار بيتطوي (وبيتفتكر في المتصفح) فاللوحة العريضة بتاخد المساحة كلها، وعلى
الموبايل بيبقى زرار قائمة. التبديل **لوحة ↔ جدول** بقى جوه صفحة مراحل البيع نفسها، وبيتفتكر (`deal-workspace:view-mode`
— نفس المفتاح القديم) وبيتحفظ في اللينك (`?view=`).

## 5. الصفحات واحدة واحدة

### نظرة عامة (`/deals/:id`)
- 4 أرقام: عملاء مفتوحين (+ قيمة المراحل)، مكسوب، خاسر، قيمة العقود.
- **التقدم مقابل الهدف:** الوقت اللي عدّى من مدة الصفقة مقابل نسبة المحقق من هدف الإيراد؛ لو الفرق 15 نقطة أو أكتر =
  "متأخرة".
- رسم: العملاء المفتوحين لكل مرحلة.
- **يحتاج انتباهك:** تنبيهات بقواعد ثابتة (مش ذكاء اصطناعي): عملاء بدون مسؤول، عملاء بدون نشاط 7 أيام+، أقساط متأخرة،
  عملاء بدون قيمة، متأخرة عن الهدف، صفقة فاضية. كل تنبيه بيفتح الصفحة المناسبة **مفلترة** (مثلاً
  `pipeline?filter=unassigned&view=table`).
- **القادم:** أقرب 6 حاجات (مهام مفتوحة + مكالمات/اجتماعات جاية).

### مراحل البيع (`/deals/:id/pipeline`)
- **لوحة (Kanban):** عمود لكل مرحلة (من مراحل الصفقة). السحب بضغطة طويلة (الضغطة العادية بتفتح العميل). اختيار
  **"تقسيم حسب الفريق"** بيعمل صفوف (swimlanes): صف لكل فريق في الصفقة + صف "خارج الفرق" — ده "تقسيم الفرق".
- **جدول:** `DataTable` المشترك بكل الفلاتر والتصدير؛ اختيار صفوف ← "إسناد X محدد" لمسؤول واحد.
- فلاتر في اللينك: البحث `q`، الحالة `status` (الافتراضي مفتوح)، المسؤول `owner`، `filter=unassigned|stale`، `lanes=team`.
- **كارت العميل:** الاسم، التليفون، المسؤول، آخر نشاط (بيتلوّن لو راكد)، القيمة أو المصدر، حالة لو مقفول، وقائمة:
  تفاصيل · جدولة مكالمة · جدولة اجتماع · كسب · خسارة.
- **درج العميل:** بياناته + لينك صفحته، تغيير المرحلة، تغيير المسؤول، مكالمة/اجتماع، كسب/خسارة، **منتجات قيد التفاوض**
  (تتحفظ بـ sync وتتعبّى تلقائي في فورم الكسب)، ومهام العميل (`EntityTasksPanel`).
- **إضافة عملاء:** 3 تابات: عملاء موجودين (بحث في مركز العملاء + مسؤول + مرحلة)، عميل جديد، استيراد ملف (مخطط).

### الكسب والخسارة
- **الكسب:** سطور منتجات (المنتج · الكمية · سعر الوحدة · الخصم · الإجمالي) + طريقة الدفع + المقدم + (للتقسيط) عدد
  الأقساط والدورية والفايدة وتاريخ أول قسط، و**معاينة** للجدول. طلب واحد؛ الباك إند بيعمل كل حاجة. رسالة الخطأ من
  الباك إند بتظهر زي ما هي.
- **الخسارة:** سبب من القايمة.
- **السحب لعمود الكسب/الخسارة** بيفتح نفس الفورم؛ الكارت ما بيتحركش إلا بعد التأكيد، وبعد النجاح بيتنقل للعمود ده.

### العقود (`/deals/:id/contracts`، وكل العقود في `/deals/contracts`)
- جدول: الرقم، العميل، (الصفقة في الهب)، الإجمالي، المتبقي، طريقة الدفع، عدد المتأخر، تاريخ التوقيع.
- درج العقد (`?contract=<id>`): الإجمالي، المقدم، المدفوع، المتبقي، تنبيه المتأخر، جدول الأقساط (المتأخر بيتحسب من
  التاريخ لو الباك إند ما قالش)، ومهام العقد (اللي الكسب بيعملها). `?filter=overdue` = المتأخر بس.

### الفريق (`/deals/:id/team`)
- الفرق (بأعضائها) والأفراد، كل واحد بدوره، وعدد العملاء المفتوحين لكل شخص، وحذف.
- **إضافة:** مستخدم **أو** فريق بدور (قاعدة الباك إند: مش الاتنين في نفس الطلب). كل اللي يتضاف بيوصله إشعار
  `deal_assigned` (من الباك إند).
- رسم توزيع العملاء المفتوحين على الأشخاص + تنبيه لو فيه عملاء بدون مسؤول.
- التوزيع التلقائي (بالدور/بالحمل) وتغيير الدور: **مخطط** (§9).

### الاجتماعات والمكالمات (`/meetings`، `/calls`)
- **مع العملاء:** أي مكالمة/اجتماع على عميل من عملاء الصفقة (بيشتغل على الـ API الحالي). زرار "اجتماع مع عميل" بيختار
  العميل وبعدين يفتح فورم الجدولة المشترك.
- **داخلي (اجتماع فريق):** مربوط بالصفقة نفسها (`taskable_type = App\Models\Deal`). تابات: الكل · مع العملاء · داخلي.
- الضغط على أي واحد بيفتح درج النشاط المشترك.

### المهام وقائمة المهام (`/tasks`)
- **مهام الصفقة وقائمة المهام:** إضافة To-Do سريعة للصفقة (اليوم/بكرة/الأسبوع/الشهر) + `EntityTasksPanel` على الصفقة
  (مهمة · مكالمة · اجتماع).
- **متابعات العملاء:** كل المهام على عملاء الصفقة.
- **متابعات العقود:** المهام اللي الكسب بيعملها (بدء الخدمة، تذكير كل قسط).

### المنتجات (`/products`)
- منتجات الصفقة (كروت بالسعر) + إضافة من الكتالوج (بحث واختيار متعدد) + حذف.

### التقارير والإحصائيات (`/reports`)
- بمحرك التقارير المشترك: عملاء مضافين، مكسوب، نسبة الكسب، قيمة العقود؛ رسوم: المضاف يومياً، المكسوب والخاسر يومياً،
  المفتوح لكل مرحلة، الحالات، المصادر، المسؤولين، أسباب الخسارة. محسوبة من عملاء الصفقة وعقودها (والصفحة بتقول عددهم).

### التقويم (`/calendar`)
- محرك التقويم المشترك: مهام ومكالمات واجتماعات الصفقة + **الأقساط** + **بداية ونهاية الصفقة**. الضغط على قسط بيفتح عقده.

### الأتمتة (`/automation`)
- الـ Workflow Builder المشترك بسياق الصفقة. اتسجّل موديول `deals` بـ 8 triggers و4 conditions و5 actions (§9.7) —
  كلهم `backendSupport: false` لحد ما الباك إند يشغّلهم.

### مساعد الصفقة (`/assistant`) وإعداد الذكاء الاصطناعي (`/ai`)
- المساعد: التنبيهات (قواعد) + صندوق سؤال وأسئلة جاهزة (مقفولين لحد ما §9.6 يتعمل).
- الإعداد: صفحة `AiSetupPage` المشتركة لموديول الصفقات (6 قدرات)، محفوظة في المتصفح لحد ما `features/ai` يبقى ليه API.

### الإعدادات (`/settings`)
- **عام:** تعديل الصفقة (القالب مقفول بعد الإنشاء). **المراحل:** عرض مراحل الصفقة. **التفضيلات:** العرض الافتراضي
  (في المتصفح) + الإعدادات المخططة. **قوالب المراحل:** نفس سكشن `/settings` من الـ registry. **الحذف.**

### الهب
- **كل الصفقات:** جدول (الحالة، النوع، المسؤول، تقدم العملاء، هدف الإيراد، المدة) + "صفقة جديدة" (بتفتح مساحة عملها).
- **كل العقود**، **التقارير** (صفقات نشطة، منشأة، عقود، قيمة؛ العقود يومياً، الحالات، الأنواع، العقود لكل صفقة)،
  **قوالب المراحل** (إنشاء/تعديل بمحرر مراحل: اسم، لون، كسب/خسارة، ترتيب — وحذف).

## 6. القواعد

| القاعدة | فين في الكود |
|---|---|
| نقل الكارت لعمود = تغيير المرحلة **بس**؛ عمره ما يعني كسب أو خسارة | `DealPipelineBoard`، `PipelineBoard.onTerminalStageDrop` |
| الكسب والخسارة endpoints منفصلين، والسحب لعمودهم بيفتح الفورم | `useLeadDialogs` |
| الكسب/الخسارة للعميل المفتوح بس؛ المقفول ما يتنقلش ولا يتقفل تاني | `DealLeadCard`، `DealLeadDrawer`، `DealPipelineBoard` |
| الفرونت **ما بيعملش** عقد ولا أقساط؛ بيبعت الكسب ويعرض اللي رجع | `WonDialog` |
| الإجماليات في الفرونت **معاينة**؛ الطلب ما فيهوش totals | `utils/dealMoney.buildWonPayload` (tested) |
| الخصم مبلغ على السطر: 2 × 150 − 10 = 290 | `lineTotal` (tested) |
| الكاش من غير مقدم مكتوب = المبلغ كامل | `buildWonPayload` (tested) |
| الحالة (`open/won/lost`) هي اللي بتقول مقفول ولا لأ، مش المرحلة | `getDealLeadStatus` (tested) |
| `id` في الواجهة = رقم الـ DealLead؛ `leadId` = العميل في الـ CRM | `normalizeDealLead` (tested) |
| الفريق: مستخدم **أو** فريق في الطلب | `buildTeamMemberPayload` (tested) |
| نقل المرحلة optimistic ويرجع لو فشل | `useDealLeadMutations.changeStage` |
| أي حاجة endpointها مخطط: زرار مقفول + تنبيه، **عمرنا ما نعمل نجاح وهمي** | `constants/dealApiStatus.js`، `PlannedNotice` |
| المهمة/النشاط "تبع الصفقة" لو مربوط بالصفقة أو عقودها أو عملائها | `utils/dealLinks` (tested) |

## 7. الكود فين كل حاجة

التفاصيل التقنية في [`features/deals/README.md`](../../src/features/deals/README.md). باختصار:

```
src/features/deals/
├─ api/            dealsApi · dealLeadsApi · dealResourcesApi · pipelineTemplatesApi · contractsApi · dealAnalyticsApi · dealAiApi
├─ constants/      dealApiStatus (live/planned) · dealOptions · dealQueryKeys · dealWorkspacePages (registry الصفحات)
├─ hooks/          useDeals · useDealLeads · useDealResources · useDealContracts · useDealAnalytics
│                  useDealWorkspace (context) · useDealLinkedWork · useDealCalendarEvents
├─ utils/          dealStages · dealLeads · dealMoney · dealTeam · dealContracts · dealLinks · dealInsights · dealCalendar (+ tests)
├─ reports/        dealReportModel (+ test) · useDealReport · useDealsHubReport
├─ navigation/     dealNavigation (+ test) — إعداد السايدبار الفرعي
├─ workflow/       dealWorkflowDefinition — تسجيل موديول الأتمتة
└─ components/     layout · pipeline · leads · closing · team · products · contracts · activities · tasks
                   calendar · overview · ai · settings · hub · common
src/pages/deals/   dealRoutes · DealsHubPages · DealWorkspacePages (+ smoke test لكل الصفحات)
src/locales/{ar,en}/dealWorkspace.js + dealWorkspace/*.js
```

تغييرات صغيرة برة الفولدر: تسجيل `deal` و`contract` في سجل الكيانات بتاع المهام (`features/tasks/constants/taskableTypes.js`)،
تصديرات عامة جديدة (`features/tasks`: `useCurrentUserId`, `useTaskToggle`, `TodoItemRow` · `features/teams/index.js` ·
`features/products/index.js`)، 6 أيقونات للأتمتة، سكشن `deals.pipelines` في سجل الإعدادات، ومتغير لون `--calendar-deals`.

## 8. الـ API المستخدم حالياً

كل الطلبات عن طريق `services/httpClient` (بيضيف الـ token و`api_password`). المسارات **زي الكولكشن بالظبط**:

| الحاجة | الطلب | ملاحظة |
|---|---|---|
| القوالب | `GET /api/pipeline-templates` · `GET/DELETE /api/pipeline-templates/{id}` | |
| إنشاء/تعديل قالب | `POST /api/tenant/pipeline-templates` · `POST /api/tenant/pipeline-templates/{id}` | **اتغيّر 2026-10-03**: كان بيبعت على `/api/pipeline-templates` |
| الصفقات | `GET/POST /api/tenant/deals` · `GET/POST(تعديل)/DELETE /api/tenant/deals/{id}` | |
| الفريق | `GET /api/tenant/deals/{dealId}/team` · `POST /api/tenant/deals/team` · `DELETE /api/tenant/deals/team/{id}` | |
| المنتجات | `GET /api/tenant/deals/{dealId}/products` · `POST /api/tenant/deals/products` · `DELETE /api/tenant/deals/{dealId}/products/{productId}` | |
| العملاء | `GET /api/tenant/deals/{dealId}/leads` (`per_page=500`) · `POST .../leads/add-existing` · `POST .../leads/create` · `POST .../leads/bulk-assign` | |
| المرحلة | `POST /api/tenant/deals/leads/{dealLeadId}/change-stage` `{ stage_id }` | |
| منتجات العميل | `POST /api/tenant/deals/leads/products/sync` · `GET /api/tenant/deals/leads/{dealLeadId}/productsc` | `productsc` غلطة إملائية في الباك إند، سايبينها زي ما هي |
| الكسب | `POST /api/tenant/deals/leads/{dealLeadId}/won` | بيرجّع العقد |
| الخسارة | `POST /api/tenant/deals/leads/{dealLeadId}/lost` `{ reason }` | |
| العقود | `GET /api/tenant/deals/contracts` (`deal_id`، `lead_id`) · `GET /api/tenant/deals/contracts/{id}` | |
| التحليلات | `GET /api/tenant/deals/{dealId}/analytics/overview` · `.../analytics/owners` | التقارير حالياً محسوبة من العملاء؛ ده جاهز للتحويل |
| مهام/مكالمات/اجتماعات | الـ endpoints الحالية للمهام والاجتماعات بـ `taskable_type = App\Models\Deal` أو `App\Models\Lead` | ربط الصفقة نفسها لازم الباك إند يقبله (§9.4) |

## 9. العقد المطلوب من الباك إند

كل اللي تحت **مش موجود في الكولكشن**. الواجهة جاهزة ومقفولة عليه بـ `DEAL_API_STATUS` (`planned`). لما يتعمل، الباك إند
يقول، ونغيّر القيمة لـ `live` في `features/deals/constants/dealApiStatus.js` — من غير أي تغيير تاني.

### 9.1 الأولوية العالية (P1)

**استيراد ملف عملاء** — `leadsImport`
```http
POST /api/tenant/deals/leads/import        (multipart/form-data)
deal_id, file (xlsx|xls|csv: name | phone | email), owner_id?, stage_id?
→ 200 { "data": { "total": 120, "created": 110, "duplicates": 10, "errors": [{ "row": 7, "message": "..." }] } }
```

**التوزيع التلقائي على فريق الصفقة** — `leadsDistribute` (تقسيم الفرق)
```http
POST /api/tenant/deals/{dealId}/leads/distribute
{ "strategy": "round_robin" | "least_loaded", "scope": "unassigned" | "selected",
  "deal_lead_ids": [101, 102]?, "user_ids": [2, 4]? , "team_id": 3? }
→ 200 { "data": { "assigned": [{ "deal_lead_id": 101, "owner_id": 2 }], "count": 12 } }
```
التنفيذ لازم يكون على السيرفر (قاعدة المشروع: توزيع الليدز مسؤولية الباك إند). يبعت `deal_assigned` لكل مسؤول.

**تفاصيل في رد قائمة العملاء** (`GET /deals/{id}/leads`) — مطلوب يرجع لكل DealLead:
`id, lead_id, stage_id, status, owner_id, owner{id,name}, estimated_value, last_activity_at, won_at, lost_at, lost_reason,
created_at, lead{ id, name, phone, email, company, customer_id, source }`. الواجهة بتقرا الأشكال دي كلها.

**ربط المهام والأنشطة بالصفقة** — `dealLinkedTasks` / `dealLinkedActivities` (حالياً `live` بس مش متجرّب)
- قبول `taskable_type = App\Models\Deal` في `POST /api/tenant/tasks` و`POST /api/tenant/meetings` (اجتماعات الفريق
  الداخلية، To-Do الصفقة).
- فلتر في القوائم: `GET /api/tenant/tasks?taskable_type=...&taskable_id=...` و`GET /api/tenant/meetings?deal_id=...` (يرجّع
  الأنشطة على الصفقة **وعلى عملائها**) — حالياً الواجهة بتجيب آخر 200 وتفلتر عندها.
- في رد المهمة لما `taskable` يكون عقد: `taskable.deal_id` (عشان لينك المهمة يفتح العقد في صفقته).

### 9.2 الكسب والخسارة والعقود

**بعد الكسب/الخسارة:** يا ريت الباك إند ينقل `stage_id` لمرحلة `is_won_stage`/`is_lost_stage` بنفسه. حالياً الواجهة
بتعمل `change-stage` بعد النجاح لو المستخدم سحب الكارت لعمود الكسب/الخسارة.

**رد الكسب** = العقد كامل بنفس شكل `GET /contracts/{id}` (`payment_plan.installments[]`).

**أخطاء الكسب/الخسارة:** `422` برسالة واضحة في `message` (مثلاً "الـ Lead ده مقفول بالفعل")، و`errors` للحقول. الواجهة
بتعرض `message` زي ما هي.

**`custom_staged`:** محتاجين تعريف: الواجهة بتبعت `notes` بس. المقترح:
```json
{ "payment_type": "custom_staged", "stages": [{ "label": "عند التعاقد", "amount": 100, "due_date": "2026-10-01" }] }
```

**تسجيل دفع قسط** — `installmentPayment`
```http
POST /api/tenant/deals/contracts/{contractId}/installments/{installmentId}/pay
{ "amount": 98, "paid_at": "2026-10-03", "method": "cash" | "bank" | "card", "reference": "..." }
→ 200 { "data": <installment بعد التحديث>, "contract": { "paid": 198, "remaining": 392 } }
```
وفي رد العقد/القسط: `paid_amount`، وحالة `overdue` لما يعدّي ميعاده.

**إعادة فتح عميل مقفول** — `leadReopen`: `POST /api/tenant/deals/leads/{dealLeadId}/reopen` (للمدير بس؛ ممنوع لو فيه عقد ساري).

**إزالة عميل من الصفقة** — `leadRemove`: `DELETE /api/tenant/deals/leads/{dealLeadId}` (ممنوع لو `won`).

### 9.3 الفريق

**تغيير الدور** — `teamRoleUpdate`: `POST /api/tenant/deals/team/{id}` `{ "role": "manager" }`.

**رد `GET /deals/{id}/team`:** للفريق يرجّع `team.users[]` (id, name) عشان "تقسيم حسب الفريق" والحمل يشتغلوا من غير طلب تاني.

### 9.4 الأنشطة (اتشرح في 9.1)

### 9.5 التحليلات
- تصليح طلب "analytics overview funnel" في الكولكشن (بيشاور على `/overview`) → `GET /deals/{id}/analytics/funnel`.
- إضافة `GET /deals/{id}/analytics/sources` (زي الماركداون).
- شكل مقترح لـ overview: `{ total_leads, open, won, lost, revenue, pipeline_value, achievement_percentage, win_rate,
  stages_summary: [{ stage_id, count, value }] }`. لما يتأكد، `useDealReport` يتحول له.

### 9.6 الذكاء الاصطناعي — `dealAi`
```http
GET  /api/tenant/deals/{dealId}/ai/insights
→ { "data": [{ "id": "stale_leads", "severity": "high", "title": "...", "deal_lead_ids": [101] }] }
POST /api/tenant/deals/{dealId}/ai/ask    { "question": "...", "language": "ar" }
→ { "data": { "answer": "...", "sources": [{ "type": "deal_lead", "id": 101 }] } }
```
الموديل والمفاتيح على السيرفر بس. إعدادات المساعد (`AiSetupPage`) هتتحفظ من `features/ai` لما يبقى ليه API.

### 9.7 الأتمتة (أحداث لازم الباك إند يبعتها)
`deal.lead_added`، `deal.stage_changed` (`to_stage`)، `deal.lead_won`، `deal.lead_lost`، `deal.lead_stale` (بعد N يوم)،
`deal.contract_created`، `deal.installment_due` (قبل N يوم)، `deal.installment_overdue`. والأكشنز: إسناد مسؤول، نقل مرحلة،
إنشاء مهمة، جدولة مكالمة، إشعار فريق الصفقة. (التسجيل في `workflow/dealWorkflowDefinition.js`.)

### 9.8 إعدادات مساحة العمل — `dealSettings`
```http
GET  /api/tenant/deals/{dealId}/settings
POST /api/tenant/deals/{dealId}/settings
{ "lost_reasons": [{ "key": "price", "label": "السعر", "active": true }],
  "payment_defaults": { "payment_type": "installment", "number_of_installments": 6, "frequency": "monthly" },
  "card_fields": ["phone", "owner", "last_activity", "value"],
  "stage_rules": [{ "stage_id": 11, "required_fields": ["estimated_value"], "sla_hours": 48 }],
  "notifications": { "lead_assigned": true, "stage_changed": false } }
```

### 9.9 سجل نشاط الصفقة — `dealActivityLog`
`GET /api/tenant/deals/{dealId}/activity-log?page=` → مين عمل إيه (إضافة عميل، نقل مرحلة، كسب، خسارة، إضافة للفريق...).

## 10. ملاحظات على الباك إند الحالي

1. **مسارات مختلفة عن الماركداون:** الكولكشن هو اللي اتطبّق (`/deals/leads/{id}/won` مش `/deal-leads/{id}/won`، و`/deals/contracts` مش `/contracts`).
2. **القوالب:** القراءة والحذف على `/api/pipeline-templates` والإنشاء والتعديل على `/api/tenant/pipeline-templates` — يا ريت يتوحّدوا تحت `/api/tenant`.
3. **"update + sync":** هل التعديل بيأثر على صفقات موجودة؟ الماركداون بيقول لأ (المراحل بتستقل). الواجهة ماشية على كده.
4. **`productsc`** غلطة إملائية.
5. **العقد بيرجع `lead_id`** مش `customer_id`: سؤال Lead/Customer لسه مفتوح في المشروع.
6. **تعارض اسم Deal:** في `docs/customer-service/SERVICE-MASTER-SPEC.md` (§29.7) جدول `deals` معرّف كعملية بيع واحدة
   (`item_instance_id`, `payment_plan_id`, `plan_overrides`)، بينما هنا الـ Deal حاوية والـ DealLead هو عملية البيع. وكمان
   خطط الدفع هناك مكتبة على مستوى التينانت بمحرك معاينة، وهنا أرقام بتتبعت مع الكسب. **لازم قرار قبل ما الفوترة تتبني.**
7. التحديث `POST` مش `PUT/PATCH` — ماشيين عليه.

## 11. المراحل وحالتها

| المرحلة | المحتوى | الحالة |
|---|---|---|
| D0 (قبل 2026-10-03) | هب بجدول، صفحة واحدة بتابات، لوحة، فريق ومنتجات للعرض بس | اتشالت واتبنت من جديد |
| D1 (2026-10-03) | كل اللي في القسم 5: هب بسايدبار، 14 صفحة للصفقة، كسب/خسارة، عقود، فريق، أنشطة، مهام، تقويم، تقارير، أتمتة، ذكاء، إعدادات، قوالب | **CURRENT** على endpoints الكولكشن؛ المخطط مقفول بتنبيه |
| D2 (بعد الباك إند) | استيراد، توزيع تلقائي، تغيير دور، دفع أقساط، تحليلات السيرفر، ذكاء اصطناعي، إعدادات مساحة العمل، سجل النشاط | مستني §9 |

## 12. حاجات معروفة ناقصة

- **ما اتجربش على سيرفر حقيقي:** كل الصفحات اتجربت بتيست smoke ببيانات بنفس شكل الكولكشن (`pages/deals/dealRoutes.test.jsx`)،
  من غير باك إند ولا لوجن، فالشكل الفعلي (RTL/LTR، دارك/لايت، موبايل) **ما اتشافش بالعين**. ردود الـ API الحقيقية ممكن
  تختلف في التغليف (`data`/`data.data`) — الهوكس بتتعامل مع الاتنين.
- قائمة العملاء بتتجاب مرة واحدة (`per_page=500`) والفلترة في المتصفح.
- الأنشطة والمهام: آخر 200 في الشركة متفلترة عندنا (لحد فلتر السيرفر §9.1).
- التقارير محسوبة في المتصفح من عملاء الصفقة وعقودها.
- السحب في اللوحة بالضغطة الطويلة (زي مركز العملاء)؛ ما فيش لوحة كيبورد للسحب.
- تغيير الدور، التوزيع التلقائي، الاستيراد، دفع الأقساط، المساعد الذكي، إعدادات الفريق: مقفولين لحد الباك إند.
- `AgentChat` القديم (`features/ai-agent`) ما بقاش مستخدم في الصفقات (فيه نصوص عربي ثابتة)؛ المساعد بقى `DealAssistant`.

## 13. سجل التغييرات

| امتى | إيه اللي اتغيّر |
|---|---|
| 2026-10-03 23:32 (Africa/Cairo) | إعادة بناء كاملة: `features/deals` (API بمسارات الكولكشن، سجل live/planned، هوكس، utils + tests، تقارير، أتمتة، مكونات)، `pages/deals` (راوتس الهب و14 صفحة للصفقة + smoke test)، ترجمات `dealWorkspace` جديدة (ar/en)، سجل `deal`/`contract` في المهام، سكشن `deals.pipelines` في الإعدادات، وتصليح مسار إنشاء/تعديل القوالب. الملف ده اتعمل. |
