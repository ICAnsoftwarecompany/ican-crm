import { useTranslation } from 'react-i18next'
import { ClipboardCheck } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { useTodoList } from '../../hooks/useTodoList'

/** Header button for "My to-do list"; the badge is today's open To-Dos (overdue included). */
export function TodoNavbarButton({ active = false, onClick }) {
  const { t } = useTranslation()
  const { counts } = useTodoList('today')
  const count = counts.today || 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]'
      )}
      aria-label={t('tasks.todo.panel.ariaLabel')}
      title={t('tasks.todo.panel.buttonTitle')}
    >
      <ClipboardCheck size={16} className="text-[var(--text)]" />
      {count > 0 && (
        <span className="absolute -top-1.5 -end-1.5 min-w-5 h-5 rounded-full bg-[var(--brand-accent)] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
