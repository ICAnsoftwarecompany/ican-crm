import { useState, useMemo } from 'react'
import { DEFAULT_PAGE_SIZE } from '../constants'

export function usePagination(filteredRows) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const paginatedRows = useMemo(() => {
    if (!filteredRows) return []
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredRows.slice(start, end)
  }, [filteredRows, pagination])

  const pageCount = useMemo(() => {
    if (!filteredRows) return 0
    return Math.ceil(filteredRows.length / pagination.pageSize)
  }, [filteredRows, pagination.pageSize])

  const setPageIndex = (index) => {
    const maxIndex = Math.max(pageCount - 1, 0)
    setPagination((prev) => ({
      ...prev,
      pageIndex: Math.min(Math.max(index, 0), maxIndex),
    }))
  }

  const setPageSize = (size) => {
    setPagination((prev) => ({
      pageIndex: 0, // Reset to first page when changing page size
      pageSize: size,
    }))
  }

  const nextPage = () => setPageIndex(pagination.pageIndex + 1)
  const prevPage = () => setPageIndex(pagination.pageIndex - 1)
  const goToPage = (index) => setPageIndex(index)

  return {
    pagination,
    paginatedRows,
    pageCount,
    setPageIndex,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
    canNextPage: pagination.pageIndex < pageCount - 1,
    canPrevPage: pagination.pageIndex > 0,
  }
}
