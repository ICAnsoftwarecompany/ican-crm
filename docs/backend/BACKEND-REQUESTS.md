# المطلوب من الباك إند — قفل الليد والصفقات

> **Documentation update:** 2026-10-04 14:45 (Africa/Cairo) — الملف اتعمل: كل اللي الفرونت محتاجه من الباك إند في
> جزئين: (أ) قفل الليد في مركز العملاء، (ب) الصفقات ومساحة العمل. مجمّع من
> [deals/DEALS-WORKSPACE-SPEC.md §9–§10](../deals/DEALS-WORKSPACE-SPEC.md) ومن شغل قفل الليد
> ([2-SALES → Closing a lead](../2-SALES.md#closing-a-lead)).

الملف ده للمطوّر اللي هيشتغل على الـ Laravel. كل بند فيه: **إيه المطلوب**، **شكل الطلب والرد**، **الأولوية**، و**الفرونت
عامل إيه دلوقتي**. الفرونت جاهز لكل البنود: الحاجة اللي مش موجودة في الباك إند يا إما مقفولة في الواجهة بتنبيه، يا إما
شغالة بحل مؤقت مكتوب جنبها. أول ما بند يخلص، قولوا رقمه ونشيل الحل المؤقت.

**الأولويات:** **P1** = محتاجينه عشان الشغل يبقى صح أو آمن · **P2** = بيحسّن الأداء أو التجربة · **P3** = تحسينات لاحقة.

**قواعد عامة لكل البنود:**
- كل حاجة تحت `/api/tenant/...` وبتعدي على نفس التوثيق (Bearer + `api_password`) والعزل بين الشركات (tenant).
- الأخطاء: `422` بـ `message` مفهومة للمستخدم (الواجهة بتعرضها زي ما هي) و`errors` للحقول. `403` لو مالوش صلاحية.
- الصلاحيات على السيرفر: الواجهة بتخفي وبتقفل أزرار بس، **ده مش حماية**.

---

## الملخص

| # | البند | الجزء | الأولوية |
|---|---|---|---|
| A1 | أنواع الحالات ترجع في قائمة الحالات | قفل الليد | P1 |
| A2 | حقول القفل في `save/action` وتتخزن وترجع في السجل | قفل الليد | P1 |
| A3 | منع تحريك ليد مقفول من غير "إعادة فتح" + السبب إجباري | قفل الليد | P1 |
| A4 | قائمة أسباب الخسارة لكل شركة | قفل الليد | P2 |
| A5 | صفقات الليد (عشان الكسب يتعمل من الصفقة) | قفل الليد | P2 |
| A6 | تقرير أسباب الخسارة والتحويل | قفل الليد | P2 |
| A7 | أحداث الأتمتة `lead.won` / `lead.lost` / `lead.reopened` | قفل الليد | P2 |
| A8 | قفل جماعي في طلب واحد | قفل الليد | P3 |
| B1 | وحدات المنتج (`unit_mode`, `available_units`) ومنع البيع المكرر | الصفقات | P1 |
| B2 | ملخص الصفقة في القائمة (`products_count`, `team_count`, `last_activity`) | الصفقات | P1 |
| B3 | استيراد ملف عملاء للصفقة | الصفقات | P1 |
| B4 | التوزيع التلقائي على فريق الصفقة | الصفقات | P1 |
| B5 | ربط المهام والأنشطة بالصفقة + فلتر في القوائم | الصفقات | P1 |
| B6 | شكل رد عملاء الصفقة (حقول ثابتة) | الصفقات | P1 |
| B7 | بعد الكسب/الخسارة: نقل المرحلة تلقائياً + أخطاء 422 | الصفقات | P1 |
| B8 | تسجيل دفع قسط + حالة `overdue` | الصفقات | P1 |
| B9 | إعادة فتح عميل الصفقة / إزالته منها | الصفقات | P2 |
| B10 | تغيير دور عضو الفريق + `team.users[]` في الرد | الصفقات | P2 |
| B11 | إنشاء الصفقة في طلب واحد (transaction) | الصفقات | P2 |
| B12 | التحليلات: funnel و sources و شكل overview | الصفقات | P2 |
| B13 | إعدادات مساحة العمل (`dealSettings`) | الصفقات | P2 |
| B14 | سجل نشاط الصفقة | الصفقات | P2 |
| B15 | أحداث الأتمتة للصفقات | الصفقات | P2 |
| B16 | `custom_staged`: تعريف مراحل الدفع | الصفقات | P2 |
| B17 | الذكاء الاصطناعي للصفقة | الصفقات | P3 |
| C | أسئلة وقرارات مفتوحة | الاتنين | — |

---

## (أ) قفل الليد في مركز العملاء

**الفكرة:** الليد بيتقفل لما يتنقل لحالة نوعها **صفقة/مكسوب** (`is_deal`) أو **خسارة** (`is_lost`) — الأنواع دي بتتحدد
في صفحة تعريف الحالات. الفرونت دلوقتي بيحوّل أي نقل لحالة من النوعين دول (من الدرور، والقائمة، واللوحة، والإجراءات
الجماعية) لمربع "قفل الليد":
- **مكسوب:** بيسجل اشترى إيه (من اهتمامات الليد) وبكام.
- **خاسر:** السبب من قائمة ثابتة وإجباري، ومعاه اختياري "نرجع له بعد…"، وده بيعمل مهمة متابعة على الليد.
- **إعادة فتح:** لو الليد مقفول واتنقل لحالة مفتوحة، لازم ملاحظة.

الطلب هو نفس `POST /api/tenant/leads/save/action` اللي كل تغيير حالة بيستخدمه. **ما غيّرناش شكله**: بيانات القفل
اتحطت جوه `data` (الحقل الحر اللي موجود أصلاً).

### A1 — أنواع الحالات ترجع في قائمة الحالات (P1)

`GET /api/tenant/definitions/status` لازم يرجّع مع كل حالة `is_deal`, `is_lost`, `is_retarget`, `has_resone` (0/1). الفرونت
بيعتمد عليهم عشان يعرف إن النقل ده "قفل". لو مش راجعين، مربع القفل **مش هيظهر** والنقل هيبقى تغيير حالة عادي.

### A2 — حقول القفل في `save/action` (P1)

**الفرونت بيبعت دلوقتي:**
```json
POST /api/tenant/leads/save/action
{
  "lead_id": 5,
  "action": "create_activity",
  "type": "note-to-lead",                     // "status_change" في الكسب
  "title": "اتقفل كخاسر: Lost",
  "description": "السعر — العرض أغلى من المنافس",
  "note": "السعر — العرض أغلى من المنافس",
  "new_status_id": 8,
  "new_status_title": "Lost",
  "old_status_title": "New",
  "activity_at": "2026-10-04 15:00:00",
  "data": {
    "source": "lead_close",                   // "lead_close_bulk" في الجماعي
    "close_type": "lost",                     // won | lost | reopen
    "lost_reason_key": "price",               // في الخسارة
    "follow_up_at": "2026-11-03",             // في الخسارة لو فيه متابعة
    "won_value": 1500,                        // في الكسب (اختياري)
    "interest_id": 33                         // في الكسب (اختياري): الاهتمام اللي اتباع
  }
}
```
مفاتيح أسباب الخسارة الافتراضية: `price`, `competitor`, `no_response`, `not_interested`, `not_qualified`, `timing`, `other`.

**المطلوب:**
1. تخزين `close_type`, `lost_reason_key`, `won_value`, `interest_id`, `follow_up_at` **كأعمدة** (على الليد كحالة حالية، وعلى
   سطر السجل كتاريخ)، مش بس جوه `data`. عشان التقارير والفلاتر.
2. على الليد: `closed_at`, `close_type`, `lost_reason_key`, `won_value` ترجع في قائمة الليدز وتفاصيله.
3. في الكسب بـ `interest_id`: الاهتمام ده يتعلم عليه إنه اتباع (زي `is_lost` اللي موجود للاهتمامات، محتاجين `is_won` أو حالة).
4. سجل الليد (`GET /leads/lead/log/{id}`) يرجّع الحقول دي عشان التايملاين يعرضها.

**مهمة المتابعة** بتتعمل من الفرونت بطلب عادي على `POST /api/tenant/tasks` (`type: follow_up`, `taskable_type: Lead`,
`due_date = follow_up_at`، ومسندة لمسؤول الليد). لو عايزين السيرفر يعملها بنفسه من `follow_up_at` قولوا، ونشيلها من الفرونت
عشان ما تتعملش مرتين.

### A3 — منع تحريك ليد مقفول + السبب إجباري (P1)

الفرونت بيمنع ده في الواجهة بس. المطلوب من السيرفر:
- لو الليد في حالة `is_deal` أو `is_lost` والطلب بينقله لحالة تانية **من غير** `data.close_type = "reopen"` ← `422`
  ("العميل مقفول، استخدم إعادة الفتح").
- إعادة الفتح محتاجة `note` مش فاضية، ويُفضّل تبقى بصلاحية (مدير/مشرف) ← `403` لغير المسموح لهم.
- النقل لحالة `is_lost` من غير `lost_reason_key` ← `422`.
- لو `lost_reason_key = other` لازم `note`.

### A4 — قائمة أسباب الخسارة لكل شركة (P2)

دلوقتي القائمة ثابتة في الفرونت. المطلوب CRUD بسيط:
```http
GET  /api/tenant/definitions/lost-reasons
→ { "data": [{ "id": 1, "key": "price", "label": "السعر", "active": 1, "order": 1 }] }
POST /api/tenant/definitions/create/lost-reason   { "key": "budget", "label": "الميزانية", "active": 1, "order": 8 }
POST /api/tenant/definitions/update/lost-reason/{id}
POST /api/tenant/definitions/delete/lost-reason/{id}
```
`key` ثابت بعد الإنشاء، لأن التقارير بتتجمع عليه. يُفضّل نفس القائمة تخدم الصفقات كمان (`lost_reasons` في B13) بدل قائمتين.

### A5 — صفقات الليد (P2)

لو الليد جوه صفقة، **الكسب لازم يتعمل من الصفقة** (`POST /deals/leads/{id}/won`) عشان يتعمل العقد والأقساط. الواجهة
بتقول كده للمستخدم بس، لأنها مش عارفة الليد في أنهي صفقة. المطلوب واحد من الاتنين:
```http
GET /api/tenant/leads/{leadId}/deals
→ { "data": [{ "deal_id": 1, "deal_name": "...", "deal_lead_id": 101, "status": "open", "stage": { "id": 10, "name": "..." } }] }
```
أو `deals[]` بنفس الشكل جوه رد الليد. وقرار مطلوب: هل كسب الليد في مركز العملاء **يتمنع** لو عنده صفقة مفتوحة؟

### A6 — تقرير أسباب الخسارة والتحويل (P2)

```http
GET /api/tenant/leads/reports/closing?from=2026-09-01&to=2026-09-30&user_id=&source=
→ { "data": {
     "won": 42, "lost": 130, "reopened": 5, "won_value": 380000,
     "lost_by_reason": [{ "key": "price", "count": 51 }],
     "by_user": [{ "user_id": 2, "won": 12, "lost": 30 }],
     "by_source": [{ "source": "facebook", "won": 20, "lost": 70 }] } }
```
لحد ما يتعمل، تقارير الليد سنتر مش هتقدر تعرض أسباب الخسارة (الحقول جوه `data` مش قابلة للفلترة).

### A7 — أحداث الأتمتة (P2)

`lead.won` (`won_value`, `interest_id`)، `lead.lost` (`lost_reason_key`)، `lead.reopened`. عشان الـ Workflow Engine يقدر
يبدأ بيها (مثلاً: "لو خسارة بسبب السعر → ابعت عرض بعد شهر").

### A8 — قفل جماعي في طلب واحد (P3)

الفرونت دلوقتي بيبعت طلب لكل ليد (ولو حاجة فشلت، بيعيد الفاشل بس). المقترح:
```http
POST /api/tenant/leads/close/bulk
{ "lead_ids": [5, 6, 7], "status_id": 8, "close_type": "lost", "lost_reason_key": "no_response", "note": "", "follow_up_at": null }
→ { "data": { "closed": [5, 6], "failed": [{ "lead_id": 7, "message": "..." }] } }
```

---

## (ب) الصفقات ومساحة العمل

التفاصيل الكاملة في [DEALS-WORKSPACE-SPEC.md §9](../deals/DEALS-WORKSPACE-SPEC.md). في الفرونت، كل بند مربوط بمفتاح في
`src/features/deals/constants/dealApiStatus.js`، والقيمة `planned` معناها إن الزرار مقفول بتنبيه. لما البند يخلص، القيمة
بتتغير لـ `live` ومش بيتغير حاجة تانية.

### B1 — وحدات المنتج ومنع البيع المكرر (P1)

المنتج يرجع في `/api/tenant/product/data` و`/deals/{id}/products` بحقلين:
```json
{ "id": 31, "name": "فيلا 12", "price": 9000000,
  "unit_mode": "unique",        // unique = قطعة واحدة | units = وحدات متطابقة | service = خدمة
  "available_units": 1 }        // المتاح الآن بعد المباع
```
السيرفر يمنع: كسب قطعة `unique` مرتين (`422` من `.../leads/{id}/won`)، وبيع كمية أكبر من `available_units`، ويقلّل
`available_units` مع كل كسب (ويرجّعها لو العقد اتلغى). **الفرونت دلوقتي:** بيخمّن من المخزون (`stock`/`quantity` = 1 ← قطعة
واحدة)، وبيمنع في الواجهة بس.

### B2 — ملخص الصفقة في القائمة (P1)

`GET /api/tenant/deals` يرجّع مع كل صفقة:
```json
{ "id": 1, "leads_count": 24, "products_count": 1, "team_count": 3,
  "last_activity": { "description": "تم كسب أحمد علي", "created_at": "2026-10-03T12:00:00Z", "causer": { "id": 2, "name": "كريم" } } }
```
(أو `products[]` بدل العدد.) **الفرونت دلوقتي:** بيعمل 3 طلبات لكل صفقة (فريق، منتجات، عملاء) لأحدث 40 صفقة بس، و"آخر
إجراء" بيستنتجه من التواريخ. أول ما الحقول دي ترجع، الطلبات دي بتقف لوحدها.

### B3 — استيراد ملف عملاء (P1)
```http
POST /api/tenant/deals/leads/import        (multipart/form-data)
deal_id, file (xlsx|xls|csv: name | phone | email), owner_id?, stage_id?
→ { "data": { "total": 120, "created": 110, "duplicates": 10, "errors": [{ "row": 7, "message": "..." }] } }
```

### B4 — التوزيع التلقائي على فريق الصفقة (P1)
```http
POST /api/tenant/deals/{dealId}/leads/distribute
{ "strategy": "round_robin" | "least_loaded", "scope": "unassigned" | "selected",
  "deal_lead_ids": [101, 102], "user_ids": [2, 4], "team_id": 3 }
→ { "data": { "assigned": [{ "deal_lead_id": 101, "owner_id": 2 }], "count": 12 } }
```
التنفيذ على السيرفر (التوزيع مسؤولية الباك إند)، ويبعت إشعار لكل مسؤول.

### B5 — ربط المهام والأنشطة بالصفقة (P1)
- قبول `taskable_type = App\Models\Deal` في `POST /api/tenant/tasks` و`POST /api/tenant/meetings`.
- فلاتر: `GET /api/tenant/tasks?taskable_type=&taskable_id=` و`GET /api/tenant/meetings?deal_id=` (يرجّع أنشطة الصفقة
  **وعملائها**).
- في رد المهمة لما تكون على عقد: `taskable.deal_id`.

**الفرونت دلوقتي:** بيجيب آخر 200 مهمة ونشاط في الشركة كلها ويفلترهم عنده، فالقديم ممكن ما يظهرش.

### B6 — شكل رد عملاء الصفقة (P1)
`GET /deals/{id}/leads` يرجّع لكل DealLead: `id, lead_id, stage_id, status, owner_id, owner{id,name}, estimated_value,
last_activity_at, won_at, lost_at, lost_reason, created_at, lead{id, name, phone, email, company, customer_id, source}`.
ومعاه pagination حقيقي (الفرونت دلوقتي بيطلب `per_page=500` مرة واحدة).

### B7 — بعد الكسب والخسارة (P1)
- السيرفر ينقل `stage_id` لمرحلة `is_won_stage`/`is_lost_stage` بنفسه (الفرونت بيعمل `change-stage` بعدها كحل مؤقت).
- رد الكسب = العقد كامل بنفس شكل `GET /contracts/{id}`.
- `422` برسالة واضحة لو العميل مقفول أصلاً.

### B8 — دفع الأقساط (P1)
```http
POST /api/tenant/deals/contracts/{contractId}/installments/{installmentId}/pay
{ "amount": 98, "paid_at": "2026-10-03", "method": "cash" | "bank" | "card", "reference": "..." }
→ { "data": <القسط بعد التحديث>, "contract": { "paid": 198, "remaining": 392 } }
```
وفي رد العقد والقسط: `paid_amount`، وحالة `overdue` لما الميعاد يعدّي.

### B9 — إعادة فتح عميل الصفقة / إزالته (P2)
- `POST /api/tenant/deals/leads/{dealLeadId}/reopen` (للمدير؛ ممنوع لو فيه عقد ساري).
- `DELETE /api/tenant/deals/leads/{dealLeadId}` (ممنوع لو `won`).

### B10 — الفريق (P2)
- تغيير الدور: `POST /api/tenant/deals/team/{id}` `{ "role": "manager" }`.
- `GET /deals/{id}/team`: لما العضو فريق، يرجّع `team.users[]` (id, name).

### B11 — إنشاء الصفقة في طلب واحد (P2)
```http
POST /api/tenant/deals/wizard
{ "pipeline_template_id": 5,               // أو "pipeline_template": { name, type, status, stages[] }
  "deal": { name, description, type, status, start_date, end_date, target_revenue, target_leads, owner_id },
  "team": [{ "user_id": 4, "role": "sales_rep" }, { "team_id": 3, "role": "sales_rep" }],
  "product_ids": [31] }
→ 201 { "data": { "id": 88, ... } }
```
**الفرونت دلوقتي:** 4 طلبات بالترتيب (القالب ← الصفقة ← الفريق ← المنتجات)، وبيكمّل من مكان الفشل من غير ما يكرر الصفقة.

### B12 — التحليلات (P2)
- طلب "overview funnel" في الكولكشن بيشاور على `/overview`: المطلوب `GET /deals/{id}/analytics/funnel`.
- إضافة `GET /deals/{id}/analytics/sources`.
- شكل overview المقترح: `{ total_leads, open, won, lost, revenue, pipeline_value, achievement_percentage, win_rate,
  stages_summary: [{ stage_id, count, value }] }`.

### B13 — إعدادات مساحة العمل (P2)
```http
GET  /api/tenant/deals/{dealId}/settings
POST /api/tenant/deals/{dealId}/settings
{ "lost_reasons": [{ "key": "price", "label": "السعر", "active": true }],
  "payment_defaults": { "payment_type": "installment", "number_of_installments": 6, "frequency": "monthly" },
  "card_fields": ["phone", "owner", "last_activity", "value"],
  "stage_rules": [{ "stage_id": 11, "required_fields": ["estimated_value"], "sla_hours": 48 }],
  "notifications": { "lead_assigned": true, "stage_changed": false } }
```

### B14 — سجل نشاط الصفقة (P2)
`GET /api/tenant/deals/{dealId}/activity-log?page=` يرجّع مين عمل إيه وإمتى (إضافة عميل، نقل مرحلة، كسب، خسارة، تعديل
الفريق). آخر سطر فيه هو `last_activity` في B2.

### B15 — أحداث الأتمتة (P2)
`deal.lead_added`، `deal.stage_changed`، `deal.lead_won`، `deal.lead_lost`، `deal.lead_stale` (بعد N يوم)،
`deal.contract_created`، `deal.installment_due` (قبل N يوم)، `deal.installment_overdue`.

### B16 — `custom_staged` (P2)
الفرونت بيبعت `notes` بس. المقترح:
```json
{ "payment_type": "custom_staged", "stages": [{ "label": "عند التعاقد", "amount": 100, "due_date": "2026-10-01" }] }
```

### B17 — الذكاء الاصطناعي (P3)
```http
GET  /api/tenant/deals/{dealId}/ai/insights   → { "data": [{ "id": "stale_leads", "severity": "high", "title": "...", "deal_lead_ids": [101] }] }
POST /api/tenant/deals/{dealId}/ai/ask         { "question": "...", "language": "ar" } → { "data": { "answer": "...", "sources": [] } }
```
الموديل والمفاتيح على السيرفر بس.

---

## (ج) أسئلة وقرارات مفتوحة

1. **الكسب في مركز العملاء = إيه؟** الفرونت شغال على إن الكسب "اتحول لعميل/اشترى" ومعاه اختياري الاهتمام والقيمة. هل
   المفروض كمان يتعمل Customer بشكل رسمي (لو الليد ونموذج العميل منفصلين)؟ وهل يتمنع لو الليد عنده صفقة مفتوحة (A5)؟
2. **أسباب الخسارة:** قائمة واحدة للشركة (A4) تخدم الليد سنتر والصفقات؟ ولا كل صفقة ليها قائمتها (B13)؟ المقترح: قائمة
   الشركة هي الأساس، والصفقة تقدر تقفل أسباب منها بس.
3. **مسارات القوالب:** القراءة والحذف على `/api/pipeline-templates`، والإنشاء والتعديل على `/api/tenant/pipeline-templates`.
   يا ريت يبقوا كلهم تحت `/api/tenant`.
4. **"update + sync" للقوالب:** هل تعديل القالب بيأثر على الصفقات الموجودة؟ الفرونت ماشي على إنه لأ.
5. **`productsc`:** غلطة إملائية في `GET /deals/leads/{id}/productsc`. لو اتصلحت، قولوا ونغيّرها.
6. **العقد بيرجع `lead_id`** مش `customer_id`: مرتبط بالسؤال 1.
7. **تعارض اسم Deal:** في مواصفة خدمة العملاء (`docs/customer-service/SERVICE-MASTER-SPEC.md` §29.7)، جدول `deals` معناه
   عملية بيع واحدة، وهنا الـ Deal حاوية والـ DealLead هو عملية البيع. وخطط الدفع هناك مكتبة على مستوى الشركة، وهنا بتتبعت
   مع الكسب. **لازم قرار قبل ما الفوترة تتبني.**
