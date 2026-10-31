# features/leads/outcome — كسب وخسارة الليد من مركز العملاء

> **Documentation update:** 2026-10-15 17:55 (Africa/Cairo) — زرارين الكسب والخسارة في كارت بيانات العميل.
> 2026-10-15 17:40 (Africa/Cairo) — الفولدر اتعمل.

## تحديث 2026-10-17 16:06 (Africa/Cairo)

- اختيار صفقة موجودة أو إنشاء صفقة تلقائيًا عند الضغط على تسجيل الكسب فقط.
- الإنشاء يستخدم `dealsApi.create` مع اسم العميل والمنتجات و`type: sales` و`status: active` ومالك العميل أو المستخدم الحالي.
- بعد الإنشاء يستخدم معرّف `data.id` في طلب `directe/won`. يحتفظ النموذج بالمعرّف إن فشل الكسب لإعادة المحاولة دون إنشاء نسخة أخرى خلال نفس الجلسة.
- اختيار المستند: بدون إجراء إضافي أو فتح عقود الصفقة بعد النجاح. إصدار الفاتورة مجهز بالواجهة ومعطّل لحين توفير API.
- مسار الكسب الحالي ينشئ العقد وخطة الدفع على السيرفر؛ اختيار «بدون» لا يعطّل هذا السلوك، بل يمنع الانتقال لصفحة مستند إضافي.

## تحديث 2026-10-17 16:30 (Africa/Cairo)

- ديالوج الكسب لا يغلق بالنقر خارجه أو Escape أو زر إلغاء؛ يغلق بعلامة الغلق خارج الحفظ أو بعد نجاح المعاملة بالكامل.
- حالات البيع من `/api/tenant/definitions/status`: حالات lead المفعلة التي تحمل `is_deal: 1`. حالة واحدة تختار تلقائيًا؛ عند تعددها يجب الاختيار، وعند عدم وجودها يتوقف الحفظ.
- بعد `directe/won` يُرسل `leadsApi.saveAction`: `action: create_activity` و`type: status_change`، الحالة القديمة والجديدة ووقت النشاط، و`data.source: lead_center_won` و`close_type: won` مع معرفات العميل والليد والصفقة ونسخة بيانات المنتجات والدفع واختيار المستند.
- إن فشل تحديث الحالة بعد نجاح الكسب، يبقى الديالوج مفتوحًا، وتُقفل بيانات البيع لمنع تغيير المعاملة المحفوظة، ويمكن إعادة محاولة تحديث الحالة دون تكرار الكسب خلال نفس جلسة الديالوج.

## تحديث 2026-10-17 16:42 (Africa/Cairo)

- الخسارة تجلب حالات `lead` المفعلة التي تحمل `is_lost: 1` من تعريفات الحالات. الواحدة تلقائية والمتعددة تتطلب اختيارًا، وعدم وجودها يمنع الحفظ.
- لكل ليد: تسجيل الخسارة بالسبب والملاحظة ثم `save/action` لتحديث الحالة، مع سجل `source: lead_center_lost` و`close_type: lost` ومعرفات العميل والليد والديل إن وجد والسبب والملاحظة والحالة القديمة والجديدة ووقت التنفيذ.
- في الفشل الجزئي تبقى النافذة مفتوحة، وتستكمل المحاولة التالية الخطوات الناقصة فقط. تُقفل حقول السبب والملاحظة والحالة بعد أول خسارة محفوظة لتبقى بيانات الدفعة متسقة؛ نقاط الاستكمال مؤقتة طوال فتح النافذة.
- الديالوج لا يغلق بالنقر خارجه أو Escape أو الإلغاء، فقط بعلامة الغلق خارج الحفظ أو بعد نجاح جميع العملاء.

## تحديث 2026-10-17 21:12 (Africa/Cairo)

- ديالوج الكسب أصبح ثلاث مراحل: المنتجات، طرق الدفع، باقي الإعدادات (حالة البيع والصفقة وإجراء المستند).
- زر التالي يتحقق من بيانات المرحلة الحالية فقط. السابق وتابات المراحل تسمح بالرجوع مع الاحتفاظ بالقيم؛ المرحلة التالية تفتح بعد نجاح التحقق، ولا تُرسل طلبات إنشاء الصفقة أو تسجيل الكسب قبل المرحلة الأخيرة.
- اختيار المستند ومعالجة فشل تحويل الحالة وإعادة المحاولة يظلان في المرحلة الأخيرة.

