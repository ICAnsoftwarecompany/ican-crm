import { useState, useCallback } from 'react'

/**
 * Export dialog state management hook
 * Handles dialog open/close and export options
 */
export function useExport() {
  const [showDialog, setShowDialog] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    exportMode: 'filtered', // 'filtered' | 'all'
    columnMode: 'visible',  // 'visible' | 'all'
  })

  const openDialog = useCallback(() => {
    setShowDialog(true)
  }, [])

  const closeDialog = useCallback(() => {
    setShowDialog(false)
  }, [])

  const handleExportModeChange = useCallback((mode) => {
    setExportOptions(prev => ({
      ...prev,
      exportMode: mode,
    }))
  }, [])

  const handleColumnModeChange = useCallback((mode) => {
    setExportOptions(prev => ({
      ...prev,
      columnMode: mode,
    }))
  }, [])

  const handleExport = useCallback((onExport, filters, visibleColumns) => {
    if (onExport) {
      onExport({
        filters,
        visibleColumns,
        ...exportOptions,
      })
    }
    closeDialog()
  }, [exportOptions, closeDialog])

  return {
    showDialog,
    openDialog,
    closeDialog,
    exportOptions,
    handleExportModeChange,
    handleColumnModeChange,
    handleExport,
  }
}
