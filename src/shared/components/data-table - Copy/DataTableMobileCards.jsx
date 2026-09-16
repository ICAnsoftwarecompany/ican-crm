import { cn } from '../../utils/cn'

function getCellValue(row, accessor) {
  if (!accessor) return undefined
  return accessor.split('.').reduce((current, key) => current?.[key], row)
}

function isEmptyValue(value) {
  return value === null || value === undefined || value === ''
}

function renderValue(row, column) {
  if (column.render) return column.render(row)
  const value = getCellValue(row, column.accessor)
  return isEmptyValue(value) ? '-' : String(value)
}

function isInteractiveElement(element) {
  return Boolean(
    element?.closest?.(
      'button, a, input, textarea, select, label, summary, [role="button"], [data-no-cell-copy="true"]'
    )
  )
}

export function DataTableMobileCards({
  rows,
  columns,
  pageStart = 0,
  selectedRowKeys,
  onToggleRowSelection,
  onRowClick,
  onRowDoubleClick,
  rowClassName,
}) {
  const dataColumns = columns.filter((column) => !['__select', '__serial'].includes(column.id))
  const actionColumn = dataColumns.find((column) => column.id === 'actions')
  const contentColumns = dataColumns.filter((column) => column.id !== 'actions')
  const titleColumn = contentColumns.find((column) => column.id === 'name') || contentColumns[0]
  const detailColumns = contentColumns.filter((column) => column.id !== titleColumn?.id)

  const handleCardClickCapture = (event, rowKey, isSelected) => {
    if (!(event.ctrlKey || event.metaKey)) return
    if (event.button !== 0) return
    if (isInteractiveElement(event.target)) return

    event.preventDefault()
    event.stopPropagation()
    onToggleRowSelection?.(rowKey, !isSelected)
  }

  const handleCardDoubleClick = (event, row) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    onRowDoubleClick?.(row)
  }

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row, rowIndex) => {
        const rowKey = row.__rowKey || String(row.id || rowIndex)
        const isSelected = selectedRowKeys?.has(rowKey)
        const serialNumber = pageStart + rowIndex + 1

        return (
          <article
            key={rowKey}
            className={cn(
              'rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm',
              'transition-colors active:bg-[var(--surface-2)]',
              isSelected && 'border-[#00C2CB] bg-[#EAF6FF]',
              (onRowClick || onRowDoubleClick) && 'cursor-pointer',
              rowClassName?.(row)
            )}
            onClickCapture={(event) => handleCardClickCapture(event, rowKey, Boolean(isSelected))}
            onClick={() => onRowClick?.(row)}
            onDoubleClick={(event) => handleCardDoubleClick(event, row)}
          >
            <div className="flex min-w-0 items-start gap-3">
              <input
                type="checkbox"
                checked={Boolean(isSelected)}
                onChange={(event) => onToggleRowSelection?.(rowKey, event.target.checked)}
                onClick={(event) => event.stopPropagation()}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
                title="تحديد الصف"
              />

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[var(--text-muted)]">#{serialNumber}</div>
                    <div className="mt-1 min-w-0 break-words text-sm font-black text-[var(--text)]">
                      {titleColumn ? renderValue(row, titleColumn) : `Row ${serialNumber}`}
                    </div>
                  </div>
                  {actionColumn && (
                    <div className="shrink-0" onClick={(event) => event.stopPropagation()}>
                      {renderValue(row, actionColumn)}
                    </div>
                  )}
                </div>

                {detailColumns.length > 0 && (
                  <dl className="mt-3 grid grid-cols-1 gap-2">
                    {detailColumns.slice(0, 8).map((column) => (
                      <div key={column.id} className="min-w-0 rounded-lg bg-[var(--surface-2)] px-2 py-2">
                        <dt className="text-[11px] font-bold text-[var(--text-muted)]">{column.header}</dt>
                        <dd className="mt-1 min-w-0 break-words text-sm text-[var(--text)]">
                          {renderValue(row, column)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
