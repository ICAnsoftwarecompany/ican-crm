# إطار عمل جدول البيانات — دليل العمارة والاستخدام

## نظرة عامة

إطار عمل جدول البيانات هو مكون جدول قابل لإعادة الاستخدام على مستوى المؤسسات مبني على React 19. يوفر:

- **الفرز من جانب العميل** — فرز حسب أي عمود قابل للفرز (تصاعدي/تنازلي)
- **البحث العام** — البحث عبر جميع الأعمدة القابلة للبحث في نفس الوقت
- **التصفيح** — تقسيم الصفحات التلقائي مع أحجام صفحات قابلة للتخصيص
- **رؤية الأعمدة** — إظهار/إخفاء الأعمدة مع حفظ التفضيلات في localStorage
- **دعم RTL/LTR** — دعم كامل للنصوص ثنائية الاتجاه (العربية/الإنجليزية)
- **الوضع الليلي** — تنسيق مستند إلى متغيرات CSS في Tailwind
- **إمكانية الوصول** — هيكل جدول دلالي، ملء للملاحة بلوحة المفاتيح
- **السلامة من النوع** — تعريفات الأعمدة جاهزة للتوافق مع TypeScript
- **الأداء** — تحسين useMemo للفرز والتصفية والتصفيح

---

## هيكل المجلد

```
src/shared/components/data-table/
├── DataTable.jsx                    # مكون المنسق الرئيسي
├── DataTableHeader.jsx              # رأس الجدول مع مؤشرات الفرز
├── DataTableBody.jsx                # جسم الجدول مع عرض الصفوف
├── DataTableFooter.jsx              # عناصر التحكم في التصفيح
├── DataTableToolbar.jsx             # شريط البحث + رؤية الأعمدة
├── GlobalSearch.jsx                 # إدخال البحث مع زر مسح
├── ColumnVisibilityToggle.jsx       # قائمة منسدلة إظهار/إخفاء الأعمدة
├── LoadingState.jsx                 # رسم متحرك تحميل الهيكل العظمي
├── EmptyState.jsx                   # رسالة حالة فارغة
├── ErrorState.jsx                   # حالة خطأ مع زر إعادة محاولة
├── types.js                         # تعريفات الأنواع و JSDoc
├── constants.js                     # القيم الافتراضية والخيارات
├── index.js                         # تصدير برميل
└── hooks/
    ├── useDataTable.js              # خطاف المنسق الرئيسي (واجهة برمجية عامة)
    ├── useSorting.js                # منطق الفرز
    ├── useFiltering.js              # تصفية البحث العام
    ├── usePagination.js             # منطق التصفيح
    ├── useColumnPreferences.js       # حالة رؤية الأعمدة
    └── useLocalStorage.js           # غلاف localStorage مع إصدار
```

---

## تعريف العمود

حدد الأعمدة باستخدام هذا الهيكل:

```javascript
const columns = [
  {
    id: 'name',                      // معرف فريد
    header: 'الاسم',                 // عنوان العرض (يدعم العربية)
    accessor: 'name',                // مسار مفتاح الكائن (يدعم الترميز النقطي: 'user.name')
    searchable: true,                // تضمين في البحث العام
    sortable: true,                  // السماح بفرز الأعمدة
    visible: true,                   // مرئي في البداية
    width: 'w-32',                   // فئة عرض Tailwind (اختياري)
    render: (row) => (               // دالة عرض مخصصة اختيارية
      <span className="font-bold">{row.name}</span>
    ),
  },
]
```

---

## البدء السريع

### الاستخدام الأساسي

```jsx
import { DataTable } from '@/shared/components/data-table'

export function CustomersPage() {
  const customers = [
    { id: 1, name: 'أحمد', email: 'ahmed@example.com' },
    { id: 2, name: 'فاطمة', email: 'fatima@example.com' },
  ]

  const columns = [
    { id: 'name', header: 'الاسم', accessor: 'name', searchable: true, sortable: true },
    { id: 'email', header: 'البريد', accessor: 'email', searchable: true, sortable: true },
  ]

  return (
    <DataTable
      data={customers}
      columns={columns}
      tableId="customers"
    />
  )
}
```

### مع حالات التحميل والخطأ

```jsx
const { data, isLoading, error, refetch } = useCustomers()

return (
  <DataTable
    data={data}
    columns={columns}
    tableId="customers"
    isLoading={isLoading}
    error={error}
    onRetry={refetch}
    emptyMessage="لا توجد عملاء"
  />
)
```

