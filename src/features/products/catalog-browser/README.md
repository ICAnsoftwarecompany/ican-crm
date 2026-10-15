# features/products/catalog-browser — لوحة تصفح المنتجات والخدمات

> **Documentation update:** 2026-10-15 17:25 (Africa/Cairo) — الفولدر اتعمل.

لوحة جانبية (`AppDrawer`) لتصفح الكتالوج من أي مكان من غير ما تسيب الصفحة. أول استخدام: زرار "المنتجات والخدمات" في
هيدر مركز العملاء (`pages/customers/components/CustomersHeaderTools.jsx`).

| | |
|---|---|
| **الواجهة العامة** | `CatalogBrowserDrawer` (`{ open, onClose }`)، ومن `features/products/index.js` |
| **البيانات** | `useCatalogProducts` + `useItemTypes` (نفس كاش صفحة المنتجات، مفيش endpoint جديد) |
| **التفاصيل** | الضغط على صنف بيعرض `ProductQuickView` (`product-details/ProductQuickDrawer.jsx`) جوه نفس اللوحة + "رجوع للقائمة" |
| **الترجمة** | `catalog.browser.*` |
| **الاختبارات** | `utils/catalogBrowser.test.js` + `CatalogBrowserDrawer.test.jsx` |

**الفلاتر** (`utils/catalogBrowser.js`، منطق صافي): النوع (الكل / منتجات / خدمات / خطط / باقات بالعدد، التبويب الفاضي مش بيظهر)،
نوع الصنف (من الأنواع الموجودة في التبويب + "من غير نوع")، التصنيف (من الأصناف نفسها)، بحث (الاسم، الوصف، الكود، الفئة، النوع)،
و"إظهار الموقوف" (مقفول افتراضيًا). تغيير التبويب بيمسح فلتر النوع والتصنيف.

**ناقص:** الفلاتر مش بتتحفظ بعد قفل الصفحة؛ التصنيف بالاسم من الأصناف نفسها مش من شجرة الفئات؛ مفيش "إضافة كاهتمام" من اللوحة لسه.
