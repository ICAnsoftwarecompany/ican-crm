# Outreach Campaigns — التوثيق المعماري

هذا الملف هو المرجع الكامل لوحدة **حملات التواصل (Outreach Campaigns)**. الهدف منه أن مطور جديد يقدر يفهم الوحدة كاملة من غير ما يقرأ كل ملف على حدة.

---

## 1. ما هو Outreach Campaigns

وحدة لإرسال **حملات تواصل** (رسائل جماعية) لعملاء ICAN CRM الحاليين والمحتملين عبر ثلاث قنوات:

- **WhatsApp**
- **Gmail**
- **Messenger**

الفكرة المفاهيمية:

```
Audience → Campaign → Channel → Message → Schedule → Send → Engagement → Follow-up → Opportunity
```

القنوات الثلاثة مش أنظمة منفصلة — هي **Adapters** جوه معمارية واحدة (Channel Registry)، ونفس الـ Wizard بيستخدمها كلها.

## 2. الفرق بين Outreach وAdvertising Campaigns

فيه تصادم أسماء موجود بالفعل في المشروع لازم توضيحه:

| | **Campaigns** (`/campaigns`) | **Outreach Campaigns** (`/outreach-campaigns`) |
|---|---|---|
| الغرض | إعلانات Meta/Facebook Ads (حملات، Ad Sets، إعلانات، Lead Forms) | التواصل مع عملاء الـ CRM الحاليين عبر WhatsApp/Gmail/Messenger |
| الملفات | `src/features/campaigns/`, `src/pages/campaigns/CampaignsPage.jsx` | `src/features/outreach-campaigns/`, `src/pages/outreach-campaigns/` |
| الـ Backend | `/api/tenant/campaigns/save/campaign`, `/active`, `/inactive`, `/details/{id}`, `/api/facebook/*` | `/api/tenant/campaigns/create`, `/edite`, إلخ (راجع القسم 20) |

**لا تدمج الاثنين ولا تعيد استخدام اسم "Campaigns" لأي منهم بدون توضيح.** الاسمين بيشتركوا في كلمة "campaigns" فقط بالصدفة التاريخية، ومفيش أي علاقة بين الـ backend بتاعهم.

## 3. مكان الوحدة في ICAN CRM

- الـ Sidebar: **Growth** ← "حملات التواصل" (`nav.outreachCampaigns`)، بجانب "Campaigns" (إعلانات) و"Opportunity Center".
- الراوت: `/outreach-campaigns` (نظرة عامة) و`/outreach-campaigns/all` (القائمة) و`/outreach-campaigns/:campaignId` (التفاصيل).
- راجع `src/shared/components/layout/SIDEBAR_ARCHITECTURE.md` → قسم "Outreach Campaigns vs Campaigns" لنفس التوضيح من ناحية الـ Navigation.

## 4. Folder Structure

```
src/features/outreach-campaigns/         ← API + hooks + domain في وحدة واحدة
  api/messegeCampaignApi.js
  api/whatsappTemplateImagesApi.js
  hooks/useMessegeCampaign.js
  config/campaignChannels.js             ← Channel Registry (القسم 9)
  constants/campaignStatus.js            ← campaignStatusConfig (القسم 6)
  constants/campaignObjectives.js        ← قائمة "الغرض" المحلية فقط (القسم 8)
  utils/normalizeCampaign.js             ← Adapter: backend → domain model
  utils/buildCampaignPayload.js          ← Adapter: form state → backend payload
  utils/campaignAudience.js              ← فحص أهلية الجمهور لكل قناة
  utils/campaignDateTime.js              ← تنسيق starts_at
  utils/campaignCalendar.js              ← تحويل startsAt إلى أحداث التقويم
  schemas/campaignSchema.js              ← Zod validation حسب القناة
  hooks/useOutreachCampaigns.js          ← يطبع استجابات الـ hooks المحلية
  components/OutreachSidebar.jsx         ← قائمة التنقل الداخلية
  components/CampaignStageNavigation.jsx ← مراحل الإنشاء والتنقل للخلف
  components/OutreachOverviewContent.jsx ← إحصائيات ونشاط Live
  components/OutreachCampaignListContent.jsx ← جدول كل الحملات والقنوات وLive
  components/OutreachCalendarContent.jsx ← تقويم الحملات
  components/OutreachWorkflowContent.jsx ← محرر سير العمل
  components/OutreachCreateContent.jsx   ← مساحة صفحة الإنشاء
  components/Campaign{Channel,Status}Badge.jsx ← شارات مشتركة
  components/CampaignStatsCards.jsx      ← بطاقات الإحصائيات
  docs/CodeA1_API_BackEndDocumentation.md ← مرجع الـ endpoints
  docs/OUTREACH_CAMPAIGNS_ARCHITECTURE_AR.md ← هذا الملف
  index.js                               ← الـ barrel

src/pages/outreach-campaigns/
  OutreachCampaignsLayout.jsx            ← التخطيط والـ sidebar للكمبيوتر والموبايل
  OutreachOverviewPage.jsx               ← الإحصائيات والحملات الجارية
  OutreachCampaignsPage.jsx              ← القائمة: الكل/Live/القناة
  OutreachCreatePage.jsx                 ← إنشاء الحملة في صفحة كاملة
  OutreachCalendarPage.jsx               ← تقويم الحملات فقط
  OutreachWorkflowPage.jsx               ← WorkflowBuilder على visual-flow
  OutreachCampaignDetailsPage.jsx        ← صفحة التفاصيل
  components/
    useCampaignsTableColumns.jsx
    CampaignAttachments.jsx
    CampaignDetailsOverview.jsx
    CampaignDetailsAudience.jsx
    CampaignDetailsContent.jsx
    CampaignDetailsActivity.jsx
    CampaignDetailsPerformance.jsx
    preview/
      WhatsAppMessagePreview.jsx
      EmailMessagePreview.jsx
      MessengerMessagePreview.jsx
    wizard/
      CampaignWizardModal.jsx
      CampaignWizardSteps.js            ← STEPS array + createInitialCampaignForm
      CampaignAudienceBuilder.jsx
      steps/
        CampaignSetupStep.jsx
        CampaignAudienceStep.jsx
        CampaignChannelStep.jsx
        CampaignContentStep.jsx
        CampaignScheduleStep.jsx
        CampaignTeamStep.jsx
        CampaignReviewStep.jsx
      channels/
        WhatsAppCampaignContent.jsx
        GmailCampaignContent.jsx
        MessengerCampaignContent.jsx
```

