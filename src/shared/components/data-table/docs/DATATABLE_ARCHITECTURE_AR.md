# إطار عمل جدول البيانات — دليل العمارة والاستخدام

## نظرة عامة

إطار عمل جدول البيانات هو مكون جدول قابل لإعادة الاستخدام على مستوى المؤسسات مبني على React 19. يوفر:

- **الفرز من جانب العميل** — فرز حسب أي عمود قابل للفرز (تصاعدي/تنازلي)
- **البحث العام** — البحث عبر جميع الأعمدة القابلة للبحث في نفس الوقت
- **الفلاتر المسماة** — إنشاء شروط متعددة من القيم الفعلية وحفظ أكثر من فلتر لكل جدول
- **التصفيح** — تقسيم الصفحات التلقائي مع أحجام صفحات قابلة للتخصيص
- **رؤية الأعمدة** — إظهار/إخفاء الأعمدة مع حفظ التفضيلات في localStorage
- **دعم RTL/LTR** — دعم كامل للنصوص ثنائية الاتجاه (العربية/الإنجليزية)
- **الوضع الليلي** — تنسيق مستند إلى متغيرات CSS في Tailwind
- **إمكانية الوصول** — هيكل جدول دلالي، ملء للملاحة بلوحة المفاتيح
- **السلامة من النوع** — تعريفات الأعمدة جاهزة للتوافق مع TypeScript
- **الأداء** — تحسين useMemo للفرز والتصفية والتصفيح
- **تحديد الصفوف** — اختيار متعدد مع خانات اختيار وإجراءات جماعية
- **تنسيق الخلايا والصفوف** — تطبيق ألوان وخطوط من واجهة المستخدم
- **النسخ إلى الحافظة** — نسخ خلايا فردية أو صفوف محددة
- **التصدير مع الأنماط** — تصدير إلى Excel محتفظاً بالألوان والخصائص
- **مزامنة قواعد التنسيق مع السيرفر** — حفظ تنسيقات الصفوف والخلايا والأعمدة عبر `/api/table-format-rules`
- **وعي Server Pagination** — دعم البيانات الجزئية من السيرفر
- **الطباعة** — طباعة الجدول مع الحفاظ على التنسيق
- **قائمة السياق الذكية** — تحرير الأنماط بقائمة ناشئة ذكية الموضع

---

## هيكل المجلد

```
src/shared/components/data-table/
├── DataTable.jsx                    # مكون المنسق الرئيسي
├── DataTableHeader.jsx              # رأس الجدول مع مؤشرات الفرز والتحديد
├── DataTableBody.jsx                # جسم الجدول مع عرض الصفوف والتنسيق
├── DataTableFooter.jsx              # عناصر التحكم في التصفيح
├── DataTableToolbar.jsx             # شريط البحث + رؤية الأعمدة + إعدادات الخط
├── SavedFiltersDialog.jsx           # إنشاء/حفظ/تبديل الفلاتر المسماة
├── DataTableFilterRow.jsx           # صف الفلترة لكل عمود
├── GlobalSearch.jsx                 # إدخال البحث مع زر مسح
├── ColumnVisibilityToggle.jsx       # قائمة منسدلة إظهار/إخفاء الأعمدة
├── PrintButton.jsx                  # زر الطباعة
├── CopyButton.jsx                   # زر النسخ (صفوف محددة)
├── ExportButton.jsx                 # زر التصدير
├── ExportDialog.jsx                 # حوار خيارات التصدير
├── LoadingState.jsx                 # رسم متحرك تحميل الهيكل العظمي
├── EmptyState.jsx                   # رسالة حالة فارغة
├── ErrorState.jsx                   # حالة خطأ مع زر إعادة محاولة
├── types.js                         # تعريفات الأنواع و JSDoc
├── constants.js                     # القيم الافتراضية والخيارات
├── index.js                         # تصدير برميل
├── api/
│   └── tableFormatRulesApi.js       # دوال API لقواعد تنسيق الجدول
├── utils/
│   ├── exportHelpers.js             # إنشاء ملفات Excel مع الأنماط
│   ├── clipboardHelpers.js          # نسخ النصوص والصفوف إلى الحافظة
│   ├── buildFilterQuery.js          # بناء الاستعلامات المتقدمة
│   └── tableFormatRules.js          # تحويل ومطابقة قواعد التنسيق مع السيرفر
├── docs/
│   └── DATATABLE_ARCHITECTURE_AR.md # هذا الملف
└── hooks/
    ├── useDataTable.js              # خطاف المنسق الرئيسي
    ├── useSorting.js                # منطق الفرز
    ├── useFiltering.js              # تصفية البحث العام
    ├── useAdvancedFilters.js        # تصفية متقدمة لكل عمود
    ├── usePagination.js             # منطق التصفيح
    ├── useColumnPreferences.js       # حالة رؤية الأعمدة
    ├── useColumnPinning.js          # تثبيت الأعمدة
    ├── useColumnResize.js           # تغيير حجم الأعمدة
    ├── useLocalStorage.js           # غلاف localStorage مع إصدار
    ├── useTableFormatRules.js       # مزامنة قواعد التنسيق مع API
    └── useExport.js                 # حالة حوار التصدير
```

## الفلاتر المحفوظة

عند تفعيل `enableAdvancedFilters` يظهر زر **الفلاتر** في شريط الأدوات. التدفق هو:

1. اختيار عمود قابل للفلترة (`accessor` موجود و`enableFilter !== false`).
2. اختيار قيمة من القيم الفعلية المحملة لهذا العمود، أو من `filterOptions` لو عرّفها العمود.
3. إضافة شروط أخرى؛ جميع الشروط تُطبق بمنطق `AND` على كامل البيانات المحملة قبل البحث والتصفيح.
4. يمكن تطبيق الشروط مباشرة، أو كتابة اسم وحفظها كفلتر قابل لإعادة الاستخدام.
5. يمكن التبديل بين الفلاتر المحفوظة أو حذفها من نفس الحوار.

