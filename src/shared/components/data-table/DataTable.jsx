import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
import { DataTableShortcuts } from './DataTableShortcuts'
import { DataTableZoomControl } from './DataTableZoomControl'
import { DataTableRowSplitToggle } from './DataTableRowSplitToggle'
import { DataTableRowSplitDialog } from './DataTableRowSplitDialog'
import { DataTableColumnSplitToggle } from './DataTableColumnSplitToggle'
import { DataTableColumnSplitDialog } from './DataTableColumnSplitDialog'
import { DateRangeFilter } from './DateRangeFilter'
import { DataTableCompareDialog } from './DataTableCompareDialog'
import { useDataTable } from './hooks/useDataTable'
import { useAdvancedFilters } from './hooks/useAdvancedFilters'
import { useExport } from './hooks/useExport'
import { useColumnPinning } from './hooks/useColumnPinning'
import { useColumnOrder } from './hooks/useColumnOrder'
import { useColumnResize } from './hooks/useColumnResize'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTableFormatRules } from './hooks/useTableFormatRules'
import { buildFilterQuery } from './utils/buildFilterQuery'
import { generateExcelFile, getExportFilename } from './utils/exportHelpers'
import { copySelectedRowsToClipboard } from './utils/clipboardHelpers'
import { buildSplitRowsLayout } from './utils/splitRowsLayout'
import { buildSplitColumnsLayout, normalizeSplitColumnsForTable } from './utils/splitColumnsLayout'
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

const EMPTY_FORMAT_ROWS = []
const SELECTION_BG_COLORS = ['#FFFFFF', '#FEF3C7', '#DBEAFE', '#DCFCE7', '#FCE7F3', '#F3F4F6', '#E2E8F0']
const SELECTION_TEXT_COLORS = ['#0F172A', '#1D4ED8', '#047857', '#B45309', '#BE185D', '#374151', '#7C3AED']
const SELECTION_FONT_SIZES = ['12px', '13px', '14px', '16px', '18px']
const SELECTION_FONT_WEIGHTS = [
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
]
const SELECTION_FONT_FAMILIES = [
  { label: 'Default', value: 'inherit' },
  { label: 'Cairo', value: 'Cairo, sans-serif' },
  { label: 'Tajawal', value: 'Tajawal, sans-serif' },
  { label: 'Monospace', value: "'Courier New', monospace" },
]

function shallowEqualObjects(left = {}, right = {}) {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)

  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every((key) => left[key] === right[key])
}