تم نقل API والـ hooks وتوثيق CodeA1 إلى `outreach-campaigns`. مجلد `MessegeCampaign` القديم يحتفظ فقط بـ `index.js` كواجهة إعادة تصدير للتوافق مع أي مستهلك خارجي قديم؛ لا يحتوي منطقاً مستقلاً.

## 5. Routes

| Route | الصفحة | ملاحظات |
|---|---|---|
| `/outreach-campaigns` | `OutreachOverviewPage` | إحصائيات الحملات المحملة والحملات الجارية |
| `/outreach-campaigns/live` | `OutreachCampaignsPage` | الحملات بحالة `running` |
| `/outreach-campaigns/all` | `OutreachCampaignsPage` | كل الحملات |
| `/outreach-campaigns/create` | `OutreachCreatePage` | Wizard الإنشاء في صفحة كاملة؛ `?channel=whatsapp|gmail|messenger` يختار القناة مسبقاً |
| `/outreach-campaigns/channels/{messenger,whatsapp,gmail}` | `OutreachCampaignsPage` | قائمة مفلترة محلياً حسب القناة، مع إنشاء/تعديل/حذف |
| `/outreach-campaigns/calendar` | `OutreachCalendarPage` | محرك التقويم المشترك مع أحداث الحملات المحملة فقط |
| `/outreach-campaigns/workflow` | `OutreachWorkflowPage` | `WorkflowBuilder` بسياق outreach مبني على visual-flow؛ التخزين محلي حسب وحدة workflow-engine |
| `/outreach-campaigns/:campaignId` | `OutreachCampaignDetailsPage` | التفاصيل + التبويبات الخمسة |

الشريط الجانبي قابل للطيّ على الكمبيوتر ويحفظ الحالة محلياً، ويُعرض في درج على الموبايل. «الأدوات» قسم مستقل يضم التقويم وسير العمل. زر الإنشاء العلوي يظهر فقط في `/all` وصفحات القنوات الثلاث؛ من صفحة قناة يضيف `channel` للرابط. صفحة الإنشاء نفسها تملأ عرض وارتفاع مساحة العمل، بلا وصف أسفل العنوان. المراحل مرتبة، ويمكن الضغط على مرحلة سابقة للرجوع والتعديل دون فقد البيانات. المرحلة التالية مباشرة تصبح قابلة للنقر فقط بعد اكتمال متطلبات المرحلة الحالية، بنفس شروط زر «التالي»، بينما المراحل الأبعد تبقى مغلقة. شروط المحتوى تعتمد على القناة المختارة. منطق الإنشاء والحفظ هو نفسه المستخدم في مودال التعديل. قنوات TikTok وTelegram وSnapchat ظاهرة بوضع غير مفعّل حتى يتوفر API الإرسال والـ wizard. الإحصائيات وLive والتقويم تعتمد على نتيجة `getCampaigns` المحملة، وقد لا تشمل كل الحملات عند تصفح الخادم. التقويم يستخدم محرك `shared/components/calendar` لكنه يعرض الحملات ذات `startsAt` صالح فقط، ولا يجلب مهاماً أو مكالمات أو اجتماعات.

