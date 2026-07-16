# DataTable Filters & Export System

## Overview

The DataTable component includes an enterprise-grade filtering and Excel export system that works seamlessly across all CRM pages (Customers, Products, Leads, Teams, etc.) without requiring page-specific logic.

**Key Features:**
- Per-column advanced filters (text, select, number, date, boolean)
- Filter persistence to localStorage
- Active filter display with quick removal
- Excel export (filtered or all data, visible or all columns)
- Generic implementation (zero hardcoded business logic)
- Fully accessible and RTL-compatible

---

## Architecture

### Component Hierarchy

```
DataTable (orchestrator)
├─ useAdvancedFilters (filter state + persistence)
├─ useExport (export dialog state)
├─ useDataTable (sort, search, pagination)
├─ DataTableToolbar
│  ├─ GlobalSearch
│  ├─ ColumnVisibilityToggle
│  ├─ ExportButton
│  └─ toolbarActions (custom)
├─ ActiveFilters (when filters exist)
│  └─ FilterChip × N
├─ ExportDialog (when export button clicked)
└─ DataTableBody + DataTableHeader + DataTableFooter

Filter & Export Utilities
├─ buildFilterQuery (apply column filters to rows)
├─ applyAllFilters (combines global + column filters)
├─ prepareExportData (formats rows/columns for Excel)
└─ generateExcelFile (creates XLSX and downloads)
```

### Data Flow (with Advanced Filters)

```
Raw Data (from API)
    ↓
useAdvancedFilters (filter state: { columnId: { operator, value } })
    ↓
buildFilterQuery (apply column filters)
    ↓
useDataTable (sort, global search, pagination)
    ↓
Rendered Table Rows
    ↓
Export Dialog → generateExcelFile (respects export options)
```

---

## Filter Types & Operators

### Text Filter
**Use For:** Names, descriptions, email addresses, any string field.

**Operators:**
- `contains` — substring search (default)
- `startsWith` — begins with value
- `endsWith` — ends with value
- `equals` — exact match

**Column Definition:**
```javascript
{
  id: "name",
  header: "الاسم",
  accessor: "name",
  filterType: "text",  // Optional, defaults to "text"
}
```

### Select Filter
**Use For:** Categories, statuses, dropdown options with predefined values.

**Operators:**
- `equals` — single value match
- `in` — comma-separated values (multi-select)

**Column Definition:**
```javascript
{
  id: "status",
  header: "الحالة",
  accessor: "status",
  filterType: "select",
  filterOptions: [
    { label: "نشط", value: "active" },
    { label: "معطل", value: "inactive" },
  ],
}
```

### Number Filter
**Use For:** Quantities, amounts, counts, any numeric field.

**Operators:**
- `equals` — exact value
- `greaterThan` — greater than
- `lessThan` — less than
- `between` — range (from/to)

**Column Definition:**
```javascript
{
  id: "balance",
  header: "الرصيد",
  accessor: "balance",
  filterType: "number",
}
```

### Date Filter
**Use For:** Created dates, updated dates, due dates, any date field.

**Operators:**
- `equals` — exact date
- `before` — before date
- `after` — after date
- `between` — date range

**Column Definition:**
```javascript
{
  id: "created_at",
  header: "تاريخ الإنشاء",
  accessor: "created_at",
  filterType: "date",
}
```

### Boolean Filter
**Use For:** Checkboxes, yes/no fields, active/inactive flags.

**Operators:**
- `true` — true values
- `false` — false values

**Column Definition:**
```javascript
{
  id: "is_verified",
  header: "تم التحقق",
  accessor: "is_verified",
  filterType: "boolean",
}
```

---

## Using Filters in Pages

### Basic Setup (Client-Side Filtering)

```jsx
import { DataTable } from '@/shared/components/data-table'
import { useCustomersQuery } from '@/services/hooks/useCustomersQuery'

export function CustomersPage() {
  const { data, isLoading, error } = useCustomersQuery()

  const columns = [
    {
      id: "name",
      header: "الاسم",
      accessor: "name",
      filterType: "text",
    },
    {
      id: "status",
      header: "الحالة",
      accessor: "status",
      filterType: "select",
      filterOptions: [
        { label: "نشط", value: "active" },
        { label: "معطل", value: "inactive" },
      ],
    },
    {
      id: "balance",
      header: "الرصيد",
      accessor: "balance",
      filterType: "number",
    },
  ]

  return (
    <DataTable
      data={data?.data || []}
      columns={columns}
      tableId="customers"
      isLoading={isLoading}
      error={error}
      enableAdvancedFilters={true}
      enableExport={true}
    />
  )
}
```

