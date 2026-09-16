# lead-details

هذا الفولدر خاص بصفحة تفاصيل الليد التي تفتح من المسار:

```text
/lead/:customerId
/leads/:customerId
```

الهدف من الفصل أن تكون صفحة الليد مستقلة وقابلة للتطوير مثل فولدر `CustomerDetailsDrawer`، بحيث يمكن تعديل التصميم أو إضافة responsive/layout جديد بدون تضخيم ملف الصفحة الرئيسي.

## الملفات

- `CustomerLeadDetailsPage.jsx`: الصفحة الرئيسية وتستدعي المكونات الصغيرة.
- `LeadDetailsBreadcrumbs.jsx`: مسار الرجوع إلى مركز العملاء المحتملين وعنوان الصفحة.
- `LeadPageSwitcher.jsx`: قائمة اختيار عميل آخر حسب الحالة مع البحث.
- `leadDetailsUtils.js`: دوال مساعدة خاصة بتسمية العميل والبحث داخل العملاء.
- `index.js`: نقطة تصدير موحدة للفولدر.

## العلاقة مع CustomerDetailsDrawer

الصفحة لا تكرر تفاصيل العميل. هي تستخدم:

```jsx
<CustomerDetailsContent mode="page" />
```

من فولدر:

```text
src/pages/customers/components/CustomerDetailsDrawer/
```

وبالتالي أي تطوير عام في تبويبات العميل أو الشات أو المتابعة داخل `CustomerDetailsDrawer` سيظهر أيضا داخل صفحة الليد الكاملة.