مسجلين في `src/app/router/index.jsx` بنفس نمط الـ routes التاني الموجودة (بدون lazy loading، مطابقة لباقي المشروع).

## 6. Architecture

```
navigation.config.js ──▶ Sidebar/Header (قسم منفصل تمامًا، غير مرتبط هنا)

OutreachCampaignsPage / OutreachCampaignDetailsPage
        │
        ▼
useOutreachCampaigns() / useOutreachCampaign() / useOutreachCampaignMutations()   ← hooks/useOutreachCampaigns.js
        │ (يغلف)
        ▼
useMessegeCampaigns() / useMessegeCampaignMutations() ...                        ← hooks/useMessegeCampaign.js داخل نفس الوحدة
        │
        ▼
messegeCampaignApi.js ──▶ httpClient (api_password + Bearer يتحقنوا تلقائيًا)
```

الـ UI مبنيّة حول **Channel Registry** (`config/campaignChannels.js`) مش `if (channel === 'whatsapp')` متناثرة. كل مكوّن قناة (`WhatsAppCampaignContent`, `GmailCampaignContent`, `MessengerCampaignContent`) مستقل، والـ `CampaignContentStep` هو نقطة الـ dispatch الوحيدة.

## 7. Campaign Domain Model

`normalizeCampaign(apiCampaign)` (في `utils/normalizeCampaign.js`) بيحوّل استجابة الباك إند (غير موثقة الشكل بدقة — راجع قسم 43) لموديل واحد ثابت تستخدمه كل الواجهة:

```js
{
  id, name, channel, status, message, subject, startsAt, createdAt, updatedAt,
  createdBy, metadata, whatsappTemplateGeneral, whatsappTemplateId, externalId,
  customers, users, attachments, customersCount, usersCount, raw,
}
```

`raw` بيحتفظ بالاستجابة الأصلية كاملة عشان أي حقل مش متعامل معاه لسه يفضل متاح.

## 8. Supported Channels

WhatsApp، Gmail، Messenger — راجع القسم 9 للتفاصيل الكاملة.

## 9. Channel Registry

`src/features/outreach-campaigns/config/campaignChannels.js` هو **مصدر الحقيقة الوحيد** لقدرات كل قناة:

```js
{
  key, labelKey, descriptionKey, icon, accent,
  supportsSubject, supportsTemplates, supportsAttachments, supportsVariables,
  eligibilityField,   // 'phone' | 'email' | 'unknown'
}
```

الواجهة بتتصرف حسب هذه الأعلام (`definition.supportsAttachments`، إلخ) مش حسب اسم القناة نفسه. لإضافة قناة جديدة، راجع القسم 45.

## 10. WhatsApp Workflow

1. اختيار **Phone Number** من الأرقام المرتبطة فعليًا (`useFacebookIntegrations` → `whatsapp[].phone_number_id`).
2. اختيار **Template** من القوالب الحقيقية (`useWhatsappTemplates` من `features/integrations/whatsapp` — نفس الـ API المستخدم في `WhatsappTemplatesDialog`/صفحة `/templates`، لم يُعد بناؤه).
3. النظام بيستخرج عدد المتغيرات `{{n}}` من الـ Header/Body تلقائيًا ويولّد حقول إدخال بعددها — المستخدم **لا يكتب** `template_params` يدويًا.
4. معاينة حية (`WhatsAppMessagePreview`).
5. عند الإرسال: `buildCampaignPayload` يبني `whatsapp_templet_genral`, `whatsapp_templete_id`, `metadata.phone_number_id`, `metadata.template_params.{header,body}` بالظبط زي التوثيق.

## 11. Gmail Workflow

لا يوجد نظام قوالب لـ Gmail في المشروع (بعكس WhatsApp) — فقط Subject + Body عاديين. صندوق الإرسال (`mailbox_email`) بييجي من `useGmailMailboxes()` (موجودة ومكتملة فعليًا في `features/conversations/`، لم تُبنَ من الصفر). معاينة عبر `EmailMessagePreview`.

## 12. Messenger Workflow

⚠️ **يتطلب توضيح من الباك إند** — حقل `external_id` موثّق فقط كـ "رقم" بدون ربط مؤكد بأي كيان. كحل عملي مؤقت (مش تخمين معروض كحقيقة)، بنعرض صفحات Messenger المرتبطة فعليًا (من نفس بيانات `useFacebookIntegrations` المستخدمة في إعدادات → التكاملات → Meta) ونستخدم الـ `id` بتاعها، مع إمكانية إدخال القيمة يدويًا لو مش مطابقة. **لازم تأكيد هذه القيمة مع فريق الباك إند قبل الاعتماد عليها في بيئة الإنتاج.**

