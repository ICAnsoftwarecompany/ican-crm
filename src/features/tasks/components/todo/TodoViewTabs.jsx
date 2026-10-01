import { useTranslation } from 'react-i18next'
import { TODO_VIEWS } from '../../utils/todoPeriods'

/** Today / This week / This month / Overdue switch with open counts. */
export function TodoViewTabs({ value, onChange, counts = {} }) {
  const { t } = useTranslation()

  return (
    <div role="radiogroup" aria-label={t('tasks.todo.viewsLabel')} className="flex flex-wrap gap-1.5">
      {TODO_VIEWS.map((id) => {
        const active = value === id
        const count = counts[id] || 0
        const danger = id === 'overdue' && count > 0
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange?.(id)}
            className={[
              'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-black transition-colors',
              active
                ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]',
            ].join(' ')}
          >
            {t(`tasks.todo.views.${id}`)}
            <span className={[
              'rounded-full px-1.5 py-0.5 text-[10px]',
              danger ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-[var(--surface-2)]',
            ].join(' ')}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
