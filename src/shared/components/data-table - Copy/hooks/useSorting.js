import { useState } from 'react'
import { DEFAULT_SORT_DIRECTION } from '../constants'

export function useSorting(initialSort = null) {
  const [sorting, setSorting] = useState(initialSort || { column: null, direction: DEFAULT_SORT_DIRECTION })

  const setSortColumn = (columnId) => {
    setSorting((prev) => {
      // Toggle direction if same column, reset if different column
      if (prev.column === columnId) {
        return {
          column: columnId,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { column: columnId, direction: DEFAULT_SORT_DIRECTION }
    })
  }

  const clearSort = () => {
    setSorting({ column: null, direction: DEFAULT_SORT_DIRECTION })
  }

  const sortRows = (rows, columns) => {
    if (!sorting.column || !rows) return rows

    const column = columns.find((c) => c.id === sorting.column)
    if (!column || !column.sortable) return rows
    const sortingAccessor = column.sortAccessor || column.accessor

    const sorted = [...rows].sort((a, b) => {
      const aVal = getNestedValue(a, sortingAccessor)
      const bVal = getNestedValue(b, sortingAccessor)

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sorting.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      // String comparison
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sorting.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })

    return sorted
  }

  return { sorting, setSortColumn, clearSort, sortRows }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}