## 13. Audience Builder

`CampaignAudienceBuilder.jsx` (تُستخدم في خطوة الويزارد وفي تبويب "الجمهور" بصفحة التفاصيل):

- يعرض جدول العملاء الحقيقي (`useCustomers` + `DataTable` المشترك، بدون إعادة بناء جدول جديد).
- المستخدم بيفلتر/يبحث، يحدد صفوف، يضغط "إضافة المحدد للجمهور" — العملية دي بتتكرر عبر أكتر من عملية فلترة وبتتجمّع في قائمة واحدة (Accumulator).
- عداد حي "X عميل ضمن هذا الجمهور".
- **قيد معروف موثّق**: مفيش endpoint في الباك إند لحساب "كام عميل مطابق للفلتر ده من غير ما أحمّلهم كلهم" — الاختيار مقتصر على الصفوف المحمّلة فعليًا في المتصفح. راجع قسم 43 "Backend Gaps".

## 14. Campaign Creation Workflow

Wizard من 7 خطوات (`CampaignWizardModal.jsx` + `CampaignWizardSteps.js`):

1. **الإعداد** — الاسم + الغرض (محلي فقط).
2. **الجمهور** — `CampaignAudienceBuilder`.
3. **القناة** — بطاقات القنوات مع حالة الاتصال الحقيقية.
4. **المحتوى** — مكوّن القناة المختارة + المرفقات.
5. **الجدولة** — تاريخ ووقت (`starts_at`).
6. **الفريق** — اختيار `user_ids`.
7. **المراجعة** — ملخص كامل + تحذيرات (لا تمنع الإطلاق إلا في حالة أخطاء الـ Validation).

عند الإطلاق: `campaignFormSchema.safeParse` ثم `buildCampaignPayload` ثم `createCampaign` ثم رفع أي مرفقات (`addCampaignImages`) بعد الحصول على الـ `campaignId` — **مش قبل كده**، لأن دعم الباك إند لرفع ملفات أثناء الإنشاء المباشر غير مؤكد (راجع قسم 18).

## 15. Campaign Editing

نفس `CampaignWizardModal` بالظبط، بفرق `mode="edit"` و`campaign` (الموديل المطبّع). `createInitialCampaignForm(campaign)` بيحوّل الموديل المطبّع رجوع لشكل الفورم. عند الحفظ يُستخدم `updateCampaign` (`POST .../edite`) بنفس الـ payload builder — **لا يوجد فورم تاني مكرر للتعديل**.

## 16. Campaign Scheduling

`starts_at` هو الحقل الوحيد الموجود في الباك إند (`YYYY-MM-DD HH:mm:ss`). "إرسال الآن" بيملأ نفس الحقل بالوقت الحالي — مفيش endpoint أو سلوك جديد مُخترع. هل الباك إند فعليًا بيعامل وقت قريب جدًا كـ "إرسال فوري" ولا بينتظر الـ scheduler التالي؟ **غير مؤكد** (راجع قسم 43).

## 17. Campaign Cancellation/Deletion

`GET .../cancel` و`GET .../destroy` — كما هي موثقة بالظبط (GET رغم إنها بتغيّر حالة السيرفر، وده موثّق في الكود كملاحظة وليس خطأ يُصلَّح من الفرونت إند). كلاهما عبر `ConfirmDialog` المشترك (**لا** `window.confirm()`)، وأزرارهم تظهر فقط حسب `campaignStatusConfig` (مثلاً "إلغاء" مايظهرش على حملة `completed`).

## 18. Attachments

`POST .../add/images` و`POST .../remove/images`. بما إن دعم رفع الملفات مباشرة أثناء `create` غير موثّق بثقة (فيه سطر معلّق فقط في الـ Postman collection يلمّح لكده)، التدفق المعتمد هو:

```
إنشاء الحملة → الحصول على campaign_id → رفع المرفقات
```

`CampaignAttachments.jsx` بيدعم وضعين: `staged` (ملفات محلية لحد ما الحملة تتعمل) و`uploaded` (رفع/حذف مباشر لحملة موجودة بالفعل، مستخدَم في صفحة التفاصيل).

## 19. WhatsApp Template Images

الـ endpoints الأربعة (`create/template/images`, `template/images`, `template/{template}/images`, `change/.../image/status`) موجودة في `features/outreach-campaigns/api/whatsappTemplateImagesApi.js` وhooks بتاعتها. اختيار القالب في خطوة WhatsApp يعتمد حالياً على `features/integrations/whatsapp`. Hooks الصور مُصدَّرة من `features/outreach-campaigns/index.js` للاستخدام المستقبلي.