الحفظ محلي ومعزول لكل جدول بالمفتاح:

```text
ican-datatable-saved-filter-profiles-{tableId}
ican-datatable-active-filter-profile-{tableId}
```

لذلك يجب تمرير `tableId` ثابت وفريد لكل استخدام. عند وجود server pagination، القيم المتاحة والتصفية تخص الصفوف المحملة فقط؛ إرسال الشروط إلى الخادم يظل مسؤولية المستهلك عبر `onFilterChange`.

## الترجمة والثيم

- عناصر شريط الأدوات، البحث، صف الفلاتر، فلتر التاريخ، التكبير، تقسيم الصفوف/الأعمدة، الحالات الفارغة والأخطاء تستخدم مفاتيح `dataTable.*` من ملفات اللغات.
- الأسطح والحدود والنصوص تستخدم `--surface` و`--surface-2` و`--border` و`--text` و`--text-muted` حتى يتوافق الجدول والقوائم العائمة مع الوضع الداكن.
- ألوان التنسيق التي يختارها المستخدم تظل قيماً صريحة لأنها بيانات تخصيص، وليست لون واجهة ثابتًا.

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
  serverPaginationMeta?: object     // معلومات pagination من السيرفر (has_more, next_cursor)
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
  enableAdvancedFilters?: boolean   // تفعيل التصفية المتقدمة (افتراضي: false)
  enablePagination?: boolean        // تفعيل التصفيح (افتراضي: true)
  enableColumnVisibility?: boolean  // تفعيل تبديل رؤية الأعمدة (افتراضي: true)
  enableGlobalSearch?: boolean      // تفعيل البحث العام (افتراضي: true)
  enableExport?: boolean            // تفعيل التصدير إلى Excel (افتراضي: true)
  enableColumnPinning?: boolean     // تفعيل تثبيت الأعمدة (افتراضي: true)
  enableColumnResize?: boolean      // تفعيل تغيير حجم الأعمدة (افتراضي: true)
  emptyMessage?: string             // رسالة حالة فارغة (افتراضي: 'لا توجد بيانات')
  onExport?: (options) => void      // معالج تصدير مخصص (للـ API)
  onFilterChange?: (filters) => void // معالج تغيير المرشحات
  toolbarActions?: ReactNode        // أزرار إضافية في شريط الأدوات
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

## الميزات الجديدة (الجلسة الأخيرة)

### 1. تحديد الصفوف المتقدم

**الميزات**:
- ✅ خانات اختيار في كل صف
- ✅ خانة اختيار رأس للتحديد/إلغاء التحديد (الصفحة الحالية أو المصفاة)
- ✅ Ctrl+A لتحديد جميع الصفوف المحملة
- ✅ قائمة منسدلة للخيارات (تحديد، إلغاء تحديد)
- ✅ حفظ التحديد في localStorage
- ✅ تمييز بصري للصفوف المحددة (لون أزرق فاتح)

**الكود**:
```jsx
const selectedRowKeys = new Set([...])  // تتبع الصفوف المحددة
const { allPageSelected, somePageSelected, allFilteredSelected } = selectionState
```

### 2. التنسيق المخصص (Styling)

**الميزات**:
- ✅ تطبيق الألوان (خلفية، نص) على الخلايا/الصفوف/الأعمدة
- ✅ تغيير حجم الخط ووزنه
- ✅ اختيار نوع الخط من القيم المقبولة في API (`inherit`, `Cairo`, `Tajawal`, `Courier New`)
- ✅ قائمة right-click لكل خلية
- ✅ تبويبات للنطاق (خلية، صف، عمود)
- ✅ حفظ الأنماط في API فقط عبر `/api/tenant/table-format-rules`
- ✅ لا يتم حفظ ألوان الصفوف أو الخلايا أو الخطوط في localStorage

**الكود**:
```jsx
// في DataTable.jsx
const tableFormatRules = useTableFormatRules(tableId, [], columns, undefined, formatVisibility)

// في DataTableBody.jsx
const styles = buildStylesFromFormatRules(tableFormatRules.visibleRules, rows, columns, getRowKey)
```

**تحديث 2026-07-26 01:50:50 +03:00**

- تم توحيد تحميل قواعد التنسيق داخل `DataTable` فقط ثم تمريرها إلى `DataTableBody`.
- لم يعد `DataTableBody` ينشئ طلب تحميل مستقل لقواعد التنسيق.
- يتم تحديث الكاش مباشرة عند الحفظ أو عبر WebSocket بدون refetch متكرر.
- تم تصحيح أولوية التنسيق لتكون: خلية ← صف ← عمود ← جدول.

### 3. إعدادات الخط العامة

**الميزات**:
- ✅ إعدادات خط عامة في الـ toolbar
- ✅ تحكم في: نوع الخط، الحجم، الوزن
- ✅ يطبق على كل الجدول افتراضياً
- ✅ يمكن تجاوزه بالتنسيق المخصص للخلايا
- ✅ يتم تحميله وحفظه من API كقاعدة table-wide بـ `visibility: personal/shared`

**الكود**:
```jsx
<TableStyleCustomizer visibility={formatVisibility} />
```

### 4. النسخ إلى الحافظة

#### نسخ الخلايا الفردية
- ✅ Single-click على أي خلية = نسخ تلقائي
- ✅ تأثير بصري (تلوين أخضر)
- ✅ يختفي بعد 1.5 ثانية
- ✅ يعمل مع جميع أنواع البيانات

