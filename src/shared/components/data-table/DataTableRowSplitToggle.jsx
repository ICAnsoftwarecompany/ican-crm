import { TableRowsSplit } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function DataTableRowSplitToggle({ enabled, onToggle, onConfigure }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={() => {
        if (onConfigure) {
          onConfigure()
          return
        }

        onToggle?.(!enabled)
      }}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
        enabled
          ? 'border-[#8FE4EA] bg-[#E8F9FA] text-[#007A80] shadow-sm dark:bg-cyan-950 dark:text-cyan-200'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
      }`}
      title={t(enabled ? 'dataTable.rowSplit.disableTitle' : 'dataTable.rowSplit.enableTitle')}
      aria-pressed={enabled}
    >
      <TableRowsSplit size={16} />
      <span className="hidden xl:inline">{t(enabled ? 'dataTable.rowSplit.enabled' : 'dataTable.rowSplit.button')}</span>
    </button>
  )
}
