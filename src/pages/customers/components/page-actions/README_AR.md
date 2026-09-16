# page-actions

هذا الفولدر يحتوي على الإجراءات الموجودة في أعلى صفحة مركز العملاء المحتملين داخل الهيدر.

تم فصله عن `CustomersPageHeader.jsx` حتى يبقى الهيدر مسؤولا عن عرض العنوان والوصف فقط، بينما تكون الأزرار والقوائم في مكونات مستقلة سهلة التعديل.

## الملفات

- `CustomersPageActions.jsx`: المكون الجامع لكل إجراءات أعلى الصفحة.
- `LeadsActionsMenu.jsx`: قائمة الإجراءات الرئيسية.
- `AddLeadAction.jsx`: إجراء إضافة عميل محتمل.
- `ImportLeadsAction.jsx`: إجراء استيراد عملاء محتملين.
- `ExportLeadsAction.jsx`: إجراء تصدير العملاء المحتملين.
- `TableSettingsAction.jsx`: زر إعدادات الجدول.
- `TrashLeadsAction.jsx`: زر فتح سلة المحذوفات أو الرجوع للسجلات النشطة.
- `index.js`: نقطة تصدير موحدة للفولدر.

## الاستخدام

`CustomersPageHeader.jsx` يستدعي:

```jsx
<CustomersPageActions
  onAdd={onAdd}
  onImport={onImport}
  onExport={onExport}
  onTrash={onTrash}
  trashActive={trashActive}
  onTableSettings={onTableSettings}
/>
```

أي إجراء جديد أعلى الصفحة يضاف هنا كمكون مستقل، ثم يضاف إلى `CustomersPageActions.jsx`.