**الكود**:
```jsx
// في DataTableBody.jsx
const handleCellClick = async (event, value, rowKey, colId) => {
  await copyCellToClipboard(value)
  setCopiedCellKey(`${rowKey}::${colId}`)
}
```

#### نسخ الصفوف المحددة
- ✅ زر "نسخ" يظهر عند تحديد صفوف
- ✅ نسخ بصيغة TSV (Tab-Separated Values)
- ✅ متوافق مع Excel والجداول
- ✅ يتضمن الرؤوس

**الكود**:
```jsx
// في DataTable.jsx
const handleCopySelected = async () => {
  await copySelectedRowsToClipboard(filteredData, processedColumns, selectedRowKeys)
}
```

### 5. التصدير مع الأنماط

**الميزات**:
- ✅ تصدير الألوان (خلفية + نص)
- ✅ تصدير حجم الخط ووزنه
- ✅ تصدير نوع الخط
- ✅ حفظ التنسيق من السياق
- ✅ أولويات: خلية > صف > عمود > عام

**الكود**:
```jsx
// في exportHelpers.js
export function generateExcelFile(
  rows,
  columns,
  filename,
  visibleColumnsOnly,
  styles = { rowStyles, cellStyles, columnStyles, tableTypography }
)
```

**الأمثلة**:
```javascript
// الخلايا ستحافظ على ألوانها في Excel
// الصفوف ستحتفظ بالألوان والخطوط المطبقة
// الأعمدة ستظهر بنفس التنسيق
```

### 6. قائمة السياق الذكية

**الميزات**:
- ✅ موضع ذكي بالقرب من حواف الشاشة
- ✅ تقلب تلقائياً إذا اقتربت من الحافة اليمنى/السفلى
- ✅ تبقى مرئية دائماً

**الكود**:
```jsx
const getSafeMenuPosition = (x, y) => {
  const menuWidth = 280
  const menuHeight = 420
  // حساب الموضع الآمن مع الهامش
  return { safeX, safeY }
}
```

### 7. وعي Server Pagination

**الميزات**:
- ✅ تنبيه عند وجود بيانات إضافية على السيرفر
- ✅ تحذير عند التحديد (على البيانات المحملة فقط)
- ✅ تعديل نصوص الخيارات
- ✅ Props اختيارية: `serverPaginationMeta`

**الكود**:
```jsx
// في DataTable.jsx
<DataTable
  data={data}
  serverPaginationMeta={{ has_more: true, next_cursor: '...' }}
/>

// التنبيه الذي يظهر:
// "يوجد بيانات إضافية على السيرفر. التحديد الحالي يطبق على البيانات المحمّلة فقط."
```

### 8. الطباعة

**الميزات**:
- ✅ زر "طباعة" في الـ toolbar
- ✅ فتح نافذة طباعة منفصلة
- ✅ إخفاء الأزرار والعناصر الإدارية
- ✅ الحفاظ على التنسيق

---

## ملفات الحافظة والتصدير

### clipboardHelpers.js
```javascript
export async function copyToClipboard(text)
export async function copySelectedRowsToClipboard(rows, columns, selectedRowKeys)
export async function copyCellToClipboard(value)
```

### exportHelpers.js (محدث)
```javascript
// الآن يدعم تمرير الأنماط:
export function generateExcelFile(
  rows,
  columns,
  filename,
  visibleColumnsOnly,
  styles   // ← جديد
)
```

### CopyButton.jsx
مكون زر جديد مع حالة "تم النسخ":
```jsx
<CopyButton onClick={handleCopySelected} title="نسخ الصفوف المحددة" />
```

---

## مزامنة قواعد التنسيق مع API

**تحديث 2026-07-23 01:20:05 +03:00**

تمت إضافة طبقة ربط مع API الجديد:

```txt
GET    /api/table-format-rules?tableKey=customers
GET    /api/table-format-rules/{id}
POST   /api/table-format-rules
PUT    /api/table-format-rules/{id}
PATCH  /api/table-format-rules/{id}/toggle
DELETE /api/table-format-rules/{id}
```

### الملفات المضافة

- `api/tableFormatRulesApi.js` — دوال CRUD لقواعد التنسيق باستخدام `httpClient` وBearer token.
- `utils/tableFormatRules.js` — تحويل الـ style المحلي إلى الشكل المقبول من السيرفر والعكس.
- `hooks/useTableFormatRules.js` — تحميل القواعد بـ React Query وتحديثها عند تغيير تنسيق صف/خلية/عمود.

### طريقة العمل الحالية

- عند تحميل `DataTableBody` يتم جلب قواعد التنسيق حسب `tableId` كـ `tableKey`.
- يتم جلب القواعد دائما من:
  `GET /api/tenant/table-format-rules?tableKey={tableId}&api_password=TenantSecret`
- يتم تطبيق القواعد النشطة فقط `is_active !== false`.
- الأولوية في العرض:
  1. قواعد السيرفر.
  2. أي تعديل مؤقت داخل الواجهة قبل الضغط على حفظ.
- عند استخدام قائمة right-click لتلوين خلية أو صف أو عمود، يتم إرسال القاعدة للسيرفر فقط.
- لا يوجد fallback لتخزين ألوان الصفوف/الخلايا/الأعمدة أو خصائص الخط في localStorage.

### Mapping بين تنسيق الجدول والـ API

| داخل DataTable | داخل API | ملاحظات |
|---|---|---|
| `bgColor` | `bg` | يقبل Hex فقط |
| `textColor` | `color` | يقبل Hex فقط |
| `fontSize` | `fontSize` | مثل `14px` |
| `fontWeight: 700/600` | `fontWeight: bold` | السيرفر يقبل `bold` أو `normal` |
| `fontWeight: 400/500` | `fontWeight: normal` |  |
| `fontFamily` | `fontFamily` | يتم تحويلها للقيم المسموحة: `inherit`, `Cairo`, `Tajawal`, `Courier New` |

