import { useTranslation } from 'react-i18next'
import { KanbanSquare, List } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'

const ICONS = { kanban: KanbanSquare, board: KanbanSquare, table: List }

/** Segmented switch between views (board / table). Labels: `dealWorkspace.viewToggle.<mode>`. */
export function ViewToggle({ modes = ['kanban', 'table'], value, onChange, label }) {
  const { t } = useTranslation()
  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-0.5" role="group" aria-label={label}>
      {modes.map((mode) => {
        const Icon = ICONS[mode] || List
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={value === mode}
            className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold', value === mode ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)]')}
          >
            <Icon size={14} />{t(`dealWorkspace.viewToggle.${mode}`)}
          </button>
        )
      })}
    </div>
  )
}
