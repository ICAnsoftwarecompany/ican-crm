import { useTranslation } from 'react-i18next'
import { CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { TodoItemRow } from './TodoItemRow'
import { TodoQuickAdd } from './TodoQuickAdd'
import { TodoViewTabs } from './TodoViewTabs'

const GROUP_ORDER = ['overdue', 'timed', 'untimed', 'carried', 'undated', 'done']

/**
 * Presentational To-Do list. `todo` is the result of `useTodoList(view)`; the parent owns `view`.
 * `maxRows` caps the rows per group (compact use in My Work); `hideTabs` when the parent shows its own.
 */
export function TodoPanelView({ todo, view, onViewChange, onOpenTask, maxRows, hideTabs = false }) {
  const { t } = useTranslation()

  const handleToggle = async (task) => {
    try {
      const result = await todo.toggleDone(task)
      if (result) toast.success(t(result === 'completed' ? 'tasks.todo.completedToast' : 'tasks.todo.reopenedToast'))
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.todo.statusFailed')))
    }
  }

  const groups = GROUP_ORDER.map((id) => ({ id, items: todo.groups?.[id] || [] })).filter((group) => group.items.length)
  const openCount = groups.filter((group) => group.id !== 'done').reduce((sum, group) => sum + group.items.length, 0)

  return (
    <div className="space-y-3">
      {!hideTabs && <TodoViewTabs value={view} onChange={onViewChange} counts={todo.counts} />}
      {view !== 'overdue' && <TodoQuickAdd view={view} onAdd={(title) => todo.quickAdd(title, view)} isAdding={todo.isAdding} />}

      {todo.isLoading ? (
        <div className="space-y-2" aria-label={t('tasks.todo.loading')}>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      ) : todo.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {t('tasks.todo.loadFailed')}{' '}
          <button type="button" onClick={() => todo.refetch?.()} className="font-black underline">{t('common.retry')}</button>
        </div>
      ) : openCount === 0 && !groups.length ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[var(--border)] py-8 text-center">
          <CheckSquare size={22} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">{t(`tasks.todo.empty.${view}`)}</p>
        </div>
      ) : (
        groups.map((group) => {
          const shown = maxRows ? group.items.slice(0, maxRows) : group.items
          return (
            <section key={group.id} aria-label={t(`tasks.todo.groups.${group.id}`)}>
              <h3 className={`mb-1 px-2 text-[11px] font-black ${group.id === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-muted)]'}`}>
                {t(`tasks.todo.groups.${group.id}`)} · {group.items.length}
              </h3>
              <ul className="space-y-0.5">
                {shown.map((task) => (
                  <TodoItemRow
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onOpen={onOpenTask}
                    isPending={todo.pendingIds?.has(task.id)}
                  />
                ))}
              </ul>
              {group.items.length > shown.length && (
                <p className="px-2 pt-1 text-xs text-[var(--text-muted)]">{t('tasks.todo.more', { count: group.items.length - shown.length })}</p>
              )}
            </section>
          )
        })
      )}
    </div>
  )
}