### تم تصحيح حفظ بعض الإعدادات

- `useColumnPinning.js` أصبح يقرأ ويكتب عبر `useLocalStorage` بشكل صحيح.
- `useColumnResize.js` أصبح يقرأ ويكتب عبر `useLocalStorage` بشكل صحيح.
- ما زالت إعدادات مثل رؤية الأعمدة، التحديد، الفلاتر، والعرض محفوظة محليا، لأن API الحالي خاص بقواعد التنسيق فقط وليس كل تفضيلات الجدول.

---

## حفظ البيانات في localStorage

يستخدم `localStorage` فقط لإعدادات تجربة الاستخدام غير اللونية مثل البحث ورؤية الأعمدة. ألوان الصفوف والخلايا والخطوط لا يتم تخزينها محليا، ويتم جلبها دائما من API قواعد التنسيق.

| المفتاح | التنسيق | الوصف |
|--------|---------|-------|
| `datatable-columns-{tableId}` | JSON | رؤية الأعمدة |
| `selected-{tableId}` | Array | الصفوف المحددة |
| `pinned-{tableId}` | Array | الأعمدة المثبتة |
| `column-widths-{tableId}` | JSON | أعرض الأعمدة |
| `datatable-filters-{tableId}` | JSON | الفلاتر المتقدمة |
| `search-history-{tableId}` | Array | آخر 10 عمليات بحث فقط |
| `format-visibility-{tableId}` | string | وضع عرض التنسيق الحالي: `personal` أو `shared` |

### حفظ قواعد التنسيق في السيرفر

| العملية | المصدر في الواجهة | API |
|---|---|---|
| تحميل القواعد | فتح الجدول | `GET /api/tenant/table-format-rules?tableKey={tableId}` |
| إنشاء تنسيق جديد | right-click أو تخصيص الجدول | `POST /api/tenant/table-format-rules` |
| تعديل تنسيق موجود | تغيير نفس الصف/الخلية/العمود/الجدول | `PUT /api/tenant/table-format-rules/{id}` |
| مسح تنسيق | زر "مسح تنسيق هذا النطاق" | `DELETE /api/tenant/table-format-rules/{id}` |

ملاحظة: `tableId` في مكون `DataTable` هو نفسه `tableKey` المرسل للسيرفر.

### Search History

- شريط البحث العام مفعل افتراضيا.
- كل جدول له history منفصل حسب `tableId`.
- يتم تخزين آخر 10 عمليات بحث فقط.
- عند تكرار نفس البحث يتم نقله لأول القائمة بدلا من تكراره.



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
- التصفيح (حجم الصفحة، فهرس الصفحة، السابق/التالي) مع دعم 1000 صفوف/الصفحة
- تبديل رؤية العمود مع حفظ localStorage
- حالة التحميل (رسم متحرك هيكل عظمي)
- حالة فارغة (رسالة مخصصة)
- حالة خطأ مع إعادة محاولة
- دعم RTL
- دعم الوضع الليلي
- إمكانية الوصول الكاملة (HTML دلالي، ARIA)
- **تحديد الصفوف** مع خانات اختيار ورؤوس تحديد
- **تحديد الصفحة الحالية** مع قائمة منسدلة للإجراءات
- **Ctrl+A للتحديد** لجميع الصفوف المحملة/المصفاة
- **التنسيق المخصص** (ألوان، خطوط، أوزان) للخلايا والصفوف والأعمدة
- **حفظ الأنماط** في localStorage لكل جدول
- **قائمة السياق الناشئة** (right-click) لتحرير الأنماط
- **الموضع الذكي للقائمة** (auto-flip بالقرب من حواف الشاشة)
- **الطباعة** مع الحفاظ على التنسيق والرأس
- **نسخ الخلايا الفردية** عند النقر (single-click) مع visual feedback
- **نسخ الصفوف المحددة** إلى الحافظة بصيغة TSV
- **التصدير إلى Excel** محتفظاً بالألوان والخصائص المخصصة
- **إعدادات الخط العامة** (نوع، حجم، وزن) قابلة للتطبيق على الجدول بأكمله
- **أدوات التنسيق الجماعي** عند تحديد صفوف متعددة
- **التصفية المتقدمة** بمرشحات منسدلة لكل عمود
- **تثبيت الأعمدة** (Pin/Unpin) مع حفظ الحالة
- **تغيير حجم الأعمدة** (اسحب الحافة) مع حفظ الأعرض
- **أعمدة النظام** (__select، __serial) محمية من الإخفاء
- **عمود الرقم التسلسلي** ديناميكي حسب الصفحة والعرض
- **وعي Server Pagination** مع تحذيرات واضحة
- **حفظ الفلترة والعرض** لكل جدول في localStorage

---

## ميزات المرحلة الثانية (المستقبل)

🔄 **مخطط لها**:
- التحديث الديناميكي للبيانات من السيرفر
- دعم Server-Side Pagination (cursor-based أو offset-based)
- إجراءات جماعية متقدمة (حذف، دمج، حالة)
- البحث المتقدم (بحث متعدد المستويات)
- حفظ العروض المسماة (مرشحات + فرز معينة مسبقاً)

---

## ميزات المرحلة الثالثة (المستقبل)

🔜 **مخطط لها**:
- التمرير الافتراضي (أداء 100 ألف+ صف)
- تصدير PDF
- مجاميع الأعمدة (Sum, Avg, Count)
- التعليقات والملاحظات على الخلايا
- التحرير المباشر في الخلايا (Inline Editing)

---

