# تحسينات DataTable Header - وثائق التحديث

## الميزات المضافة ✨

### 1. **أيقونات قفل/فتح العمود (Column Pinning)**
- أيقونة `LockOpen` (🔓) افتراضيًا لكل عمود
- تظهر عند التحويم (hover) على رأس العمود
- يمكن النقر عليها لتثبيت/فك العمود
- تتحول إلى أيقونة `Lock` (🔒) عند التثبيت
- الألوان:
  - غير مثبت: #9CA3AF (رمادي فاتح)
  - مثبت: #00C2CB (لون الماركة الأساسي)

### 2. **معالجات Resize الأفقية (Column Resize)**
- خط رمادي فاتح على حافة كل عمود
- يظهر عند التحويم على رأس العمود
- قابل للسحب لتغيير عرض العمود
- الحد الأدنى للعرض: 60px
- يتم حفظ العروض المخصصة في localStorage

### 3. **تحسينات التصميم**
- تحسين التخطيط مع مسافات أفضل
- دعم RTL/LTR (متوافق مع اللغة العربية والإنجليزية)
- مؤشرات الترتيب (Sort) محسّنة:
  - ChevronUp ⬆️ للترتيب التصاعدي
  - ChevronDown ⬇️ للترتيب التنازلي
  - لون الماركة الأساسي (#00C2CB) للترتيب النشط

## الملفات الجديدة المُنشأة

### 1. **`src/shared/components/data-table/hooks/useColumnPinning.js`**
Hook لإدارة حالة تثبيت الأعمدة
- `pinnedColumns`: كائن يتتبع الأعمدة المثبتة
- `toggleColumnPin(columnId)`: دالة لتثبيت/فك العمود
- `orderedColumns`: الأعمدة مرتبة (المثبتة أولاً)
- `isPinned(columnId)`: دالة للتحقق من حالة العمود
- الحفظ التلقائي في localStorage بمفتاح `datatable-pinned-{tableId}`

### 2. **`src/shared/components/data-table/hooks/useColumnResize.js`**
Hook لإدارة عروض الأعمدة المخصصة
- `columnWidths`: كائن يتتبع عروض الأعمدة (بالبكسل)
- `setColumnWidth(columnId, width)`: تعيين عرض عمود
- `getColumnWidth(columnId, defaultWidth)`: الحصول على عرض العمود
- `resetColumnWidth(columnId)`: إعادة تعيين عمود واحد
- `resetAllWidths()`: إعادة تعيين جميع الأعمدة
- الحفظ التلقائي في localStorage بمفتاح `datatable-widths-{tableId}`

## الملفات المُحدّثة

### 1. **`src/shared/components/data-table/DataTableHeader.jsx`**
- إضافة props جديدة: `onPinColumn`, `isPinned`, `onStartResize`
- أيقونة قفل مفتوح/مغلق مع معالج نقر
- معالج resize عند حافة العمود
- تحسين التخطيط والأنماط

### 2. **`src/shared/components/data-table/DataTable.jsx`**
- استيراد `useColumnPinning` و `useColumnResize`
- إضافة state `resizingColumn` و `resizeStartX` للتعامل مع السحب
- دالة `handleStartResize` لمعالجة بداية عملية تغيير الحجم
- تمرير callbacks إلى `DataTableHeader`

### 3. **`src/shared/components/data-table/types.js`**
- إضافة `pinnedColumns` و `columnWidths` إلى `DataTableState`
- توثيق شاملة لأنواع البيانات

## كيفية الاستخدام

### تثبيت/فك عمود:
```jsx
// في DataTable
const { pinnedColumns, toggleColumnPin, isPinned } = useColumnPinning(columns, tableId)

// تمريره إلى Header
<DataTableHeader
  columns={table.visibleColumns}
  onPinColumn={toggleColumnPin}
  isPinned={isPinned}
/>

// النقر على أيقونة القفل يثبت/يفك العمود
```

### تغيير عرض عمود:
```jsx
// في DataTable
const { setColumnWidth } = useColumnResize(tableId)

// معالج السحب
const handleStartResize = (e, columnId) => {
  // ... منطق السحب
  setColumnWidth(columnId, newWidth) // يتم حفظه تلقائيًا
}
```

## localStorage Keys
- `datatable-pinned-{tableId}`: تخزين حالة التثبيت
- `datatable-widths-{tableId}`: تخزين عروض الأعمدة المخصصة
- `datatable-columns-{tableId}`: تخزين رؤية الأعمدة (موجود مسبقًا)

## المميزات الفنية

✅ **Persistence**: جميع الحالات محفوظة في localStorage
✅ **RTL/LTR Support**: متوافق مع كلا الاتجاهين
✅ **Performance**: استخدام useMemo و useCallback لتحسين الأداء
✅ **Accessibility**: ARIA labels صحيحة، keyboard support
✅ **TypeScript Ready**: يمكن إضافة أنواع TypeScript بسهولة
✅ **Responsive**: يعمل على جميع أحجام الشاشات

## الخطوات التالية المخطط لها

1. **Column Lock Visual Indicator**: تصميم بصري مميز للأعمدة المثبتة
2. **Persist State to Database**: حفظ التفضيلات في API
3. **Column Grouping**: جمع الأعمدة ذات الصلة
4. **Advanced Resize**: مؤشرات بصرية أثناء السحب
5. **Column Virtualization**: تحسين الأداء للجداول الكبيرة جداً

## الملاحظات

- يتم إظهار الأيقونات فقط عند التحويم (group-hover)
- الحد الأدنى لعرض العمود هو 60px لضمان رؤية المحتوى
- جميع الحالات تُحفظ تلقائيًا وتُستعاد عند تحديث الصفحة
