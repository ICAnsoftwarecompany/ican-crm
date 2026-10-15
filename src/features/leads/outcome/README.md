# features/leads/outcome — كسب وخسارة الليد من مركز العملاء

> **Documentation update:** 2026-10-15 17:55 (Africa/Cairo) — زرارين الكسب والخسارة في كارت بيانات العميل.
> 2026-10-15 17:40 (Africa/Cairo) — الفولدر اتعمل.

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
