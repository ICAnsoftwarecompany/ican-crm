import { Columns2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function DataTableColumnSplitToggle({ enabled, onConfigure }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={onConfigure}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
        enabled
          ? 'border-[#8FE4EA] bg-[#E8F9FA] text-[#007A80] shadow-sm dark:bg-cyan-950 dark:text-cyan-200'
          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]'
      }`}
      title={t(enabled ? 'dataTable.columnSplit.configureTitle' : 'dataTable.columnSplit.enableTitle')}
      aria-pressed={enabled}
    >
      <Columns2 size={16} />
      <span className="hidden xl:inline">{t(enabled ? 'dataTable.columnSplit.enabled' : 'dataTable.columnSplit.button')}</span>
    </button>
  )
}
