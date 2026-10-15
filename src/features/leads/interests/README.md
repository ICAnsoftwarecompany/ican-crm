# features/leads/interests — اهتمامات العميل على الكتالوج الجديد

> **Documentation update:** 2026-10-15 16:10 (Africa/Cairo) — عرض الاهتمام الموحد (§2.1) في التبويب والخط الزمني وعمود الجدول ونافذة المقارنة.
> 2026-10-15 15:30 (Africa/Cairo) — الفولدر اتعمل: نافذة إضافة/تعديل الاهتمام اتبنت من جديد على
> هيكل المنتجات والخدمات الجديد (النوع، نوع الصنف، القدرات، الوحدات، الحاجات المرفقة، القطع)، وبدّلت `InterestFormDialog` القديمة.

| | |
|---|---|
| **بيتفتح من** | درج العميل في مركز العملاء: زرار "إضافة اهتمام" (`quick-actions/interests/AddInterestQuickAction.jsx`) و"تعديل" في تبويب الاهتمامات (`tabs/InterestsTab`) |
| **الواجهة العامة** | `index.js` (ومنه `features/leads/index.js`): `LeadInterestDialog`, `InterestCard`, `InterestLevelBadge`, `useInterestCatalogIndex`, `toInterestView`، والدوال الصافية |
| **الـ API** | نفس الطلبات القديمة: `POST /api/tenant/interesteds/save` و`/edite` (`interestedsApi`) — **مفيش endpoint جديد** |
| **الكتالوج** | من `features/products` (الواجهة العامة بس): `useCatalogProducts`, `useItemTypes`, `useProductUnits`, `useProductRelations`, `useProductInstances` |
| **الترجمة** | `leads.interestDialog.*` في `src/locales/{ar,en}/leads.js` |
| **الاختبارات** | `utils/interests.test.js` و`utils/interestView.test.js` (المنطق) + `LeadInterestDialog.test.jsx` (النافذة على كتالوج وهمي) |

---

## 1. الرحلة

**الخطوة 1 — اختيار الصنف (`InterestProductPicker`)**
- تبويبات: الكل · منتجات · خدمات · خطط واشتراكات · باقات (بالعدد؛ التبويب الفاضي مش بيظهر).
- بحث بالاسم أو الكود أو الفئة، وفلتر بأنواع الأصناف الموجودة في التبويب (ومعاها "من غير نوع").
- كل سطر: الاسم، النوع (منتج/خدمة…)، نوع الصنف · الفئة، السعر. الأصناف الموقوفة مش بتظهر (إلا لو الاهتمام المتعدّل عليها).
- حالات التحميل والخطأ (إعادة المحاولة) والكتالوج الفاضي (لينك "إضافة منتج أو خدمة").

**الخطوة 2 — التفاصيل.** الحقول بتتحدد من **قدرات نوع الصنف** (`utils/interestProfile.js`)، مش من اسمه:

| الصنف | اللي بيظهر |
|---|---|
| منتج عادي (من غير نوع، أو باركود/دفعات/ضمان…) | **الوحدة** (الأساسية أو البديلة زي "علبة ×10" بسعرها) + **الكمية** |
| منتج `unique_unit` (عقارات، عربيات) | **الوحدات اللي العميل مهتم بيها** بحالتها (متاح/محجوز/مباع؛ المباع مقفول) + مدة الحجز المؤقت لو النوع فيه `availability`. من غير كمية ولا وحدة قياس |
| منتج `serial_tracking` | زي المنتج العادي + جملة إن السيريال بيتحدد وقت البيع أو التسليم |
| خدمة | **العدد** (مرات/زيارات/ساعات) |
| خدمة فيها `participants` / `capacity` | **عدد الأفراد** بدل العدد، بحدود النوع، و**السعر للفرد** |
| فيها `scheduling` / `onsite` | **التاريخ المفضل** |
| خطة (`plan`) | من غير كمية؛ السعر والقيمة **لكل دورة** (شهر/سنة… من `recurrence`) |
| باقة | الكمية |
| أي صنف ليه حاجات مرفقة | **بييجي معاه** (`included`، للعرض) + **إضافات** (`optional`، checkbox بسعرها، وبتتحسب في القيمة) |

وفي كل الحالات: درجة الاهتمام (مرتفعة/متوسطة/منخفضة)، ملاحظة، و**القيمة المتوقعة** (`estimateInterest`):
سعر الوحدة × الكمية (أو × الأفراد) + الإضافات المختارة.

كارت الصنف فوق التفاصيل بيوري: النوع، نوع الصنف والفئة، السعر، القدرات، وحقائق البيع (ضمان X شهر، بيتجدد كل…،
السعر للفرد، متاح بالتقسيط، البيع بينشئ…)، وزرار "تغيير" ولينك صفحة الصنف (تبويب جديد).
الصنف اللي من غير نوع بيظهر بالحقول الأساسية بس، مع جملة إن تحديد نوع ليه هيظهر حقوله.

**التعديل** بيفتح على التفاصيل على طول، وبيقرا الحقول الجديدة لو السيرفر رجّعها.

---

## 2. الطلب

نفس شكل الطلب القديم بالظبط، والحقول الجديدة **بتتضاف للعنصر بس لما تنطبق** (`buildInterestPayload`):