**Notes:**
- `tableId` must be unique per page (used for localStorage key)
- Filter state persists automatically to `localStorage.filters-{tableId}`
- Filters persist across page reloads
- `enableAdvancedFilters=true` enables filter button + FilterChip display
- `enableExport=true` enables export button + ExportDialog

### Server-Side Filtering (Optional)

If your API supports a `filters` parameter, use the `onFilterChange` callback:

```jsx
const [activeFilters, setActiveFilters] = useState({})
const { data, isLoading } = useCustomersQuery({ filters: activeFilters })

return (
  <DataTable
    data={data?.data || []}
    columns={columns}
    tableId="customers"
    isLoading={isLoading}
    enableAdvancedFilters={true}
    onFilterChange={(filters) => {
      // Filters object: { columnId: { operator, value } }
      setActiveFilters(filters)
      // Your API query hook will refetch with new filters
    }}
  />
)
```

### Server-Side Export (Optional)

If your API has a dedicated export endpoint, use the `onExport` callback:

```jsx
const handleExport = async (options) => {
  // options shape:
  // {
  //   filters,          // Active column filters
  //   visibleColumns,   // Array of visible column IDs
  //   exportMode,       // "filtered" | "all"
  //   columnMode,       // "visible" | "all"
  //   allData,          // Full dataset (client-side only)
  //   filteredData,     // After advanced filters (client-side only)
  // }

  try {
    const response = await fetch('/api/customers/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: options.filters,
        columnMode: options.columnMode,
        exportMode: options.exportMode,
      }),
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
  } catch (error) {
    console.error('Export failed:', error)
  }
}

return (
  <DataTable
    data={data?.data || []}
    columns={columns}
    tableId="customers"
    enableExport={true}
    onExport={handleExport}
  />
)
```

---

## Filter Lifecycle

### 1. User Opens Filter Menu
```
Click Filter Button for Column X
  ↓
ColumnFilter component renders
  - Shows appropriate UI (input, select, date picker, etc.)
  - Displays current operator and value
```

### 2. User Selects Operator & Value
```
Select Operator (e.g., "contains")
Enter/Select Value (e.g., "Ahmed")
  ↓
Component updates local state (operator, value)
```

### 3. User Applies Filter
```
Click "تطبيق" (Apply) Button
  ↓
handleApplyFilter called in ColumnFilter
  ↓
advancedFilters.setFilter(columnId, { type, operator, value })
  ↓
useAdvancedFilters updates state:
  filters[columnId] = { type, operator, value }
  ↓
useAdvancedFilters persists to localStorage
  ↓
ColumnFilter closes
```

### 4. DataTable Re-renders with Filter Applied
```
DataTable detects advancedFilters.filters changed
  ↓
buildFilterQuery called:
  - For each row in data
  - For each active filter
  - Apply filter logic (text contains, number between, etc.)
  ↓
Filtered rows passed to useDataTable
  ↓
Pagination applied to filtered rows
  ↓
Table re-renders
  ↓
ActiveFilters component shows filter chips
```

### 5. User Removes Filter
```
Click × on FilterChip
  ↓
advancedFilters.removeFilter(columnId)
  ↓
filters[columnId] deleted
  ↓
localStorage updated
  ↓
Table re-renders with unfiltered data (or remaining filters applied)
```

### 6. User Clears All Filters
```
Click "مسح الكل" (Clear All) Button
  ↓
advancedFilters.clearFilters()
  ↓
filters = {}
  ↓
localStorage cleared (or reset to {})
  ↓
Table re-renders with all data
```

---

## Export Lifecycle

### 1. User Clicks Export Button
```
ExportButton.onClick → exportState.openDialog()
  ↓
ExportDialog opens with options:
  - Export Mode: (•) Filtered Results | ( ) All Data
  - Column Mode: ☑ Visible Columns | ☐ All Columns
```

