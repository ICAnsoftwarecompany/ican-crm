import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GitCompareArrows } from 'lucide-react'
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
import { PrintButton } from './PrintButton'
import { ExportDialog } from './ExportDialog'
import { TableStyleCustomizer } from './TableStyleCustomizer'
import { DataTableCompareDialog } from './DataTableCompareDialog'
import { useDataTable } from './hooks/useDataTable'
import { useAdvancedFilters } from './hooks/useAdvancedFilters'
import { useExport } from './hooks/useExport'
import { useColumnPinning } from './hooks/useColumnPinning'
import { useColumnResize } from './hooks/useColumnResize'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTableFormatRules } from './hooks/useTableFormatRules'
import { buildFilterQuery } from './utils/buildFilterQuery'
import { generateExcelFile, getExportFilename } from './utils/exportHelpers'
import { copySelectedRowsToClipboard } from './utils/clipboardHelpers'
import { CopyButton } from './CopyButton'
import { useDirection } from '../../hooks/useDirection'

function toExcelColumnLabel(index) {
  let n = index + 1
  let label = ''

  while (n > 0) {
    const remainder = (n - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    n = Math.floor((n - 1) / 26)
  }

  return label
}

function estimateTextWidth(text, averageCharWidth = 8) {
  const value = String(text || '').trim()
  if (!value) return 0

  return Array.from(value).reduce((width, char) => {
    if (/[\u0600-\u06FF]/.test(char)) return width + 9
    if (/[A-Z0-9]/.test(char)) return width + 8
    if (/[a-z]/.test(char)) return width + 7
    if (/\s/.test(char)) return width + 4
    return width + averageCharWidth
  }, 0)
}

function getHeaderMinWidth(header) {
  const headerTextWidth = estimateTextWidth(header, 8)

  // Header text + cell padding + sort icon + pin icon + breathing room.
  return Math.ceil(headerTextWidth + 92)
}

export function DataTable({
  data,
  columns,
  tableId = 'default',
  serverPaginationMeta = null,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore = undefined,
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
  enableGlobalSearch = true,
  enableExport = true,
  emptyMessage = 'لا توجد بيانات',
  toolbarActions = null,
  onExport = null,
  onFilterChange = null,
}) {
  const dir = useDirection()
  const tableContainerRef = useRef(null)
  const tableRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [showScrollUpButton, setShowScrollUpButton] = useState(false)
  const [showScrollDownButton, setShowScrollDownButton] = useState(false)
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const effectiveTableId = useMemo(() => {
    if (tableId && tableId !== 'default') return tableId
    if (typeof window === 'undefined') return 'default'
    return `route:${window.location.pathname || 'default'}`
  }, [tableId])

  const getRowKey = useCallback((row, index) => {
    if (row?.id !== undefined && row?.id !== null) return String(row.id)
    if (row?._id !== undefined && row?._id !== null) return String(row._id)
    if (row?.uuid !== undefined && row?.uuid !== null) return String(row.uuid)
    return `row-${index}`
  }, [])

  const [storedSelection, setStoredSelection] = useLocalStorage(`selected-${effectiveTableId}`, [])
  const [selectedRowKeys, setSelectedRowKeys] = useState(new Set(storedSelection || []))
  const tableTypography = {
    fontSize: '14px',
    fontFamily: '',
    fontWeight: '500',
  }
  const [bulkRowStyleAction, setBulkRowStyleAction] = useState(null)
  const [formatVisibility, setFormatVisibility] = useLocalStorage(
    `format-visibility-${effectiveTableId}`,
    'personal'
  )
  const [draftTableStyle, setDraftTableStyle] = useState({})

  const persistSelection = useCallback((nextSet) => {
    setSelectedRowKeys(nextSet)
    setStoredSelection(Array.from(nextSet))
  }, [setStoredSelection])

  const processedColumns = useMemo(() => {
    const selectColumn = {
      id: '__select',
      header: '',
      accessor: '__select',
      searchable: false,
      sortable: false,
      visible: true,
      customWidth: 44,
      canHide: false,
      enableFilter: false,
    }

    const totalRows = Array.isArray(data) ? data.length : 0
    const maxSerial = Math.min(Math.max(totalRows, 1), 100000)
    const serialDigits = String(maxSerial).length
    const serialWidth = Math.max(56, serialDigits * 12 + 24)

    const serialColumn = {
      id: '__serial',
      header: '#',
      accessor: '__serial',
      searchable: false,
      sortable: false,
      visible: true,
      width: null,
      customWidth: serialWidth,
      canHide: false,
      enableFilter: false,
      render: (row) => row.__serial,
    }

    return [selectColumn, serialColumn, ...columns]
  }, [columns, data])

  const advancedFilters = useAdvancedFilters(effectiveTableId, processedColumns)
  const exportState = useExport()
  const { orderedColumns, toggleColumnPin, isPinned } = useColumnPinning(processedColumns, effectiveTableId)
  const { columnWidths, setColumnWidth } = useColumnResize(effectiveTableId)
  const tableFormatRules = useTableFormatRules(
    effectiveTableId,
    [],
    processedColumns,
    undefined,
    formatVisibility
  )

  useEffect(() => {
    setDraftTableStyle(tableFormatRules.tableStyle || {})
  }, [tableFormatRules.tableStyle, formatVisibility])

  const activeTableStyle = draftTableStyle || {}

  const updateActiveTableStyle = useCallback(
    (nextStyle) => {
      setDraftTableStyle(nextStyle)
    },
    []
  )

  const saveActiveTableStyle = useCallback(() => {
    tableFormatRules.saveTableFormatRule({
      style: activeTableStyle,
      visibility: formatVisibility,
    })
  }, [activeTableStyle, formatVisibility, tableFormatRules])

  const toggleFormatVisibility = useCallback(() => {
    setFormatVisibility((current) => (current === 'personal' ? 'shared' : 'personal'))
  }, [setFormatVisibility])

  const widthClassToPx = useMemo(
    () => ({
      'w-20': 80,
      'w-24': 96,
      'w-28': 112,
      'w-32': 128,
      'w-36': 144,
      'w-40': 160,
      'w-48': 192,
      'w-56': 224,
      'w-64': 256,
    }),
    []
  )

  // Apply advanced filters first
  const filteredData = enableAdvancedFilters && advancedFilters.hasActiveFilters
    ? buildFilterQuery(data, advancedFilters.filters, processedColumns)
    : data

  // Optionally show selected rows only.
  const visibleData = useMemo(() => {
    if (!showSelectedOnly) return filteredData

    return (filteredData || []).filter((row, index) => {
      const key = getRowKey(row, index)
      return selectedRowKeys.has(key)
    })
  }, [showSelectedOnly, filteredData, getRowKey, selectedRowKeys])

  const isCursorMode = typeof onLoadMore === 'function'

  const allFilteredRowKeys = useMemo(() => {
    return (visibleData || []).map((row, index) => getRowKey(row, index))
  }, [visibleData, getRowKey])

  const table = useDataTable({
    data: visibleData,
    columns: processedColumns,
    tableId: effectiveTableId,
    initialSort,
    enableSorting,
    enableFiltering,
    enablePagination: isCursorMode ? false : enablePagination,
    enableColumnVisibility,
  })

  const autoContentWidths = useMemo(() => {
    const sampleRows = (visibleData || []).slice(0, 200)
    const widths = {}

    const getNestedValue = (obj, path) => {
      if (!path || !obj) return undefined
      return path.split('.').reduce((current, key) => current?.[key], obj)
    }

    const normalizeValue = (value) => {
      if (value === null || value === undefined) return ''
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
      if (Array.isArray(value)) return value.map((item) => normalizeValue(item)).join(', ')
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    }

    table.visibleColumns.forEach((col) => {
      if (!col || col.id === '__select' || col.id === '__serial') return

      // Keep strict/fixed action columns from their explicit width.
      if (!col.accessor) return

      const headerMinWidth = getHeaderMinWidth(normalizeValue(col.header))
      let maxContentWidth = 0

      sampleRows.forEach((row) => {
        const value = getNestedValue(row, col.accessor)
        const text = normalizeValue(value)
        maxContentWidth = Math.max(maxContentWidth, estimateTextWidth(text))
      })

      // Auto width must never be narrower than the header label.
      widths[col.id] = Math.min(560, Math.max(headerMinWidth, maxContentWidth + 44, 96))
    })

    return widths
  }, [table.visibleColumns, visibleData])

  useEffect(() => {
    const missingPersistedWidths = Object.entries(autoContentWidths).filter(
      ([columnId]) => !columnWidths[columnId]
    )

    if (!missingPersistedWidths.length) return

    missingPersistedWidths.forEach(([columnId, width]) => {
      setColumnWidth(columnId, width)
    })
  }, [autoContentWidths, columnWidths, setColumnWidth])

  useEffect(() => {
    if (selectedRowKeys.size > 0) return
    if (showSelectedOnly) setShowSelectedOnly(false)
  }, [selectedRowKeys, showSelectedOnly])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateScrollButtons = () => {
      const currentY = window.scrollY || window.pageYOffset || 0
      const maxY = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      const scrollingDown = currentY > lastScrollYRef.current + 2
      const scrollingUp = currentY < lastScrollYRef.current - 2

      setShowScrollUpButton(scrollingUp && currentY > 220)
      setShowScrollDownButton(scrollingDown && currentY < maxY - 220)

      lastScrollYRef.current = currentY
    }

    window.addEventListener('scroll', updateScrollButtons, { passive: true })
    updateScrollButtons()

    return () => {
      window.removeEventListener('scroll', updateScrollButtons)
    }
  }, [])

  useEffect(() => {
    if (!tableContainerRef.current) return

    const updateWidth = () => {
      setContainerWidth(tableContainerRef.current?.clientWidth || 0)
    }

    updateWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }

    const observer = new ResizeObserver(updateWidth)
    observer.observe(tableContainerRef.current)
    window.addEventListener('resize', updateWidth)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  const preferredColumns = useMemo(() => {
    const visibleIds = new Set(table.visibleColumns.map((col) => col.id))

    return orderedColumns
      .filter((col) => visibleIds.has(col.id))
      .map((col) => {
        const configuredWidth = Number(col.customWidth) || widthClassToPx[col.width] || 0
        const autoWidth = Number(autoContentWidths[col.id]) || 0
        const minimumWidth =
          col.id === '__select' || col.id === '__serial'
            ? configuredWidth || autoWidth || 60
            : Math.max(configuredWidth, autoWidth, 96)

        return {
          ...col,
          _minimumWidth: minimumWidth,
          _preferredWidth:
            columnWidths[col.id] ||
            autoWidth ||
            configuredWidth ||
            160,
        }
      })
  }, [table.visibleColumns, orderedColumns, columnWidths, autoContentWidths, widthClassToPx])

  const renderedColumns = useMemo(() => {
    let excelIndex = 0
    return preferredColumns.map((col) => {
      const resolvedWidth = Math.max(60, Number(col._minimumWidth) || 96, Number(col._preferredWidth) || 160)
      return {
        ...col,
        _excelLabel: col.id === '__select' ? '' : toExcelColumnLabel(excelIndex++),
        _resolvedWidth: resolvedWidth,
      }
    })
  }, [preferredColumns])

  const resolvedTableWidth = useMemo(() => {
    const sum = renderedColumns.reduce((acc, col) => acc + (col._resolvedWidth || 0), 0)
    return Math.max(sum, containerWidth || 0)
  }, [renderedColumns, containerWidth])

  const displayRows = useMemo(() => {
    const pageStart = table.pagination.pageIndex * table.pagination.pageSize
    return table.rows.map((row, index) => ({
      ...row,
      __rowKey: getRowKey(row, pageStart + index),
      __serial: pageStart + index + 1,
    }))
  }, [table.rows, table.pagination.pageIndex, table.pagination.pageSize, getRowKey])

  const compareRows = useMemo(() => {
    return (visibleData || []).map((row, index) => ({
      ...row,
      __rowKey: getRowKey(row, index),
      __serial: index + 1,
    }))
  }, [visibleData, getRowKey])

  const pageRowKeys = useMemo(() => displayRows.map((row) => row.__rowKey), [displayRows])
  const pageSelectionCount = useMemo(
    () => pageRowKeys.filter((key) => selectedRowKeys.has(key)).length,
    [pageRowKeys, selectedRowKeys]
  )
  const allPageSelected = pageRowKeys.length > 0 && pageSelectionCount === pageRowKeys.length
  const somePageSelected = pageSelectionCount > 0 && !allPageSelected
  const allFilteredSelected =
    allFilteredRowKeys.length > 0 && allFilteredRowKeys.every((key) => selectedRowKeys.has(key))
  const hasMoreOnServer = Boolean(serverPaginationMeta?.has_more || serverPaginationMeta?.hasMore)

  const toggleRowSelection = useCallback((rowKey, checked) => {
    const next = new Set(selectedRowKeys)
    if (checked) {
      next.add(rowKey)
    } else {
      next.delete(rowKey)
    }
    persistSelection(next)
  }, [selectedRowKeys, persistSelection])

  const selectCurrentPage = useCallback((checked) => {
    const next = new Set(selectedRowKeys)
    pageRowKeys.forEach((key) => {
      if (checked) next.add(key)
      else next.delete(key)
    })
    persistSelection(next)
  }, [selectedRowKeys, pageRowKeys, persistSelection])

  const selectAllFiltered = useCallback((checked) => {
    const next = new Set(selectedRowKeys)
    allFilteredRowKeys.forEach((key) => {
      if (checked) next.add(key)
      else next.delete(key)
    })
    persistSelection(next)
  }, [selectedRowKeys, allFilteredRowKeys, persistSelection])

  const applyStyleToSelectedRows = useCallback((patch) => {
    if (!selectedRowKeys.size) return
    setBulkRowStyleAction({
      id: Date.now(),
      patch,
    })
  }, [selectedRowKeys])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (!(event.code === 'KeyA' || event.key?.toLowerCase() === 'a')) return

      const tag = (event.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target?.isContentEditable) {
        return
      }

      event.preventDefault()
      selectAllFiltered(true)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [selectAllFiltered])

  // Handle column resize
  const handleStartResize = (e, columnId) => {
    e.preventDefault()
    const startX = e.clientX

    // Find the th element - the resize handle is inside th
    const thElement = e.currentTarget?.closest('th')
    if (!thElement) return

    const column = renderedColumns.find((col) => col.id === columnId)
    const minimumWidth = Number(column?._minimumWidth) || 60
    const initialWidth = thElement.offsetWidth

    const handleMouseMove = (moveEvent) => {
      const rawDiff = moveEvent.clientX - startX
      const diff = dir === 'rtl' ? -rawDiff : rawDiff
      const newWidth = Math.max(minimumWidth, initialWidth + diff)
      setColumnWidth(columnId, newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

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
        ? table.visibleColumns.filter((col) => col.id !== '__serial')
        : processedColumns.filter((col) => col.id !== '__serial')

      generateExcelFile(
        dataToExport,
        columnsToExport,
        getExportFilename('export'),
        true,
        {
          rowStyles: {},
          cellStyles: {},
          columnStyles: {},
          tableTypography,
          tableStyle: activeTableStyle,
        }
      )
    }
    exportState.closeDialog()
  }

  const handleCopySelected = async () => {
    const rowsToUseForCopy = exportState.exportOptions.exportMode === 'filtered' ? visibleData : data
    const success = await copySelectedRowsToClipboard(
      rowsToUseForCopy,
      processedColumns,
      selectedRowKeys
    )
    if (success) {
      console.log('Copied to clipboard successfully')
    }
  }

  const scrollToTop = () => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
  }

  const handlePrint = () => {
    if (typeof window === 'undefined' || !tableRef.current) return

    const printWindow = window.open('', '_blank', 'width=1200,height=800')
    if (!printWindow) return

    const tableHtml = tableRef.current.outerHTML
    const title = document.title || 'Data Table'

    printWindow.document.write(`
      <html lang="${document.documentElement.lang || 'en'}" dir="${document.documentElement.dir || 'ltr'}">
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Tahoma, Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { font-size: 18px; margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: start; font-size: 12px; }
            thead tr:nth-child(2), thead tr:nth-child(2) * { display: none !important; }
            .no-print, button { display: none !important; }
            @media print {
              body { margin: 0; }
              @page { size: auto; margin: 12mm; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${tableHtml}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
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
      <style>{`
        @keyframes pulse-bounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-2px); }
        }
        .scroll-button-pulse {
          animation: pulse-bounce 1.5s ease-in-out infinite;
        }
      `}</style>
      {showToolbar && (
        <>
          <DataTableToolbar
            columns={processedColumns}
            tableId={effectiveTableId}
            globalFilter={table.globalFilter}
            onGlobalFilterChange={table.setGlobalFilter}
            columnVisibility={table.columnVisibility}
            onColumnToggle={table.toggleColumnVisibility}
            showGlobalSearch={enableGlobalSearch}
          >
            <TableStyleCustomizer
              visibility={formatVisibility}
              style={activeTableStyle}
              onStyleChange={updateActiveTableStyle}
              onSave={saveActiveTableStyle}
              onToggleVisibility={toggleFormatVisibility}
              isSaving={tableFormatRules.isSavingTableStyle}
            />

            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
              title="مقارنة العملاء"
              aria-label="مقارنة العملاء"
            >
              <GitCompareArrows size={16} />
            </button>

            {selectedRowKeys.size > 0 && (
              <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
                <span className="text-xs text-[var(--text-muted)] font-arabic">تخصيص المحدد</span>
                {['#DBEAFE', '#DCFCE7', '#FEF3C7', '#FCE7F3', '#E2E8F0'].map((color) => (
                  <button
                    key={`bulk-bg-${color}`}
                    type="button"
                    className="w-4 h-4 rounded border border-slate-300"
                    style={{ backgroundColor: color }}
                    onClick={() => applyStyleToSelectedRows({ bgColor: color })}
                    title="لون خلفية الصفوف المحددة"
                  />
                ))}
                {['#0F172A', '#1D4ED8', '#047857', '#B45309', '#BE185D'].map((color) => (
                  <button
                    key={`bulk-text-${color}`}
                    type="button"
                    className="w-4 h-4 rounded border border-slate-300"
                    style={{ backgroundColor: color }}
                    onClick={() => applyStyleToSelectedRows({ textColor: color })}
                    title="لون خط الصفوف المحددة"
                  />
                ))}
                <select
                  className="h-7 rounded border border-[var(--border)] bg-[var(--surface)] px-1 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (!e.target.value) return
                    applyStyleToSelectedRows({ fontSize: e.target.value })
                  }}
                >
                  <option value="">حجم</option>
                  <option value="12px">12</option>
                  <option value="13px">13</option>
                  <option value="14px">14</option>
                  <option value="16px">16</option>
                  <option value="18px">18</option>
                </select>
                <select
                  className="h-7 rounded border border-[var(--border)] bg-[var(--surface)] px-1 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (!e.target.value) return
                    applyStyleToSelectedRows({ fontWeight: e.target.value })
                  }}
                >
                  <option value="">وزن</option>
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            )}

            <PrintButton
              onClick={handlePrint}
              disabled={table.totalRowCount === 0}
            />
            {selectedRowKeys.size > 0 && (
              <CopyButton
                onClick={handleCopySelected}
                title="نسخ الصفوف المحددة"
              />
            )}
            {selectedRowKeys.size > 0 && (
              <button
                type="button"
                onClick={() => setShowSelectedOnly((prev) => !prev)}
                className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs font-arabic hover:bg-[var(--surface-2)]"
                title="تحديد ما يتم عرضه من العملاء"
              >
                {showSelectedOnly
                  ? `عرض الكل (${table.totalRowCount})`
                  : `عرض المحدد فقط (${selectedRowKeys.size})`}
              </button>
            )}
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

          {hasMoreOnServer && (
            <div className="text-xs text-[var(--text-muted)] font-arabic">
              يوجد بيانات إضافية على السيرفر. التحديد الحالي يطبق على البيانات المحمّلة فقط.
            </div>
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

      <DataTableCompareDialog
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        rows={compareRows}
        columns={renderedColumns}
        selectedRowKeys={selectedRowKeys}
      />

      {table.filteredRowCount === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div ref={tableContainerRef} className="overflow-x-auto border border-[var(--border)] rounded-lg">
          <table
            ref={tableRef}
            className="table-fixed border-collapse"
            style={{ width: `${resolvedTableWidth}px`, minWidth: '100%' }}
          >
            <colgroup>
              {renderedColumns.map((col) => (
                <col
                  key={col.id}
                  style={{ width: `${col._resolvedWidth}px`, minWidth: `${col._resolvedWidth}px` }}
                />
              ))}
            </colgroup>
            <thead>
              <DataTableHeader
                columns={renderedColumns}
                sorting={table.sorting}
                onSort={table.setSortColumn}
                onPinColumn={toggleColumnPin}
                isPinned={isPinned}
                onStartResize={handleStartResize}
                selectionState={{
                  allPageSelected,
                  somePageSelected,
                  allFilteredSelected,
                  pageCount: pageRowKeys.length,
                  selectedCount: selectedRowKeys.size,
                  hasMoreOnServer,
                }}
                onSelectPage={selectCurrentPage}
                onSelectAllFiltered={selectAllFiltered}
              />
              {enableAdvancedFilters && (
                <DataTableFilterRow
                  columns={renderedColumns}
                  rows={data}
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
              rows={displayRows}
              columns={renderedColumns}
              tableId={effectiveTableId}
              pageStart={table.pagination.pageIndex * table.pagination.pageSize}
              selectedRowKeys={selectedRowKeys}
              onToggleRowSelection={toggleRowSelection}
              tableTypography={tableTypography}
              tableStyle={activeTableStyle}
              formatVisibility={formatVisibility}
              bulkRowStyleAction={bulkRowStyleAction}
              onRowClick={onRowClick}
              rowClassName={rowClassName}
            />
          </table>
        </div>
      )}

      {showFooter && !isCursorMode && (
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

      {showFooter && isCursorMode && hasNextPage && (
        <div className="py-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm font-arabic hover:bg-[var(--surface-2)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isFetchingNextPage ? 'جاري التحميل...' : 'تحميل المزيد'}
          </button>
        </div>
      )}

      {showScrollUpButton && (
        <button
          type="button"
          onClick={scrollToTop}
          className={`fixed bottom-5 ${dir === 'rtl' ? 'left-5' : 'right-5'} z-40 w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-md hover:bg-[var(--surface-2)] scroll-button-pulse`}
          title="الصعود لأعلى"
          aria-label="الصعود لأعلى"
        >
          ↑
        </button>
      )}

      {showScrollDownButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          className={`fixed bottom-5 ${dir === 'rtl' ? 'left-16' : 'right-16'} z-40 w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-md hover:bg-[var(--surface-2)] scroll-button-pulse`}
          title="النزول لأسفل"
          aria-label="النزول لأسفل"
        >
          ↓
        </button>
      )}
    </div>
  )
}
