import { useTranslation } from 'react-i18next'
import { PanelRightOpen } from 'lucide-react'

function getCellValue(row, accessor) {
  if (!accessor) return undefined
  return String(accessor).split('.').reduce((current, key) => current?.[key], row)
}

function DrawerTriggerCell({ row, content, onOpen }) {
  const { t } = useTranslation()
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="min-w-0 flex-1">{content}</span>
      <button
        type="button"
        data-no-cell-copy="true"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--brand-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
        aria-label={t('dataTable.openDrawer')}
        title={t('dataTable.openDrawer')}
        onClick={(event) => {
          event.stopPropagation()
          onOpen(row)
        }}
      >
        <PanelRightOpen size={15} className="rtl:-scale-x-100" aria-hidden="true" />
      </button>
    </span>
  )
}

/** The column that carries the drawer icon: `drawerTrigger: true`, else `id: 'name'`, else the first data column. */
export function findDrawerTriggerColumn(columns = []) {
  const usable = columns.filter((column) => !String(column.id).startsWith('__'))
  return usable.find((column) => column.drawerTrigger) || usable.find((column) => column.id === 'name') || usable[0] || null
}

/**
 * * DataTable `onOpenRowDrawer(row)` (2026-10-15): adds an "open drawer" icon next to the name cell of every row.
 * The rest of the cell keeps its own render / click behavior.
 */
export function withDrawerTrigger(columns = [], onOpen) {
  if (typeof onOpen !== 'function') return columns
  const target = findDrawerTriggerColumn(columns)
  if (!target) return columns
  return columns.map((column) => {
    if (column !== target) return column
    return {
      ...column,
      render: (row) => {
        const content = column.render ? column.render(row) : getCellValue(row, column.accessor) ?? '—'
        return <DrawerTriggerCell row={row} content={content} onOpen={onOpen} />
      },
    }
  })
}