### 2. User Selects Export Options
```
User selects exportMode ("filtered" or "all")
User selects columnMode ("visible" or "all")
  ↓
exportState updates
```

### 3. User Clicks Export
```
Click "تصدير" (Export) Button
  ↓
DataTable.handleExport called
```

### 4a. Client-Side Export (Default)
```
DataTable.handleExport
  ├─ Determine data source:
  │  ├─ exportMode === "filtered" ? filteredData : data
  │  └─ (filteredData = after buildFilterQuery, before pagination)
  ├─ Determine columns:
  │  ├─ columnMode === "visible" ? table.visibleColumns : columns
  │  └─ (visibleColumns = columns where visible !== false)
  └─ Call generateExcelFile(dataToExport, columnsToExport, filename)

generateExcelFile
  ├─ Call prepareExportData to format rows/columns
  ├─ Create XLSX workbook
  ├─ Format header row (bold, gray background)
  ├─ Set column widths
  ├─ Call XLSX.writeFile (downloads to user device)
  └─ File: export-{YYYY-MM-DD}.xlsx
```

### 4b. Server-Side Export (with onExport callback)
```
DataTable.handleExport
  └─ Call onExport(options)
      ├─ options.filters = active column filters
      ├─ options.visibleColumns = visible column IDs
      ├─ options.exportMode = "filtered" | "all"
      ├─ options.columnMode = "visible" | "all"
      └─ Your implementation:
          - Send to /api/export endpoint
          - Return XLSX file
          - Download to user device
```

---

## Filter State in localStorage

**Key Format:** `filters-{tableId}`

**Value Shape:**
```javascript
{
  "name": {
    "type": "text",
    "operator": "contains",
    "value": "Ahmed"
  },
  "status": {
    "type": "select",
    "operator": "equals",
    "value": "active"
  },
  "balance": {
    "type": "number",
    "operator": "between",
    "value": {
      "from": 10000,
      "to": 50000
    }
  },
  "created_at": {
    "type": "date",
    "operator": "between",
    "value": {
      "from": "2026-01-01",
      "to": "2026-12-31"
    }
  }
}
```

**Persistence Behavior:**
- Filters auto-save when user applies/removes filter
- Filters auto-load when page mounts
- Filters cleared when user clicks "Clear All"
- Each page has independent filter state (different `tableId`)
- Filters survive page reloads (stored in localStorage)

---

## Component API Reference

### DataTable Props (New)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableAdvancedFilters` | boolean | true | Enable per-column filters |
| `enableExport` | boolean | true | Enable export button |
| `onFilterChange` | function | null | Called when filters change (for server-side filtering) |
| `onExport` | function | null | Called when export button clicked (for server-side export) |

### Hooks

#### useAdvancedFilters
```javascript
const filters = useAdvancedFilters(tableId, columns)

// Returns object:
{
  filters: {},                                    // Active filters by columnId
  setFilter: (columnId, filter) => void,        // Apply or update filter
  removeFilter: (columnId) => void,             // Remove single filter
  clearFilters: () => void,                     // Remove all filters
  activeFilterCount: number,                    // Count of active filters
  activeFilters: [                              // Array of active filters with display info
    { columnId, columnHeader, operator, value },
    ...
  ],
  hasActiveFilters: boolean,                    // true if any filters active
}
```

#### useExport
```javascript
const exportState = useExport()

// Returns object:
{
  showDialog: boolean,                          // Export dialog open/closed
  openDialog: () => void,                       // Open export dialog
  closeDialog: () => void,                      // Close export dialog
  exportOptions: {
    exportMode: 'filtered' | 'all',             // Which rows to export
    columnMode: 'visible' | 'all',              // Which columns to export
  },
  handleExportModeChange: (mode) => void,       // Change export mode
  handleColumnModeChange: (mode) => void,       // Change column mode
}
```

### Utility Functions

#### buildFilterQuery
```javascript
import { buildFilterQuery } from '@/shared/components/data-table'

const filteredRows = buildFilterQuery(
  rows,           // Array of row objects
  filters,        // { columnId: { operator, value } }
  columns         // Column definitions with filterType
)
// Returns: rows that pass all active filters
```