## حالات الاستخدام الشائعة

### مثال 1: قائمة العملاء مع التحديد والتنسيق

```jsx
export function CustomersPage() {
  const { data, isLoading } = useCustomers()

  const columns = [
    {
      id: 'name',
      header: 'الاسم',
      accessor: 'name',
      searchable: true,
      sortable: true,
    },
    {
      id: 'email',
      header: 'البريد',
      accessor: 'email',
      searchable: true,
      sortable: true,
    },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      tableId="customers"
      isLoading={isLoading}
      enableExport={true}     // تفعيل التصدير مع الأنماط
      onRowClick={(row) => navigate(`/customers/${row.id}`)}
    />
  )
}
```

**ما يمكن فعله**:
- تحديد صفوف متعددة
- تطبيق ألوان وخطوط
- نسخ البيانات
- تصدير مع الأنماط المحفوظة
- طباعة الجدول

### مثال 2: جدول تقرير للقراءة فقط

```jsx
<DataTable
  data={data}
  columns={columns}
  enablePagination={false}    // عرض جميع البيانات
  enableSorting={false}       // لا يوجد فرز
  enableColumnVisibility={false}
  showToolbar={false}
/>
```

### مثال 3: جدول مع Server Pagination

```jsx
<DataTable
  data={loadedCustomers}
  columns={columns}
  tableId="customers"
  serverPaginationMeta={{
    has_more: hasMore,
    next_cursor: nextCursor
  }}
  enableExport={true}
  onExport={async (options) => {
    // إرسال البيانات كاملة للسيرفر للتصدير
    await api.exportCustomers(options)
  }}
/>
```

### مثال 4: مع إجراءات جماعية

```jsx
const [selectedRows, setSelectedRows] = useState(new Set())

const handleBulkDelete = async () => {
  const ids = Array.from(selectedRows)
  await api.deleteCustomers(ids)
  setSelectedRows(new Set())
}

return (
  <div>
    <DataTable
      data={data}
      columns={columns}
      tableId="customers"
      toolbarActions={
        selectedRows.size > 0 && (
          <Button onClick={handleBulkDelete} variant="danger">
            حذف المحدد ({selectedRows.size})
          </Button>
        )
      }
    />
  </div>
)
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

- ✅ `src/shared/components/data-table/` — ملفات الإطار (25+ ملف)
- ✅ `src/shared/components/data-table/utils/clipboardHelpers.js` — نسخ البيانات
- ✅ `src/shared/components/data-table/utils/exportHelpers.js` — تصدير مع الأنماط
- ✅ `src/shared/components/data-table/utils/tableFormatRules.js` — تحويل ومطابقة قواعد تنسيق الجدول
- ✅ `src/shared/components/data-table/api/tableFormatRulesApi.js` — دوال API لقواعد التنسيق
- ✅ `src/shared/components/data-table/hooks/useTableFormatRules.js` — Hook ربط التنسيق مع React Query
- ✅ `src/shared/components/data-table/CopyButton.jsx` — زر النسخ
- ✅ `src/shared/components/data-table/PrintButton.jsx` — زر الطباعة
- ✅ `src/shared/components/data-table/ExportDialog.jsx` — حوار التصدير
- ✅ `src/pages/playground/DataTableDemo.jsx` — صفحة عرض توضيحي/مثال
- ✅ `src/app/router/index.jsx` — تمت إضافة المسار: `/playground/datatable`
- ✅ `docs/DATATABLE_ARCHITECTURE_AR.md` — هذا الملف (التوثيق الكامل)

**الوصول إلى العرض التوضيحي**: http://localhost:3001/playground/datatable (بعد تسجيل الدخول)

---

## الخطوات التالية

1. **هجرة صفحات أخرى** — استبدال الشبكات المخصصة بـ DataTable
   - صفحة الرصاصات (`/leads`)
   - صفحة المحادثات (`/conversations`)
   - صفحة الحملات الإعلانية (`/campaigns`)

2. **دعم Server-Side Pagination**
   - تمرير `cursor` و `limit` إلى API
   - دعم الفلترة من السيرفر
   - دعم الفرز من السيرفر

3. **إجراءات جماعية**
   - حذف متعدد
   - تغيير الحالة الجماعي
   - الدمج

4. **اختبار شامل**
   - اختبار مع 10,000+ صف
   - اختبار مع البيانات الحقيقية من API
   - اختبارات أداء

5. **تكامل مع Permission System**
   - إظهار/إخفاء الأعمدة بناءً على الصلاحيات
   - إظهار/إخفاء الإجراءات بناءً على الصلاحيات

---

## أسئلة شائعة

### س: كيفية إضافة عمود جديد؟
```jsx
const columns = [
  { id: 'name', header: 'الاسم', accessor: 'name' },
  { id: 'custom', header: 'مخصص', accessor: 'customField', render: (row) => (...) }
]
```

### س: كيفية تغيير ألوان الصفوف؟
1. Right-click على الصف → اختر "صف"
2. اختر اللون المطلوب
3. سيتم الحفظ في localStorage تلقائياً، ومع وجود تسجيل دخول سيتم حفظ قاعدة التنسيق أيضا في `/api/table-format-rules`

### س: كيفية تصدير مع الألوان؟
1. اضغط "Export Excel"
2. اختر الخيارات
3. الملف سيُحمّل بكل الألوان المطبقة

### س: هل يدعم العربية؟
✅ نعم، دعم RTL كامل والعربية في جميع النصوص

### س: هل يعمل مع البيانات الضخمة؟
✅ مع 10,000+ صف بكفاءة مع التصفيح
- المرحلة 3 ستضيف التمرير الافتراضي للملايين

---

## المراجع السريعة

- **تحديد الصفوف**: Ctrl+A أو انقر على رأس الجدول
- **نسخ الخلية**: Click على الخلية (بدون double-click)
- **نسخ الصفوف**: حدد + اضغط زر "نسخ"
- **تنسيق**: Right-click لفتح القائمة
- **الطباعة**: اضغط "طباعة" (Ctrl+P في نافذة الطباعة)
- **تصدير**: اضغط "Export Excel" واختر الخيارات

---

## المساهمة والملاحظات

إذا واجهت أي مشاكل أو أردت إضافة ميزة:

1. تحقق من وحدة تحكم المتصفح للأخطاء
2. تحقق من localStorage للبحث والإعدادات فقط (DevTools → Application → Local Storage)
3. تحقق من Network للتأكد من نجاح طلبات `/api/tenant/table-format-rules`
4. تأكد من أن `tableId` فريد لكل جدول لأنه يستخدم كـ `tableKey`
5. راجع أمثلة في `DataTableDemo.jsx`

---

**آخر تحديث**: 2026-07-23 01:20:05 +03:00
---

## تحديث 2026-08-14 01:31:01 +03:00 — تكبير وتصغير الجدول

تمت إضافة تحكم جديد أعلى `DataTable` باسم `DataTableZoomControl` لتمكين المستخدم من تكبير أو تصغير عرض الجدول نفسه فقط.

### الملفات المضافة والمعدلة

- `src/shared/components/data-table/DataTableZoomControl.jsx`
  - مكون مستقل لعرض أزرار التكبير والتصغير وقائمة اختيار النسبة.
  - يستخدم أيقونات `ZoomIn` و `ZoomOut` من `lucide-react`.
- `src/shared/components/data-table/DataTable.jsx`
  - إضافة حالة `tableZoom`.
  - حفظ النسبة في `localStorage` لكل جدول حسب `tableId`.
  - تطبيق الزوم على wrapper داخلي حول عنصر `<table>` فقط.

### نسب الزوم المدعومة

- `50%`
- `70%`
- `90%`
- `100%`
- `125%`
- `150%`
- `200%`

### التخزين

يتم حفظ نسبة الزوم لكل جدول تحت المفتاح:

```text
datatable-zoom-{tableId}
```

مثال:

```text
datatable-zoom-customers
```

### نطاق التأثير

الزوم يؤثر فقط على رأس الجدول، صف الفلاتر، بيانات الصفوف، وعرض الأعمدة داخل جسم الجدول.

ولا يؤثر على شريط البحث، أزرار الأدوات أعلى الجدول، الفوتر أو pagination، أو الديالوجات والقوائم العائمة خارج جسم الجدول.

### طريقة التطبيق

```jsx
<div style={{ zoom: tableZoom / 100 }}>
  <table>...</table>