| | |
|---|---|
| **الخسارة** | `POST /api/tenant/leads/{leadId}/lost` — multipart: `lost_reason_id` (من أسباب الخسارة المتعرفة)، `note`. طلب لكل ليد. |
| **الكسب** | `POST /api/tenant/deals/{dealId}/directe/won/{leadId}` — JSON بنفس body كسب الصفقة: `items[{product_id, quantity, unit_price, discount}]`، `payment_type`، `down_payment`، وللتقسيط `number_of_installments`، `frequency`، `interest_rate`، `first_due_date`. |
| **الواجهة العامة** | `LeadLostDialog`، `LeadWonDialog`، `useLeadActionDialogs` (اهتمام + كسب + خسارة لصفحة واحدة)، `useLeadOutcome`، `leadOutcomeApi`، helpers |
| **الترجمة** | `customers.leadOutcome.*` |
| **الاختبارات** | `utils/leadOutcome.test.js` + `LeadOutcomeDialogs.test.jsx` |

## بيتفتح منين
| المكان | الكسب | الخسارة |
|---|---|---|
| كارت بيانات العميل (الدرج وصفحة الليد) | ✓ | ✓ (`pages/customers/.../CustomerDetailsDrawer/CustomerOutcomeButtons.jsx`، تحت التواريخ) |
| درج العميل (الأزرار السريعة) | `WonQuickAction` | `LostQuickAction` (`pages/customers/.../quick-actions/OutcomeQuickActions.jsx`) |
| الكليك يمين على الصف | "كسب العميل (تسجيل بيع)" | "خسارة العميل" (`pages/customers/utils/customerRowContextActions.js`) |
| قائمة كارت الـ Pipeline | ✓ | ✓ |
| شريط التحديد | عميل واحد بس | أي عدد، نفس السبب للكل (`bulk-actions/selection-actions/outcome/OutcomeBulkActions.jsx`) |

## الخسارة (`LeadLostDialog`)
- الأسباب من **التعريفات** (`features/definitions` → `useLostReasons({ activeOnly: true })`)، اللي بتتدار من حالة الخسارة في صفحة الحالات.
- لو فيه أسباب: السبب **إجباري**. لو مفيش: تنبيه ولينك "عرّفها من حالة الخسارة"، والخسارة تتبعت بالملاحظة بس.
- أكتر من عميل: طلب لكل ليد، والعملاء من غير ليد بيتخطوا، والفشل الجزئي بيتعرض.
- كمان نافذة قفل الليد القديمة (لما الحالة تتغير لحالة خسارة) بقت تعرض نفس الأسباب المتعرفة لو موجودة (`close/LeadCloseDialog.jsx`).

## الكسب (`LeadWonDialog`)
- **الصفقة إجبارية** لأن المسار فيه `dealId`؛ بتتختار تلقائي لو الليد في صفقة مفتوحة (`getLeadOpenDeal`).
- المنتجات بتتملى من **اهتمامات العميل** (`linesFromInterests`: الكمية من الاهتمام، السعر من الكتالوج) وتقدر تعدلها.
- بيستخدم من `features/deals`: `LineItemsEditor`، `InstallmentFields`، `buildWonPayload`، `validateWonForm`، `previewInstallments`.
- طرق الدفع: كاش، تقسيط، تقسيط من غير فوايد (`DIRECT_WON_PAYMENT_TYPES`؛ `custom_staged` بتاع الصفقات مش هنا).
- بعد النجاح: تحديث كاش `customers` و`leads` و`deals`.

## ناقص / أسئلة للباك إند
- هل `directe/won` لازم يكون ليه صفقة؟ لو ليد من غير صفقة يتكسب، المسار المفروض `leads/{leadId}/won` (BACKEND-REQUESTS §E2).
- هل الخسارة بتغيّر حالة الليد لحالة الخسارة بنفسها؟ الفرونت بيفترض آه ومش بيبعت `save/action` معاها.
- متجرب على سيرفر حقيقي لأ؛ بالعين على بيانات وهمية بس.
## Customer deals destination - 2026-10-17 21:23 (Africa/Cairo)

The contract document action navigates to `/customers/{customer.id}/deals?deal={dealId}` only after both win and status synchronization succeed. Uses the public `customerDealsPath` helper from `features/customers`. This destination displays all customer transactions and their contracts; it does not create another contract. See `pages/customers/customer-deals/README.md`.

## Sale status selection - 2026-10-17 22:21 (Africa/Cairo)

`LeadWonDialog` accepts optional `initialSaleStatusId`, preselecting the sale status chosen by a status-change entry point without changing it before transaction save. `onDone` now supplies `{ status, dealId }` after both direct won and status synchronization succeed; existing callbacks can ignore this argument. The form still uses live active `is_deal` definitions, preserving validation and partial-failure retry checkpoints.

## Loss status selection - 2026-10-17 22:26 (Africa/Cairo)

`LeadLostDialog` accepts optional `initialLostStatusId` for status-change entry points. `onDone` reports `{ status, done }` after all selected customers complete loss recording and status synchronization. The modal keeps its current dismissal restrictions and partial-failure retry behavior. Existing callers may ignore the callback argument.