#### generateExcelFile
```javascript
import { generateExcelFile } from '@/shared/components/data-table'

generateExcelFile(
  rows,           // Array of row objects to export
  columns,        // Column definitions (uses id, header, accessor)
  filename,       // e.g., "customers-2026-07-17.xlsx" (optional, default: export.xlsx)
  visibleColumnsOnly  // true: export visible columns only; false: export all (default: true)
)
// Downloads XLSX file to user device
```

---

## Common Integration Patterns

### Pattern 1: Basic Page with Filters & Export
```jsx
export function CustomersPage() {
  const { data, isLoading, error } = useCustomersQuery()

  return (
    <DataTable
      data={data?.data || []}
      columns={CUSTOMER_COLUMNS}
      tableId="customers"
      isLoading={isLoading}
      error={error}
      enableAdvancedFilters={true}
      enableExport={true}
    />
  )
}
```

### Pattern 2: Dynamic Filters (Server-Side)
```jsx
export function ProductsPage() {
  const [filters, setFilters] = useState({})
  const { data, isLoading } = useProductsQuery({
    filters: buildFilterPayload(filters),
  })

  return (
    <DataTable
      data={data?.data || []}
      columns={PRODUCT_COLUMNS}
      tableId="products"
      isLoading={isLoading}
      enableAdvancedFilters={true}
      onFilterChange={(newFilters) => {
        setFilters(newFilters)
        // Query hook will refetch with new filters
      }}
    />
  )
}
```

### Pattern 3: Custom Export Handler
```jsx
export function LeadsPage() {
  const { data, isLoading } = useLeadsQuery()

  const handleExport = async (options) => {
    const response = await fetch('/api/leads/export', {
      method: 'POST',
      body: JSON.stringify({
        filters: options.filters,
        columnMode: options.columnMode,
      }),
    })
    const blob = await response.blob()
    downloadFile(blob, `leads-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <DataTable
      data={data?.data || []}
      columns={LEAD_COLUMNS}
      tableId="leads"
      isLoading={isLoading}
      enableAdvancedFilters={true}
      enableExport={true}
      onExport={handleExport}
    />
  )
}
```

---

## Accessibility

All filter and export components include:
- Semantic HTML (`<button>`, `<form>`, `<dialog>`)
- ARIA attributes (`role`, `aria-label`, `aria-modal`)
- Keyboard navigation (Tab, Enter, Escape)
- Focus management
- Screen reader support

---

## Performance Considerations

- **buildFilterQuery**: O(rows × filters × accessors) — memoized in DataTable
- **Filter persistence**: localStorage API is fast (< 1ms for typical filter objects)
- **Excel generation**: SheetJS is optimized for up to 100K rows (may slow on very large exports)
- **Pagination**: Applied after filtering (filters run on full dataset, pagination reduces rendered rows)

For datasets > 10K rows, consider server-side filtering.

---

## RTL & Dark Mode

All components use:
- Tailwind logical properties (start/end instead of left/right)
- CSS variables for colors (dark mode via `[data-theme="dark"]`)
- Auto-detect RTL from `<html dir="rtl">` attribute

No additional configuration required.

---

## Troubleshooting

### Filters Not Persisting
- Check browser localStorage is enabled
- Verify `tableId` is unique per page
- Check browser dev tools: Application → Storage → localStorage → `filters-{tableId}`

### Export Creates Empty File
- Verify column `accessor` matches data structure (e.g., "user.name" for nested data)
- Check filter logic didn't remove all rows
- Try export with "All Data" mode

### Filter UI Not Appearing
- Verify `enableAdvancedFilters={true}` in DataTable
- Verify columns have `filterType` defined
- Check console for JavaScript errors

### Performance Degradation with Large Datasets
- Consider server-side filtering via `onFilterChange` callback
- Limit visible rows via pagination page size
- Use React DevTools Profiler to identify bottleneck

---

## Future Enhancements

- [ ] Advanced filter builder (AND/OR logic)
- [ ] Saved filter presets per user
- [ ] Filter suggestions based on data
- [ ] CSV export option
- [ ] Scheduled exports
- [ ] Filter templates per page type