## 20. API Endpoints (المتاحة فعليًا)

كل هذه الـ 19 endpoint شغالين من خلال `features/outreach-campaigns/api/`:

```
POST GET   /api/tenant/campaigns/create
POST       /api/tenant/campaigns/{campaign}/add/images
POST       /api/tenant/campaigns/{campaign}/remove/images
GET        /api/tenant/campaigns
GET        /api/tenant/campaigns/{campaign}/destroy      ← GET رغم إنه تغيير حالة
GET        /api/tenant/campaigns/show/{campaign}
GET        /api/tenant/campaigns/{campaign}/cancel       ← GET رغم إنه تغيير حالة
GET        /api/tenant/campaigns/scheduled
GET        /api/tenant/campaigns/my
GET        /api/tenant/campaigns/my/scheduled
POST       /api/tenant/campaigns/{campaign}/edite        ← الإملاء "edite" مش "edit"، مقصود
POST       /api/tenant/campaigns/{campaign}/add/customers
POST       /api/tenant/campaigns/{campaign}/remove/customers
POST       /api/tenant/campaigns/{campaign}/add/users
POST       /api/tenant/campaigns/{campaign}/remove/users
POST       /api/tenant/whatsapp/create/template/images
GET        /api/tenant/whatsapp/template/images
GET        /api/tenant/whatsapp/template/{template}/images
POST       /api/tenant/whatsapp/change/template/{template}/image/status
```

## 21. Request Payloads

راجع `utils/buildCampaignPayload.js` — الشكل بالظبط لكل قناة موجود هناك كتعليق + كود. ملخص الحقول المشتركة: `name`, `channel`, `starts_at`, `message`, `customer_ids`, `user_ids`. لكل قناة حقول إضافية (`whatsapp_templet_genral`/`whatsapp_templete_id`/`metadata.*` لواتساب، `subject`/`metadata.mailbox_email` لجيميل، `external_id`/`metadata` لماسنجر).

**ملاحظة مهمة**: `add/users` و`remove/users` بيتوقعوا مفتاح `users` مش `user_ids` (توثيق الباك إند بالظبط) — هذا التضارب موجود فعليًا في `messegeCampaignApi.js` ولم يُصحَّح، لأن تغييره من الفرونت إند مش هيغيّر توقع الباك إند.

## 22. API Service

`hooks/useOutreachCampaigns.js` بيغلف `hooks/useMessegeCampaign.js` داخل نفس الوحدة ويضيف تطبيع (`normalizeCampaign`) عبر `useMemo`. أي استدعاء API مباشر لازم يعدي من `messegeCampaignApi`/`whatsappTemplateImagesApi` — ممنوع استدعاء `httpClient` مباشرة من مكوّن واجهة.

## 23. TanStack Query Strategy

`QUERY_KEYS.messegeCampaigns` (في `src/shared/constants/queryKeys.js`) هو مفتاح الكاش المستخدم — **لم يُنشأ namespace موازٍ جديد**. البادئات: `all`, `list(filters)`, `detail(id)`, `scheduled(filters)`, `my(filters)`, `myScheduled(filters)`.

## 24. Cache Invalidation

كل الـ mutations (`useMessegeCampaignMutations`) بتعمل `invalidateQueries({ queryKey: QUERY_KEYS.messegeCampaigns.all })` فقط — بادئة واحدة كفيلة إنها تُبطل القائمة والتفاصيل مع بعض (React Query بتعمل prefix match). **لا يوجد** إبطال شامل لكل الكاش (global refetch) في أي مكان.

## 25. Error Handling

`extractMessage(error, fallback)` (من `shared/utils/apiResponse.js`) هو المستخدم في كل مكان لعرض رسالة الخطأ عبر `toast.error`. أخطاء الـ Validation (Zod) بتتعرض جنب الحقل المعني مباشرة في خطوة "الإعداد"/"الجدولة" مش toast عام فقط.

## 26. Permissions

**لا يوجد نظام صلاحيات/باقات حقيقي في المشروع بالكامل** (تم التأكد من هذا بالبحث الشامل قبل البناء). عنصر الـ Sidebar الجديد بيحمل `permission: 'outreachCampaigns.view'` كمفتاح **محجوز فقط** — مفيش أي كود بيتحقق منه فعليًا حاليًا (`hasNavigationPermission` بترجع `true` لو مفيش بيانات صلاحيات، وهو الحال دايمًا الآن). لما نظام صلاحيات حقيقي يتبنى، هذا المفتاح جاهز يُستخدم من غير تعديل في بنية الـ Sidebar.