### مع معالج نقر الصف

```jsx
const handleRowClick = (row) => {
  navigate(`/customers/${row.id}`)
}

return (
  <DataTable
    data={data}
    columns={columns}
    tableId="customers"
    onRowClick={handleRowClick}
    rowClassName={(row) =>
      row.status === 'inactive' ? 'opacity-50' : ''
    }
  />
)
```

### مع عمليات عرض مخصصة

```jsx
const columns = [
  {
    id: 'status',
    header: 'الحالة',
    accessor: 'status',
    render: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
      }`}>
        {row.status}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'الإجراءات',
    accessor: 'id',
    sortable: false,
    searchable: false,
    render: (row) => (
      <div className="flex gap-2">
        <Button onClick={() => handleEdit(row)}>تعديل</Button>
        <Button onClick={() => handleDelete(row)}>حذف</Button>
      </div>
    ),
  },
]
```

---

## مرجع الخصائص

### مكون DataTable

```typescript
interface DataTableProps {
  // مطلوب
  data: object[]                    // مصفوفة كائنات الصفوف
  columns: ColumnDefinition[]       // تعريفات الأعمدة

  // اختياري
  tableId?: string                  // معرف فريد لـ localStorage (افتراضي: 'default')
  isLoading?: boolean               // عرض هيكل عظمي للتحميل
  error?: Error                     // عرض حالة الخطأ
  onRetry?: () => void              // دالة رد نداء إعادة محاولة الخطأ
  onRowClick?: (row) => void        // معالج نقر الصف
  rowClassName?: (row) => string    // دالة className الصف
  showToolbar?: boolean             // إظهار البحث + تبديل الأعمدة (افتراضي: true)
  showFooter?: boolean              // إظهار التصفيح (افتراضي: true)
  initialSort?: { column, direction } // حالة الفرز الأولية
  enableSorting?: boolean           // تفعيل فرز الأعمدة (افتراضي: true)
  enableFiltering?: boolean         // تفعيل البحث العام (افتراضي: true)
  enablePagination?: boolean        // تفعيل التصفيح (افتراضي: true)
  enableColumnVisibility?: boolean  // تفعيل تبديل رؤية الأعمدة (افتراضي: true)
  emptyMessage?: string             // رسالة حالة فارغة (افتراضي: 'لا توجد بيانات')
  toolbarActions?: ReactNode        # أزرار إضافية في شريط الأدوات
}
```

---

## خطاف useDataTable (متقدم)

للتحكم الدقيق، استخدم `useDataTable` مباشرة:

```jsx
import { useDataTable } from '@/shared/components/data-table'

