import { GlobalSearch } from './GlobalSearch'
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle'

export function DataTableToolbar({
  columns,
  globalFilter,
  onGlobalFilterChange,
  columnVisibility,
  onColumnToggle,
  children,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="flex-1">
        <GlobalSearch value={globalFilter} onChange={onGlobalFilterChange} />
      </div>
      <div className="flex gap-2">
        <ColumnVisibilityToggle
          columns={columns}
          columnVisibility={columnVisibility}
          onToggle={onColumnToggle}
        />
        {children}
      </div>
    </div>
  )
}
