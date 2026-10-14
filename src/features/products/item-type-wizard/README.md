# features/products/item-type-wizard — إضافة نوع منتج أو خدمة

> **Documentation update:** 2026-10-15 00:43 (Africa/Cairo) — `QuickItemTypeDialog` اتضاف (نوع سريع من إضافة المنتج)، و`HelpTip` / `TutorialPanel` / `usePersistentFlag` اتنقلوا لـ `components/common` و`hooks` لأن إضافة المنتج بتستخدمهم كمان.
> 2026-10-15 00:08 (Africa/Cairo) — الفولدر اتعمل وكل مكونات إضافة النوع اتنقلت فيه، والملف ده اتكتب.

الفولدر ده فيه **كل حاجة تخص إضافة وتعديل نوع صنف** (Item Type) في الكتالوج: الصفحة، المراحل، القوالب الجاهزة،
الوضع التعليمي، دليل البداية، ومنطق نقل افتراضيات النوع للمنتج الجديد.

| | |
|---|---|
| **المسارات** | `/products/item-types/new` (إضافة، `?kind=` و`?returnTo=`) · `/products/item-types/:itemTypeId` (تعديل) |
| **الصفحات** | `pages/products/ItemTypeCreatePage.jsx` · `pages/products/ItemTypeEditPage.jsx` (رفيعة، بتقرا الـ URL بس) |
| **الواجهة العامة** | `index.js` — أي حد برة الفولدر يستورد منه بس |
| **الترجمة** | `src/locales/{ar,en}/catalogSetup.js` (namespace `catalogSetup`) + مفاتيح قليلة في `catalog.js` |
| **الـ API** | `GET/POST /api/tenant/product/item-types` · `GET/PUT /item-types/{id}` · `GET/POST /product/units` · `POST /product/create` (خدمة سريعة) |
| **الاختبارات** | `utils/*.test.js` + سيناريوهات الصفحة في `pages/products/productRoutes.test.jsx` |

---

## 1. يعني إيه "نوع"؟ وليه بييجي الأول؟

النوع هو **قالب** للمنتجات أو الخدمات. لما المنتج يتسجل بنوع معين، النوع بيحدد:

- **القدرات (Capabilities):** المنتج محتاج إيه — سيريال، دفعة وصلاحية، ضمان، حجز ميعاد، زيارة موقع، تجديد…
  وكل قدرة بتضيف حقول في فورم المنتج، وبتحدد شكل القطع (Product Instances): سيريال، وحدة عقارية، أو دفعة.
- **نموذج الخدمة** (A–H) و**"البيع بينشئ"** (أصل، اشتراك، حجز، شحنة…): إيه اللي يحصل بعد ما الصفقة تتقفل.
- **الوحدات الافتراضية:** زي "علبة = 10 قطع"، وكل منتج جديد من النوع بيبدأ بيها.
- **الحاجات المرفقة الافتراضية:** زي "تركيب مجاني" أو "عقد صيانة اختياري"، وبتتنسخ في كل منتج جديد.

عشان كده التسجيل الصح: **الأنواع ← الوحدات ← المنتجات**، وده اللي دليل البداية (`CatalogSetupGuide`) بيقوله للعميل.

---

## 2. شكل الفولدر

