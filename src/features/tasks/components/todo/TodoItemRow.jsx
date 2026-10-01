import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { formatDate, formatTime, isSameDay } from '../../../../shared/utils/dateTime'
import { getTaskDateTime, getTaskDueTime, getTaskPriorityMeta, getTaskTitle, getTaskTypeMeta, isTaskCompleted, isTaskOverdue } from '../../utils/taskMeta'
import { TaskLinkChip } from '../TaskLinkChip'

function useDueLabel(task) {
  const { t, i18n } = useTranslation()
  const due = getTaskDateTime(task)
  if (!due) return ''
  if (getTaskDueTime(task)) {
    return isSameDay(due, new Date())
      ? formatTime(due, i18n.language)
      : `${formatDate(due, i18n.language, { day: 'numeric', month: 'short' })} · ${formatTime(due, i18n.language)}`
  }
  if (isSameDay(due, new Date())) return ''
  return t('tasks.todo.dueBy', { date: formatDate(due, i18n.language, { weekday: 'short', day: 'numeric', month: 'short' }) })
}

/** A To-Do row: done checkbox, type icon, title (opens the task), link, due label, priority. */
export function TodoItemRow({ task, onToggle, onOpen, isPending = false, hideLink = false }) {
  const { t } = useTranslation()
  const done = isTaskCompleted(task)
  const overdue = isTaskOverdue(task)
  const typeMeta = getTaskTypeMeta(task?.type, t)
  const priority = String(task?.priority || '').toLowerCase()
  const priorityMeta = getTaskPriorityMeta(priority, t)
  const dueLabel = useDueLabel(task)
  const TypeIcon = typeMeta.icon

  return (
    <li className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)]">
      <button
        type="button"
        onClick={() => onToggle?.(task)}
        disabled={isPending}
        aria-label={done ? t('tasks.todo.reopen') : t('tasks.todo.complete')}
        title={done ? t('tasks.todo.reopen') : t('tasks.todo.complete')}
        className="mt-0.5 shrink-0 text-[var(--text-muted)] hover:text-[var(--brand-accent)] disabled:opacity-50"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : done ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Circle size={18} />}
      </button>

      <button type="button" onClick={() => onOpen?.(task.id)} className="min-w-0 flex-1 text-start">
        <span className="flex items-center gap-1.5">
          <TypeIcon size={13} className="shrink-0 text-[var(--brand-accent)]" />
          <span className={`truncate text-sm font-bold ${done ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'}`}>
            {getTaskTitle(task, t)}
          </span>
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          {!hideLink && <TaskLinkChip task={task} showPersonal={false} linkable={false} className="py-0.5" />}
          {dueLabel && (
            <span className={`text-[11px] font-bold ${overdue ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-muted)]'}`}>{dueLabel}</span>
          )}
        </span>
      </button>

      {(priority === 'high' || priority === 'urgent') && !done && (
        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-black ${priorityMeta.className}`}>{priorityMeta.label}</span>
      )}
    </li>
  )
}