```json
{
  "lead_id": 5,
  "interesteds": [{
    "product_id": 41, "note": "", "interest_level": "high",
    "item_type_id": 2,
    "quantity": 2,                    // منتج / خدمة / باقة
    "product_unit_id": 50,            // لو اختار وحدة بديلة
    "item_instance_ids": [70, 73],    // unique_unit
    "preferred_date": "2026-11-01",   // scheduling / onsite
    "participants": 3,                // participants / capacity
    "optional_product_ids": [43],     // إضافات اختارها
    "estimated_value": 15300
  }]
}
```
التعديل: نفس الشكل + `id` فوق وجوه العنصر (زي القديم).
**لحد ما السيرفر يخزن الحقول دي** ([BACKEND-REQUESTS §E1](../../../../docs/backend/BACKEND-REQUESTS.md)) اللي بيتحفظ هو
الصنف والدرجة والملاحظة بس. كارت الاهتمام (§2.1) بيعرضها أول ما ترجع، ومش بيعرض حاجة قبل كده.

### 2.1 عرض الاهتمام في كل مكان (2026-10-15 16:10 (Africa/Cairo))

نموذج عرض واحد (`utils/interestView.js` → `toInterestView(source, index)`) وكارت واحد (`components/InterestCard.jsx`) في:

| المكان | الملف | الشكل |
|---|---|---|
| تبويب الاهتمامات في الدرج | `pages/customers/.../tabs/InterestsTab/InterestsTab.jsx` | `full` + أزرار تعديل / عرض |
| الخط الزمني ("المنتجات المهتم بها") | `.../CustomerActivityTimeline/renderers/InterestedProductsActivity.jsx` | `compact` لكل صنف |
| عمود "المنتجات والاهتمامات" في الجدول | `.../customers-table/CustomerProductsCell.jsx` | `compact` لآخر اهتمام + "+N" + عرض |
| نافذة "المنتجات والاهتمامات" | `.../CustomerProductsDialog/` (`InterestedProductsPanel`, `AvailableProductsPanel`, `productsDialogItems.js`, `KindCounts`) | `full`؛ التبويبات بقت بالـ `kind` (منتجات/خدمات/خطط/باقات) بدل نوع الفئة |

- `toInterestView` بيقرا كل أشكال الاهتمام (صف `lead.interesteds`، الـ "linked product" بتاع الجدول، عنصر السجل) وبيكمّل
  الصنف من الكتالوج (`useInterestCatalogIndex`: طلب واحد مشترك): الاسم، النوع، نوع الصنف · الفئة، الصورة، السعر
  (`/ شهر` للخطط، `للفرد` للخدمات بالأفراد)، والقدرات. فعنصر السجل اللي فيه `product_id` بس بقى بيظهر باسمه بدل "منتج #1".
- الكارت بيعرض: النوع، الدرجة بكلمة ("اهتمام عالي" مش "H")، صفقة / خسارة، المصدر (يدوي/فورم/إعلان/حملة)، التاريخ،
  الملاحظة، تفاصيل الاهتمام (كمية، وحدات، تاريخ، أفراد، إضافات، قيمة)، والقدرات. اتشالت منه بيانات `data` الخام.
- "التفاصيل" في النافذة لسه بتفتح `ProductInfoDialog` القديم (بيانات المنتج الكاملة والعملاء المهتمين).

---

## 3. شكل الفولدر

```
interests/
├── index.js · README.md
├── LeadInterestDialog.jsx         النافذة: الخطوتين، الدرجة، الملاحظة، القيمة، الحفظ
├── hooks/useLeadInterestForm.js   الكتالوج، الصنف ونوعه وملفه، الوحدات/المرفقات/القطع، القيمة، الحفظ
├── hooks/useInterestCatalogIndex.js  فهرس الكتالوج المشترك للعرض
├── components/
│   ├── InterestCard.jsx           كارت العرض الموحد (full / compact) + InterestLevelBadge
│   ├── InterestProductPicker.jsx  الخطوة 1
│   ├── SelectedProductCard.jsx    كارت الصنف المختار
│   ├── InterestDetailsFields.jsx  الوحدة/الكمية/الأفراد/التاريخ (+ القطع)
│   ├── InterestUnitsPicker.jsx    الوحدات الفريدة بحالتها
│   ├── InterestRelationsField.jsx المرفقات والإضافات
│   ├── InterestEstimate.jsx       القيمة المتوقعة
└── utils/
    ├── interestProfile.js         القدرات ← الحقول (صافي)
    ├── interestForm.js            الفورم ⇄ الطلب، التحقق، القيمة (صافي)
    ├── interestView.js            أي شكل اهتمام + الكتالوج ← نموذج العرض (صافي)
    ├── interestView.test.js
    └── interests.test.js
```

## 4. إزاي توسّعه
- **قدرة جديدة بتغيّر الاهتمام:** ضيف علمها في `getInterestProfile`، وحقلها في `InterestDetailsFields`، والحقل في
  `EMPTY_INTEREST_FORM` / `interestToForm` / `buildInterestPayload`، والترجمة، والاختبار.
- القاعدة: **اقرا القدرات، مش اسم النوع ولا نموذج الخدمة.**

## 5. حاجات ناقصة
- الحقول الجديدة مش بتتخزن لحد §E1. حجز الوحدة فعلياً (Hold) مستني D8؛ هنا الاختيار "مهتم بيها" بس.
- السيريال مش بيتختار في الاهتمام (مكانه البيع/التسليم).
- ملاحظة المتابعة وعروض الأسعار لسه بيختاروا المنتج من `useProducts` القديم، و`ProductInfoDialog` لسه بالشكل القديم.
- اتجربت بالعين على كتالوج وهمي (عربي/إنجليزي، فاتح/غامق)، مش على سيرفر حقيقي.