```
item-type-wizard/
├── index.js                      الواجهة العامة للفولدر
├── README.md                     الملف ده
├── ItemTypeWizard.jsx            الصفحة: الهيدر، شريط المراحل، المرحلة الحالية، لوحة الشرح، أزرار التنقل، شاشة النجاح
├── hooks/
│   └── useItemTypeWizard.js      كل الـ state: الفورم، المرحلة، الأخطاء، القالب، الحفظ، الرجوع لـ returnTo
├── steps/                        مرحلة = ملف
│   ├── KindStep.jsx              1. بتبيع إيه؟ (منتج / خدمة / خطة / باقة) + معرض القوالب
│   ├── BasicsStep.jsx            2. الاسم، الكود، الوصف، نموذج الخدمة، البيع بينشئ، الحالة
│   ├── CapabilitiesStep.jsx      3. القدرات في مجموعات + القدرات المخصصة بالكود (JSON)
│   ├── UnitsStep.jsx             4. الوحدات الافتراضية (بتظهر بس لو النوع بيتباع بوحدات)
│   ├── TypeRelationsStep.jsx     5. الحاجات المرفقة + اقتراحات القالب + خدمة سريعة
│   └── TypeReviewStep.jsx        6. المراجعة والحفظ
├── components/
│   ├── TemplateGallery.jsx       كروت القوالب + "ابدأ يدوي" + إخفاء/إظهار
│   ├── QuickItemTypeDialog.jsx   نوع سريع (اسم + قالب اختياري) من إضافة المنتج، وزرار "فتح الصفحة الكاملة"
│   ├── QuickServiceDialog.jsx    عمل خدمة بسيطة (اسم + سعر) من غير ما تخرج
│   └── CatalogSetupGuide.jsx     كارت "ضيف الأنواع الأول" في القوائم وإضافة المنتج وصفحة الأنواع
├── constants/
│   └── itemTypeTemplates.js      الـ 25 قالب الجاهزين
└── utils/                        منطق صافي (من غير React) ومتختبر
    ├── itemTypeForm.js           النوع من الـ API ⇄ الفورم ⇄ body الطلب + التحقق
    ├── itemTypeForm.test.js
    ├── itemTypeWizard.js         المراحل، تطبيق القالب، تشغيل/قفل القدرات، تحقق كل مرحلة
    ├── itemTypeWizard.test.js    (+ اختبار إن كل مفتاح ترجمة موجود بالعربي والإنجليزي)
    └── typeDefaults.js           نقل وحدات وحاجات النوع المرفقة للمنتج الجديد
```

**اتجاه الاعتماد:** الفولدر بيستخدم من باقي `features/products`: الـ hooks (`useCatalogSetup`, `useCatalogProducts`)،
`constants/capabilityRegistry.js` و`catalogOptions.js`، `components/common/catalogUi` و`CapabilityConfigFields`،
`components/units/UnitFormDialog`، و`components/common/RelationRowsEditor`، والأدوات المشتركة للشرح
`components/common/{HelpTip,TutorialPanel}.jsx` و`hooks/usePersistentFlag.js` (مستخدمين كمان في `product-create`). وباقي الـ feature بيستخدم منه
`CatalogSetupGuide` و`applyTypeDefaults` عن طريق `index.js` بس.

---

## 3. رحلة العميل خطوة بخطوة

### المرحلة 1 — بتبيع إيه؟ (`steps/KindStep.jsx`)
- كارتين كبار: **منتج** و**خدمة**، وتحتهم "اختيارات تانية" فيها **خطة / اشتراك** و**باقة**.
- تغيير النوع بيمسح الفورم (بيحتفظ بالاسم والوصف بس)، لأن القدرات المتاحة بتختلف بالنوع.
- تحتهم **معرض القوالب** (`TemplateGallery`): قوالب النوع المختار بس + كارت **"ابدأ يدوي"**.
  - اختيار قالب ← `applyTemplate()` بيملا الفورم وينقلك على "البيانات الأساسية".
  - "ابدأ يدوي" ← فورم فاضي للنوع.
  - زرار "إخفاء القوالب" بيتحفظ في المتصفح (`type-templates-hidden`).
- المرحلة دي مش موجودة في التعديل (النوع مينفعش يتغير بعد الحفظ).

### المرحلة 2 — البيانات الأساسية (`steps/BasicsStep.jsx`)
| الحقل | ملاحظات |
|---|---|
| الاسم | إجباري. لو اخترت قالب بيتملي باسم القالب وتقدر تغيره. |
| الكود | إجباري في الإضافة: حروف إنجليزي صغيرة وأرقام و`_`. زرار "استخدم …" بيقترحه من الاسم (لو الاسم إنجليزي). **مقفول في التعديل.** |
| الوصف | اختياري. |
| نموذج الخدمة | A–H، وأول ما تختار الشرح بيتغير للنموذج المختار. |
| البيع بينشئ | `fulfillment_config.creates`، برضه بشرح لكل اختيار. |
| مفعّل | الأنواع الموقوفة مش بتظهر في إضافة منتج جديد. |

### المرحلة 3 — القدرات (`steps/CapabilitiesStep.jsx`)
- القدرات من `constants/capabilityRegistry.js`، متفلترة حسب النوع (`capabilitiesForKind`) ومتقسمة في 4 مجموعات:
  **التتبع والمخزون · ما بعد البيع · الدفع · التنفيذ والتسليم**.
