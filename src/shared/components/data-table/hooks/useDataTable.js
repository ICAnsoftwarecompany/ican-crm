import { useMemo } from 'react'
import { useSorting } from './useSorting'
import { useFiltering } from './useFiltering'
import { usePagination } from './usePagination'
import { useColumnPreferences } from './useColumnPreferences'

export function useDataTable({
  data = [],
  columns = [],
  tableId = 'default',
  initialSort = null,
  sortFirstDirection = 'asc',
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableColumnVisibility = true,
}) {
  const { sorting, setSortColumn, clearSort, sortRows } = useSorting(initialSort, sortFirstDirection)
  const { globalFilter, setGlobalFilter, filteredRows } = useFiltering(data, columns)
  const { columnVisibility, toggleColumnVisibility, resetColumnVisibility, visibleColumns } = useColumnPreferences(
    columns,
    tableId
  )

  const sortedRows = useMemo(() => {
    if (!enableSorting) return filteredRows
    return sortRows(filteredRows, columns)
  }, [filteredRows, sorting, enableSorting, columns, sortRows])

  const {
    paginatedRows,
    pageCount,
    pagination,
    setPageSize,
    setPageIndex,
    nextPage,
    prevPage,
    goToPage,
    canNextPage,
    canPrevPage,
  } = usePagination(enablePagination ? sortedRows : sortedRows)

  return {
    // Display data
    rows: enablePagination ? paginatedRows : sortedRows,
    visibleColumns,
    filteredRowCount: filteredRows?.length || 0,
    totalRowCount: data?.length || 0,

    // Sorting
    sorting,
    setSortColumn: enableSorting ? setSortColumn : undefined,
    clearSort: enableSorting ? clearSort : undefined,

    // Filtering
    globalFilter,
    setGlobalFilter: enableFiltering ? setGlobalFilter : undefined,

    // Pagination
    pagination,
    pageCount,
    setPageSize: enablePagination ? setPageSize : undefined,
    setPageIndex: enablePagination ? setPageIndex : undefined,
    nextPage: enablePagination ? nextPage : undefined,
    prevPage: enablePagination ? prevPage : undefined,
    goToPage: enablePagination ? goToPage : undefined,
    canNextPage,
    canPrevPage,

    // Column visibility
    columnVisibility,
    toggleColumnVisibility: enableColumnVisibility ? toggleColumnVisibility : undefined,
    resetColumnVisibility: enableColumnVisibility ? resetColumnVisibility : undefined,
  }
}
