import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { formatDate, formatTime, isSameDay } from '../../../../shared/utils/dateTime'
import {
  getTaskAssignees,
  getTaskDateTime,
  getTaskDueTime,
  getTaskPriorityMeta,
  getTaskStatusMeta,
  getTaskTitle,
  getTaskTypeMeta,
  isTaskClosed,
  isTaskOverdue,
} from '../../utils/taskMeta'
import { TaskLinkChip } from '../TaskLinkChip'

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] || '?') + (parts[1]?.[0] || '')
}

function useDueText(task) {
  const { t, i18n } = useTranslation()
  const due = getTaskDateTime(task)
  if (!due) return ''
  const hasTime = Boolean(getTaskDueTime(task))
  if (isSameDay(due, new Date())) return hasTime ? formatTime(due, i18n.language) : t('activities.derivedStates.today')
  const date = formatDate(due, i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })
  return hasTime ? `${date} · ${formatTime(due, i18n.language)}` : date
}

/**
 * One task in a list: tick to complete, type icon, title, linked customer, assignees, due, priority,
 * and the status when it is "in progress". The whole row opens the task.
 */
export function TaskRow({ task, onOpen, onToggle, isPending = false, compact = false }) {
  const { t } = useTranslation()
  const closed = isTaskClosed(task)
  const overdue = isTaskOverdue(task)
  const typeMeta = getTaskTypeMeta(task?.type, t)
  const TypeIcon = typeMeta.icon
  const priority = String(task?.priority || '').toLowerCase()
  const priorityMeta = getTaskPriorityMeta(priority, t)
  const status = String(task?.status || '').toLowerCase()
  const assignees = getTaskAssignees(task)
  const dueText = useDueText(task)

  return (
    <li className="group flex items-center gap-2 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--surface-2)]">
      <button
        type="button"
        onClick={() => onToggle?.(task)}
        disabled={isPending}
        aria-label={closed ? t('tasks.todo.reopen') : t('tasks.todo.complete')}
        title={closed ? t('tasks.todo.reopen') : t('tasks.todo.complete')}
        className="shrink-0 text-[var(--text-muted)] hover:text-[var(--brand-accent)] disabled:opacity-50"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : closed ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Circle size={18} />}
      </button>

      <button type="button" onClick={() => onOpen?.(task.id)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]" title={typeMeta.label}>
          <TypeIcon size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-bold ${closed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'}`}>
            {getTaskTitle(task, t)}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
            <span>{typeMeta.label}</span>
            <TaskLinkChip task={task} showPersonal={false} linkable={false} className="py-0" />
            {status === 'in_progress' && !compact && (
              <span className={`rounded-full px-1.5 ${getTaskStatusMeta(status, t).tone}`}>{getTaskStatusMeta(status, t).label}</span>
            )}
          </span>
        </span>

        {(priority === 'high' || priority === 'urgent') && !closed && (
          <span className={`hidden shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-black sm:inline ${priorityMeta.className}`}>{priorityMeta.label}</span>
        )}

        {!compact && assignees.length > 0 && (
          <span className="hidden shrink-0 -space-x-1.5 rtl:space-x-reverse md:flex" title={assignees.map((user) => user.name || `#${user.id}`).join('، ')}>
            {assignees.slice(0, 3).map((user) => (
              <span key={user.id} className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--surface-2)] text-[9px] font-black uppercase text-[var(--text)]">
                {initials(user.name)}
              </span>
            ))}
            {assignees.length > 3 && (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--surface-2)] text-[9px] font-black text-[var(--text-muted)]">+{assignees.length - 3}</span>
            )}
          </span>
        )}

        {dueText && (
          <span className={`shrink-0 text-xs font-bold ${overdue ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-muted)]'}`}>{dueText}</span>
        )}
      </button>
    </li>
  )
}
