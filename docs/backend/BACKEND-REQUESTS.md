# المطلوب من الباك إند — قفل الليد والصفقات والكتالوج

> **Documentation update:** 2026-10-04 14:45 (Africa/Cairo) — الملف اتعمل: كل اللي الفرونت محتاجه من الباك إند في
> جزئين: (أ) قفل الليد في مركز العملاء، (ب) الصفقات ومساحة العمل. مجمّع من
> [deals/DEALS-WORKSPACE-SPEC.md §9–§10](../deals/DEALS-WORKSPACE-SPEC.md) ومن شغل قفل الليد
> ([2-SALES → Closing a lead](../2-SALES.md#closing-a-lead)).
> **2026-10-04 20:03 (Africa/Cairo)** — القسم (أ) اتحدّث: A1 متحقق، أسباب لكل حالة (A4)، إعادة الاستهداف، الإضافة لصفقة،
> قواعد الحالات (A6)، والربط مع الصفقات (A7). أرقام A8–A10 اتغيرت.

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
| A1 | أنواع الحالات في قائمة الحالات | قفل الليد | ✅ متحقق |
| A2 | حقول القفل في `save/action` تتخزن كأعمدة وترجع | قفل الليد | P1 |
| A3 | قفل الليد على السيرفر (إعادة فتح، سبب، متابعة) | قفل الليد | P1 |
| A4 | أسباب لكل حالة (`reasons`) | قفل الليد | P1 |
| A5 | صفقات الليد في الرد + منع البيع لليد في صفقة مفتوحة | قفل الليد | P1 |
| A6 | قواعد الحالات + الحالة الافتراضية لكل نوع | قفل الليد | P2 |
| A7 | الربط: كسب/خسارة الصفقة يحدّث حالة الليد | قفل الليد | P1 |
| A8 | تقرير القفل وأسبابه | قفل الليد | P2 |
| A9 | أحداث الأتمتة `lead.won` / `lead.lost` / `lead.retargeted` / `lead.reopened` | قفل الليد | P2 |
| A10 | قفل جماعي في طلب واحد | قفل الليد | P3 |
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
| D1 | رد فعلي (examples) لكل طلبات الكتالوج | الكتالوج | P1 |
| D2 | قائمة الـ Capabilities بالـ schema بتاعها | الكتالوج | P1 |
| D3 | `item_type` بالـ capabilities و`available_units` في `/product/data` و`/info` | الكتالوج | P1 |
| D4 | `kind`: دعم `plan`/`bundle` وحذف `type` | الكتالوج | P1 |
| D5 | الكسب يقبل `product_unit_id` و`item_instance_ids` ويقفل القطعة | الكتالوج + الصفقات | P1 |
| D6 | منع البيع من مركز العملاء لمنتج بقطع أو مخزون | الكتالوج + قفل الليد | P1 |
| D7 | `data` و`description` و`category_id` في المنتج | الكتالوج | P2 |
| D8 | حجز مؤقت للقطعة (Hold / Release) | الكتالوج + الصفقات | P2 |
| D9 | حذف منتج، الوحدة الأساسية، العملة، الأسماء ar/en | الكتالوج | P2 |
| D10 | pagination للقطع وتوحيد مسار JSON في الكولكشن | الكتالوج | P3 |
| C | أسئلة وقرارات مفتوحة | الكل | — |

---

## (أ) قفل الليد في مركز العملاء

> *محدّث 2026-10-04 20:03 (Africa/Cairo)*: أسباب لكل حالة، حالة إعادة الاستهداف، الإضافة لصفقة بدل البيع، منع البيع
> لليد اللي جوه صفقة مفتوحة، قواعد الحالات، والربط مع الصفقات.

**الفكرة:** الشركة بتعرّف حالات الليد بنفسها من صفحة تعريف الحالات، وبتحدد نوع كل حالة. الفرونت بيقرا النوع من نفس
رد `GET /api/tenant/definitions/status`:

| النوع في الإعدادات | الحقل | معناه | اللي بيحصل في الفرونت لما الليد يتنقل للحالة دي |
|---|---|---|---|
| حالة التعاقد/الشراء | `is_deal = 1` | **بيع** | مربع "تسجيل بيع" بخيارين: **تسجيل البيع هنا** (السبب لو الحالة ليها أسباب، الاهتمام اللي اتباع، القيمة، ملاحظة) أو **إضافته لصفقة** (الصفقة هي اللي بتكسب وتعمل العقد) |
| حالة الخسارة | `is_lost = 1` | **خسارة** | مربع "إغلاق كخاسر": السبب **إجباري** من أسباب الحالة، ملاحظة، ومتابعة اختيارية (بعد 7/30/90 يوم أو تاريخ) |
| حالة إعادة الاستهداف | `is_retarget = 1` | **مؤجل** | مربع "المحاولة لاحقاً": تاريخ المتابعة **إجباري** (افتراضي 30 يوم)، سبب اختياري، ملاحظة. الليد بيفضل مفتوح |
| حالة عادية | الكل `0` | — | تغيير حالة عادي. **إلا** لو الليد كان في حالة بيع أو خسارة: ساعتها مربع "إعادة فتح" والملاحظة إجبارية |

ده بيحصل من كل الأماكن: سحب الكارت في اللوحة، تغيير الحالة من الدرور (الزرار السريع والقائمة)، والإجراءات الجماعية. في
الجماعي: الخسارة وإعادة الاستهداف بسبب واحد للكل؛ البيع **ما ينفعش جماعي** (كل ليد ليه منتج وقيمة)، فالمربع بيفتح على
"إضافتهم لصفقة". مربع ملاحظة المتابعة بيقفل حالات البيع والخسارة ("استخدم الإغلاق").

الطلب هو نفس `POST /api/tenant/leads/save/action`. **ما غيّرناش شكله**: بيانات القفل جوه `data`.

### A1 — أنواع الحالات في قائمة الحالات ✅ متحقق

`GET /api/tenant/definitions/status` بيرجّع `is_deal`, `is_lost`, `is_retarget`, `has_resone` (اتأكدنا من الرد يوم
2026-10-04). **المطلوب بس:** يفضلوا راجعين بنفس الأسماء، وتتضاف لهم `reasons` (A4) و`is_default` (A6).

### A2 — حقول القفل في `save/action` (P1)

**الفرونت بيبعت دلوقتي** (مثال خسارة):
```json
POST /api/tenant/leads/save/action
{
  "lead_id": 5,
  "action": "create_activity",
  "type": "note-to-lead",                  // "status_change" في البيع من غير سبب ولا ملاحظة
  "title": "أُغلق كخاسر: حالة الخسارة",
  "description": "السعر — العرض أغلى من المنافس",
  "note": "السعر — العرض أغلى من المنافس",
  "new_status_id": 3,
  "new_status_title": "حالة الخسارة",
  "old_status_title": "status1",
  "activity_at": "2026-10-04 15:00:00",
  "data": {
    "source": "lead_close",                // "lead_close_bulk" في الجماعي
    "close_type": "lost",                  // won | lost | retarget | reopen
    "reason_key": "price",                 // لو اتختار سبب (أي نوع)
    "reason_id": 11,                       // لو السبب جاي من قائمة الحالة (A4)
    "lost_reason_key": "price",            // في الخسارة بس (نفس reason_key — للتوافق)
    "follow_up_at": "2026-11-03",          // خسارة بمتابعة، أو إعادة استهداف (دايماً)
    "won_value": 1500,                     // في البيع (اختياري)
    "interest_id": 33                      // في البيع (اختياري): الاهتمام اللي اتباع
  }
}
```

**المطلوب:**
1. تخزين `close_type`, `reason_key`, `reason_id`, `won_value`, `interest_id`, `follow_up_at` **كأعمدة**: على الليد (الحالة
   الحالية: `closed_at`, `close_type`, `close_reason_id`/`close_reason_key`, `won_value`, `retarget_at`) وعلى سطر السجل
   (التاريخ). مش بس جوه `data` — عشان التقارير والفلاتر (A8).
2. الحقول دي ترجع في قائمة الليدز وتفاصيل الليد وسجل الليد (`GET /leads/lead/log/{id}`).
3. في البيع بـ `interest_id`: الاهتمام يتعلم عليه إنه اتباع (`is_won` أو حالة).

**مهمة المتابعة** (خسارة بمتابعة، أو إعادة استهداف): الفرونت بيعملها بطلب عادي `POST /api/tenant/tasks`
(`type: follow_up`, `taskable_type: App\Models\Lead`, `due_date = follow_up_at`، مسندة لمسؤول الليد). لو عايزين السيرفر يعملها
بنفسه من `follow_up_at`، قولوا ونشيلها من الفرونت عشان ما تتعملش مرتين.

**"إضافته لصفقة"** بيستخدم endpoint موجود وشغال: `POST /api/tenant/deals/leads/add-existing`
`{ "deal_id": 4, "lead_ids": [5, 6], "stage_id": 40 }` (أول مرحلة مفتوحة في الصفقة). حالة الليد ما بتتغيرش. المطلوب بس: الرد
يرجّع `added_count` و`existing_count` (الفرونت بيعرضهم لو موجودين).

### A3 — قفل الليد على السيرفر (P1)

الفرونت بيمنع ده في الواجهة بس — **ده مش حماية**. المطلوب في `save/action`:
- الليد في حالة `is_deal` أو `is_lost` والطلب بينقله لحالة تانية **من غير** `data.close_type = "reopen"` ← `422`
  ("العميل مغلق، استخدم إعادة الفتح").
- `reopen` محتاج `note` مش فاضية، ويُفضّل بصلاحية (مدير/مشرف) ← `403` لغير المسموح لهم.
- النقل لحالة `is_lost` من غير `reason_key` ← `422`.
- النقل لحالة `is_retarget` من غير `follow_up_at` ← `422`.
- النقل لحالة `is_deal` أو `is_retarget` **وليها أسباب** و`has_resone = 1` من غير `reason_key` ← `422`.
- `reason_key = other` من غير `note` ← `422`.
- `reason_key`/`reason_id` لازم يكون من أسباب **نفس الحالة** (A4) ← وإلا `422`.

### A4 — أسباب لكل حالة (P1)

كل حالة بيع/خسارة/إعادة استهداف ليها قائمة أسباب خاصة بيها. الفرونت جاهز: محرر الأسباب ظاهر في نافذة تعريف الحالة (مقفول
بتنبيه لحد ما ده يتعمل)، ومربع القفل بيقرا أسباب الحالة لوحده أول ما ترجع.

**الجدول المقترح:** `lead_status_reasons (id, tenant_id, status_id, key, label, active, order, timestamps)`، و`key` فريد جوه
الحالة وثابت بعد الإنشاء (التقارير بتتجمع عليه). السبب المستخدم **ما يتمسحش** — يتقفل (`active = 0`).

**في الإنشاء والتعديل** (`POST /definitions/create/status` و`/update/status/{id}`): نفس الـ FormData + حقل `reasons` = نص JSON:
```json
reasons = "[{\"id\":11,\"key\":\"price\",\"label\":\"السعر\",\"active\":1,\"order\":1},{\"key\":\"budget\",\"label\":\"الميزانية\",\"active\":1,\"order\":2}]"
```
فيه `id` ← تعديل، مفيهوش ← جديد، سبب قديم مش موجود في القائمة ← يفضل زي ما هو (ما يتمسحش).

**في القراءة** (`GET /definitions/status`): كل حالة ترجع `reasons: [{ id, key, label, active, order }]`.

**في الفرونت لما يخلص:** `DEFINITIONS_API_STATUS.statusReasons` في `src/features/definitions/constants/definitionsApiStatus.js`
تتغير لـ `live`. لحد كده: الخسارة بتستخدم قائمة ثابتة (`price`, `competitor`, `no_response`, `not_interested`,
`not_qualified`, `timing`, `other`)، والبيع وإعادة الاستهداف من غير أسباب.

### A5 — صفقات الليد + منع البيع المكرر (P1)

الليد اللي جوه **صفقة مفتوحة** بيتباع من الصفقة (عشان العقد والأقساط)، مش من مركز العملاء — وإلا الإيراد يتحسب مرتين. الفرونت
بيمنع "تسجيل البيع هنا" وبيعرض لينك الصفقة **لو الليد راجع ومعاه صفقاته**. المطلوب:
- في قائمة الليدز (اللي مركز العملاء بيعرضها) وتفاصيل الليد:
  ```json
  "deals": [{ "deal_id": 4, "deal_name": "صفقة الفيلات", "deal_lead_id": 101, "status": "open" }]
  ```
  (`status` = حالة الليد جوه الصفقة: `open | won | lost`.)
- السيرفر يرفض نقل الليد لحالة `is_deal` في مركز العملاء لو ليه `deal_lead` مفتوح ← `422` برسالة فيها اسم الصفقة.

### A6 — قواعد الحالات (P2)

- الحالة ليها **نوع واحد بس**: أكتر من واحد من `is_deal`/`is_lost`/`is_retarget` = 1 ← `422` (الواجهة بتختار نوع واحد أصلاً).
- ما ينفعش حذف أو تعطيل حالة بيع/خسارة عليها ليدات ← `422` (أو نقل الليدات لحالة تانية من نفس النوع).
- **`is_default`** لكل نوع: حالة بيع افتراضية وحالة خسارة افتراضية للشركة (للربط في A7). لو مفيش، أقل `priority`.
- الواجهة بتنبّه في صفحة الحالات لو الشركة مفيهاش حالة بيع أو حالة خسارة.

### A7 — الربط مع الصفقات (P1)

لما ليد يتكسب أو يخسر **جوه صفقة** (`POST /deals/leads/{id}/won|lost`)، السيرفر يحدّث الليد نفسه في مركز العملاء:
- كسب ← حالة البيع الافتراضية (A6)، `close_type = won`، `won_value` = إجمالي العقد، `deal_id`.
- خسارة ← حالة الخسارة الافتراضية، `close_type = lost`، `reason_key` = سبب الخسارة في الصفقة.
- إعادة فتح الصفقة (B9) ← يرجّع الليد لحالته قبل القفل.
- ويتسجل سطر في سجل الليد ("اتكسب في صفقة X").

### A8 — تقرير القفل (P2)

```http
GET /api/tenant/leads/reports/closing?from=2026-09-01&to=2026-09-30&user_id=&source=&status_id=
→ { "data": {
     "won": 42, "lost": 130, "retargeted": 18, "reopened": 5, "won_value": 380000,
     "by_reason": [{ "status_id": 3, "reason_key": "price", "label": "السعر", "count": 51 }],
     "by_user": [{ "user_id": 2, "won": 12, "lost": 30 }],
     "by_source": [{ "source": "facebook", "won": 20, "lost": 70 }] } }
```

### A9 — أحداث الأتمتة (P2)

`lead.won` (`won_value`, `interest_id`, `reason_key`)، `lead.lost` (`reason_key`)، `lead.retargeted` (`follow_up_at`)،
`lead.reopened`. عشان الـ Workflow يبدأ بيها (مثلاً: "خسارة بسبب السعر ← ابعت عرض بعد شهر").

### A10 — قفل جماعي في طلب واحد (P3)

الفرونت دلوقتي بيبعت طلب لكل ليد (ولو حاجة فشلت بيعيد الفاشل بس). المقترح:
```http
POST /api/tenant/leads/close/bulk
{ "lead_ids": [5, 6, 7], "status_id": 3, "close_type": "lost", "reason_key": "no_response", "note": "", "follow_up_at": null }
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

## (د) الكتالوج: المنتجات والخدمات

> *أُضيف 2026-10-06 23:35 (Africa/Cairo)*: بعد ربط `/products` بكولكشن "Products & Catalog". الفرونت شغال على المسارات
> والـ bodies زي الكولكشن بالظبط، والبنود دي هي اللي ناقصة أو مش واضحة. التفاصيل في
> [features/products/README.md](../../src/features/products/README.md).

### D1 — أمثلة ردود (P1)
الكولكشن مفيهاش ولا response. الفرونت بيقرا أكتر من شكل (`data` / `data.data` / شجرة الفئات القديمة). المطلوب مثال رد حقيقي
لكل طلب، خصوصاً `/product/data` (لسه شجرة فئات ولا قائمة؟) و`/product/info/{id}` و`/product-instances` (paginated؟).

### D2 — قائمة الـ Capabilities (P1)
```http
GET /api/tenant/product/capabilities
→ { "data": [{ "code": "warranty", "version": 1, "applies_to": "both", "config_schema": { ... }, "instance_schema": null }] }
```
لحد ما يتعمل، الفرونت عنده نسخة ثابتة (`constants/capabilityRegistry.js`)، وأي كود جديد بيتعدل كـ JSON.

### D3 — بيانات المنتج في القوائم (P1)
`/product/data` و`/product/info/{id}` و`/deals/{id}/products` يرجّعوا مع كل منتج:
`item_type: { id, name, kind, capabilities[] }`، `base_unit: { id, name, code }`، و`available_units` (عدد القطع `available`، أو
`stock_quantity` للمنتج بالمخزون). ده بيحل محل `unit_mode` في **B1**: الفرونت هيستنتج النوع من الـ capabilities.

### D4 — `kind` (P1)
الكولكشن فيها `product` بس. المواصفة §25.3 فيها `product | service | plan | bundle`، والفرونت بيبعت الأربعة. و`type` القديم
اختفى من الكولكشن: الفرونت بيبعت `kind` بس، ولسه بيقرا `type` لو رجع. يا ريت يتأكد إن المنتجات القديمة اتنقلت لـ `kind`.

### D5 — الكسب بالوحدة والقطعة (P1)
`POST /deals/leads/{id}/won`: كل سطر يقبل `product_unit_id` و`item_instance_ids[]`. السيرفر يعلّم القطع `sold`، ويخصم المخزون
بالوحدة الأساسية (الكمية × `factor`)، ويرجّع `422` لو قطعة مش `available`. وإلغاء العقد أو إعادة الفتح (B9) يرجّعها `available`.

### D6 — البيع من مركز العملاء (P1)
`save/action` بحالة `is_deal` لاهتمام منتجه عليه `unique_unit` أو `serial_tracking` أو `is_stock_tracked` ← `422` (يتباع من صفقة)،
أو يقبل `quantity` و`item_instance_id` ويخصم. محتاجين قرار.

### D7 — حقول المنتج (P2)
الفرونت بيبعت `description` (مش `desc`)، و`category_id`، و`data` (البيانات الإضافية كـ JSON string). المطلوب يتخزنوا ويرجعوا.

### D8 — الحجز المؤقت (P2)
`POST /product/product-instances/{id}/hold { "until": "2026-10-13", "deal_lead_id": 101 }` و`/release`، والسيرفر يرجّعها
`available` بعد `until` (المواصفة §19.3، §29.8).

### D9 — تكملة (P2)
حذف منتج (أو تعطيل فقط)؛ اختيار `base_unit_id` وقت الإنشاء (الخدمات وحدتها ساعة/زيارة مش "قطعة")؛ `currency_code` مع السعر
وأرقام decimal مش float؛ أسماء الأنواع والوحدات `{ ar, en }` (المواصفة §23).

### D10 — تنظيم (P3)
`per_page`/`page` حقيقي في `/product-instances` (الفرونت بيطلب 200). وطلب "Create Products (JSON)" في الكولكشن على
`{{url_server}}api/...{{apiPass}}` وفي الـ body تعليقات `//` (JSON مش صالح) — يتوحد مع `{{base_url}}`.

---

## (ج) أسئلة وقرارات مفتوحة

1. **البيع في مركز العملاء — اتحسم 2026-10-04:** حالة `is_deal` = بيع اتقفل. الليد اللي جوه صفقة مفتوحة بيتباع من الصفقة
   بس (A5)، والصفقة بتحدّث حالته (A7). لسه مفتوح: هل البيع لازم يعمل Customer رسمي لو الليد والعميل نموذجين منفصلين؟
2. **أسباب الخسارة — اتحسم 2026-10-04:** الأسباب على مستوى **الحالة** (A4). قائمة `lost_reasons` في إعدادات الصفقة (B13)
   يُفضّل تتشال، وخسارة الصفقة تاخد أسبابها من حالة الخسارة الافتراضية (A6) عشان يبقى فيه مصدر واحد.
3. **مسارات القوالب:** القراءة والحذف على `/api/pipeline-templates`، والإنشاء والتعديل على `/api/tenant/pipeline-templates`.
   يا ريت يبقوا كلهم تحت `/api/tenant`.
4. **"update + sync" للقوالب:** هل تعديل القالب بيأثر على الصفقات الموجودة؟ الفرونت ماشي على إنه لأ.
5. **`productsc`:** غلطة إملائية في `GET /deals/leads/{id}/productsc`. لو اتصلحت، قولوا ونغيّرها.
6. **العقد بيرجع `lead_id`** مش `customer_id`: مرتبط بالسؤال 1.
7. **تعارض اسم Deal:** في مواصفة خدمة العملاء (`docs/customer-service/SERVICE-MASTER-SPEC.md` §29.7)، جدول `deals` معناه
   عملية بيع واحدة، وهنا الـ Deal حاوية والـ DealLead هو عملية البيع. وخطط الدفع هناك مكتبة على مستوى الشركة، وهنا بتتبعت
   مع الكسب. **لازم قرار قبل ما الفوترة تتبني.**