- كل قدرة كارت فيه checkbox؛ لو اتفعلت وليها إعدادات بتظهر حقولها (`CapabilityConfigFields`).
- **التعارض:** `serial_tracking` مع `unique_unit`، و`unique_unit` مع `batch_lot` — بيظهر تنبيه ومينفعش تكمل.
- **متقدم:** إضافة قدرة بكود مش معروف للواجهة، وإعداداتها بتتكتب JSON (لازم يكون object صالح).
- تفعيل `unique_unit` بيمسح الوحدات (كل قطعة فريدة، مش بتتباع بالعلبة) ومرحلة الوحدات بتختفي.

### المرحلة 4 — الوحدات (`steps/UnitsStep.jsx`)
- **بتظهر بس** لو النوع منتج أو خدمة ومن غير `unique_unit` (`supportsUnits()`). الخطة والباقة مفيهمش وحدات.
- كل سطر: الوحدة (من وحدات القياس عندك) + المعامل (علبة فيها 10 ← 10) + "افتراضية" (واحدة بس).
- القوالب بتقترح وحدات بالـ `code` (box, carton, pack, visit, hour):
  - لو الوحدة موجودة عندك بتتضاف لوحدها (حتى لو قائمة الوحدات حملت بعد اختيار القالب).
  - لو مش موجودة بيظهر زرار "اعمل علبة (×10)" بيفتح `UnitFormDialog` متملي، وبعد الحفظ بتتضاف.
- زرار "وحدة قياس جديدة" لأي وحدة تانية.
- الأسعار والباركود **مش هنا** — دول بيتحطوا لكل منتج.

### المرحلة 5 — الحاجات المرفقة (`steps/TypeRelationsStep.jsx`)
- بيعيد استخدام `components/common/RelationRowsEditor` (نفس اللي في إضافة المنتج): الصنف، ضمن السعر / اختياري،
  الكمية، سعر خاص، إضافة تلقائية.
- لو جاي من قالب بتظهر **اقتراحات** (تركيب، عقد صيانة، تأمين سفر، توصيل مطار، باص مدرسة، خطة دعم، تهيئة…)؛ الضغط
  على اقتراح بيفتح `QuickServiceDialog` باسمه، وبعد الحفظ الخدمة بتترفق.
- "عمل خدمة جديدة ورفقها" لأي خدمة تانية (اسم + سعر، `POST /product/create` بـ `kind: service`).

### المرحلة 6 — المراجعة (`steps/TypeReviewStep.jsx`)
- ملخص كل جزء مع زرار "تعديل" يرجعك للمرحلة، وأي خطأ من السيرفر بيظهر هنا.
- **حفظ** = طلب واحد: `POST /item-types` (أو `PUT /item-types/{id}` في التعديل).
- بعد الحفظ:
  - لو فيه `returnTo` (جاي من إضافة منتج) ← يرجع له بـ `?item_type=<id>` والنوع متختار.
  - غير كده ← شاشة نجاح فيها "إضافة منتج/خدمة من النوع ده" (`/products/new?item_type=<id>`) و"رجوع للأنواع".

### التنقل والتحقق
- "التالي" بيتحقق من المرحلة الحالية بس (`validateTypeStep`).
- الضغط على مرحلة قدام في الشريط بيتحقق من كل اللي قبلها (`firstInvalidTypeStep`) ويوقفك عند أول مرحلة فيها خطأ.
- الرجوع لورا مسموح دايمًا. والحفظ بيتحقق من كله تاني.

---

## 4. الوضع التعليمي وشرح الحقول

- زرار **"إظهار / إخفاء الشرح"** في الهيدر، مفعّل افتراضيًا ومحفوظ في المتصفح (`type-tutorial`).
- لما يكون مفعّل، الصفحة بتبقى عمودين: المرحلة + **`TutorialPanel`** على الجنب، وفيها:
  1. كارت المرحلة: عنوان + شرح + نقاط "هتعمل إيه" (`catalogSetup.typeWizard.steps.<step>.guide.*`).
  2. كارت الحقل: شرح الحقل اللي العميل واقف عليه بالماوس أو داخل عليه بالكيبورد.
