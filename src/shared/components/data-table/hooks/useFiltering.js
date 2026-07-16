import { useState, useMemo } from 'react'

export function useFiltering(rows, columns) {
  const [globalFilter, setGlobalFilter] = useState('')

  const filteredRows = useMemo(() => {
    if (!globalFilter.trim() || !rows) return rows

    const term = globalFilter.toLowerCase()
    const searchColumns = columns.filter((c) => c.searchable !== false)

    return rows.filter((row) =>
      searchColumns.some((column) => {
        const value = getNestedValue(row, column.accessor)
        if (value == null) return false
        return String(value).toLowerCase().includes(term)
      })
    )
  }, [globalFilter, rows, columns])

  return { globalFilter, setGlobalFilter, filteredRows }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, prop) => current?.[prop], obj)
}
