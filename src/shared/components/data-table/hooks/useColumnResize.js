import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Manages column widths with drag-to-resize functionality
 */
export function useColumnResize(tableId = 'default') {
  const storageKey = `datatable-widths-${tableId}`
  const [savedWidths, setSavedWidths] = useLocalStorage(storageKey, {})
  
  const [columnWidths, setColumnWidths] = useState(savedWidths || {})

  const setColumnWidth = useCallback((columnId, width) => {
    setColumnWidths((prev) => {
      const updated = {
        ...prev,
        [columnId]: Math.max(width, 60), // Minimum 60px
      }
      setSavedWidths(updated)
      return updated
    })
  }, [setSavedWidths])

  const getColumnWidth = useCallback((columnId, defaultWidth = 'w-32') => {
    return columnWidths[columnId] ? `${columnWidths[columnId]}px` : defaultWidth
  }, [columnWidths])

  const resetColumnWidth = useCallback((columnId) => {
    setColumnWidths((prev) => {
      const updated = { ...prev }
      delete updated[columnId]
      setSavedWidths(updated)
      return updated
    })
  }, [setSavedWidths])

  const resetAllWidths = useCallback((nextWidths = {}) => {
    setColumnWidths(nextWidths)
    setSavedWidths(nextWidths)
  }, [setSavedWidths])

  return {
    columnWidths,
    setColumnWidth,
    getColumnWidth,
    resetColumnWidth,
    resetAllWidths,
  }
}
