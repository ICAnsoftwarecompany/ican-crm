import { useTranslation } from 'react-i18next'
import { ListTodo } from 'lucide-react'

import { cn } from '../../../shared/utils/cn'
import { useTasks } from '../hooks/useTasks'
import { getTaskSummaryMetrics, withoutTodos } from '../utils/taskMeta'

export function TasksNavbarButton({ active = false, onClick }) {
  const { t } = useTranslation()
  const tasksQuery = useTasks({ per_page: 40 })
  const tasks = withoutTodos(tasksQuery.data)
  const unreadCount = getTaskSummaryMetrics(tasks).unread

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
      aria-label={t('tasks.navbarButton.ariaLabel')}
      title={t('tasks.navbarButton.title')}
    >
      <ListTodo size={16} className="text-[var(--text)]" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -end-1.5 min-w-5 h-5 rounded-full bg-[#EF4444] px-1 text-[10px] font-black leading-5 text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