- إزاي بيشتغل (`../components/common/HelpTip.jsx`، و`TutorialPanel` بياخد `guideKey` = بادئة الترجمة):
  - `HelpScope` بيلف الصفحة وبيحتفظ بـ "الشرح النشط".
  - `HelpField title text` بيلف أي حقل؛ عند `mouseenter` أو `focus` بيبقى هو النشط، وبيحط ⓘ في ركنه.
  - `HelpTip` هو الـ ⓘ نفسه: tooltip بيظهر بالـ hover والـ focus (شغال حتى لو الشرح مقفول).
- عشان تضيف شرح لحقل جديد: لفه بـ `<HelpField title={…} text={…}>` وحط النصوص في `catalogSetup.typeWizard.help.<key>`.

---

## 5. القوالب الجاهزة (`constants/itemTypeTemplates.js`)

كل قالب: `{ id, kind, icon, code, serviceModel, creates, capabilities: [{ code, config }], units?, relationHints? }`.
الاسم والوصف في `catalogSetup.templates.<id>.name/description`.

| القالب | النوع | النموذج / ينشئ | القدرات | وحدات | مقترح يترفق |
|---|---|---|---|---|---|
| appliance أجهزة منزلية | منتج | B / asset | سيريال إجباري، ضمان 24 شهر من التركيب، أقساط | — | تركيب، عقد صيانة |
| equipment معدات | منتج | B / asset | سيريال، ضمان 12 شهر، حقوق خدمة، أقساط | — | تركيب، عقد صيانة |
| medicine أدوية | منتج | A | باركود، دفعة، صلاحية (تنبيه 60 يوم) | علبة ×10 | — |
| grocery بقالة | منتج | A | باركود، دفعة، صلاحية (30 يوم) | كرتونة ×24 | — |
| retail تجزئة | منتج | A / order | باركود | عبوة ×6 | — |
| apparel ملابس | منتج | A / order | باركود | — | — |
| spareParts قطع غيار | منتج | A | باركود، ضمان 3 شهور | علبة ×10 | — |
| realEstate عقارات | منتج | B / asset | وحدة فريدة، حجز 7 أيام، ضمان 12 شهر، أقساط | — | عقد صيانة |
| vehicle عربيات | منتج | B / asset | وحدة فريدة، ضمان 36 شهر، أقساط | — | عقد صيانة |
| digital رقمي | منتج | A | تسليم رقمي (رخصة) | — | — |
| maintenanceVisit زيارة صيانة | خدمة | H / work_order | زيارة موقع، ميعاد 60 دقيقة، ضمان 3 شهور | زيارة | — |
| installation تركيب | خدمة | H / work_order | زيارة موقع، ميعاد 90 دقيقة | — | — |
| cleaning نظافة | خدمة | H / work_order | زيارة موقع، ميعاد 120 دقيقة | ساعة | — |
| consultation استشارة | خدمة | E / booking | ميعاد 60 دقيقة | ساعة | — |
| clinic كشف | خدمة | E / booking | ميعاد 30 دقيقة، مشارك واحد | — | — |
| tourPackage رحلة | خدمة | E / booking | ميعاد، مشاركين، مكونات، مستندات، سعة، أقساط | — | تأمين سفر، توصيل مطار |
| shipment شحن | خدمة | F / shipment | تتبع، طرفين | — | — |
| course كورس | خدمة | D / enrollment | مشاركين، سعة، ميعاد، أقساط | — | — |
| schoolYear سنة دراسية | خدمة | D / enrollment | طالب واحد، حقوق، أقساط | — | باص المدرسة |
| softwareProject مشروع برمجة | خدمة | G / project | مراحل، ضمان 6 شهور، أقساط | — | خطة دعم |
| saasSubscription اشتراك برنامج | خطة | C / subscription | تكرار شهري تلقائي (سماح 7 أيام)، حقوق، رابط | — | تهيئة وتدريب |
| maintenanceContract عقد صيانة | خطة | C / subscription | تكرار سنوي (سماح 15 يوم)، حقوق، أقساط | — | — |
| membership عضوية | خطة | C / subscription | تكرار شهري تلقائي، حقوق | — | — |
| extendedWarranty ضمان ممتد | خطة | C / subscription | ضمان 12 شهر من البيع، حقوق | — | — |
| bundle باقة | باقة | A / order | — | — | أصناف الباقة |

