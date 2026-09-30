import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Table2 } from 'lucide-react'
import { cn } from '../../utils/cn'

/** Plain accessible table — the view every chart must offer (tooltips never gate values). */
export function ChartTable({ columns = [], rows = [] }) {
  return (
    <div className="max-h-80 overflow-auto rounded-md border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[var(--surface-2)]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-3 py-2 text-start text-xs font-bold text-[var(--text-muted)]">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index} className="border-t border-[var(--border)]">
              {columns.map((column) => (
                <td key={column.key} className={cn('px-3 py-1.5 text-[var(--text)]', column.numeric && 'tabular-nums')} dir={column.numeric ? 'ltr' : undefined}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Card around one chart: title, optional description, chart ↔ table toggle, empty state.
 * `table` = { columns, rows } (built automatically by ReportChart).
 */
export function ChartCard({ title, description, size = 'normal', table, isEmpty = false, emptyText, children }) {
  const { t } = useTranslation()
  const [showTable, setShowTable] = useState(false)
  const canToggle = Boolean(table?.rows?.length) && !isEmpty

  return (
    <section className={cn('flex min-w-0 flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)]', size === 'wide' && 'lg:col-span-2')}>
      <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[var(--text)]">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>}
        </div>
        {canToggle && (
          <button
            type="button"
            onClick={() => setShowTable((value) => !value)}
            aria-pressed={showTable}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
          >
            {showTable ? <BarChart3 size={13} /> : <Table2 size={13} />}
            {showTable ? t('reports.showChart') : t('reports.showTable')}
          </button>
        )}
      </header>
      <div className="min-h-0 flex-1 p-4">
        {isEmpty ? (
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">{emptyText || t('reports.noData')}</p>
        ) : showTable && table ? (
          <ChartTable {...table} />
        ) : (
          children
        )}
      </div>
    </section>
  )
}