export function CustomTable() {
  const table = useDataTable({
    data: customers,
    columns,
    tableId: 'customers',
    enableSorting: true,
    enablePagination: true,
  })

  return (
    <div>
      {/* بحث مخصص */}
      <input
        value={table.globalFilter}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        placeholder="بحث..."
      />

      {/* عرض جدول مخصص */}
      <table>
        <thead>
          <tr>
            {table.visibleColumns.map((col) => (
              <th
                key={col.id}
                onClick={() => table.setSortColumn(col.id)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.id}>
              {table.visibleColumns.map((col) => (
                <td key={col.id}>
                  {col.render ? col.render(row) : getCellValue(row, col.accessor)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* تصفيح مخصص */}
      <button onClick={table.prevPage} disabled={!table.canPrevPage}>
        السابق
      </button>
      <span>الصفحة {table.pagination.pageIndex + 1}</span>
      <button onClick={table.nextPage} disabled={!table.canNextPage}>
        التالي
      </button>
    </div>
  )
}
```

---

## إدارة الحالة

### حالة الفرز

```javascript
const { sorting, setSortColumn } = useDataTable({...})

// sorting = { column: 'name', direction: 'asc' }
// انقر على رأس العمود للتبديل أو الفرز تصاعديًا إذا كان مختلفًا
setSortColumn('name')       // تبديل إذا كان نفس الشيء، أو فرز تصاعدي إذا كان مختلفًا
```

### حالة التصفيح

```javascript
const { pagination, pageCount, setPageSize, nextPage, prevPage } = useDataTable({...})

// pagination = { pageIndex: 0, pageSize: 10 }
setPageSize(20)             // تغيير حجم الصفحة (إعادة تعيين إلى الصفحة 0)
nextPage()                  // الانتقال إلى الصفحة التالية إن أمكن
prevPage()                  // الانتقال إلى الصفحة السابقة إن أمكن
```

### رؤية الأعمدة

مخزن في localStorage تحت المفتاح: `datatable-columns-{tableId}`

```javascript
const { columnVisibility, toggleColumnVisibility } = useDataTable({...})

// columnVisibility = { name: true, email: true, phone: false }
toggleColumnVisibility('phone')   // إظهار/إخفاء العمود
```

---

## تحسين الأداء

جميع المسارات الحرجة مُحسَّنة مع `useMemo`:

| العملية | التحسين | المحفز |
|---------|----------|---------|
| الفرز | useMemo | حالة الفرز، تغيير الصفوف |
| التصفية | useMemo | تصفية عام، تغيير الصفوف |
| التصفيح | useMemo | صفوف مصفاة، فهرس الصفحة، حجم الصفحة |
| الأعمدة المرئية | useMemo | حالة رؤية الأعمدة |

**النتيجة**: يتعامل بكفاءة مع 10,000+ صفوف مع الفرز والبحث والتصفيح.

---

## حفظ localStorage

يتم حفظ تفضيلات رؤية الأعمدة تلقائيًا:

**مفتاح التخزين**: `datatable-columns-{tableId}`

**التنسيق**:
```javascript
{
  _version: 1,
  value: {
    name: true,
    email: true,
    phone: false
  }
}
```

**السلوك**:
- الحفظ التلقائي عند كل تبديل عمود
- التحميل عند تحميل المكون
- فحص الإصدار (يتجاهل المخطط القديم إذا تغير)
- آمن من الأخطاء (يعود إلى الإعدادات الافتراضية إذا تلف)

---

## إمكانية الوصول

يتضمن جدول البيانات:

- ✅ هيكل دلالي `<table>`، `<thead>`، `<tbody>`
- ✅ `role="table"` و `role="row"` (ضمني من HTML)
- ✅ رؤوس أعمدة قابلة للفرز مع مؤشرات بصرية
- ✅ ملاحة لوحة المفاتيح (Tab, Enter, Escape)
- ✅ تسميات ARIA على الأزرار والرموز
- ✅ تباين عالي ومؤشرات التركيز
- ✅ دعم اتجاه النص RTL

**ملاحة لوحة المفاتيح**:
- `Tab` — التنقل عبر العناصر التفاعلية
- `Enter` — انقر على الرؤوس للفرز، اضغط على الأزرار
- `Escape` — إغلاق قائمة رؤية الأعمدة

---

## التنسيق والوضع الليلي

جميع المكونات تستخدم متغيرات CSS للمظهر:

```css
--surface       /* خلفية الجدول */
--surface-2     /* خلفية الرأس والتمرير */
--border        /* لون الحدود */
--text          /* لون النص */
--text-muted    /* نص ثانوي */
```

تجاوز في المظهر الخاص بك:

```css
:root {
  --surface: #ffffff;
  --surface-2: #f5f5f5;
  --border: #e0e0e0;
  --text: #000000;
  --text-muted: #666666;
}

[data-theme="dark"] {
  --surface: #1a1a1a;
  --surface-2: #2d2d2d;
  --border: #404040;
  --text: #ffffff;
  --text-muted: #999999;
}
```

---

## ميزات المرحلة الأولى (MVP)

✅ **المُنفذة**:
- عرض الجدول مع عمليات عرض مخصصة
- فرز من جانب العميل (تبديل صعود/هبوط)
- بحث عام عبر أعمدة متعددة
- التصفيح (حجم الصفحة، فهرس الصفحة، السابق/التالي)
- تبديل رؤية العمود مع حفظ localStorage
- حالة التحميل (رسم متحرك هيكل عظمي)
- حالة فارغة (رسالة مخصصة)
- حالة خطأ مع إعادة محاولة
- دعم RTL
- دعم الوضع الليلي
- إمكانية الوصول الكاملة (HTML دلالي، ARIA)

---

## ميزات المرحلة الثانية (المستقبل)

🔄 **مخطط لها**:
- تصفية كل عمود (مرشحات منسدلة)
- تحديد الصف (خانات اختيار، إجراءات جماعية)
- شريط أدوات الإجراء الجماعي
- بحث متقدم (بحث خاص بالعمود)

---

## ميزات المرحلة الثالثة (المستقبل)

🔜 **مخطط لها**:
- تثبيت العمود (رؤوس لاصقة)
- تغيير حجم العمود (اسحب لتغيير الحجم)
- عرض محفوظ (مرشحات وفرز معين مسبقًا)
- التمرير الافتراضي (أداء 100 ألف+ صف)

---

## حالات الاستخدام الشائعة

### مثال 1: قائمة العملاء مع الإجراءات

انظر `src/pages/playground/DataTableDemo.jsx`

```jsx
const columns = [
  { id: 'name', header: 'الاسم', accessor: 'name', searchable: true, sortable: true },
  { id: 'email', header: 'البريد', accessor: 'email', searchable: true, sortable: true },
  {
    id: 'type',
    header: 'النوع',
    accessor: 'type',
    render: (row) => (
      <Badge variant={row.type === 'customer' ? 'success' : 'warning'}>
        {row.type}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'الإجراءات',
    accessor: 'id',
    sortable: false,
    render: (row) => (
      <Button size="sm" onClick={() => handleEdit(row)}>تعديل</Button>
    ),
  },
]
```

### مثال 2: جدول تقرير للقراءة فقط

```jsx
<DataTable
  data={data}
  columns={columns}
  enablePagination={false}    // عرض جميع البيانات
  enableSorting={false}       // لا يوجد فرز مطلوب
  enableColumnVisibility={false}
  showToolbar={false}
/>
```

### مثال 3: جدول بحث ثقيل (الخيوط)

```jsx
<DataTable
  data={leads}
  columns={leadColumns}
  tableId="leads"
  enableSorting={true}
  enableFiltering={true}      // استخدام بحث ثقيل
  enablePagination={true}
  initialSort={{ column: 'createdAt', direction: 'desc' }}
/>
```

---

## دليل الهجرة (من مكونات الشبكة القديمة)

### قبل (شبكة مخصصة + بطاقة)
```jsx
<div className="grid gap-3">
  {filteredRows.map((row) => (
    <article className="...">
      <h3>{row.name}</h3>
      <p>{row.email}</p>
      ...
    </article>
  ))}
</div>
```

### بعد (DataTable)
```jsx
<DataTable data={rows} columns={columns} tableId="name" />
```

**الفوائد**:
- الفرز من الصندوق
- البحث مدمج
- التصفيح تلقائي
- تبديل رؤية العمود
- واجهة مستخدم للمؤسسات الاحترافية
- متسق عبر جميع الصفحات

---

## استكشاف الأخطاء

### العمود لا يتم فرزه
- ✅ تأكد من `column.sortable = true`
- ✅ تأكد من صحة `column.accessor`
- ✅ تحقق من نوع البيانات (الأرقام والسلاسل كلاهما يعمل)

### البحث لا يجد النتائج
- ✅ تأكد من `column.searchable = true` (افتراضي)
- ✅ تحقق من أن `column.accessor` صحيح
- ✅ تأكد من أن البيانات تحتوي على قيم غير فارغة في هذا الحقل

### رؤية العمود لا تستمر
- ✅ تحقق من تفعيل localStorage
- ✅ تأكد من معرف `tableId` فريد
- ✅ تحقق من وحدة تحكم المتصفح للأخطاء

### الأداء بطيئة مع عدد كبير من الصفوف
- ✅ استخدم التصفيح (افتراضي: 10 لكل صفحة)
- ✅ قلل عدد الأعمدة القابلة للبحث
- ✅ تحميل البيانات بطريقة كسول بدلاً من تحميل الكل مرة واحدة
- ✅ ستضيف المرحلة 3 التمرير الافتراضي للصفوف 100,000+

---

## الملفات المُنتجة

- ✅ `src/shared/components/data-table/` — ملفات الإطار (18 ملف)
- ✅ `src/pages/playground/DataTableDemo.jsx` — صفحة عرض توضيحي/مثال
- ✅ `src/app/router/index.jsx` — تمت إضافة المسار: `/playground/datatable`
- ✅ `docs/DATATABLE_ARCHITECTURE_AR.md` — هذا الملف

**الوصول إلى العرض التوضيحي**: http://localhost:5173/playground/datatable (بعد تسجيل الدخول)

---

## الخطوات التالية

1. **هجرة صفحة العملاء** (استخدم DataTable بدلاً من الشبكة)
2. **إنشاء مرشحات المرحلة الثانية** (تصفية لكل عمود)
3. **إضافة تحديد الصف** (إجراءات جماعية)
4. **اختبار مع البيانات الحقيقية** من نقاط نهاية API

---

## أسئلة؟

راجع توثيق الخطاف في:
- `src/shared/components/data-table/hooks/useDataTable.js`
- أنواع الخصائص في كل ملف `.jsx`