**إضافة قالب جديد:**
1. ضيف object في `ITEM_TYPE_TEMPLATES` (أيقونة من `lucide-react`، أكواد قدرات من الـ registry بس).
2. ضيف `catalogSetup.templates.<id>.name/description` في `ar` و`en`.
3. لو فيه وحدة جديدة في `units` ضيف اسمها في `catalogSetup.typeWizard.unitNames.<code>` (ولو نوعها مش `count`
   ضيفها في `SUGGESTED_UNIT_TYPES` في `UnitsStep.jsx`).
4. لو فيه اقتراح مرفق جديد ضيف `catalogSetup.typeWizard.relationHints.<key>.name` وطريقة رفقه في `HINT_INCLUSION`
   في `TypeRelationsStep.jsx`.
5. `npx vitest run src/features/products` — اختبار الترجمة بيفشل لو نسيت مفتاح، واختبار القوالب بيفشل لو استخدمت قدرة مش موجودة.

---

## 6. شكل البيانات

### الفورم (`EMPTY_ITEM_TYPE_FORM` في `utils/itemTypeForm.js`)
```js
{
  template_id, code, name, description, kind, service_model, status,
  fulfillment_creates,            // → fulfillment_config.creates
  fulfillment_extra: {},          // أي مفاتيح تانية في fulfillment_config بتتحفظ زي ما هي
  capabilities: [{ code, version, config, configJson }],  // configJson للقدرات المخصصة بس
  units:     [{ key, unit_id, factor, is_default }],
  relations: [{ key, child_product_id, inclusion, quantity, price_override, auto_add }],
}
```

### الـ body اللي بيتبعت (`buildItemTypePayload`)
```json
{
  "code": "medicine",
  "name": "أدوية",
  "kind": "product",
  "service_model": "A",
  "status": true,
  "capabilities": [
    { "code": "batch_lot", "version": 1, "config": {} },
    { "code": "expiry", "version": 1, "config": { "alert_days": 60 } },
    { "code": "units", "version": 1, "config": { "alternatives": [{ "unit_id": 3, "factor": 10, "is_default": true }] } }
  ],
  "fulfillment_config": {
    "default_relations": [{ "child_product_id": 32, "inclusion": "included", "quantity": 1, "price_override": 0, "auto_add": true, "sort_order": 1 }]
  }
}
```
- `code` بيتبعت في الإضافة بس. في التعديل `fulfillment_config` بيتبعت دايمًا عشان المسح يتحفظ فعلًا.
- القدرة `units` **داخلية** (`internal: true` في الـ registry): مش بتظهر ككارت قدرة، ولا في chips، ولا في تبويب
  قدرات المنتج (`visibleCapabilities()`).
- ⚠️ **محتاج تأكيد الباك إند:** تخزين `units` و`default_relations` — بند **D11** في
  [docs/backend/BACKEND-REQUESTS.md](../../../../docs/backend/BACKEND-REQUESTS.md). لو السيرفر مش بيخزنهم بيضيعوا بعد الحفظ.

---

## 7. الربط مع إضافة المنتج (`utils/typeDefaults.js`)

- `/products/new?item_type=<id>` بيبدأ والنوع متختار (`ProductCreatePage` ← `ProductCreateWizard initialItemTypeId`).
  لو النوع خطة أو باقة، نوع المنتج بيتظبط عليه.
- أول ما النوع يتحدد (وبعد ما `GET /item-types/{id}` يرجع بالقدرات كاملة)، `applyTypeDefaults()` بيقرر:
  - **سطور فاضية** ← تتملى بوحدات النوع وحاجاته المرفقة.
  - **سطور لسه زي ما اتملت من نوع قبله** ← تتبدل بتاعة النوع الجديد.
  - **سطور العميل عدلها** ← مش بتتلمس أبدًا.
  - نفس الافتراضيات مش بتتطبق مرتين (لو العميل مسحها مش بترجع).
- بيظهر تنبيه "اتملت من النوع X: N وحدة و M حاجة مرفقة".
- الوحدات بتتبعت مع `POST /product/create` (`products[i][units]`) والحاجات المرفقة بـ `POST /products/{id}/relations` —
  نفس طلبات الكولكشن، من غير أي حاجة جديدة.
- زرار "نوع جديد" في إضافة المنتج بيفتح الصفحة دي بـ `returnTo`، وبعد الحفظ بيرجع والنوع متختار.
  (بيانات المنتج اللي اتكتبت قبل كده بتضيع؛ الزرار في أول مرحلة عشان كده.)