## 27. Tenant Capabilities

بما إن مفيش نظام باقات (packages/entitlements)، "هل هذا التينانت عنده قناة معينة؟" بيتحدد بشكل واقعي عن طريق **بيانات الاتصال الفعلية**:

- WhatsApp/Messenger: `useFacebookIntegrations(tenant)` (نفس البيانات المستخدمة في إعدادات → التكاملات → Meta).
- Gmail: `useGmailMailboxes()`.

القناة **متاحة دائمًا** في خطوة الاختيار (مفيش نظام باقات يمنعها)، لكن بتتعرض عليها علامة "غير مرتبطة" لو مفيش اتصال فعلي — وهذه حالة مختلفة تمامًا عن "غير متاحة في الباقة" (غير موجودة أصلًا حاليًا).

## 28. Integration Connection States

راجع القسم 27 — الحالتين المطلوب التفريق بينهم:

1. القناة غير متاحة في باقة التينانت → **غير موجود هذا المفهوم حاليًا في الكود** (مفيش باقات).
2. القناة متاحة لكن غير مرتبطة → معروضة فعليًا بعلامة تحذير + زر "إعداد الربط" (يوجه لصفحة الإعدادات، فيما عدا Gmail لعدم وجود تبويب إعدادات مخصص له حاليًا).

## 29. RTL/LTR

كل النصوص عبر `react-i18next` (`t('outreachCampaigns.*')`)، الأرقام والتواريخ والحقول اللاتينية (Phone Number ID, Mailbox email) بتُعرض بـ `dir="ltr"` صريح جوه صفحة RTL، بنفس نمط باقي المشروع (`CustomersTableColumns`, `WhatsappTemplatesDialog`). مفيش استخدام لـ `marginLeft`/`marginRight` — فقط Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).

## 30. Responsive Behavior

القائمة الرئيسية تستخدم `DataTable` المشترك. إنشاء الحملة يتم في صفحة كاملة ويستخدم نفس `CampaignWizardModal` بوضع `variant="page"`، بينما التعديل يبقى مودال ويستخدم نفس الخطوات والمنطق. خطوات القناة تتحول لعمود واحد على الموبايل (`grid md:grid-cols-3`).

## 31. Campaign Lifecycle

الحالات المفاهيمية المعروضة (`constants/campaignStatus.js`): `draft`, `scheduled`, `running`, `completed`, `cancelled`, `failed`. **شكل الاستجابة الفعلي من الباك إند غير موثّق** (لا توجد أمثلة استجابة في الـ Postman collection) — `getCampaignStatusConfig` بترجع قيمة افتراضية آمنة (neutral + كل الإجراءات متاحة) لأي status مش معروف، بدل ما تكسر الواجهة.

## 32. Customer Relationship

الحملة مرتبطة بالعملاء عن طريق `customer_ids` عند الإنشاء، و`add/remove customers` بعد كده. مفيش عرض "سجل حملات هذا العميل" في صفحة العميل حاليًا — يحتاج endpoint من نوع "campaigns by customer" غير موجود اليوم (موثّق في قسم 43).

## 33. Opportunity Center Relationship

**الحملة مش = فرصة بيعية.** إرسال رسالة مش فرصة. لو العميل رد أو تفاعل، هذا "إشارة" (Signal) محتملة تتحول لفرصة عبر Opportunity Center — لكن **لا يوجد اليوم** أي ربط تلقائي أو تتبع لهذه الإشارات (مفيش reply tracking من الباك إند أصلًا). هذا الربط منطقي مستقبلي فقط، موثّق هنا وليس مبني.

## 34. Lead Generation Relationship

Lead Generation (اكتشاف/استيراد عملاء جدد) مختلف تمامًا عن Outreach Campaigns (التواصل مع عملاء موجودين بالفعل). لا تخلط الاثنين. الترتيب المفاهيمي الكامل:

```
Lead Generation → Leads/Customers → Audience → Outreach Campaign → Engagement → Signal → Opportunity Center → Sales
```

## 35. Sequence Concept

**غير مبني اليوم.** لا يوجد أي محرك تسلسل (Sequence) حقيقي أو وهمي في الكود. المعمارية الحالية (Channel Registry منفصل عن الـ Wizard، والـ Wizard منفصل عن الـ payload builder) مُعدّة بحيث إضافة مفهوم Sequence مستقبلًا (خطوات `message`/`wait`/`condition`/`action`) ما يحتاجش إعادة بناء `CampaignsPage`/`CampaignWizardModal` — فقط طبقة تنسيق جديدة فوق نفس الـ channel content components.

## 36. Automation Concept

