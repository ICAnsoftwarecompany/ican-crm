import { DataTableHeader } from './DataTableHeader'
import { DataTableBody } from './DataTableBody'
import { DataTableFooter } from './DataTableFooter'
import { DataTableToolbar } from './DataTableToolbar'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { useDataTable } from './hooks/useDataTable'

export function DataTable({
  data,
  columns,
  tableId = 'default',
  isLoading = false,
  error = null,
  onRetry = null,
  onRowClick = null,
  rowClassName = null,
  showToolbar = true,
  showFooter = true,
  initialSort = null,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableColumnVisibility = true,
  emptyMessage = 'لا توجد بيانات',
  toolbarActions = null,
}) {
  const table = useDataTable({
    data,
    columns,
    tableId,
    initialSort,
    enableSorting,
    enableFiltering,
    enablePagination,
    enableColumnVisibility,
  })

  if (isLoading) {
    return <LoadingState columns={table.visibleColumns} />
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (table.totalRowCount === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="space-y-4">
      {showToolbar && (
        <DataTableToolbar
          columns={columns}
          globalFilter={table.globalFilter}
          onGlobalFilterChange={table.setGlobalFilter}
          columnVisibility={table.columnVisibility}
          onColumnToggle={table.toggleColumnVisibility}
        >
          {toolbarActions}
        </DataTableToolbar>
      )}

      {table.filteredRowCount === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
          <table className="w-full">
            <DataTableHeader
              columns={table.visibleColumns}
              sorting={table.sorting}
              onSort={table.setSortColumn}
            />
            <DataTableBody
              rows={table.rows}
              columns={table.visibleColumns}
              onRowClick={onRowClick}
              rowClassName={rowClassName}
            />
          </table>
        </div>
      )}

      {showFooter && (
        <DataTableFooter
          pageIndex={table.pagination.pageIndex}
          pageCount={table.pageCount}
          pageSize={table.pagination.pageSize}
          filteredRowCount={table.filteredRowCount}
          onPrevPage={table.prevPage}
          onNextPage={table.nextPage}
          onPageSizeChange={table.setPageSize}
          canPrevPage={table.canPrevPage}
          canNextPage={table.canNextPage}
        />
      )}
    </div>
  )
}
