import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import { buildStylesFromFormatRules } from './utils/tableFormatRules'
import { copyCellToClipboard } from './utils/clipboardHelpers'
import { buildSplitRowsLayout } from './utils/splitRowsLayout'
import { useTranslation } from 'react-i18next'

const BG_COLORS = ['#FFFFFF', '#FEF3C7', '#DBEAFE', '#DCFCE7', '#FCE7F3', '#F3F4F6', '#E2E8F0']
const TEXT_COLORS = ['#0F172A', '#1D4ED8', '#047857', '#B45309', '#BE185D', '#374151', '#7C3AED']
const FONT_SIZES = [12, 13, 14, 16, 18]
const FONT_FAMILIES = [
  { label: 'Default', value: 'inherit' },
  { label: 'Cairo', value: 'Cairo, sans-serif' },
  { label: 'Tajawal', value: 'Tajawal, sans-serif' },
  { label: 'Monospace', value: "'Courier New', monospace" },
]

const noop = () => {}

const THEME_BACKGROUND_COLORS = new Map([
  ['#fff', 'var(--surface)'],
  ['#ffffff', 'var(--surface)'],
  ['white', 'var(--surface)'],
  ['#f8fafc', 'var(--surface-2)'],
  ['#f9fafb', 'var(--surface-2)'],
  ['#f3f4f6', 'var(--surface-2)'],
  ['#e2e8f0', 'var(--surface-2)'],
])

const THEME_TEXT_COLORS = new Map([
  ['#0f172a', 'var(--text)'],
  ['#111827', 'var(--text)'],
])

function resolveThemeBackground(color, fallback) {
  if (!color) return fallback
  return THEME_BACKGROUND_COLORS.get(String(color).trim().toLowerCase()) || color
}

function resolveThemeText(color) {
  if (!color) return undefined
  return THEME_TEXT_COLORS.get(String(color).trim().toLowerCase()) || color
}

function getFormatRowKey(row, index) {
  if (row?.__rowKey !== undefined && row?.__rowKey !== null) return String(row.__rowKey)
  if (row?.id !== undefined && row?.id !== null) return String(row.id)
  if (row?._id !== undefined && row?._id !== null) return String(row._id)
  if (row?.uuid !== undefined && row?.uuid !== null) return String(row.uuid)
  return `row-${index}`
}

function isInteractiveElement(element) {
  return Boolean(
    element?.closest?.(
      'button, a, input, textarea, select, label, summary, [role="button"], [data-no-cell-copy="true"]'
    )
  )
}