**غير مبني اليوم.** أي أتمتة مستقبلية (زي: "لو العميل رد → أوقف المتابعة وأنشئ فرصة") المفروض تتبنى على محرك Automation مشترك يُستخدم كمان من Leads/Customers/Opportunities/Tasks — مش منطق خاص بالحملات فقط.

## 37. الفرق بين Sequence وAutomation

- **Sequence**: يحدد **رحلة التواصل** نفسها (إرسال واتساب، انتظار يومين، إرسال إيميل...).
- **Automation**: **بيتفاعل مع أحداث النظام** (لو حصل رد، لو تغيرت حالة العميل...) بغض النظر عن كونه جزء من Sequence أو لا.

## 38. Future CampaignMember Model

النموذج الحالي بيعتمد على `customer_ids` فقط (مصفوفة IDs بلا حالة لكل فرد). التطور المقترح للباك إند:

```
Campaign hasMany CampaignMember
CampaignMember: campaign_id, customer_id, channel, status, current_step,
  sent_at, delivered_at, read_at, replied_at, converted_at, failed_at,
  failure_reason, exit_reason
```

دورة حياة مقترحة: `queued → sent → delivered → read → replied → qualified → converted` (أو `failed`/`skipped`/`unsubscribed`/`stopped`). **لم يُبنَ أي تخزين وهمي لهذا في الفرونت إند** — التوثيق هنا فقط.

## 39. Stop Conditions

غير مبنية اليوم. مقترحات مستقبلية: إيقاف التسلسل عند الرد، عند التحويل، عند تغيير حالة العميل، عند إنشاء فرصة، عند إلغاء الاشتراك، عند دخول قائمة استبعاد. تحتاج دعم Backend غير موجود حاليًا.

## 40. Frequency Rules

غير مبنية اليوم. مقترحات مستقبلية: ساعات إرسال مسموحة، أيام مسموحة، حد أقصى رسائل/عميل/يوم، منع التكرار. تحتاج دعم Backend غير موجود حاليًا.

## 41. Consent/Opt-out Considerations

لا يوجد نظام موافقة/إلغاء اشتراك (Consent/Unsubscribe/Suppression List) في الباك إند حاليًا. أي حملة بترسل لكل عميل داخل `customer_ids` بدون أي فحص "هل وافق على التواصل؟". هذه فجوة مهمة يفضّل سدها قبل استخدام حقيقي واسع (راجع قسم 43).

## 42. Analytics Architecture

`CampaignDetailsPerformance.jsx` بيعرض قائمة المقاييس المتوقعة لكل قناة (Sent/Delivered/Read/Opened/Clicked/Replied) لكن **كل واحدة معلَّم عليها "التتبع غير متاح بعد"** بدل رقم أو صفر مزيّف — لأن الباك إند مفيش عنده أي endpoint تتبع تسليم/قراءة/رد حاليًا. لو تم إضافة endpoint حقيقي مستقبلًا، فقط استبدل نص "غير متاح" بالقيمة الفعلية في نفس المكوّن.

## 43. Backend Limitations

هذه القائمة **AVAILABLE NOW** (موجود ويشتغل فعليًا) مقابل **RECOMMENDED NEXT** (يحتاج تطوير Backend):

### AVAILABLE NOW
- الـ 19 endpoint المذكورة في القسم 20 (CRUD كامل، صور، عملاء، مستخدمين).
- WhatsApp templates الحقيقية (`features/integrations/whatsapp`).
- Gmail sending مع مرفقات (`features/conversations/api/gmailApi.js`).
- بيانات اتصال Meta/WhatsApp/Messenger الحقيقية (`useFacebookIntegrations`).

### RECOMMENDED NEXT
- **شكل استجابة موثّق** لـ list/detail (لا توجد أمثلة استجابة في الـ Postman collection حاليًا — أهم فجوة).
- تأكيد Bearer authentication على: `edite`, `add/remove customers`, `add/remove users` (موثّقة بدون تأكيد في الكولكشن).
- تأكيد معنى `external_id` لحملات Messenger.
- **Campaign Members** (القسم 38).
- **Segments / Saved Audiences** (بديل حقيقي لتحديد آلاف العملاء بدون تحميلهم كلهم).
- **Sequences / Sequence Steps** (القسم 35).
- **Campaign Events / Delivery / Read / Reply / Click Tracking** (القسم 42).
- **Stop Conditions** (القسم 39).
- **Automation Events** (القسم 36).
- **Suppression Lists / Consent / Unsubscribe** (القسم 41).
- **Rate Limiting / Channel Eligibility** (القسم 40، وحساب أهلية دقيق للجمهور بحجم كبير).
- **Analytics endpoint حقيقي**.
- **Opportunity Signals** من تفاعل الحملات (القسم 33).
- توضيح شكل استجابة `add/images`/الملحقات (id, url, name).
- endpoint لعرض "حملات هذا العميل" (القسم 32).

