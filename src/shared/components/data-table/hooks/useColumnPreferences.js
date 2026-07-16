import { useState, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useColumnPreferences(columns, tableId) {
  const [storedVisibility, setStoredVisibility] = useLocalStorage(
    `columns-${tableId}`,
    null
  )

  const [columnVisibility, setColumnVisibility] = useState(() => {
    if (storedVisibility) return storedVisibility

    return columns.reduce((acc, col) => {
      acc[col.id] = col.visible !== false
      return acc
    }, {})
  })

  const handleColumnVisibilityChange = (columnId, visible) => {
    const newVisibility = { ...columnVisibility, [columnId]: visible }
    setColumnVisibility(newVisibility)
    setStoredVisibility(newVisibility)
  }

  const toggleColumnVisibility = (columnId) => {
    handleColumnVisibilityChange(columnId, !columnVisibility[columnId])
  }

  const visibleColumns = useMemo(() => {
    return columns.filter((col) => columnVisibility[col.id] !== false)
  }, [columns, columnVisibility])

  return {
    columnVisibility,
    handleColumnVisibilityChange,
    toggleColumnVisibility,
    visibleColumns,
  }
}
