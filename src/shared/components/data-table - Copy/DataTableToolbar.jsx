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
    <div className="mb-4 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start">
      {showGlobalSearch && (
        <div className="min-w-0 flex-1">
          <GlobalSearch value={globalFilter} onChange={onGlobalFilterChange} tableId={tableId} />
        </div>
      )}
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pb-1 lg:justify-end">
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
