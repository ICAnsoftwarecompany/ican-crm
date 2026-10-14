# features/products/overview — نظرة عامة على المنتجات والخدمات

> **Documentation update:** 2026-10-15 00:56 (Africa/Cairo) — الفولدر اتعمل مع صفحة النظرة العامة، والملف ده اتكتب.

| | |
|---|---|
| **المسار** | `/products/overview`، أول عنصر في القائمة الجانبية للمنتجات والخدمات (مجموعة "الكتالوج") |
| **الصفحة** | `pages/products/ProductsOverviewPage.jsx` |
| **الواجهة العامة** | `index.js`: `ProductsOverviewView`, `buildProductsOverview` |
| **الترجمة** | `src/locales/{ar,en}/productOverview.js` (namespace `productOverview`) + `catalog.nav.overview` |
| **الاختبارات** | `utils/overviewModel.test.js` + سيناريو الصفحة في `pages/products/productRoutes.test.jsx` |
| **الـ API** | مفيش جديد: `GET /product/data`، و`GET /product/item-types`، و`GET /category/data` |

الصفحة دي بتجاوب في لمحة على:
- عندي كام منتج وكام خدمة؟
- قيمتهم كام؟
- متوزعين على أنهي فئات وأنواع؟
- بياناتهم كاملة ولا لأ؟
- ناقصني أنواع؟

الأرقام دي كانت قبل كده كروت فوق قائمة المنتجات (الإجمالي، والمفعّل، وبتتبع مخزون، ومربوط بنوع)، **واتشالت من القوائم واتنقلت هنا**.

---

## 1. شكل الفولدر

```
overview/
├── index.js
├── README.md
├── ProductsOverviewView.jsx      الصفحة: الهيدر + تحديث، التنبيهات، الأرقام الكلية، قسم المنتجات، قسم الخدمات
├── hooks/
│   └── useProductsOverview.js    بيجيب الكتالوج والأنواع والفئات ويحسب الأرقام
├── components/
│   ├── OverviewAlerts.jsx        تنبيه "مفيش أنواع منتجات / خدمات" بلينك لإضافة نوع
│   └── OverviewSection.jsx       قسم واحد (منتجات أو خدمات): 4 أرقام + 3 رسوم
└── utils/
    ├── overviewModel.js          الحسابات كلها (منطق صافي)
    └── overviewModel.test.js
```

الرسوم والأرقام كلها من محرك التقارير المشترك `shared/components/reports` (`KpiRow`، و`ReportChart` بنوع `bar` و`share`)، حسب
القاعدة 12 في `CLAUDE.md`. مفيش Recharts مباشر ولا pie. وكل رسم ليه عرض كجدول.

---

## 2. اللي بيتعرض

### التنبيهات (`OverviewAlerts`)
- **"مفيش أنواع منتجات لسه"** لو مفيش نوع **مفعّل** للمنتجات، ومعاه لينك "إضافة نوع منتج" بيفتح `/products/item-types/new?kind=product`.
- **"مفيش أنواع خدمات لسه"** نفس الكلام للخدمات (`?kind=service`).
- المنتجات هنا معناها كل حاجة مش خدمة، يعني المنتجات والخطط والباقات.

### الأرقام الكلية (فوق)
| الرقم | الحساب |
|---|---|
| المنتجات والخدمات | عدد كل الأصناف |
| قيمة الكتالوج | مجموع أسعار كل الأصناف |
| المنتجات | عدد الأصناف اللي مش خدمة |
| الخدمات | عدد الخدمات |

### قسم المنتجات وقسم الخدمات (`OverviewSection`)
**4 أرقام:**
| الرقم | المنتجات | الخدمات |
|---|---|---|
| العدد | عدد المنتجات + "N مفعّل" | عدد الخدمات + "N مفعّل" |
| القيمة | مجموع الأسعار + متوسط السعر | مجموع الأسعار + متوسط السعر |
| الثالث | **قيمة المخزون** = Σ السعر × الكمية للأصناف اللي بتتبع مخزون، + عدد أنواع المنتجات | **أنواع الخدمات** + كام خدمة من غير نوع |
| الاكتمال | متوسط درجة اكتمال البيانات + كام صنف محتاج بيانات | نفس الكلام |

**3 رسوم:**
1. **الفئات اللي فيها أصناف أكتر** (أعمدة): أكبر 7 فئات بمسارها الكامل، والباقي في "أخرى"، واللي من غير فئة في "مش محدد".
2. **الأنواع اللي فيها أصناف أكتر** (أعمدة): بنفس الطريقة.
3. **اكتمال البيانات** (شريط 100%): مكتمل / قرب يكمل / محتاج بيانات. التعريف في
   [product-details/README.md](../product-details/README.md).

فيه كمان لينك "فتح المنتجات" أو "فتح الخدمات" لكل قسم.

### الحالات
- **التحميل:** هياكل مكان الأرقام والرسوم.
- **الخطأ:** رسالة وزرار إعادة.
- **الكتالوج فاضي:** رسالة "الكتالوج لسه فاضي"، والتنبيهات بتفضل ظاهرة.

---

## 3. الحسابات (`utils/overviewModel.js`)

`buildProductsOverview({ products, itemTypes, categories })` بترجع:

```js
{
  total:   { count, listValue, stockValue },
  product: { count, active, listValue, stockValue, averagePrice, averageCompleteness, incomplete,
             withoutType, withoutCategory, itemTypes, topCategories, topItemTypes, completenessLevels },
  service: { ...نفس الحقول },
  alerts:  { noProductTypes, noServiceTypes },
}
```

- `products`: صفوف الكتالوج normalized (`useCatalogProducts`).
- `categories`: الفئات flattened بـ `_pathLabel`.
- `topCategories` و`topItemTypes` معمولين بـ `countBy` من محرك التقارير، وفيهم `{ key, label, value }`.
  المفاتيح الخاصة `__none__` و`__other__` الواجهة هي اللي بتترجمها.
- "مكتمل" و"قرب يكمل" و"محتاج بيانات" جايين من `productCompleteness`.

---

## 4. إزاي توسّعه

- **رقم جديد:** احسبه في `summarize` جوه `overviewModel.js`، وضيفه في `kpis` بتاع `OverviewSection`، واكتب له اختبار.
- **رسم جديد:** config بنفس شكل محرك التقارير (`type: 'bar' | 'share' | 'timeseries'`) في `charts` بتاع `OverviewSection`.
- **فترة زمنية** (زي "اللي اتضاف آخر 30 يوم"): استخدم `useReportRange` و`filterByRange` من المحرك.

## 5. حاجات ناقصة

- القيمة رقم من غير عملة، لأن الأسعار لسه مالهاش `currency_code` (طلب D9 في ملف طلبات الباك إند).
- الأرقام محسوبة في المتصفح من `/product/data` كله. لو الكتالوج كبر محتاجين endpoint إحصائيات.
- الصفحة متجربتش بالعين (RTL/LTR، الوضع الغامق).