</div>
```

هذا يجعل التكبير والتصغير محصورين داخل منطقة الجدول فقط مع استمرار دعم التمرير الأفقي عند النسب الكبيرة مثل `150%` و `200%`.

**آخر تحديث**: 2026-08-14 01:31:01 +03:00
---

## تحديث 2026-08-14 01:35:36 +03:00 — إخفاء أدوات الإعداد عند تحديد الصفوف

تم تعديل شريط أدوات `DataTable` بحيث عند تحديد صف واحد أو أكثر يتم إخفاء أدوات الإعداد العامة التي لا تخص التحديد الحالي، لتقليل التشويش على المستخدم وإبقاء التركيز على إجراءات الصفوف المحددة.

### الأدوات التي يتم إخفاؤها أثناء وجود تحديد

- إعدادات الأعمدة `ColumnVisibilityToggle`.
- زر اختصارات الجدول `DataTableShortcuts`.
- إعدادات وتنسيق الجدول العام والخاص `TableStyleCustomizer`.
- تحكم تكبير وتصغير الجدول `DataTableZoomControl`.

### الأدوات التي تظل ظاهرة

- البحث العام.
- فلتر التاريخ.
- حالة التحديث اللحظي.
- زر المقارنة.
- أدوات تخصيص الصفوف المحددة.
- النسخ والطباعة والتصدير حسب الحالة الحالية.
- إجراءات الصفحة الممررة عبر `toolbarActions`.

### طريقة التنفيذ

- تمت إضافة prop جديد إلى `DataTableToolbar`:

```jsx
showColumnVisibility={enableColumnVisibility && !hasSelectedRows}
```

- داخل `DataTable.jsx` تمت إضافة الحالة:

```jsx
const hasSelectedRows = selectedRowKeys.size > 0
```

- يتم استخدام `hasSelectedRows` لإخفاء الأدوات العامة فقط أثناء وجود تحديد، وتعود تلقائيا بمجرد إلغاء تحديد الصفوف.

### الملفات المعدلة

- `src/shared/components/data-table/DataTable.jsx`
- `src/shared/components/data-table/DataTableToolbar.jsx`
- `src/shared/components/data-table/docs/DATATABLE_ARCHITECTURE_AR.md`

**آخر تحديث**: 2026-08-14 01:35:36 +03:00

---

## تحديث 2026-08-21 06:08:24 +03:00 — تطويرات DataTable الأخيرة

تم تحديث `data-table` بعدة تحسينات مهمة تخص تجربة العرض، وضع الصفين، إعادة التهيئة، وتناسق الأدوات مع حالات التحديد.

### 1. وضع تقسيم الصف إلى صفين

تمت إضافة وضع عرض جديد يسمح بعرض كل سجل على صفين:

- الصف العلوي الرئيسي يعرض الأعمدة الأساسية التي يحددها المستخدم.
- الصف الفرعي يظهر مباشرة أسفل الصف الرئيسي ويعرض باقي الأعمدة.
- الهدف هو تقليل عدد الأعمدة الأفقية المعروضة في نفس السطر، خصوصا مع الجداول الكبيرة مثل جدول العملاء.
- في الوضع الحالي لا يتم ترك كل الأعمدة الأصلية كخانات فارغة، بل يتم تقليل أعمدة الجدول فعليا في `colgroup` والهيدر والفلاتر وجسم الجدول.
- الصف الرئيسي والصف الفرعي يستخدمان نفس خانات العرض المضغوطة، بحيث يظهر العمود الفرعي تحت خانة مقابلة له بدلا من تمديد الجدول أفقيا.

### 2. موديل اختيار أعمدة الصفين

تم إنشاء موديل مستقل عند الضغط على زر تقسيم الصفوف:

- يفتح الزر موديل `DataTableRowSplitDialog`.
- المستخدم يختار الأعمدة التي تظهر في الصف العلوي الرئيسي.
- الأعمدة غير المختارة تنتقل تلقائيا إلى الصف الفرعي.
- يوجد زر `توزيع تلقائي` لإرجاع التقسيم الافتراضي.
- يوجد زر `إيقاف تقسيم الصفين` لإرجاع الجدول إلى صف واحد.
- يجب أن يحتوي الصف الرئيسي على عمود واحد على الأقل، والصف الفرعي على عمود واحد على الأقل قبل الحفظ.

### 3. حفظ إعدادات تقسيم الصفين

تم حفظ حالة تشغيل وضع الصفين وإعدادات الأعمدة لكل جدول حسب `tableId`:

```text
datatable-split-rows-{tableId}
datatable-split-rows-config-{tableId}
```

مثال:

```text
datatable-split-rows-customers
datatable-split-rows-config-customers
```

شكل إعدادات التقسيم:

```js
{
  primaryColumnIds: ['name', 'email', 'phone']
}
```

أي عمود غير موجود داخل `primaryColumnIds` يتم عرضه في الصف الفرعي.

### 4. منطق بناء تقسيم الصفين

تم نقل منطق تقسيم الأعمدة إلى ملف مساعد مستقل:

```text
src/shared/components/data-table/utils/splitRowsLayout.js
```

الدالة الأساسية:

```js
buildSplitRowsLayout(columns, splitRowsConfig)
```

تقوم الدالة بإرجاع:

```js
{
  fixedColumns,
  dataColumns,
  primaryColumns,
  secondaryColumns,
  primaryColumnIds,
  slots
}
```

شرح الحقول:

- `fixedColumns`: أعمدة ثابتة مثل التحديد والمسلسل.
- `dataColumns`: أعمدة البيانات فقط.
- `primaryColumns`: الأعمدة المختارة للصف الرئيسي.
- `secondaryColumns`: الأعمدة التي ستظهر في الصف الفرعي.
- `primaryColumnIds`: `Set` سريع لفحص إن كان العمود في الصف الرئيسي.
- `slots`: خانات العرض المضغوطة التي تربط عمودا رئيسيا بعمود فرعي في نفس موضع العرض.

### 5. تقليل عرض الجدول فعليا في وضع الصفين

تم تعديل `DataTable.jsx` بحيث لا يستخدم كل الأعمدة الأصلية عند تفعيل وضع الصفين.

بدلا من ذلك يتم إنشاء:

```js
tableRenderColumns
```

وهي الأعمدة الفعلية المستخدمة في:

- `colgroup`
- `DataTableHeader`
- `DataTableFilterRow`
- `DataTableBody`
- حساب `resolvedTableWidth`

هذا يمنع تمدد الجدول بعرض كل الأعمدة الأصلية، ويجعل وضع الصفين مفيدا فعليا لتقليل العرض الأفقي.

### 6. عرض جسم الجدول في وضع الصفين

تم تعديل `DataTableBody.jsx` ليعتمد على `splitRowsLayout.slots`.

السلوك الحالي:

- أعمدة التحديد والمسلسل تظهر مرة واحدة مع `rowSpan=2`.
- الصف الرئيسي يرسم أعمدة `primaryColumn`.
- الصف الفرعي يرسم أعمدة `secondaryColumn`.
- عند عدم وجود عمود مقابل في خانة معينة يتم رسم خلية فارغة بسيطة للحفاظ على الاتزان البصري.
- يتم الحفاظ على تنسيقات الصفوف والخلايا والأعمدة من قواعد التنسيق القادمة من API.

### 7. إعادة تهيئة الجدول

تم تحسين زر إعادة التهيئة ليعيد الجدول إلى وضعه الافتراضي بشكل أوسع:

- مسح التحديد.
- إيقاف عرض المحدد فقط.
- إعادة `formatVisibility` إلى `personal`.
- مسح فلتر التاريخ.
- إعادة الزوم إلى `100%`.
- إيقاف وضع الصفين.
- مسح إعدادات تقسيم الصفين.
- مسح نمط الجدول المؤقت.
- مسح الفلاتر المتقدمة.
- مسح الفرز.
- مسح البحث العام.
- العودة لأول صفحة.
- إعادة رؤية الأعمدة للوضع الافتراضي.
- إعادة ترتيب الأعمدة للوضع الافتراضي.
- إلغاء تثبيت الأعمدة.
- إعادة عروض الأعمدة للوضع التلقائي.
- مسح قواعد التنسيق `personal` و `shared` عبر `useTableFormatRules`.

### 8. زر إعادة التهيئة بجوار التصدير

تم وضع زر إعادة التهيئة كزر مختصر بجوار أدوات التصدير، ليكون واضحا وسريعا عند الحاجة لإرجاع الجدول للحالة الأصلية.

### 9. تكبير وتصغير الجدول

تمت إضافة `DataTableZoomControl` للتحكم في نسبة عرض الجدول فقط.

النسب المدعومة:

- `50%`
- `70%`
- `90%`
- `100%`
- `125%`
- `150%`
- `200%`

مفتاح التخزين:

```text
datatable-zoom-{tableId}
```

التأثير محصور داخل منطقة `<table>` ولا يؤثر على شريط الأدوات أو الفوتر أو الديالوجات.

### 10. إخفاء أدوات الإعداد عند تحديد صفوف

عند تحديد صف أو أكثر يتم إخفاء أدوات الإعداد العامة حتى لا تتداخل مع إجراءات الصفوف المحددة.

الأدوات التي يتم إخفاؤها أثناء التحديد:

- إعدادات الأعمدة.
- اختصارات الجدول.
- تنسيق الجدول العام والخاص.
- الزوم.
- تقسيم الصفوف.

الأدوات التي تبقى ظاهرة:

- البحث العام.
- فلتر التاريخ.
- حالة التحديث اللحظي.
- المقارنة.
- النسخ والطباعة والتصدير حسب الحالة.
- إجراءات الصفحة القادمة من `toolbarActions`.

### 11. فلتر التاريخ

تمت إضافة `DateRangeFilter` أعلى الجدول:

- يكتشف الأعمدة التي تبدو كتاريخ بناء على الاسم أو النوع أو عينة من البيانات.
- يسمح باختيار عمود تاريخ.
- يسمح بتحديد تاريخ من وإلى.
- القائمة تظهر فوق المحتوى باستخدام `createPortal` حتى لا تختفي خلف الجدول أو الأدوات.

### 12. القوائم العائمة فوق المحتوى

تم تحسين القوائم العائمة لتظهر فوق الجدول والمحتوى:

- قائمة إعدادات الأعمدة.
- قائمة فلتر التاريخ.
- قائمة تنسيق الجدول.
- قائمة اختصارات الجدول.
- قائمة سياق تنسيق الخلية/الصف/العمود.

### 13. تنسيقات الجدول والقواعد الخارجية

تنسيقات الألوان والخطوط لا يتم حفظها في `localStorage`.

مصدرها الأساسي:

```text
/api/tenant/table-format-rules
```

وتدعم:

- تنسيق الجدول بالكامل.
- تنسيق الصف.
- تنسيق الخلية.
- تنسيق العمود.
- رؤية `personal`.
- رؤية `shared`.
- مسح التنسيقات والعودة للوضع الطبيعي.

### 14. الأعمدة والتثبيت والتحجيم

تم دعم:

- سحب الأعمدة من رأس الجدول لتغيير ترتيبها.
- تثبيت الأعمدة أثناء التمرير الأفقي.
- تغيير عرض العمود بالسحب.
- الدبل كليك على رأس العمود للفرز بدلا من الفرز أثناء تغيير العرض.
- حفظ ترتيب الأعمدة في `localStorage`.
- حفظ التثبيت في `localStorage`.
- حفظ عروض الأعمدة في `localStorage`.

### 15. النسخ من الخلية

تم تعديل النسخ بحيث يتم عند الضغط على نص الخلية نفسه، وليس عند الضغط على كامل مساحة الخلية.

هذا يمنع تعارض النسخ مع:

- تحديد الصف.
- فتح القائمة بالزر الأيمن.
- الدبل كليك على الصف.
- أي عناصر تفاعلية داخل الخلية.

### 16. التحديد والاختصارات

تم دعم:

- `Ctrl + Click` لتحديد أو إلغاء تحديد صف.
- `Ctrl + A` لتحديد الكل، وإذا كان الكل محددا يتم إلغاء التحديد.
- مكون `DataTableShortcuts` لعرض اختصارات الجدول.
- ظهور قائمة الاختصارات فوق المحتوى باستخدام `createPortal`.

### 17. دعم عدم وجود بيانات

حتى لو لم توجد بيانات في الجدول، تظل أدوات الجدول والإعدادات ظاهرة أعلى الجدول حتى يستطيع المستخدم تعديل الفلاتر أو الإعدادات بدون الحاجة لوجود صفوف.

### 18. الملفات الجديدة أو المهمة في آخر تحديثات DataTable

```text
src/shared/components/data-table/DataTable.jsx
src/shared/components/data-table/DataTableBody.jsx
src/shared/components/data-table/DataTableHeader.jsx
src/shared/components/data-table/DataTableFilterRow.jsx
src/shared/components/data-table/DataTableRowSplitToggle.jsx
src/shared/components/data-table/DataTableRowSplitDialog.jsx
src/shared/components/data-table/DataTableZoomControl.jsx
src/shared/components/data-table/DataTableShortcuts.jsx
src/shared/components/data-table/DateRangeFilter.jsx
src/shared/components/data-table/TableStyleCustomizer.jsx
src/shared/components/data-table/hooks/useColumnOrder.js
src/shared/components/data-table/hooks/useColumnPinning.js
src/shared/components/data-table/hooks/useColumnResize.js
src/shared/components/data-table/hooks/useTableFormatRules.js
src/shared/components/data-table/utils/splitRowsLayout.js
src/shared/components/data-table/utils/tableFormatRules.js
src/shared/components/data-table/utils/clipboardHelpers.js
```

### 19. مفاتيح التخزين المحلية المستخدمة

```text
selected-{tableId}
format-visibility-{tableId}
date-range-filter-{tableId}
datatable-zoom-{tableId}
datatable-split-rows-{tableId}
datatable-split-rows-config-{tableId}
```

ملاحظة مهمة:

ألوان الصفوف والخلايا والأعمدة وخصائص الخط لا يتم تخزينها محليا، ويتم جلبها وحفظها من خلال API قواعد التنسيق فقط.

**آخر تحديث**: 2026-08-21 06:08:24 +03:00