## 44. Backend APIs Required in Future

نفس قائمة RECOMMENDED NEXT أعلاه — كلها endpoints/جداول جديدة، وليست تعديلات على الموجود حاليًا.

## 45. How to Add a New Outreach Channel

مثال: إضافة SMS أو Telegram مستقبلًا:

1. أضف تعريف القناة في `config/campaignChannels.js` (key, labelKey, icon, accent, الأعلام).
2. أضف الترجمات في `locales/{ar,en}/common.json` تحت `outreachCampaigns.channels.<key>`.
3. أنشئ مكوّن محتوى جديد `channels/<Key>CampaignContent.jsx` بنفس نمط الموجودين.
4. أضف حالة القناة في `CampaignContentStep.jsx` (سطر `if (form.channel === '<key>')` واحد بس).
5. أضف الحقول الخاصة بالقناة في `buildCampaignPayload.js` (شرط `if (channel === '<key>')`).
6. أضف الـ validation الخاص بالقناة في `schemas/campaignSchema.js` (`superRefine`).
7. أنشئ مكوّن معاينة `preview/<Key>MessagePreview.jsx`.
8. أضف حالة الاتصال في `CampaignChannelStep.jsx`/`CampaignReviewStep.jsx` (اعتمادًا على بيانات اتصال حقيقية لو موجودة، وإلا وثّق الفجوة).

**لا تحتاج** تعديل `OutreachCampaignsPage.jsx` ولا `CampaignWizardModal.jsx` ولا `useCampaignsTableColumns.jsx` لإضافة قناة جديدة — كلهم بيقرأوا من الـ Registry.

## 46. Development Conventions

- كل استدعاء API من خلال `messegeCampaignApi`/`whatsappTemplateImagesApi` فقط — ممنوع `httpClient` مباشر من مكوّن UI.
- كل نص جديد لازم يكون عبر `t('outreachCampaigns.*')` في الملفين `ar`/`en` معًا.
- أي شكل payload جديد لازم يمر من `buildCampaignPayload`/`normalizeCampaign` — ممنوع بناء الـ body جوه مكوّن UI.
- ممنوع اختراع endpoint أو حقل مش موثّق — لو محتاج بيانات مش متاحة، وثّقها هنا تحت "Backend Gaps" بدل ما تتخيلها.
- إعادة استخدام المكوّنات المشتركة دايمًا (`DataTable`, `AppModal`, `FormDialog`, `ConfirmDialog`, `Button`, `Input`, `Select`, `Avatar`, `Tabs`, `PageToolbar`, `ResourceState`) — ممنوع بناء نسخة جديدة من أي منهم.

## 47. Testing Checklist

- [ ] إنشاء حملة WhatsApp (مع قالب ومتغيرات)
- [ ] إنشاء حملة Gmail
- [ ] إنشاء حملة Messenger
- [ ] تعديل حملة موجودة
- [ ] إلغاء حملة
- [ ] حذف حملة
- [ ] إضافة/حذف عملاء من حملة موجودة (تبويب الجمهور)
- [ ] إضافة/حذف مستخدمين (خطوة الفريق أثناء الإنشاء)
- [ ] رفع/حذف صور مرفقة (أثناء الإنشاء وبعده)
- [ ] عرض الحملات المجدولة/الخاصة بي (الـ hooks جاهزة: `useScheduledOutreachCampaigns`, `useMyOutreachCampaigns`)
- [ ] الحالات الفارغة (لا حملات، لا عملاء مؤهلين، لا قوالب)
- [ ] أخطاء الـ Validation تظهر بجانب الحقل الصحيح
- [ ] أخطاء الـ API (401/422/500) تظهر عبر toast + `extractMessage`
- [ ] قناة غير مرتبطة (تظهر علامة "غير مرتبطة" + زر إعداد)
- [ ] العربية RTL والإنجليزية LTR
- [ ] الموبايل والديسكتوب
- [ ] `npm run build` بينجح بدون أخطاء

## 48. Future Roadmap

بالترتيب المقترح: (1) تأكيد شكل استجابة الباك إند الحقيقي وتحديث `normalizeCampaign` وفقًا له، (2) Segments/Saved Audiences لحل قيد "اختيار آلاف العملاء"، (3) Campaign Events + Delivery/Read/Reply Tracking → تفعيل تبويب "النشاط" والأداء الحقيقي، (4) Consent/Suppression Lists، (5) Sequence Builder فوق نفس الـ Channel Registry، (6) ربط Automation Engine المشترك، (7) Opportunity Signals من تفاعل الحملات.
