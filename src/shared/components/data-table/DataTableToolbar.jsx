import { GlobalSearch } from './GlobalSearch'
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle'

export function DataTableToolbar({
  columns,
  globalFilter,
  onGlobalFilterChange,
  columnVisibility,
  onColumnToggle,
  onColumnReorder,
  showGlobalSearch = true,
  showColumnVisibility = true,
  tableId = 'default',
  children,
}) {
  return (
    <div className="mb-4 flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
      {showGlobalSearch && (
        <div className="min-w-40 flex-1 basis-44 [&_input]:h-9 [&_input]:text-xs">
          <GlobalSearch value={globalFilter} onChange={onGlobalFilterChange} tableId={tableId} />
        </div>
      )}
      <div className="ms-auto flex max-w-full flex-wrap items-center gap-1.5 whitespace-nowrap [&>*]:shrink-0 [&>button]:h-9 [&>button]:rounded-lg [&>button]:text-xs [&>div>button]:h-9">
        {showColumnVisibility && (
          <ColumnVisibilityToggle
            columns={columns}
            columnVisibility={columnVisibility}
            onToggle={onColumnToggle}
            onReorder={onColumnReorder}
          />
        )}
        {children}
      </div>
    </div>
  )
}
