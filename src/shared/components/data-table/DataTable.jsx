import { DataTableHeader } from './DataTableHeader'
import { DataTableBody } from './DataTableBody'
import { DataTableFooter } from './DataTableFooter'
import { DataTableToolbar } from './DataTableToolbar'
import { DataTableFilterRow } from './DataTableFilterRow'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { ActiveFilters } from './ActiveFilters'
import { ExportButton } from './ExportButton'
import { ExportDialog } from './ExportDialog'
import { useDataTable } from './hooks/useDataTable'
import { useAdvancedFilters } from './hooks/useAdvancedFilters'
import { useExport } from './hooks/useExport'
import { buildFilterQuery } from './utils/buildFilterQuery'
import { generateExcelFile, getExportFilename } from './utils/exportHelpers'

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
  enableAdvancedFilters = true,
  enableExport = true,
  emptyMessage = 'لا توجد بيانات',
  toolbarActions = null,
  onExport = null,
  onFilterChange = null,
}) {
  const advancedFilters = useAdvancedFilters(tableId, columns)
  const exportState = useExport()

  // Apply advanced filters to data before passing to useDataTable
  const filteredData = enableAdvancedFilters && advancedFilters.hasActiveFilters
    ? buildFilterQuery(data, advancedFilters.filters, columns)
    : data

  const table = useDataTable({
    data: filteredData,
    columns,
    tableId,
    initialSort,
    enableSorting,
    enableFiltering,
    enablePagination,
    enableColumnVisibility,
  })

  // Notify parent of filter changes (for server-side filtering)
  const handleFilterChange = (columnId, filterValue) => {
    advancedFilters.setFilter(columnId, filterValue)
    if (onFilterChange) {
      onFilterChange({ ...advancedFilters.filters, [columnId]: filterValue })
    }
  }

  const handleExport = () => {
    if (onExport) {
      onExport({
        filters: advancedFilters.filters,
        visibleColumns: table.visibleColumns,
        exportMode: exportState.exportOptions.exportMode,
        columnMode: exportState.exportOptions.columnMode,
        allData: data,
        filteredData: filteredData,
      })
    } else {
      // Default client-side export
      const dataToExport = exportState.exportOptions.exportMode === 'filtered'
        ? filteredData
        : data
      const columnsToExport = exportState.exportOptions.columnMode === 'visible'
        ? table.visibleColumns
        : columns

      generateExcelFile(
        dataToExport,
        columnsToExport,
        getExportFilename('export')
      )
    }
    exportState.closeDialog()
  }

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
        <>
          <DataTableToolbar
            columns={columns}
            globalFilter={table.globalFilter}
            onGlobalFilterChange={table.setGlobalFilter}
            columnVisibility={table.columnVisibility}
            onColumnToggle={table.toggleColumnVisibility}
          >
            {enableExport && (
              <ExportButton
                onClick={exportState.openDialog}
                disabled={table.totalRowCount === 0}
              />
            )}
            {toolbarActions}
          </DataTableToolbar>

          {enableAdvancedFilters && advancedFilters.hasActiveFilters && (
            <ActiveFilters
              activeFilters={advancedFilters.activeFilters}
              onRemoveFilter={advancedFilters.removeFilter}
              onClearAll={advancedFilters.clearFilters}
            />
          )}
        </>
      )}

      {enableExport && (
        <ExportDialog
          isOpen={exportState.showDialog}
          onClose={exportState.closeDialog}
          onExport={handleExport}
          exportOptions={exportState.exportOptions}
          onExportModeChange={exportState.handleExportModeChange}
          onColumnModeChange={exportState.handleColumnModeChange}
          hasFilteredData={advancedFilters.hasActiveFilters}
        />
      )}

      {table.filteredRowCount === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
          <table className="w-full">
            <thead>
              <DataTableHeader
                columns={table.visibleColumns}
                sorting={table.sorting}
                onSort={table.setSortColumn}
              />
              {enableAdvancedFilters && (
                <DataTableFilterRow
                  columns={table.visibleColumns}
                  filters={advancedFilters.filters}
                  onFilterChange={(columnId, filter) => {
                    advancedFilters.setFilter(columnId, filter)
                    if (onFilterChange) {
                      const updatedFilters = { ...advancedFilters.filters, [columnId]: filter }
                      if (filter === null) {
                        delete updatedFilters[columnId]
                      }
                      onFilterChange(updatedFilters)
                    }
                  }}
                />
              )}
            </thead>
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