function getNestedValue(obj, path) {
  if (!obj || !path || typeof path !== 'string') return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function normalizeColumnText(value) {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function camelToSnake(value = '') {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
}

function getDateAccessorCandidates(column) {
  const candidates = [column?.accessor, column?.id].filter(Boolean)
  const accessor = String(column?.accessor || '')
  const id = String(column?.id || '')

  if (accessor.startsWith('_') && accessor.endsWith('Display')) {
    candidates.push(camelToSnake(accessor.slice(1, -7)))
  }

  if (id) {
    candidates.push(camelToSnake(id))
  }

  return Array.from(new Set(candidates.filter(Boolean)))
}

function isDateLikeText(value) {
  if (!value) return false

  return /(_at$|At$|date|time|created|updated|deleted|assigned|last_action|موعد|تاريخ|وقت)/i.test(
    String(value)
  )
}

function isDateLikeValue(value) {
  if (value === null || value === undefined || value === '') return false
  if (value instanceof Date) return !Number.isNaN(value.getTime())
  if (typeof value === 'number') return false
  if (typeof value !== 'string') return false

  const trimmed = value.trim()
  if (!trimmed) return false
  if (!/^\d{4}-\d{2}-\d{2}|^\d{4}\/\d{2}\/\d{2}|T\d{2}:\d{2}|\d{2}:\d{2}/.test(trimmed)) {
    return false
  }

  return !Number.isNaN(new Date(trimmed).getTime())
}

function getColumnDateValue(row, column) {
  const candidates = getDateAccessorCandidates(column)

  for (const candidate of candidates) {
    const value = getNestedValue(row, candidate)
    if (isDateLikeValue(value) || value instanceof Date) return value
  }

  return getNestedValue(row, column?.accessor)
}

function detectDateColumns(columns = [], rows = []) {
  const sampleRows = (rows || []).slice(0, 50)

  return columns.filter((column) => {
    if (!column || column.id === '__select' || column.id === '__serial') return false
    if (!column.accessor && !column.id) return false

    const declaredType = String(
      column.filterType || column.type || column.dataType || column.format || column.formatType || ''
    ).toLowerCase()

    if (declaredType.includes('date') || declaredType.includes('time')) return true

    if (
      isDateLikeText(column.id) ||
      isDateLikeText(column.accessor) ||
      isDateLikeText(normalizeColumnText(column.header))
    ) {
      return true
    }

    return sampleRows.some((row) => isDateLikeValue(getColumnDateValue(row, column)))
  })
}

function dateInputToTimestamp(value, boundary = 'start') {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    if (boundary === 'end') {
      date.setHours(23, 59, 59, 999)
    } else {
      date.setHours(0, 0, 0, 0)
    }
  }

  return date.getTime()
}

function applyDateRangeFilter(rows = [], filter = {}, columns = []) {
  const hasFilter = filter?.columnId && (filter?.from || filter?.to)
  if (!hasFilter) return rows

  const column = columns.find((item) => item.id === filter.columnId)
  if (!column) return rows

  const fromTime = dateInputToTimestamp(filter.from, 'start')
  const toTime = dateInputToTimestamp(filter.to, 'end')

  return (rows || []).filter((row) => {
    const value = getColumnDateValue(row, column)
    const rowTime = dateInputToTimestamp(value, 'start')

    if (rowTime === null) return false
    if (fromTime !== null && rowTime < fromTime) return false
    if (toTime !== null && rowTime > toTime) return false

    return true
  })
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
  onRowDoubleClick = null,
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
  selectionContextActions = null,
  serialColumnRender = null,
}) {
  const dir = useDirection()
  const tableContainerRef = useRef(null)
  const tableRef = useRef(null)
  const rightSplitTableRef = useRef(null)
  const leftSplitTableRef = useRef(null)
  const loadMoreTriggerRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const autoContentWidthsRef = useRef({})
  const [containerWidth, setContainerWidth] = useState(0)
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [showScrollUpButton, setShowScrollUpButton] = useState(false)
  const [showScrollDownButton, setShowScrollDownButton] = useState(false)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [selectionContextMenu, setSelectionContextMenu] = useState(null)

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
  const hasSelectedRows = selectedRowKeys.size > 0
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
  const [dateRangeFilter, setDateRangeFilter] = useLocalStorage(
    `date-range-filter-${effectiveTableId}`,
    { columnId: '', from: '', to: '' }
  )
  const [tableZoom, setTableZoom] = useLocalStorage(`datatable-zoom-${effectiveTableId}`, 100)
  const [splitRowsEnabled, setSplitRowsEnabled] = useLocalStorage(`datatable-split-rows-${effectiveTableId}`, false)
  const [splitRowsConfig, setSplitRowsConfig] = useLocalStorage(
    `datatable-split-rows-config-${effectiveTableId}`,
    { primaryColumnIds: [] }
  )
  const [isSplitRowsDialogOpen, setIsSplitRowsDialogOpen] = useState(false)
  const [splitColumnsEnabled, setSplitColumnsEnabled] = useLocalStorage(`datatable-split-columns-${effectiveTableId}`, false)
  const [splitColumnsConfig, setSplitColumnsConfig] = useLocalStorage(
    `datatable-split-columns-config-${effectiveTableId}`,
    { rightColumnIds: [] }
  )
  const [isSplitColumnsDialogOpen, setIsSplitColumnsDialogOpen] = useState(false)
  const [draftTableStyle, setDraftTableStyle] = useState({})

  const persistSelection = useCallback((nextSet) => {
    setSelectedRowKeys(nextSet)
    setStoredSelection(Array.from(nextSet))
  }, [setStoredSelection])

  const clearSelection = useCallback(() => {
    persistSelection(new Set())
  }, [persistSelection])

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
    const serialWidth = serialColumnRender ? Math.max(76, serialDigits * 12 + 54) : Math.max(56, serialDigits * 12 + 24)

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
      render: serialColumnRender || ((row) => row.__serial),
    }

    return [selectColumn, serialColumn, ...columns]
  }, [columns, data, serialColumnRender])

  const advancedFilters = useAdvancedFilters(effectiveTableId, processedColumns)
  const exportState = useExport()
  const { orderedColumns: userOrderedColumns, reorderColumn, resetColumnOrder } = useColumnOrder(processedColumns, effectiveTableId)
  const { orderedColumns, toggleColumnPin, resetColumnPinning, isPinned } = useColumnPinning(userOrderedColumns, effectiveTableId)
  const { columnWidths, setColumnWidth, resetAllWidths } = useColumnResize(effectiveTableId)
  const tableFormatRules = useTableFormatRules(
    effectiveTableId,
    EMPTY_FORMAT_ROWS,
    processedColumns,
    undefined,
    formatVisibility,
    {
      realtime: true,
    }
  )

  useEffect(() => {
    const nextTableStyle = tableFormatRules.tableStyle || {}
    setDraftTableStyle((currentStyle) => (
      shallowEqualObjects(currentStyle, nextTableStyle) ? currentStyle : nextTableStyle
    ))
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

  const realtimeStatusMeta = useMemo(() => {
    const status = tableFormatRules.realtimeConnectionStatus

    if (status === 'connected') {
      return { color: 'bg-emerald-500', label: '' }
    }
    if (status === 'connecting' || status === 'idle') {
      return { color: 'bg-amber-500', label: 'جاري الاتصال اللحظي' }
    }
    if (status === 'error') {
      return { color: 'bg-red-500', label: 'فشل الاتصال اللحظي' }
    }
    if (status === 'disconnected') {
      return { color: 'bg-slate-400', label: 'الاتصال اللحظي متوقف' }
    }

    return null
  }, [tableFormatRules.realtimeConnectionStatus])

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

  const dateFilterColumns = useMemo(
    () => detectDateColumns(processedColumns, data),
    [processedColumns, data]
  )

  useEffect(() => {
    if (!dateRangeFilter?.columnId) return
    if (dateFilterColumns.some((column) => column.id === dateRangeFilter.columnId)) return

    setDateRangeFilter({ columnId: '', from: '', to: '' })
  }, [dateFilterColumns, dateRangeFilter?.columnId, setDateRangeFilter])

  const dateFilteredData = useMemo(
    () => applyDateRangeFilter(data, dateRangeFilter, processedColumns),
    [data, dateRangeFilter, processedColumns]
  )

  const hasActiveDateFilter = Boolean(dateRangeFilter?.columnId && (dateRangeFilter?.from || dateRangeFilter?.to))

  // Apply table-level filters before global search/sorting/pagination.
  const filteredData = enableAdvancedFilters && advancedFilters.hasActiveFilters
    ? buildFilterQuery(dateFilteredData, advancedFilters.filters, processedColumns)
    : dateFilteredData

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

  const resetTableToDefault = useCallback(() => {
    const shouldReset = window.confirm('هل تريد إعادة تهيئة الجدول والرجوع للوضع الافتراضي؟')
    if (!shouldReset) return

    clearSelection()
    setShowSelectedOnly(false)
    setBulkRowStyleAction(null)
    setSelectionContextMenu(null)
    setFormatVisibility('personal')
    setDateRangeFilter({ columnId: '', from: '', to: '' })
    setTableZoom(100)
    setSplitRowsEnabled(false)
    setSplitRowsConfig({ primaryColumnIds: [] })
    setDraftTableStyle({})
    advancedFilters.clearFilters()
    table.clearSort?.()
    table.setGlobalFilter?.('')
    table.setPageIndex?.(0)
    table.resetColumnVisibility?.()
    resetColumnOrder()
    resetColumnPinning()
    resetAllWidths(autoContentWidthsRef.current || {})
    tableFormatRules.resetAllFormatRules({ visibilities: ['personal', 'shared'] })
  }, [
    advancedFilters,
    clearSelection,
    resetAllWidths,
    resetColumnOrder,
    resetColumnPinning,
    setDateRangeFilter,
    setFormatVisibility,
    setSplitRowsConfig,
    setSplitRowsEnabled,
    setTableZoom,
    table,
    tableFormatRules,
  ])

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
    autoContentWidthsRef.current = autoContentWidths
  }, [autoContentWidths])

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
    const closeSelectionContextMenu = () => setSelectionContextMenu(null)
    document.addEventListener('click', closeSelectionContextMenu)
    return () => document.removeEventListener('click', closeSelectionContextMenu)
  }, [])

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
        const resizeMinimumWidth =
          col.id === '__select' || col.id === '__serial'
            ? configuredWidth || 44
            : 72
        const naturalMinimumWidth =
          col.id === '__select' || col.id === '__serial'
            ? configuredWidth || autoWidth || 60
            : Math.max(configuredWidth, autoWidth, 96)

        return {
          ...col,
          _minimumWidth: naturalMinimumWidth,
          _resizeMinimumWidth: resizeMinimumWidth,
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
      const resizeMinimumWidth = Number(col._resizeMinimumWidth) || 60
      const resolvedWidth = Math.max(resizeMinimumWidth, Number(col._preferredWidth) || Number(col._minimumWidth) || 160)
      return {
        ...col,
        _excelLabel: col.id === '__select' ? '' : toExcelColumnLabel(excelIndex++),
        _resolvedWidth: resolvedWidth,
      }
    })
  }, [preferredColumns])

  const stickyColumns = useMemo(() => {
    let stickyOffset = 0

    return renderedColumns.map((col) => {
      const pinned = Boolean(isPinned(col.id))
      const nextColumn = {
        ...col,
        _isPinned: pinned,
        _stickyOffset: pinned ? stickyOffset : null,
      }

      if (pinned) {
        stickyOffset += Number(col._resolvedWidth) || 0
      }

      return nextColumn
    })
  }, [renderedColumns, isPinned])

  const splitRowsLayout = useMemo(
    () => buildSplitRowsLayout(stickyColumns, splitRowsConfig),
    [stickyColumns, splitRowsConfig]
  )

  const splitColumnsLayout = useMemo(
    () => buildSplitColumnsLayout(stickyColumns, splitColumnsConfig),
    [stickyColumns, splitColumnsConfig]
  )

  const shouldRenderSplitColumns = Boolean(
    splitColumnsEnabled &&
    splitColumnsLayout.rightColumns.length > 0 &&
    splitColumnsLayout.leftColumns.length > 0
  )

  const shouldRenderSplitRows = Boolean(
    splitRowsEnabled &&
    !shouldRenderSplitColumns &&
    splitRowsLayout.secondaryColumns.length > 0
  )

  const tableRenderColumns = useMemo(() => {
    if (!shouldRenderSplitRows) return stickyColumns

    return [
      ...splitRowsLayout.fixedColumns,
      ...splitRowsLayout.slots.map((slot, index) => {
        const primaryColumn = slot.primaryColumn
        const secondaryColumn = slot.secondaryColumn
        const baseColumn = primaryColumn || secondaryColumn
        const resolvedWidth = Math.max(
          96,
          Number(primaryColumn?._resolvedWidth) || 0,
          Number(secondaryColumn?._resolvedWidth) || 0
        )

        return {
          ...baseColumn,
          id: primaryColumn?.id || `__split_slot_${secondaryColumn?.id || index}`,
          header: primaryColumn?.header || secondaryColumn?.header,
          accessor: primaryColumn?.accessor || secondaryColumn?.accessor,
          sortable: Boolean(primaryColumn?.sortable || (!primaryColumn && secondaryColumn?.sortable)),
          _excelLabel: primaryColumn?._excelLabel || secondaryColumn?._excelLabel || '',
          _resolvedWidth: resolvedWidth,
          _minimumWidth: Math.max(
            96,
            Number(primaryColumn?._minimumWidth) || 0,
            Number(secondaryColumn?._minimumWidth) || 0
          ),
          _preferredWidth: resolvedWidth,
          _isPinned: false,
          _stickyOffset: null,
        }
      }),
    ]
  }, [shouldRenderSplitRows, splitRowsLayout, stickyColumns])

  const resolvedTableWidth = useMemo(() => {
    const sum = tableRenderColumns.reduce((acc, col) => acc + (col._resolvedWidth || 0), 0)
    return Math.max(sum, containerWidth || 0)
  }, [tableRenderColumns, containerWidth])

  const rightSplitColumns = useMemo(() => (
    normalizeSplitColumnsForTable([
      ...splitColumnsLayout.fixedColumns,
      ...splitColumnsLayout.rightColumns,
    ])
  ), [splitColumnsLayout])

  const leftSplitColumns = useMemo(() => (
    normalizeSplitColumnsForTable(splitColumnsLayout.leftColumns)
  ), [splitColumnsLayout])

  const rightSplitTableWidth = useMemo(() => {
    const sum = rightSplitColumns.reduce((acc, col) => acc + (col._resolvedWidth || 0), 0)
    return Math.max(sum, 360)
  }, [rightSplitColumns])

  const leftSplitTableWidth = useMemo(() => {
    const sum = leftSplitColumns.reduce((acc, col) => acc + (col._resolvedWidth || 0), 0)
    return Math.max(sum, 360)
  }, [leftSplitColumns])

  const syncSplitColumnRowHeights = useCallback(() => {
    const rightRows = Array.from(rightSplitTableRef.current?.querySelectorAll('tbody > tr') || [])
    const leftRows = Array.from(leftSplitTableRef.current?.querySelectorAll('tbody > tr') || [])
    const rowCount = Math.min(rightRows.length, leftRows.length)

    rightRows.forEach((row) => {
      row.style.height = ''
      row.style.minHeight = ''
    })
    leftRows.forEach((row) => {
      row.style.height = ''
      row.style.minHeight = ''
    })

    for (let index = 0; index < rowCount; index += 1) {
      const rightRow = rightRows[index]
      const leftRow = leftRows[index]
      const maxHeight = Math.ceil(Math.max(
        rightRow.getBoundingClientRect().height,
        leftRow.getBoundingClientRect().height
      ))

      if (maxHeight > 0) {
        rightRow.style.height = `${maxHeight}px`
        leftRow.style.height = `${maxHeight}px`
      }
    }
  }, [])

  const displayRows = useMemo(() => {
    const pageStart = table.pagination.pageIndex * table.pagination.pageSize
    return table.rows.map((row, index) => ({
      ...row,
      __rowKey: getRowKey(row, pageStart + index),
      __serial: pageStart + index + 1,
    }))
  }, [table.rows, table.pagination.pageIndex, table.pagination.pageSize, getRowKey])

  useEffect(() => {
    if (!shouldRenderSplitColumns || typeof window === 'undefined') return undefined

    const rafId = window.requestAnimationFrame(syncSplitColumnRowHeights)
    const observers = []
    const observeTable = (table) => {
      if (!table || typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(() => {
        window.requestAnimationFrame(syncSplitColumnRowHeights)
      })
      observer.observe(table)
      observers.push(observer)
    }

    observeTable(rightSplitTableRef.current)
    observeTable(leftSplitTableRef.current)
    window.addEventListener('resize', syncSplitColumnRowHeights)

    return () => {
      window.cancelAnimationFrame(rafId)
      observers.forEach((observer) => observer.disconnect())
      window.removeEventListener('resize', syncSplitColumnRowHeights)
    }
  }, [
    displayRows,
    leftSplitColumns,
    rightSplitColumns,
    shouldRenderSplitColumns,
    syncSplitColumnRowHeights,
    tableZoom,
  ])

  const compareRows = useMemo(() => {
    return (visibleData || []).map((row, index) => ({
      ...row,
      __rowKey: getRowKey(row, index),
      __serial: index + 1,
    }))
  }, [visibleData, getRowKey])

  const selectedRowsForContext = useMemo(() => {
    return (visibleData || []).filter((row, index) => {
      const key = getRowKey(row, index)
      return selectedRowKeys.has(key)
    })
  }, [getRowKey, selectedRowKeys, visibleData])

  const resolvedSelectionContextActions = useMemo(() => {
    if (!selectionContextActions) return []

    const context = {
      clearSelection,
      selectedCount: selectedRowKeys.size,
      selectedRowKeys,
      selectedRows: selectedRowsForContext,
    }
    const actions = typeof selectionContextActions === 'function'
      ? selectionContextActions(context)
      : selectionContextActions

    return Array.isArray(actions) ? actions.filter(Boolean) : []
  }, [clearSelection, selectedRowKeys, selectedRowsForContext, selectionContextActions])

  const toolbarActionsNode = useMemo(() => {
    if (typeof toolbarActions !== 'function') return toolbarActions

    return toolbarActions({
      clearSelection,
      selectedCount: selectedRowKeys.size,
      selectedRowKeys,
      selectedRows: selectedRowsForContext,
    })
  }, [clearSelection, selectedRowKeys, selectedRowsForContext, toolbarActions])

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

  useEffect(() => {
    if (!isCursorMode || !hasNextPage || isFetchingNextPage || typeof onLoadMore !== 'function') return

    const trigger = loadMoreTriggerRef.current
    if (!trigger) return

    const loadMore = () => {
      if (!hasNextPage || isFetchingNextPage) return
      onLoadMore()
    }

    if (typeof IntersectionObserver === 'undefined') {
      const onScroll = () => {
        const rect = trigger.getBoundingClientRect()
        if (rect.top <= window.innerHeight + 320) {
          loadMore()
        }
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()

      return () => window.removeEventListener('scroll', onScroll)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      { root: null, rootMargin: '320px 0px', threshold: 0 }
    )

    observer.observe(trigger)

    return () => observer.disconnect()
  }, [isCursorMode, hasNextPage, isFetchingNextPage, onLoadMore])

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

  const clearStyleFromSelectedRows = useCallback(() => {
    if (!selectedRowKeys.size) return
    setBulkRowStyleAction({
      id: Date.now(),
      clear: true,
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
      selectAllFiltered(!allFilteredSelected)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [allFilteredSelected, selectAllFiltered])

  // Handle column resize
  const handleStartResize = (e, columnId) => {
    e.preventDefault()
    const startX = e.clientX

    // Find the th element - the resize handle is inside th
    const thElement = e.currentTarget?.closest('th')
    if (!thElement) return

    const column = renderedColumns.find((col) => col.id === columnId)
    const minimumWidth = Number(column?._resizeMinimumWidth) || 60
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
        dateRangeFilter: hasActiveDateFilter ? dateRangeFilter : null,
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

  const handleSaveSplitRowsConfig = useCallback((nextConfig) => {
    setSplitRowsConfig(nextConfig)
    setSplitRowsEnabled(true)
    setIsSplitRowsDialogOpen(false)
  }, [setSplitRowsConfig, setSplitRowsEnabled])

  const handleDisableSplitRows = useCallback(() => {
    setSplitRowsEnabled(false)
    setIsSplitRowsDialogOpen(false)
  }, [setSplitRowsEnabled])

  const handleSaveSplitColumnsConfig = useCallback((nextConfig) => {
    setSplitColumnsConfig(nextConfig)
    setSplitColumnsEnabled(true)
    setIsSplitColumnsDialogOpen(false)
  }, [setSplitColumnsConfig, setSplitColumnsEnabled])

  const handleDisableSplitColumns = useCallback(() => {
    setSplitColumnsEnabled(false)
    setIsSplitColumnsDialogOpen(false)
  }, [setSplitColumnsEnabled])

  const getSafeSelectionMenuPosition = (x, y) => {
    if (typeof window === 'undefined') return { x, y }

    const menuWidth = 240
    const menuHeight = 180
    const margin = 8

    return {
      x: Math.max(margin, Math.min(x, window.innerWidth - menuWidth - margin)),
      y: Math.max(margin, Math.min(y, window.innerHeight - menuHeight - margin)),
    }
  }

  const openSelectionContextMenu = (event) => {
    if (!selectedRowKeys.size || resolvedSelectionContextActions.length === 0) return

    event.preventDefault()
    event.stopPropagation()

    const position = getSafeSelectionMenuPosition(event.clientX, event.clientY)
    setSelectionContextMenu(position)
  }

  const runSelectionContextAction = async (action) => {
    if (action.disabled) return

    await action.onClick?.({
      clearSelection,
      selectedCount: selectedRowKeys.size,
      selectedRowKeys,
      selectedRows: selectedRowsForContext,
    })
    setSelectionContextMenu(null)
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

  return (
    <div className="min-w-0 space-y-4">
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
          {toolbarActionsNode && (
            <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2">
              {toolbarActionsNode}
            </div>
          )}

          <DataTableToolbar
            columns={userOrderedColumns}
            tableId={effectiveTableId}
            globalFilter={table.globalFilter}
            onGlobalFilterChange={table.setGlobalFilter}
            columnVisibility={table.columnVisibility}
            onColumnToggle={table.toggleColumnVisibility}
            onColumnReorder={reorderColumn}
            showGlobalSearch={enableGlobalSearch}
            showColumnVisibility={enableColumnVisibility && !hasSelectedRows}
          >
            <DateRangeFilter
              dateColumns={dateFilterColumns}
              value={dateRangeFilter}
              onChange={setDateRangeFilter}
            />

            {!hasSelectedRows && (
              <DataTableZoomControl value={tableZoom} onChange={setTableZoom} />
            )}

            {!hasSelectedRows && (
              <DataTableRowSplitToggle
                enabled={Boolean(splitRowsEnabled)}
                onToggle={setSplitRowsEnabled}
                onConfigure={() => setIsSplitRowsDialogOpen(true)}
              />
            )}

            {!hasSelectedRows && (
              <DataTableColumnSplitToggle
                enabled={Boolean(splitColumnsEnabled)}
                onConfigure={() => setIsSplitColumnsDialogOpen(true)}
              />
            )}

            {!hasSelectedRows && (
              <TableStyleCustomizer
                visibility={formatVisibility}
                style={activeTableStyle}
                onStyleChange={updateActiveTableStyle}
                onSave={saveActiveTableStyle}
                onReset={resetTableToDefault}
                onToggleVisibility={toggleFormatVisibility}
                isSaving={tableFormatRules.isSavingTableStyle}
              />
            )}

            {!hasSelectedRows && <DataTableShortcuts />}

            {realtimeStatusMeta && (
              <div
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text-muted)]"
                title={realtimeStatusMeta.label}
              >
                <span className={`h-2 w-2 rounded-full ${realtimeStatusMeta.color}`} />
                <span className="hidden xl:inline">{realtimeStatusMeta.label}</span>
              </div>
            )}

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
              <div className="flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1">
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
              <div className="inline-flex items-center gap-1">
                <ExportButton
                  onClick={exportState.openDialog}
                  disabled={table.totalRowCount === 0}
                />
              </div>
            )}
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
          hasFilteredData={advancedFilters.hasActiveFilters || hasActiveDateFilter}
        />
      )}

      <DataTableCompareDialog
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        rows={compareRows}
        columns={renderedColumns}
        selectedRowKeys={selectedRowKeys}
      />

      <DataTableRowSplitDialog
        isOpen={isSplitRowsDialogOpen}
        columns={stickyColumns}
        value={splitRowsConfig}
        enabled={Boolean(splitRowsEnabled)}
        onClose={() => setIsSplitRowsDialogOpen(false)}
        onSave={handleSaveSplitRowsConfig}
        onDisable={handleDisableSplitRows}
      />

      <DataTableColumnSplitDialog
        isOpen={isSplitColumnsDialogOpen}
        columns={stickyColumns}
        value={splitColumnsConfig}
        enabled={Boolean(splitColumnsEnabled)}
        onClose={() => setIsSplitColumnsDialogOpen(false)}
        onSave={handleSaveSplitColumnsConfig}
        onDisable={handleDisableSplitColumns}
      />

      {table.filteredRowCount === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : shouldRenderSplitColumns ? (
        <div
          ref={tableContainerRef}
          className="overflow-x-auto overscroll-x-contain rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2"
          onContextMenu={openSelectionContextMenu}
        >
          <div style={{ zoom: (Number(tableZoom) || 100) / 100 }}>
            <div className="grid min-w-[960px] grid-cols-2 gap-2">
              <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border)] bg-[#E8F9FA] px-3 py-2 text-xs font-black text-[#007A80]">
                  جدول اليمين
                </div>
                <div className="overflow-x-auto">
                  <table
                    ref={(node) => {
                      tableRef.current = node
                      rightSplitTableRef.current = node
                    }}
                    className="table-fixed border-collapse"
                    style={{ width: `${rightSplitTableWidth}px`, minWidth: '100%' }}
                  >
                    <colgroup>
                      {rightSplitColumns.map((col) => (
                        <col
                          key={col.id}
                          style={{ width: `${col._resolvedWidth}px`, minWidth: `${col._resolvedWidth}px` }}
                        />
                      ))}
                    </colgroup>
                    <thead>
                      <DataTableHeader
                        columns={rightSplitColumns}
                        sorting={table.sorting}
                        onSort={table.setSortColumn}
                        onPinColumn={toggleColumnPin}
                        isPinned={isPinned}
                        onColumnReorder={reorderColumn}
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
                          columns={rightSplitColumns}
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
                      columns={rightSplitColumns}
                      tableId={effectiveTableId}
                      pageStart={table.pagination.pageIndex * table.pagination.pageSize}
                      selectedRowKeys={selectedRowKeys}
                      onToggleRowSelection={toggleRowSelection}
                      tableTypography={tableTypography}
                      tableStyle={activeTableStyle}
                      formatVisibility={formatVisibility}
                      formatRules={tableFormatRules}
                      bulkRowStyleAction={bulkRowStyleAction}
                      disableFormatContextMenuWhenSelection={resolvedSelectionContextActions.length > 0}
                      onRowClick={onRowClick}
                      onRowDoubleClick={onRowDoubleClick}
                      rowClassName={rowClassName}
                    />
                  </table>
                </div>
              </section>

              <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border)] bg-white px-3 py-2 text-xs font-black text-[var(--text)]">
                  جدول اليسار
                </div>
                <div className="overflow-x-auto">
                  <table
                    ref={leftSplitTableRef}
                    className="table-fixed border-collapse"
                    style={{ width: `${leftSplitTableWidth}px`, minWidth: '100%' }}
                  >
                    <colgroup>
                      {leftSplitColumns.map((col) => (
                        <col
                          key={col.id}
                          style={{ width: `${col._resolvedWidth}px`, minWidth: `${col._resolvedWidth}px` }}
                        />
                      ))}
                    </colgroup>
                    <thead>
                      <DataTableHeader
                        columns={leftSplitColumns}
                        sorting={table.sorting}
                        onSort={table.setSortColumn}
                        onPinColumn={toggleColumnPin}
                        isPinned={isPinned}
                        onColumnReorder={reorderColumn}
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
                          columns={leftSplitColumns}
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
                      columns={leftSplitColumns}
                      tableId={effectiveTableId}
                      pageStart={table.pagination.pageIndex * table.pagination.pageSize}
                      selectedRowKeys={selectedRowKeys}
                      onToggleRowSelection={toggleRowSelection}
                      tableTypography={tableTypography}
                      tableStyle={activeTableStyle}
                      formatVisibility={formatVisibility}
                      formatRules={tableFormatRules}
                      bulkRowStyleAction={bulkRowStyleAction}
                      disableFormatContextMenuWhenSelection={resolvedSelectionContextActions.length > 0}
                      onRowClick={onRowClick}
                      onRowDoubleClick={onRowDoubleClick}
                      rowClassName={rowClassName}
                    />
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={tableContainerRef}
            className="overflow-x-auto overscroll-x-contain rounded-lg border border-[var(--border)]"
            onContextMenu={openSelectionContextMenu}
          >
            <div style={{ zoom: (Number(tableZoom) || 100) / 100 }}>
              <table
                ref={tableRef}
                className="table-fixed border-collapse"
                style={{ width: `${resolvedTableWidth}px`, minWidth: '100%' }}
              >
                <colgroup>
                  {tableRenderColumns.map((col) => (
                    <col
                      key={col.id}
                      style={{ width: `${col._resolvedWidth}px`, minWidth: `${col._resolvedWidth}px` }}
                    />
                  ))}
                </colgroup>
                <thead>
                  <DataTableHeader
                    columns={tableRenderColumns}
                    sorting={table.sorting}
                    onSort={table.setSortColumn}
                    onPinColumn={toggleColumnPin}
                    isPinned={isPinned}
                    onColumnReorder={reorderColumn}
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
                      columns={tableRenderColumns}
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
                  columns={tableRenderColumns}
                  tableId={effectiveTableId}
                  pageStart={table.pagination.pageIndex * table.pagination.pageSize}
                  selectedRowKeys={selectedRowKeys}
                  onToggleRowSelection={toggleRowSelection}
                  tableTypography={tableTypography}
                  tableStyle={activeTableStyle}
                  formatVisibility={formatVisibility}
                  formatRules={tableFormatRules}
                  bulkRowStyleAction={bulkRowStyleAction}
                  disableFormatContextMenuWhenSelection={resolvedSelectionContextActions.length > 0}
                  onRowClick={onRowClick}
                  onRowDoubleClick={onRowDoubleClick}
                  rowClassName={rowClassName}
                  splitRowsEnabled={shouldRenderSplitRows}
                  splitRowsConfig={splitRowsConfig}
                  splitRowsLayout={splitRowsLayout}
                />
              </table>
            </div>
          </div>
        </>
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

      {showFooter && isCursorMode && (
        <div ref={loadMoreTriggerRef} className="flex min-h-12 items-center justify-center py-3">
          {isFetchingNextPage && (
            <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-muted)]">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#00C2CB] border-t-transparent" />
              جاري تحميل المزيد...
            </div>
          )}
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

      {selectionContextMenu && resolvedSelectionContextActions.length > 0 && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[120] w-72 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl"
          style={{ left: selectionContextMenu.x, top: selectionContextMenu.y }}
          onClick={(event) => event.stopPropagation()}
          role="menu"
        >
          <div className="mb-2 flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="text-xs font-medium text-[var(--text)]">المحدد: {selectedRowKeys.size}</span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              إلغاء التحديد
            </button>
          </div>

          <div className="space-y-1 border-b border-[var(--border)] pb-2">
            {resolvedSelectionContextActions.map((action) => {
              const Icon = action.icon
              const isDanger = action.variant === 'danger'

              return (
                <button
                  key={action.id || action.label}
                  type="button"
                  disabled={action.disabled}
                  onClick={() => runSelectionContextAction(action)}
                  className={`flex h-9 w-full items-center gap-2 rounded-lg px-3 text-start text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isDanger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
                  }`}
                  role="menuitem"
                >
                  {Icon && <Icon size={15} />}
                  <span>{action.label}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 space-y-3">
            <div className="text-xs font-medium text-[var(--text)]">تخصيص الصفوف المحددة</div>

            <div className="space-y-1">
              <div className="text-[11px] text-[var(--text-muted)]">لون الصف</div>
              <div className="flex flex-wrap gap-1.5">
                {SELECTION_BG_COLORS.map((color) => (
                  <button
                    key={`selection-bg-${color}`}
                    type="button"
                    className="h-6 w-6 rounded-md border border-[var(--border)]"
                    style={{ backgroundColor: color }}
                    onClick={() => applyStyleToSelectedRows({ bgColor: color })}
                    title={`لون الصف ${color}`}
                    aria-label={`لون الصف ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-[var(--text-muted)]">لون الخط</div>
              <div className="flex flex-wrap gap-1.5">
                {SELECTION_TEXT_COLORS.map((color) => (
                  <button
                    key={`selection-text-${color}`}
                    type="button"
                    className="h-6 w-6 rounded-md border border-[var(--border)]"
                    style={{ backgroundColor: color }}
                    onClick={() => applyStyleToSelectedRows({ textColor: color })}
                    title={`لون الخط ${color}`}
                    aria-label={`لون الخط ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="block text-[11px] text-[var(--text-muted)]">حجم الخط</span>
                <select
                  className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)]"
                  defaultValue=""
                  onChange={(event) => {
                    if (!event.target.value) return
                    applyStyleToSelectedRows({ fontSize: event.target.value })
                    event.target.value = ''
                  }}
                >
                  <option value="">اختيار</option>
                  {SELECTION_FONT_SIZES.map((size) => (
                    <option key={size} value={size}>{size.replace('px', '')}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="block text-[11px] text-[var(--text-muted)]">غلاظة الخط</span>
                <select
                  className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)]"
                  defaultValue=""
                  onChange={(event) => {
                    if (!event.target.value) return
                    applyStyleToSelectedRows({ fontWeight: event.target.value })
                    event.target.value = ''
                  }}
                >
                  <option value="">اختيار</option>
                  {SELECTION_FONT_WEIGHTS.map((weight) => (
                    <option key={weight.value} value={weight.value}>{weight.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="block text-[11px] text-[var(--text-muted)]">نوع الخط</span>
              <select
                className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)]"
                defaultValue=""
                onChange={(event) => {
                  applyStyleToSelectedRows({ fontFamily: event.target.value })
                  event.target.value = ''
                }}
              >
                <option value="">اختيار</option>
                {SELECTION_FONT_FAMILIES.map((font) => (
                  <option key={font.label} value={font.value}>{font.label}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              onClick={clearStyleFromSelectedRows}
            >
              مسح تخصيص الصفوف المحددة
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
