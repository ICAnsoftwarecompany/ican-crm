import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import {
  ArrowLeftRight,
  Download,
  GitCompareArrows,
  Printer,
  SlidersHorizontal,
  Split,
} from 'lucide-react'
import { AppModal } from '../overlays/AppModal'
import { Button } from '../ui/Button'
import { getExportFilename } from './utils/exportHelpers'

function getNestedValue(row, path) {
  if (!row || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], row)
}

function normalizeValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item)).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function mergeRows(currentRows, nextRows) {
  const existing = new Set(currentRows.map((row) => row.__rowKey))
  const merged = [...currentRows]

  nextRows.forEach((row) => {
    if (!existing.has(row.__rowKey)) {
      merged.push(row)
      existing.add(row.__rowKey)
    }
  })

  return merged
}

function getRowTitle(row) {
  return normalizeValue(row.name || row.customer_name || row.fullName || row.title || row.email || row.phone || row.id)
}

function CompareSide({ title, rows, columns, onRemove }) {
  const { t } = useTranslation()
  const minTableWidth = Math.max(520, 220 + columns.length * 160)

  return (
    <section className="min-h-[520px] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
        <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text-muted)]">
          {rows.length}
        </span>
      </div>

      <div className="max-h-[620px] overflow-auto p-2">
        {rows.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center text-sm text-[var(--text-muted)]">
            {t('dataTable.comparison.chooseCustomers')}
          </div>
        ) : columns.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-md border border-dashed border-[var(--border)] text-sm text-[var(--text-muted)]">
            {t('dataTable.comparison.chooseColumns')}
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs" style={{ minWidth: `${minTableWidth}px` }}>
              <thead className="sticky top-0 z-10 bg-[var(--surface-2)]">
                <tr>
                  <th className="w-12 border-b border-[var(--border)] px-2 py-2 text-start font-bold text-[var(--text-muted)]">
                    #
                  </th>
                  <th className="min-w-[170px] border-b border-[var(--border)] px-2 py-2 text-start font-bold text-[var(--text)]">
                    {t('dataTable.comparison.customer')}
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className="min-w-[150px] border-b border-[var(--border)] px-2 py-2 text-start font-bold text-[var(--text)]"
                    >
                      {column.header}
                    </th>
                  ))}
                  <th className="w-16 border-b border-[var(--border)] px-2 py-2 text-center font-bold text-[var(--text)]">
                    {t('dataTable.comparison.remove')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.__rowKey} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-2)]">
                    <td className="px-2 py-2 align-top text-[var(--text-muted)]">
                      {row.__serial}
                    </td>
                    <td className="px-2 py-2 align-top font-bold text-[var(--text)]">
                      <div className="max-w-[220px] break-words">{getRowTitle(row)}</div>
                    </td>
                    {columns.map((column) => (
                      <td key={column.id} className="px-2 py-2 align-top text-[var(--text)]">
                        <div className="max-w-[240px] break-words">
                          {normalizeValue(getNestedValue(row, column.accessor))}
                        </div>
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center align-top">
                      <button
                        type="button"
                        onClick={() => onRemove(row.__rowKey)}
                        className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        {t('dataTable.comparison.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export function DataTableCompareDialog({
  isOpen,
  onClose,
  rows,
  columns,
  selectedRowKeys,
}) {
  const { t } = useTranslation()
  const printRef = useRef(null)
  const wasOpenRef = useRef(false)
  const [fromSerial, setFromSerial] = useState(1)
  const [toSerial, setToSerial] = useState(10)
  const [rightRows, setRightRows] = useState([])
  const [leftRows, setLeftRows] = useState([])
  const [selectedColumnIds, setSelectedColumnIds] = useState([])

  const comparableColumns = useMemo(() => {
    return columns.filter((column) => {
      if (!column.accessor) return false
      if (column.id?.startsWith('__')) return false
      if (column.id === 'actions') return false
      return column.visible !== false
    })
  }, [columns])

  const selectedColumns = useMemo(() => {
    const selected = new Set(selectedColumnIds)
    return comparableColumns.filter((column) => selected.has(column.id))
  }, [comparableColumns, selectedColumnIds])

  const selectedRows = useMemo(() => {
    if (!selectedRowKeys?.size) return []
    return rows.filter((row) => selectedRowKeys.has(row.__rowKey))
  }, [rows, selectedRowKeys])

  const rangeRows = useMemo(() => {
    const from = Math.max(1, Number(fromSerial) || 1)
    const to = Math.max(from, Number(toSerial) || from)

    return rows.filter((row) => row.__serial >= from && row.__serial <= to)
  }, [rows, fromSerial, toSerial])

  const sourceRows = selectedRows.length > 0 ? selectedRows : rangeRows

  useEffect(() => {
    if (!isOpen) return

    setSelectedColumnIds((current) => {
      const validIds = new Set(comparableColumns.map((column) => column.id))
      const keptIds = current.filter((id) => validIds.has(id))
      return keptIds.length > 0 ? keptIds : comparableColumns.map((column) => column.id)
    })
  }, [isOpen, comparableColumns])

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false
      return
    }

    if (wasOpenRef.current) return
    wasOpenRef.current = true

    if (selectedRows.length > 0) {
      splitRows(selectedRows)
    }
  }, [isOpen, selectedRows])

  const addRows = (side, nextRows) => {
    if (!nextRows.length) return
    if (side === 'right') {
      setRightRows((current) => mergeRows(current, nextRows))
    } else {
      setLeftRows((current) => mergeRows(current, nextRows))
    }
  }

  const splitRows = (rowsToSplit) => {
    const midpoint = Math.ceil(rowsToSplit.length / 2)
    setRightRows(rowsToSplit.slice(0, midpoint))
    setLeftRows(rowsToSplit.slice(midpoint))
  }

  const splitEvenly = () => {
    const rowsToSplit = sourceRows.length ? sourceRows : rows
    splitRows(rowsToSplit)
  }

  const removeFromRight = (rowKey) => {
    setRightRows((current) => current.filter((row) => row.__rowKey !== rowKey))
  }

  const removeFromLeft = (rowKey) => {
    setLeftRows((current) => current.filter((row) => row.__rowKey !== rowKey))
  }

  const reset = () => {
    setRightRows([])
    setLeftRows([])
  }

  const toggleColumn = (columnId) => {
    setSelectedColumnIds((current) => {
      if (current.includes(columnId)) return current.filter((id) => id !== columnId)
      return [...current, columnId]
    })
  }

  const selectAllColumns = () => {
    setSelectedColumnIds(comparableColumns.map((column) => column.id))
  }

  const clearColumns = () => {
    setSelectedColumnIds([])
  }

  const handlePrint = () => {
    if (typeof window === 'undefined' || !printRef.current) return

    const printWindow = window.open('', '_blank', 'width=1200,height=800')
    if (!printWindow) return

    const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n')

    printWindow.document.write(`
      <html lang="${document.documentElement.lang || 'ar'}" dir="${document.documentElement.dir || 'rtl'}">
        <head>
          <title>${t('dataTable.compare')}</title>
          ${documentStyles}
          <style>
            body { margin: 24px; background: #fff; color: #111827; font-family: Tahoma, Arial, sans-serif; }
            .compare-print-shell { max-width: 1200px; margin: 0 auto; }
            @media print {
              body { margin: 0; }
              button { display: none !important; }
              .compare-print-shell { max-width: none; }
              section { break-inside: avoid; }
              table { break-inside: auto; }
              tr { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <main class="compare-print-shell">
            ${printRef.current.outerHTML}
          </main>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new()
    const maxRows = Math.max(rightRows.length, leftRows.length)
    const headers = [
      t('dataTable.comparison.rightNumber'),
      ...selectedColumns.map((column) => `${t('dataTable.comparison.right')} - ${column.header}`),
      '',
      t('dataTable.comparison.leftNumber'),
      ...selectedColumns.map((column) => `${t('dataTable.comparison.left')} - ${column.header}`),
    ]

    const sheetRows = [headers]

    for (let index = 0; index < maxRows; index += 1) {
      const rightRow = rightRows[index]
      const leftRow = leftRows[index]

      sheetRows.push([
        rightRow ? rightRow.__serial : '',
        ...selectedColumns.map((column) => rightRow ? normalizeValue(getNestedValue(rightRow, column.accessor)) : ''),
        '',
        leftRow ? leftRow.__serial : '',
        ...selectedColumns.map((column) => leftRow ? normalizeValue(getNestedValue(leftRow, column.accessor)) : ''),
      ])
    }

    const sheet = XLSX.utils.aoa_to_sheet(sheetRows)
    sheet['!cols'] = headers.map((header) => ({
      wch: header ? Math.max(14, String(header).length + 2) : 4,
    }))

    XLSX.utils.book_append_sheet(workbook, sheet, 'Comparison')
    XLSX.writeFile(workbook, getExportFilename('customers-comparison'))
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dataTable.compare')}
      description={t('dataTable.comparison.description')}
      size="lg"
      className="max-w-[calc(100vw-1rem)] xl:max-w-7xl"
      footer={
        <>
          <Button variant="outline" onClick={reset}>{t('dataTable.comparison.reset')}</Button>
          <Button variant="primary" onClick={onClose}>{t('dataTable.comparison.done')}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
          <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
            <label className="grid gap-1 text-[11px] font-medium text-[var(--text)]">
              {t('dataTable.comparison.fromNumber')}
              <input
                type="number"
                min="1"
                value={fromSerial}
                onChange={(event) => setFromSerial(event.target.value)}
                className="h-8 w-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-xs"
              />
            </label>
            <label className="grid gap-1 text-[11px] font-medium text-[var(--text)]">
              {t('dataTable.comparison.toNumber')}
              <input
                type="number"
                min="1"
                value={toSerial}
                onChange={(event) => setToSerial(event.target.value)}
                className="h-8 w-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-xs"
              />
            </label>

            <Button size="sm" variant="outline" onClick={() => addRows('right', rangeRows)} className="gap-1">
              <ArrowLeftRight size={14} />
              {t('dataTable.comparison.rangeRight')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => addRows('left', rangeRows)} className="gap-1">
              <ArrowLeftRight size={14} />
              {t('dataTable.comparison.rangeLeft')}
            </Button>
            <Button
              size="sm"
              variant="ai"
              onClick={() => addRows('right', selectedRows)}
              disabled={selectedRows.length === 0}
            >
              {t('dataTable.comparison.selectedRight', { count: selectedRows.length })}
            </Button>
            <Button
              size="sm"
              variant="ai"
              onClick={() => addRows('left', selectedRows)}
              disabled={selectedRows.length === 0}
            >
              {t('dataTable.comparison.selectedLeft', { count: selectedRows.length })}
            </Button>
            <Button size="sm" variant="accent" onClick={splitEvenly} className="gap-1">
              <Split size={14} />
              {t('dataTable.comparison.splitEvenly')}
            </Button>

            <div className="flex flex-wrap items-end gap-2 lg:ms-auto">
              <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1">
                <Printer size={14} />
                {t('dataTable.comparison.print')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportExcel}
                disabled={rightRows.length === 0 && leftRows.length === 0}
                className="gap-1"
              >
                <Download size={14} />
                Excel
              </Button>
            </div>
          </div>

          <details className="mt-2 rounded-md border border-[var(--border)] bg-[var(--surface)]">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-bold text-[var(--text)]">
              <SlidersHorizontal size={14} />
              {t('dataTable.comparison.columns', { selected: selectedColumns.length, total: comparableColumns.length })}
            </summary>
            <div className="border-t border-[var(--border)] p-2">
              <div className="mb-2 flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={selectAllColumns}>{t('dataTable.comparison.selectAll')}</Button>
                <Button size="sm" variant="ghost" onClick={clearColumns}>{t('dataTable.comparison.clearColumns')}</Button>
              </div>
              <div className="grid max-h-32 gap-1 overflow-auto sm:grid-cols-2 lg:grid-cols-4">
                {comparableColumns.map((column) => (
                  <label
                    key={column.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-2)]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumnIds.includes(column.id)}
                      onChange={() => toggleColumn(column.id)}
                      className="h-4 w-4 rounded"
                    />
                    <span className="truncate">{column.header}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </div>

        <div ref={printRef} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <GitCompareArrows size={15} />
            <span>
              {t('dataTable.comparison.source')}: {selectedRows.length > 0 ? t('dataTable.comparison.selectedRows', { count: selectedRows.length }) : t('dataTable.comparison.range', { count: rangeRows.length })}
            </span>
            <span>{t('dataTable.comparison.selectedColumns', { count: selectedColumns.length })}</span>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <CompareSide
              title={t('dataTable.comparison.right')}
              rows={rightRows}
              columns={selectedColumns}
              onRemove={removeFromRight}
            />
            <CompareSide
              title={t('dataTable.comparison.left')}
              rows={leftRows}
              columns={selectedColumns}
              onRemove={removeFromLeft}
            />
          </div>
        </div>
      </div>
    </AppModal>
  )
}
