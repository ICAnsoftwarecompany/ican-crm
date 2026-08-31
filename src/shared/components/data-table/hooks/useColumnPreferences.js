import { useState, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

function getDefaultVisibility(columns = []) {
  return columns.reduce((acc, col) => {
    acc[col.id] = col.canHide === false ? true : col.visible !== false
    return acc
  }, {})
}

export function useColumnPreferences(columns, tableId) {
  const [storedVisibility, setStoredVisibility] = useLocalStorage(
    `columns-${tableId}`,
    null
  )

  const [columnVisibility, setColumnVisibility] = useState(() => {
    if (storedVisibility) return storedVisibility

    return getDefaultVisibility(columns)
  })

  const handleColumnVisibilityChange = (columnId, visible) => {
    const targetColumn = columns.find((col) => col.id === columnId)
    if (targetColumn?.canHide === false) {
      return
    }

    const newVisibility = { ...columnVisibility, [columnId]: visible }
    setColumnVisibility(newVisibility)
    setStoredVisibility(newVisibility)
  }

  const toggleColumnVisibility = (columnId) => {
    handleColumnVisibilityChange(columnId, !columnVisibility[columnId])
  }

  const resetColumnVisibility = () => {
    const defaultVisibility = getDefaultVisibility(columns)
    setColumnVisibility(defaultVisibility)
    setStoredVisibility(null)
  }

  const visibleColumns = useMemo(() => {
    return columns.filter((col) => {
      if (col.canHide === false) return true
      return columnVisibility[col.id] !== false
    })
  }, [columns, columnVisibility])

  return {
    columnVisibility,
    handleColumnVisibilityChange,
    toggleColumnVisibility,
    resetColumnVisibility,
    visibleColumns,
  }
}