---

## 7.1 النوع السريع (`components/QuickItemTypeDialog.jsx`)

- بيتفتح من إضافة المنتج/الخدمة (زرار "نوع سريع" جنب اختيار النوع، وفي كارت النوع، وفي خطوة القطع).
- حقوله: الاسم، الكود (اختياري: بيتعمل من الاسم، ولو الاسم عربي بيتعمل كود فريد)، وقالب جاهز اختياري من قوالب الـ kind ده
  (بيملا القدرات والوحدات بـ `applyTemplate`). الحفظ `POST /item-types` والنوع بيتختار في المنتج على طول.
- زرار **"فتح صفحة النوع الكاملة"** (`onOpenFull`): إضافة المنتج بتحفظ اللي اتكتب كمسودة وتفتح الصفحة دي بـ
  `returnTo=/products/new?draft=<id>`، وبعد الحفظ بترجع بـ `&item_type=<id>` والمسودة بترجع زي ما كانت.

## 8. دليل البداية (`components/CatalogSetupGuide.jsx`)

- Props: `kind` (`product` | `service` | null) · `context` (`list` | `wizard` | `itemTypes`) · `returnTo`.
- بيظهر بس لو **مفيش نوع مفعّل** من الـ kind ده. مش بيظهر وهو بيحمل أو لو الطلب فشل.
- مكانه: قائمة المنتجات وقائمة الخدمات (يتقفل ويتحفظ `guide-dismissed-<kind>`)، أول مرحلة في إضافة المنتج، وصفحة الأنواع.
- فيه 3 خطوات (الأنواع ← الوحدات ← المنتجات؛ الخدمات من غير الوحدات) وزرار لصفحة إضافة النوع.

---

## 9. التفضيلات المحفوظة في المتصفح (`../hooks/usePersistentFlag.js`)

| المفتاح (`ican:catalog:` + …) | المعنى | الافتراضي |
|---|---|---|
| `type-tutorial` | الوضع التعليمي شغال | `true` |
| `type-templates-hidden` | القوالب مخفية | `false` |
| `guide-dismissed-product` / `-service` | دليل البداية اتقفل في القائمة | `false` |

لو التخزين مقفول (Private mode) بيشتغل في الذاكرة بس من غير أخطاء.

---

## 10. الترجمة

- كل نصوص الفولدر في `catalogSetup.*`: `help`, `guide`, `capabilityGroups`, `templates`, `typeWizard`
  (`steps`, `kinds`, `basics`, `help`, `serviceModels`, `creates`, `units`, `unitNames`, `relations`, `relationHints`, `saved`…).
- مفاتيح في `catalog.*`: `validation.kindRequired`, `validation.duplicateUnit`, `common.loading`,
  `create.typeDefaultsApplied`، وأسماء القدرات `catalog.capabilities.<code>`.
- نقاط الشرح (`guide.points`) object مش array (`{ a, b, c }`) لأن `check:i18n` بيقبل نصوص بس.

---

## 11. إزاي توسّعه

- **قدرة جديدة:** في `constants/capabilityRegistry.js` (خارج الفولدر): `code`, `group`, `appliesTo`, `fields`،
  و`conflicts` لو مينفعش تتجمع مع حاجة، و`instance` لو ليها قطع. ونصوصها في `catalog.capabilities.<code>`.
- **مرحلة جديدة:** ضيفها في `TYPE_STEPS` و`getTypeSteps` و`validateTypeStep` (`utils/itemTypeWizard.js`)، ملف في `steps/`،
  سطر في `STEP_COMPONENTS` في `ItemTypeWizard.jsx`، ونصوص `steps.<id>.title/description/guide.*`.
- **حقل جديد في النوع:** في الفورم و`itemTypeToForm` و`buildItemTypePayload` (`utils/itemTypeForm.js`) + اختبار round-trip.

---

## 12. حاجات ناقصة أو مستنية

- تخزين الوحدات والحاجات المرفقة على النوع مستني تأكيد الباك إند (D11).
- القوالب ثابتة في الفرونت؛ مفيش endpoint للقوالب ولا لقائمة القدرات (D2).
- أسماء الأنواع لغة واحدة (مفيش `{ ar, en }` — D9).
- الصفحة متجربتش بالعين ولا على سيرفر حقيقي (RTL/LTR، الوضع الغامق).