export function DataTableBody({
  rows,
  columns,
  tableId,
  pageStart = 0,
  selectedRowKeys,
  onToggleRowSelection,
  tableTypography,
  tableStyle = {},
  formatVisibility = 'personal',
  formatRules = null,
  bulkRowStyleAction,
  disableFormatContextMenuWhenSelection = false,
  onRowClick,
  onRowDoubleClick,
  rowClassName,
  rowContextActions = null,
  splitRowsEnabled = false,
  splitRowsConfig = null,
  splitRowsLayout = null,
}) {
  const { t } = useTranslation()
  const [contextMenu, setContextMenu] = useState(null)
  const [rowContextMenu, setRowContextMenu] = useState(null)
  const lastBulkActionIdRef = useRef(null)
  const [copiedCellKey, setCopiedCellKey] = useState(null)
  const copyTimeoutRef = useRef(null)
  const remoteFormatRules = useMemo(() => {
    const styles = buildStylesFromFormatRules(
      formatRules?.visibleRules || [],
      rows,
      columns,
      getFormatRowKey
    )

    return {
      ...styles,
      saveFormatRule: formatRules?.saveFormatRule || noop,
      deleteFormatRule: formatRules?.deleteFormatRule || noop,
    }
  }, [columns, formatRules?.deleteFormatRule, formatRules?.saveFormatRule, formatRules?.visibleRules, rows])

  const getStickyCellStyle = (col, backgroundColor) => {
    if (!col._isPinned) return {}

    return {
      position: 'sticky',
      insetInlineStart: `${Number(col._stickyOffset) || 0}px`,
      zIndex: 10,
      backgroundColor: resolveThemeBackground(backgroundColor, 'var(--surface)'),
      boxShadow: '1px 0 0 var(--border)',
    }
  }

  const findRowByKey = (rowKey) => {
    return rows.find((row, index) => {
      const currentKey = row.__rowKey || String(row.id || index)
      return currentKey === rowKey
    })
  }

  useEffect(() => {
    const closeMenu = () => {
      setContextMenu(null)
      setRowContextMenu(null)
    }
    document.addEventListener('click', closeMenu)
    return () => document.removeEventListener('click', closeMenu)
  }, [])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!bulkRowStyleAction || !selectedRowKeys?.size) return
    if (lastBulkActionIdRef.current === bulkRowStyleAction.id) return

    lastBulkActionIdRef.current = bulkRowStyleAction.id

    selectedRowKeys.forEach((rowKey) => {
      const row = findRowByKey(rowKey)
      if (!row) return

      if (bulkRowStyleAction.clear) {
        remoteFormatRules.deleteFormatRule({
          scope: 'row',
          row,
        })
        return
      }

      const nextStyle = {
        ...(remoteFormatRules.rowStyles[rowKey] || {}),
        ...bulkRowStyleAction.patch,
      }
      remoteFormatRules.saveFormatRule({
        scope: 'row',
        row,
        style: nextStyle,
      })
    })
  }, [bulkRowStyleAction, selectedRowKeys, remoteFormatRules])

  const handleCellClick = async (event, value, rowKey, colId) => {
    if (isInteractiveElement(event.target)) return

    event.stopPropagation()

    if (event.detail === 1) {
      const cellKey = `${rowKey}::${colId}`
      const success = await copyCellToClipboard(value)
      if (success) {
        setCopiedCellKey(cellKey)
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current)
        }
        copyTimeoutRef.current = setTimeout(() => {
          setCopiedCellKey(null)
        }, 1500)
      }
    }
  }

  const handleRowClickCapture = (event, rowKey, isSelected) => {
    if (!(event.ctrlKey || event.metaKey)) return
    if (event.button !== 0) return
    if (isInteractiveElement(event.target)) return

    event.preventDefault()
    event.stopPropagation()
    onToggleRowSelection?.(rowKey, !isSelected)
  }

  const handleRowDoubleClick = (event, row) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      event.stopPropagation()
      onRowDoubleClick?.(row, event)
      return
    }

    onRowDoubleClick?.(row, event)
  }

  const getSafeMenuPosition = (x, y) => {
    if (typeof window === 'undefined') return { x, y }

    const menuWidth = 288
    const menuHeight = 420
    const margin = 8

    let safeX = x
    let safeY = y

    if (safeX + menuWidth > window.innerWidth - margin) {
      safeX = window.innerWidth - menuWidth - margin
    }
    if (safeY + menuHeight > window.innerHeight - margin) {
      safeY = window.innerHeight - menuHeight - margin
    }

    safeX = Math.max(margin, safeX)
    safeY = Math.max(margin, safeY)

    return { x: safeX, y: safeY }
  }

  const getSafeRowMenuPosition = (x, y) => {
    if (typeof window === 'undefined') return { x, y }

    const menuWidth = 280
    const menuHeight = 300
    const margin = 8

    return {
      x: Math.max(margin, Math.min(x, window.innerWidth - menuWidth - margin)),
      y: Math.max(margin, Math.min(y, window.innerHeight - menuHeight - margin)),
    }
  }

  const resolveRowContextActions = (row, rowKey) => {
    if (!rowContextActions) return []

    const actions = typeof rowContextActions === 'function'
      ? rowContextActions({ row, rowKey })
      : rowContextActions

    return Array.isArray(actions) ? actions.filter(Boolean) : []
  }

  const openRowContextMenu = (event, row, rowKey, colId) => {
    const actions = resolveRowContextActions(row, rowKey)
    if (!actions.length) return false

    const actionsTabItems = actions.filter((action) => (action.tab || 'actions') === 'actions')
    const formatTabItems = actions.filter((action) => action.tab === 'format')

    event.preventDefault()
    event.stopPropagation()
    const safe = getSafeRowMenuPosition(event.clientX, event.clientY)
    setContextMenu(null)
    setRowContextMenu({
      x: safe.x,
      y: safe.y,
      row,
      rowKey,
      colId,
      actions: actionsTabItems,
      formatActions: formatTabItems,
      activeTab: actionsTabItems.length ? 'actions' : 'format',
      formatScope: 'cell',
    })

    return true
  }

  const runRowContextAction = async (action) => {
    if (action?.disabled) return

    const rowKey = rowContextMenu?.rowKey
    const isSelected = Boolean(rowKey && selectedRowKeys?.has(rowKey))
    const rowHelpers = {
      rowKey,
      isSelected,
      toggleSelection: (checked) => {
        if (!rowKey) return
        if (typeof checked === 'boolean') {
          onToggleRowSelection?.(rowKey, checked)
          return
        }
        onToggleRowSelection?.(rowKey, !isSelected)
      },
    }

    await action?.onClick?.(rowContextMenu?.row, rowHelpers)
    setRowContextMenu(null)
  }

  const applyRowStyle = (rowKey, patch) => {
    const nextStyle = {
      ...(remoteFormatRules.rowStyles[rowKey] || {}),
      ...patch,
    }
    remoteFormatRules.saveFormatRule({
      scope: 'row',
      row: findRowByKey(rowKey),
      style: nextStyle,
    })
  }

  const applyCellStyle = (rowKey, colId, patch) => {
    const key = `${rowKey}::${colId}`
    const nextStyle = {
      ...(remoteFormatRules.cellStyles[key] || {}),
      ...patch,
    }
    remoteFormatRules.saveFormatRule({
      scope: 'cell',
      row: findRowByKey(rowKey),
      columnId: colId,
      style: nextStyle,
    })
  }

  const applyColumnStyle = (colId, patch) => {
    const nextStyle = {
      ...(remoteFormatRules.columnStyles[colId] || {}),
      ...patch,
    }
    remoteFormatRules.saveFormatRule({
      scope: 'column',
      columnId: colId,
      style: nextStyle,
    })
  }

  const applyStyleByScope = (scope, rowKey, colId, patch) => {
    if (scope === 'cell') applyCellStyle(rowKey, colId, patch)
    if (scope === 'row') applyRowStyle(rowKey, patch)
    if (scope === 'column') applyColumnStyle(colId, patch)
  }

  const clearStylesByScope = (scope, rowKey, colId) => {
    if (scope === 'cell') {
      remoteFormatRules.deleteFormatRule({
        scope: 'cell',
        row: findRowByKey(rowKey),
        columnId: colId,
      })
    }

    if (scope === 'row') {
      remoteFormatRules.deleteFormatRule({
        scope: 'row',
        row: findRowByKey(rowKey),
      })
    }

    if (scope === 'column') {
      remoteFormatRules.deleteFormatRule({
        scope: 'column',
        columnId: colId,
      })
    }
  }

  const splitLayout = useMemo(
    () => splitRowsLayout || buildSplitRowsLayout(columns, splitRowsConfig),
    [columns, splitRowsConfig, splitRowsLayout]
  )

  const shouldUseSplitRows = Boolean(splitRowsEnabled && splitLayout.secondaryColumns.length > 0)

  const renderSelectionCell = (col, rowKey, isSelected, rowStyle, rowSpan = 1) => (
    <td
      key={col.id}
      rowSpan={rowSpan}
      className={cn('border-e border-[var(--border)] px-2 py-3 text-center align-middle', col._isPinned && 'sticky')}
      style={getStickyCellStyle(
        col,
        resolveThemeBackground(rowStyle.bgColor || tableStyle.bgColor, isSelected ? 'var(--brand-accent-soft)' : 'var(--surface)')
      )}
    >
      <input
        type="checkbox"
        checked={Boolean(isSelected)}
        onChange={(e) => onToggleRowSelection?.(rowKey, e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded border-slate-300 cursor-pointer"
        title={t('dataTable.selectRow')}
      />
    </td>
  )

  const renderSplitPlaceholderCell = (slotId, rowKey, slot, isSelected, rowStyle, isSubRow = false) => {
    const fallbackBg = isSubRow
      ? (isSelected ? 'var(--brand-accent-soft)' : 'var(--surface-2)')
      : (isSelected ? 'var(--brand-accent-soft)' : 'var(--surface)')

    return (
      <td
        key={`split-empty-${rowKey}-${slot}-${slotId}`}
        className={cn(
          'border-e border-[var(--border)] px-3 py-2.5 align-middle',
          isSubRow ? 'border-t border-[var(--border)] bg-[var(--surface-2)]' : 'bg-[var(--surface)]'
        )}
        style={{
          backgroundColor: resolveThemeBackground(rowStyle.bgColor || tableStyle.bgColor, fallbackBg),
        }}
        aria-hidden="true"
      />
    )
  }

  const renderDataCell = ({
    row,
    col,
    rowKey,
    serialNumber,
    isSelected,
    rowStyle,
    colSpan = 1,
    rowSpan = 1,
    isSubRow = false,
  }) => {
    if (col.id === '__select') {
      return renderSelectionCell(col, rowKey, isSelected, rowStyle, rowSpan)
    }

    const rawValue = col.render ? col.render(row) : getCellValue(row, col.accessor)
    const cellKey = `${rowKey}::${col.id}`
    const cellStyle = remoteFormatRules.cellStyles[cellKey] || {}
    const colStyle = remoteFormatRules.columnStyles[col.id] || {}
    const excelLabel = col._excelLabel || ''
    const hoverHint = `${excelLabel}${serialNumber} - ${col.header}`
    const resolvedTextColor = resolveThemeText(cellStyle.textColor || rowStyle.textColor || colStyle.textColor || tableStyle.textColor)
    const resolvedBgColor = resolveThemeBackground(
      cellStyle.bgColor || rowStyle.bgColor || colStyle.bgColor || tableStyle.bgColor,
      undefined
    )
    const resolvedFontSize =
      cellStyle.fontSize || rowStyle.fontSize || colStyle.fontSize || tableStyle.fontSize || tableTypography?.fontSize || undefined
    const resolvedFontFamily =
      cellStyle.fontFamily || rowStyle.fontFamily || colStyle.fontFamily || tableStyle.fontFamily || tableTypography?.fontFamily || undefined
    const resolvedFontWeight =
      cellStyle.fontWeight || rowStyle.fontWeight || colStyle.fontWeight || tableStyle.fontWeight || tableTypography?.fontWeight || undefined
    const canStickCell = col._isPinned && (!shouldUseSplitRows || ['__select', '__serial'].includes(col.id))
    const stickyBackground = resolvedBgColor || (isSelected ? 'var(--brand-accent-soft)' : 'var(--surface)')
    const fallbackBackground = isSubRow
      ? (isSelected ? 'var(--brand-accent-soft)' : 'var(--surface-2)')
      : 'var(--surface)'
    const contentClassName = cn(
      'dt-cell-content',
      shouldUseSplitRows
        ? 'block min-w-0 flex-1 max-w-none cursor-pointer whitespace-normal break-words transition-colors [&>*]:min-w-0 [&>*]:w-full [&>*]:max-w-none'
        : 'block w-full min-w-0 max-w-full cursor-pointer whitespace-normal break-words transition-colors',
      copiedCellKey === `${rowKey}::${col.id}` && 'bg-green-100'
    )
    const contentNode = (
      <div
        className={contentClassName}
        onClick={(e) => handleCellClick(e, rawValue, rowKey, col.id)}
      >
        {rawValue}
      </div>
    )

    return (
      <td
        key={col.id}
        colSpan={colSpan}
        rowSpan={rowSpan}
        className={cn(
          'border-e border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text)] text-start relative group align-top',
          canStickCell && 'sticky',
          resolvedTextColor && 'dt-text-override',
          shouldUseSplitRows && !['__select', '__serial'].includes(col.id) && 'min-w-0',
          isSubRow && 'border-t border-[var(--border)]'
        )}
        style={{
          ...getStickyCellStyle(canStickCell ? col : { ...col, _isPinned: false }, stickyBackground),
          backgroundColor: resolvedBgColor || (canStickCell ? stickyBackground : fallbackBackground),
          color: resolvedTextColor,
          '--dt-text-color': resolvedTextColor,
          fontSize: resolvedFontSize,
          fontFamily: resolvedFontFamily,
          fontWeight: resolvedFontWeight,
        }}
        onContextMenu={(event) => {
          if (openRowContextMenu(event, row, rowKey, col.id)) {
            return
          }

          if (disableFormatContextMenuWhenSelection && selectedRowKeys?.size > 0) {
            event.preventDefault()
            return
          }

          event.preventDefault()
          const safe = getSafeMenuPosition(event.clientX, event.clientY)
          setContextMenu({
            x: safe.x,
            y: safe.y,
            rowKey,
            colId: col.id,
            scope: 'cell',
          })
        }}
      >
        {shouldUseSplitRows && !['__select', '__serial'].includes(col.id) ? (
          <div className="flex min-w-0 items-start gap-2">
            <div className="mt-0.5 max-w-[34%] shrink-0 whitespace-normal break-words rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] font-black text-[var(--brand-accent)] ring-1 ring-[var(--border)]">
              {col.header}
            </div>
            {contentNode}
          </div>
        ) : (
          contentNode
        )}
        <div className="pointer-events-none absolute top-1 end-2 text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-25 transition-opacity duration-200">
          {hoverHint}
        </div>
      </td>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--text-muted)]">
            {t('dataTable.empty')}
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <>
      <style>{`
        .dt-text-override,
        .dt-text-override * {
          color: var(--dt-text-color) !important;
        }
        .dt-cell-content,
        .dt-cell-content * {
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .dt-cell-content [class*="min-w-["] {
          min-width: 0 !important;
        }
        .dt-cell-content [class*="truncate"] {
          overflow: visible !important;
          text-overflow: clip !important;
          white-space: normal !important;
        }
        .dt-split-record-main > td {
          border-top: 1px solid var(--border);
          background-clip: padding-box;
        }
        .dt-split-record-main > td[rowspan] {
          border-bottom: 3px solid var(--border);
        }
        .dt-split-record-main > td:first-child {
          border-inline-start: 1px solid var(--border);
          border-start-start-radius: 8px;
          border-end-start-radius: 8px;
          box-shadow: inset 3px 0 0 #00AEB8;
        }
        .dt-split-record-main > td:last-child {
          border-inline-end: 1px solid var(--border);
          border-start-end-radius: 8px;
        }
        .dt-split-record-sub > td {
          border-bottom: 3px solid var(--border);
          background-clip: padding-box;
        }
        .dt-split-record-sub > td:last-child {
          border-inline-end: 1px solid var(--border);
          border-end-end-radius: 8px;
        }
      `}</style>
      <tbody className="bg-[var(--surface)] text-[var(--text)]">
      {rows.map((row, rowIndex) => {
          const rowKey = row.__rowKey || String(row.id || rowIndex)
          const isSelected = selectedRowKeys?.has(rowKey)
          const serialNumber = pageStart + rowIndex + 1
          const rowStyle = remoteFormatRules.rowStyles[rowKey] || {}

          if (shouldUseSplitRows) {
            const sharedRowProps = {
              onClickCapture: (event) => handleRowClickCapture(event, rowKey, Boolean(isSelected)),
              onClick: () => onRowClick?.(row),
              onDoubleClick: (event) => handleRowDoubleClick(event, row),
            }

            return (
              <Fragment key={rowKey}>
                <tr
                  key={`${rowKey}-main`}
                  className={cn(
                    'dt-split-record-main border-b-0 bg-[var(--surface)] text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]',
                    isSelected && 'bg-[var(--brand-accent-soft)]',
                    (onRowClick || onRowDoubleClick) && 'cursor-pointer',
                    rowClassName?.(row)
                  )}
                  style={{
                    backgroundColor: resolveThemeBackground(
                      rowStyle.bgColor || tableStyle.bgColor,
                      isSelected ? 'var(--brand-accent-soft)' : 'var(--surface)'
                    ),
                  }}
                  {...sharedRowProps}
                >
                  {splitLayout.fixedColumns.map((col) => renderDataCell({
                    row,
                    col,
                    rowKey,
                    serialNumber,
                    isSelected,
                    rowStyle,
                    rowSpan: 2,
                  }))}
                  {splitLayout.slots.map((slot) => (
                    slot.primaryColumn
                      ? renderDataCell({
                        row,
                        col: slot.primaryColumn,
                        rowKey,
                        serialNumber,
                        isSelected,
                        rowStyle,
                      })
                      : renderSplitPlaceholderCell(slot.id, rowKey, 'main', isSelected, rowStyle)
                  ))}
                </tr>
                <tr
                  key={`${rowKey}-sub`}
                  className={cn(
                    'dt-split-record-sub bg-[var(--surface-2)] text-[var(--text)] transition-colors hover:bg-[var(--surface)]',
                    isSelected && 'bg-[var(--brand-accent-soft)]',
                    (onRowClick || onRowDoubleClick) && 'cursor-pointer',
                    rowClassName?.(row)
                  )}
                  style={{
                    backgroundColor: resolveThemeBackground(
                      rowStyle.bgColor || tableStyle.bgColor,
                      isSelected ? 'var(--brand-accent-soft)' : 'var(--surface-2)'
                    ),
                  }}
                  {...sharedRowProps}
                >
                  {splitLayout.slots.map((slot) => (
                    slot.secondaryColumn
                      ? renderDataCell({
                        row,
                        col: slot.secondaryColumn,
                        rowKey,
                        serialNumber,
                        isSelected,
                        rowStyle,
                        isSubRow: true,
                      })
                      : renderSplitPlaceholderCell(slot.id, rowKey, 'sub', isSelected, rowStyle, true)
                  ))}
                </tr>
              </Fragment>
            )
          }

          return (
            <tr
              key={rowKey}
              className={cn(
                'border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors',
                isSelected && 'bg-[var(--brand-accent-soft)]',
                (onRowClick || onRowDoubleClick) && 'cursor-pointer',
                rowClassName?.(row)
              )}
              style={{
                backgroundColor: resolveThemeBackground(
                  rowStyle.bgColor || tableStyle.bgColor,
                  isSelected ? 'var(--brand-accent-soft)' : 'var(--surface)'
                ),
              }}
              onClickCapture={(event) => handleRowClickCapture(event, rowKey, Boolean(isSelected))}
              onClick={() => onRowClick?.(row)}
              onDoubleClick={(event) => handleRowDoubleClick(event, row)}
            >
          {columns.map((col) => {
            if (col.id === '__select') {
              return (
                <td
                  key={col.id}
                  className={cn('border-e border-[var(--border)] px-2 py-3 text-center', col._isPinned && 'sticky')}
                  style={getStickyCellStyle(
                    col,
                    resolveThemeBackground(
                      rowStyle.bgColor || tableStyle.bgColor,
                      isSelected ? 'var(--brand-accent-soft)' : 'var(--surface)'
                    )
                  )}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(isSelected)}
                    onChange={(e) => onToggleRowSelection?.(rowKey, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                    title={t('dataTable.selectCustomer')}
                  />
                </td>
              )
            }

            const rawValue = col.render ? col.render(row) : getCellValue(row, col.accessor)
            const cellKey = `${rowKey}::${col.id}`
            const cellStyle = remoteFormatRules.cellStyles[cellKey] || {}
            const colStyle = remoteFormatRules.columnStyles[col.id] || {}
            const excelLabel = col._excelLabel || ''
            const hoverHint = `${excelLabel}${serialNumber} - ${col.header}`
            const resolvedTextColor = resolveThemeText(cellStyle.textColor || rowStyle.textColor || colStyle.textColor || tableStyle.textColor)
            const resolvedBgColor = resolveThemeBackground(
              cellStyle.bgColor || rowStyle.bgColor || colStyle.bgColor || tableStyle.bgColor,
              undefined
            )
            const resolvedFontSize =
              cellStyle.fontSize || rowStyle.fontSize || colStyle.fontSize || tableStyle.fontSize || tableTypography?.fontSize || undefined
            const resolvedFontFamily =
              cellStyle.fontFamily || rowStyle.fontFamily || colStyle.fontFamily || tableStyle.fontFamily || tableTypography?.fontFamily || undefined
            const resolvedFontWeight =
              cellStyle.fontWeight || rowStyle.fontWeight || colStyle.fontWeight || tableStyle.fontWeight || tableTypography?.fontWeight || undefined

            const stickyBackground = resolvedBgColor || (isSelected ? 'var(--brand-accent-soft)' : 'var(--surface)')

            return (
              <td
                key={col.id}
                className={cn(
                  'border-e border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text)] text-start relative group',
                  col._isPinned && 'sticky',
                  resolvedTextColor && 'dt-text-override'
                )}
                style={{
                  ...getStickyCellStyle(col, stickyBackground),
                  backgroundColor: resolvedBgColor || (col._isPinned ? stickyBackground : undefined),
                  color: resolvedTextColor,
                  '--dt-text-color': resolvedTextColor,
                  fontSize: resolvedFontSize,
                  fontFamily: resolvedFontFamily,
                  fontWeight: resolvedFontWeight,
                }}
                onContextMenu={(event) => {
                  if (openRowContextMenu(event, row, rowKey, col.id)) {
                    return
                  }

                  if (disableFormatContextMenuWhenSelection && selectedRowKeys?.size > 0) {
                    event.preventDefault()
                    return
                  }

                  event.preventDefault()
                  const safe = getSafeMenuPosition(event.clientX, event.clientY)
                  setContextMenu({
                    x: safe.x,
                    y: safe.y,
                    rowKey,
                    colId: col.id,
                    scope: 'cell',
                  })
                }}
              >
                {col.render ? (
                  <div
                    className={cn(
                      'dt-cell-content block w-full min-w-0 max-w-full cursor-pointer whitespace-normal break-words transition-colors',
                      copiedCellKey === `${rowKey}::${col.id}` && 'bg-green-100'
                    )}
                    onClick={(e) => handleCellClick(e, rawValue, rowKey, col.id)}
                  >
                    {rawValue}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'dt-cell-content block w-full min-w-0 max-w-full cursor-pointer whitespace-normal break-words transition-colors',
                      copiedCellKey === `${rowKey}::${col.id}` && 'bg-green-100'
                    )}
                    onClick={(e) => handleCellClick(e, rawValue, rowKey, col.id)}
                  >
                    {rawValue}
                  </div>
                )}
                <div className="pointer-events-none absolute top-1 end-2 text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-25 transition-opacity duration-200">
                  {hoverHint}
                </div>
              </td>
            )
          })}
            </tr>
          )
      })}
      </tbody>

      {contextMenu && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[100] max-h-[min(520px,calc(100vh-1rem))] w-72 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--text)] shadow-2xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs font-medium text-[var(--text-muted)]">{t('dataTable.customizeScope')}</div>

          <div className="flex gap-1 rounded-lg bg-[var(--surface-2)] p-1">
            {['cell', 'row', 'column'].map((scope) => (
              <button
                key={scope}
                type="button"
                className={cn(
                  'flex-1 text-xs px-2 py-1 rounded',
                  contextMenu.scope === scope ? 'bg-[var(--surface)] text-[var(--text)] shadow' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
                onClick={() => setContextMenu((prev) => ({ ...prev, scope }))}
              >
                {t(`dataTable.${scope}`)}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)]">{t('dataTable.background')}</div>
            <div className="flex flex-wrap gap-1">
              {BG_COLORS.map((color) => (
                <button
                  key={`cell-bg-${color}`}
                  type="button"
                  className="w-5 h-5 rounded border border-slate-300"
                  style={{ backgroundColor: color }}
                  onClick={() => applyStyleByScope(contextMenu.scope, contextMenu.rowKey, contextMenu.colId, { bgColor: color })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)]">{t('dataTable.textColor')}</div>
            <div className="flex flex-wrap gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={`cell-text-${color}`}
                  type="button"
                  className="w-5 h-5 rounded border border-slate-300"
                  style={{ backgroundColor: color }}
                  onClick={() => applyStyleByScope(contextMenu.scope, contextMenu.rowKey, contextMenu.colId, { textColor: color })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)]">{t('dataTable.fontSize')}</div>
            <div className="flex flex-wrap gap-1">
              {FONT_SIZES.map((size) => (
                <button
                  key={`font-size-${size}`}
                  type="button"
                  className="px-2 py-1 rounded border border-slate-300 text-[11px]"
                  onClick={() => applyStyleByScope(contextMenu.scope, contextMenu.rowKey, contextMenu.colId, { fontSize: `${size}px` })}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)]">{t('dataTable.fontFamily')}</div>
            <select
              className="h-8 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)]"
              onChange={(e) => applyStyleByScope(contextMenu.scope, contextMenu.rowKey, contextMenu.colId, { fontFamily: e.target.value || undefined })}
              value=""
            >
              <option value="">{t('dataTable.choose')}</option>
              {FONT_FAMILIES.map((font) => (
                <option key={font.label} value={font.value}>{font.label === 'Default' ? t('dataTable.defaultFont') : font.label === 'Monospace' ? t('dataTable.monospace') : font.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-muted)]">{t('dataTable.fontWeight')}</div>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'N', value: '400' },
                { label: 'M', value: '500' },
                { label: 'S', value: '600' },
                { label: 'B', value: '700' },
              ].map((weight) => (
                <button
                  key={`font-weight-${weight.value}`}
                  type="button"
                  className="px-2 py-1 rounded border border-slate-300 text-[11px]"
                  onClick={() => applyStyleByScope(contextMenu.scope, contextMenu.rowKey, contextMenu.colId, { fontWeight: weight.value })}
                >
                  {weight.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-red-600 hover:text-red-700"
              onClick={() => clearStylesByScope(contextMenu.scope, contextMenu.rowKey, contextMenu.colId)}
            >
              {t('dataTable.clearScopeStyle')}
            </button>
          </div>
        </div>,
        document.body
      )}

      {rowContextMenu && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[110] max-h-[min(520px,calc(100vh-1rem))] w-72 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text)] shadow-2xl"
          style={{ left: rowContextMenu.x, top: rowContextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 flex gap-1 rounded-lg bg-[var(--surface-2)] p-1">
            <button
              type="button"
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-xs font-black transition-colors',
                rowContextMenu.activeTab === 'actions'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
              onClick={() => setRowContextMenu((prev) => ({ ...prev, activeTab: 'actions' }))}
            >
              {t('dataTable.actions')}
            </button>
            <button
              type="button"
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-xs font-black transition-colors',
                rowContextMenu.activeTab === 'format'
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
              onClick={() => setRowContextMenu((prev) => ({ ...prev, activeTab: 'format' }))}
            >
              {t('dataTable.format')}
            </button>
          </div>

          {rowContextMenu.activeTab === 'actions' ? (
            rowContextMenu.actions.length ? rowContextMenu.actions.map((action, index) => {
              const sectionLabel = String(action.section || '').trim()
              const prevSectionLabel = String(rowContextMenu.actions[index - 1]?.section || '').trim()
              const nextSectionLabel = String(rowContextMenu.actions[index + 1]?.section || '').trim()
              const showSectionHeader = sectionLabel && sectionLabel !== prevSectionLabel
              const showDivider = index < rowContextMenu.actions.length - 1 && sectionLabel !== nextSectionLabel

              return (
                <Fragment key={action.id || `${action.label}-${index}`}>
                  {showSectionHeader ? (
                    <div className="mt-1 px-1 py-1 text-[11px] font-black text-slate-500">{sectionLabel}</div>
                  ) : null}

                  <button
                    type="button"
                    disabled={Boolean(action.disabled)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-start text-sm transition-colors',
                      action.variant === 'danger'
                        ? 'text-red-600 hover:bg-red-50 disabled:text-red-300'
                        : 'text-slate-700 hover:bg-slate-50 disabled:text-slate-300'
                    )}
                    onClick={() => runRowContextAction(action)}
                  >
                    {action.label}
                  </button>

                  {showDivider ? <div className="my-1 border-t border-slate-100" /> : null}
                </Fragment>
              )
            }) : (
              <div className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs font-semibold text-slate-500">
                {t('dataTable.noRowActions')}
              </div>
            )
          ) : (
            <>
              {rowContextMenu.formatActions.map((action, index) => {
                const sectionLabel = String(action.section || '').trim()
                const prevSectionLabel = String(rowContextMenu.formatActions[index - 1]?.section || '').trim()
                const nextSectionLabel = String(rowContextMenu.formatActions[index + 1]?.section || '').trim()
                const showSectionHeader = sectionLabel && sectionLabel !== prevSectionLabel
                const showDivider = index < rowContextMenu.formatActions.length - 1 && sectionLabel !== nextSectionLabel

                return (
                  <Fragment key={action.id || `${action.label}-${index}`}>
                    {showSectionHeader ? (
                      <div className="mt-1 px-1 py-1 text-[11px] font-black text-slate-500">{sectionLabel}</div>
                    ) : null}

                    <button
                      type="button"
                      disabled={Boolean(action.disabled)}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-start text-sm transition-colors',
                        action.variant === 'danger'
                          ? 'text-red-600 hover:bg-red-50 disabled:text-red-300'
                          : 'text-slate-700 hover:bg-slate-50 disabled:text-slate-300'
                      )}
                      onClick={() => runRowContextAction(action)}
                    >
                      {action.label}
                    </button>

                    {showDivider ? <div className="my-1 border-t border-slate-100" /> : null}
                  </Fragment>
                )
              })}

              {rowContextMenu.formatActions.length ? <div className="my-1 border-t border-slate-100" /> : null}

              <div className="text-xs text-slate-500 font-medium">{t('dataTable.customizeScope')}</div>

              <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                {['cell', 'row', 'column'].map((scope) => (
                  <button
                    key={`row-format-${scope}`}
                    type="button"
                    className={cn(
                      'flex-1 text-xs px-2 py-1 rounded',
                      rowContextMenu.formatScope === scope ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    )}
                    onClick={() => setRowContextMenu((prev) => ({ ...prev, formatScope: scope }))}
                  >
                    {t(`dataTable.${scope}`)}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-600">{t('dataTable.background')}</div>
                <div className="flex flex-wrap gap-1">
                  {BG_COLORS.map((color) => (
                    <button
                      key={`row-context-bg-${color}`}
                      type="button"
                      className="w-5 h-5 rounded border border-slate-300"
                      style={{ backgroundColor: color }}
                      onClick={() => applyStyleByScope(rowContextMenu.formatScope, rowContextMenu.rowKey, rowContextMenu.colId, { bgColor: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-600">{t('dataTable.textColor')}</div>
                <div className="flex flex-wrap gap-1">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={`row-context-text-${color}`}
                      type="button"
                      className="w-5 h-5 rounded border border-slate-300"
                      style={{ backgroundColor: color }}
                      onClick={() => applyStyleByScope(rowContextMenu.formatScope, rowContextMenu.rowKey, rowContextMenu.colId, { textColor: color })}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-600">{t('dataTable.fontSize')}</div>
                <div className="flex flex-wrap gap-1">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={`row-context-font-size-${size}`}
                      type="button"
                      className="px-2 py-1 rounded border border-slate-300 text-[11px]"
                      onClick={() => applyStyleByScope(rowContextMenu.formatScope, rowContextMenu.rowKey, rowContextMenu.colId, { fontSize: `${size}px` })}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-600">{t('dataTable.fontFamily')}</div>
                <select
                  className="w-full h-8 rounded border border-slate-300 text-xs px-2"
                  onChange={(e) => applyStyleByScope(rowContextMenu.formatScope, rowContextMenu.rowKey, rowContextMenu.colId, { fontFamily: e.target.value || undefined })}
                  value=""
                >
                  <option value="">{t('dataTable.choose')}</option>
                  {FONT_FAMILIES.map((font) => (
                    <option key={`row-context-font-${font.label}`} value={font.value}>{font.label === 'Default' ? t('dataTable.defaultFont') : font.label === 'Monospace' ? t('dataTable.monospace') : font.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-600">{t('dataTable.fontWeight')}</div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'N', value: '400' },
                    { label: 'M', value: '500' },
                    { label: 'S', value: '600' },
                    { label: 'B', value: '700' },
                  ].map((weight) => (
                    <button
                      key={`row-context-font-weight-${weight.value}`}
                      type="button"
                      className="px-2 py-1 rounded border border-slate-300 text-[11px]"
                      onClick={() => applyStyleByScope(rowContextMenu.formatScope, rowContextMenu.rowKey, rowContextMenu.colId, { fontWeight: weight.value })}
                    >
                      {weight.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-red-600 hover:text-red-700"
                  onClick={() => clearStylesByScope(rowContextMenu.formatScope, rowContextMenu.rowKey, rowContextMenu.colId)}
                >
                  {t('dataTable.clearScopeStyle')}
                </button>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

function getCellValue(row, accessor) {
  return accessor.split('.').reduce((current, prop) => current?.[prop], row)
}
