import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ListChecks } from 'lucide-react'
import { groupTasksByDue, TASK_GROUP_ORDER } from '../../utils/taskGroups'
import { TaskRow } from './TaskRow'

const GROUP_TONE = {
  overdue: 'text-red-600 dark:text-red-400',
  today: 'text-[var(--brand-accent)]',
}

/**
 * Tasks grouped by when they are due — Overdue · Today · Upcoming · No date · Done (folded).
 * `limit` caps the rows per group (header panel). Empty → `emptyText`.
 */
export function TaskGroupedList({ tasks, onOpen, onToggle, pendingIds, compact = false, limit, emptyText }) {
  const { t } = useTranslation()
  const [showDone, setShowDone] = useState(false)
  const groups = useMemo(() => groupTasksByDue(tasks), [tasks])
  const hasAny = TASK_GROUP_ORDER.some((id) => groups[id].length)

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
        <ListChecks size={24} className="text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">{emptyText || t('tasks.list.empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {TASK_GROUP_ORDER.map((id) => {
        const items = groups[id]
        if (!items.length) return null
        const isDone = id === 'done'
        const open = !isDone || showDone
        const shown = limit ? items.slice(0, limit) : items
        return (
          <section key={id} aria-label={t(`tasks.list.groups.${id}`)}>
            <button
              type="button"
              onClick={isDone ? () => setShowDone((value) => !value) : undefined}
              aria-expanded={isDone ? showDone : undefined}
              className={`mb-1 flex items-center gap-1.5 px-2 text-xs font-black ${GROUP_TONE[id] || 'text-[var(--text-muted)]'} ${isDone ? 'hover:text-[var(--text)]' : 'cursor-default'}`}
            >
              {isDone && <ChevronDown size={13} className={showDone ? 'rotate-180 transition-transform' : 'transition-transform'} />}
              {t(`tasks.list.groups.${id}`)}
              <span className="rounded-full bg-[var(--surface-2)] px-1.5 text-[10px] text-[var(--text-muted)]">{items.length}</span>
            </button>
            {open && (
              <ul className="space-y-0.5">
                {shown.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onOpen={onOpen}
                    onToggle={onToggle}
                    isPending={pendingIds?.has?.(task.id)}
                    compact={compact}
                  />
                ))}
              </ul>
            )}
            {open && items.length > shown.length && (
              <p className="px-2 pt-1 text-xs text-[var(--text-muted)]">{t('tasks.todo.more', { count: items.length - shown.length })}</p>
            )}
          </section>
        )
      })}
    </div>
  )
}
