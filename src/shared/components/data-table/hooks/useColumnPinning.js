import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * Manages which columns are pinned (frozen) to the left
 */
export function useColumnPinning(columns, tableId = 'default') {
  const storageKey = `datatable-pinned-${tableId}`
  const [savedPinnedColumns, setSavedPinnedColumns] = useLocalStorage(storageKey, {})
  
  const [pinnedColumns, setPinnedColumns] = useState(
    savedPinnedColumns || {}
  )

  const toggleColumnPin = useCallback((columnId) => {
    setPinnedColumns((prev) => {
      const updated = {
        ...prev,
        [columnId]: !prev[columnId],
      }
      setSavedPinnedColumns(updated)
      return updated
    })
  }, [setSavedPinnedColumns])

  const resetColumnPinning = useCallback(() => {
    setPinnedColumns({})
    setSavedPinnedColumns({})
  }, [setSavedPinnedColumns])

  // Return columns in order: pinned first, then unpinned
  const orderedColumns = [
    ...columns.filter((c) => pinnedColumns[c.id]),
    ...columns.filter((c) => !pinnedColumns[c.id]),
  ]

  const isPinned = useCallback((columnId) => pinnedColumns[columnId] ?? false, [pinnedColumns])

  return {
    pinnedColumns,
    toggleColumnPin,
    resetColumnPinning,
    orderedColumns,
    isPinned,
  }
}
