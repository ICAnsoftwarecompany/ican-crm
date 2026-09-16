# توثيق تطوير قسم العملاء

آخر تحديث: 2026-07-23 22:56:45 +03:00

## الملخص

تم تحويل قسم العملاء إلى قسم داخلي منظم داخل التطبيق، له Layout خاص وSidebar فرعي يظهر فقط داخل مسارات `/LeadsCenter`.

تم الحفاظ على:

- الـ MainSidebar الرئيسي.
- الـ Header الرئيسي.
- منطق جلب العملاء الحالي.
- React Query hooks.
- DataTable وكل مميزاته.

## ما تم تنفيذه

1. إنشاء `CustomersLayout` كـ layout داخلي لقسم العملاء.
2. إنشاء `CustomersSidebar` كقائمة فرعية لقسم العملاء.
3. إنشاء `CustomersMobileSidebar` للموبايل والتابلت.
4. تحويل `/LeadsCenter` إلى Nested Routes.
5. إضافة صفحات فرعية لكل عناصر القائمة.
6. إضافة صفحة جديدة داخل جزء التنظيم باسم `الإعداد والتخصيص`.
7. تحسين صفحة جميع العملاء بإضافة Header وStats Cards.
8. إضافة `CustomerDetailsDrawer` عند الضغط على صف عميل.
9. إضافة `TableSettingsDrawer` من قائمة المزيد.
10. حفظ حالة غلق وفتح الـ MainSidebar والـ CustomersSidebar بعد refresh.
11. تثبيت الـ CustomersSidebar أثناء scroll صفحة العملاء.

## تصميم Sidebar العملاء

تم الرجوع للتصميم الهادئ السابق:

- الخلفية: `var(--surface)`.
- العرض عند الفتح: `260px`.
- العرض عند الغلق: `64px`.
- العنصر النشط: خلفية `var(--surface-2)` مع مؤشر جانبي صغير.
- عند الغلق تظهر الأيقونات فقط.
- أسماء العناصر تظهر كـ tooltip عبر `title`.
- زر الغلق والفتح داخل رأس الـ sidebar.
- الإعدادات ثابتة أسفل القائمة.
- القائمة تدعم RTL/LTR.
- القائمة ثابتة أثناء scroll الصفحة.
- محتوى القائمة الداخلي فقط يعمل scroll عند الحاجة.

## المسارات النهائية

- `/LeadsCenter`
- `/LeadsCenter/new`
- `/LeadsCenter/follow-up`
- `/LeadsCenter/inactive`
- `/LeadsCenter/segments`
- `/LeadsCenter/assignments`
- `/LeadsCenter/duplicates`
- `/LeadsCenter/customization`
- `/LeadsCenter/import-export`
- `/LeadsCenter/trash`
- `/LeadsCenter/settings`

## صفحة الإعداد والتخصيص

تمت إضافة صفحة جديدة:

- الاسم في الـ sidebar: `الإعداد والتخصيص`
- المسار: `/LeadsCenter/customization`
- القسم: `التنظيم`
- الأيقونة: `SlidersHorizontal`
- الملف: `src/pages/customers/pages/customization/CustomerCustomizationPage.jsx`

الصفحة أصبحت تحتوي على نظام Tabs داخلي:

- تاب `حالات العملاء`.
- تاب `تاج العملاء`.

كل تاب موجود في مكوّن منفصل داخل نفس فولدر الصفحة.

آخر تاب يقف عليه المستخدم يتم حفظه في localStorage بالمفتاح:

- `customers-customization-active-tab`

وبالتالي بعد عمل refresh يرجع المستخدم لنفس التاب.

## الملفات الجديدة

- `src/pages/customers/layout/CustomersLayout.jsx`
- `src/pages/customers/layout/CustomersSidebar.jsx`
- `src/pages/customers/layout/CustomersMobileSidebar.jsx`
- `src/pages/customers/constants/customerNavigation.js`
- `src/pages/customers/components/CustomersPageHeader.jsx`
- `src/pages/customers/components/CustomersStats.jsx`
- `src/pages/customers/components/CustomerDetailsDrawer.jsx`
- `src/pages/customers/components/TableSettingsDrawer.jsx`
- `src/pages/customers/pages/CustomerPlaceholderPage.jsx`
- `src/pages/customers/pages/NewCustomersPage.jsx`
- `src/pages/customers/pages/FollowUpCustomersPage.jsx`
- `src/pages/customers/pages/InactiveCustomersPage.jsx`
- `src/pages/customers/pages/CustomerSegmentsPage.jsx`
- `src/pages/customers/pages/CustomerAssignmentsPage.jsx`
- `src/pages/customers/pages/DuplicateCustomersPage.jsx`
- `src/pages/customers/pages/customization/CustomerCustomizationPage.jsx`
- `src/pages/customers/pages/customization/CustomerStatusesTab.jsx`
- `src/pages/customers/pages/customization/CustomerTagsTab.jsx`
- `src/pages/customers/pages/CustomerImportExportPage.jsx`
- `src/pages/customers/pages/DeletedCustomersPage.jsx`
- `src/pages/customers/pages/CustomersSettingsPage.jsx`

## الملفات المعدلة

- `src/app/router/index.jsx`
- `src/pages/customers/CustomersPage.jsx`
- `src/pages/customers/layout/CustomersLayout.jsx`
- `src/pages/customers/layout/CustomersSidebar.jsx`
- `src/pages/customers/constants/customerNavigation.js`
- `src/pages/customers/CUSTOMERS_SECTION_IMPLEMENTATION_AR.md`

## حفظ حالة الـ Sidebars

تم استخدام localStorage لحفظ حالة الغلق والفتح:

- `main-sidebar-collapsed`
- `customers-sidebar-collapsed`

النتيجة: بعد عمل refresh ترجع القوائم لنفس الحالة السابقة.

## تثبيت Sidebar العملاء

تم تثبيت الـ CustomersSidebar أثناء scroll الصفحة باستخدام:

- `sticky`
- `top-[4.5rem]`
- `h-[calc(100vh-4.5rem)]`
- `self-start`

كما تم إزالة `overflow-hidden` من Layout العملاء حتى يعمل sticky بشكل صحيح.

## ما لم يتم تغييره

- لم يتم تعديل API العملاء.
- لم يتم تغيير React Query hooks.
- لم يتم استبدال DataTable.
- لم يتم حذف أو تكرار MainSidebar.
- لم يتم حذف أو تكرار Header.
- لم يتم إضافة مكتبات جديدة.

## التحقق

تم تشغيل:

```bash
npm.cmd run build
```

والـ build نجح.
