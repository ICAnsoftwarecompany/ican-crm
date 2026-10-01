import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ListTodo, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useEntityTasks } from '../../hooks/useEntityTasks'
import { TaskDrawer } from '../TaskDrawer'
import { TodoItemRow } from '../todo/TodoItemRow'
import { CreateTaskButton } from './CreateTaskButton'

const QUICK_ACTIONS = ['task', 'call', 'meeting']

/**
 * Every task linked to one CRM record, with quick actions (new task / schedule a call / a meeting),
 * tick to complete, and the task drawer in place. Used by the customer drawer's Tasks tab; any record
 * page can drop it in with `taskable={{ type: 'lead', id, name }}`.
 */
export function EntityTasksPanel({ taskable, layoutMode = 'compact' }) {
  const { t } = useTranslation()
  const tasks = useEntityTasks(taskable?.type, taskable?.id)
  const [openTaskId, setOpenTaskId] = useState(null)
  const [showClosed, setShowClosed] = useState(false)

  if (!tasks.enabled) {
    return (
      <div className="my-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--text-muted)]">
        {t('tasks.entity.noRecord')}
      </div>
    )
  }

  const handleToggle = async (task) => {
    try {
      const result = await tasks.toggleDone(task)
      if (result) toast.success(t(result === 'completed' ? 'tasks.todo.completedToast' : 'tasks.todo.reopenedToast'))
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.todo.statusFailed')))
    }
  }

  const listClass = layoutMode === 'wide' ? 'grid grid-cols-1 gap-x-3 lg:grid-cols-2' : 'space-y-0.5'

  return (
    <div className="min-w-0 space-y-3 py-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
            <ListTodo size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-[var(--text)]">{t('tasks.entity.title')}</h3>
            <p className="text-xs text-[var(--text-muted)]">{t('tasks.entity.openCount', { count: tasks.open.length })}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <CreateTaskButton key={action} taskable={taskable} action={action} variant={action === 'task' ? 'primary' : 'outline'} />
          ))}
          <button
            type="button"
            onClick={() => tasks.refetch()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--brand-accent)] hover:bg-[var(--brand-accent-soft)]"
            title={t('tasks.entity.refresh')}
            aria-label={t('tasks.entity.refresh')}
          >
            <RefreshCw size={15} className={tasks.isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {tasks.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-5/6" />
        </div>
      ) : tasks.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {t('tasks.entity.loadFailed')}{' '}
          <button type="button" onClick={() => tasks.refetch()} className="font-black underline">{t('common.retry')}</button>
        </div>
      ) : !tasks.open.length && !tasks.closed.length ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
          {t('tasks.entity.empty')}
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2">
          {tasks.open.length ? (
            <ul className={listClass} aria-label={t('tasks.entity.openGroup')}>
              {tasks.open.map((task) => (
                <TodoItemRow key={task.id} task={task} onToggle={handleToggle} onOpen={setOpenTaskId} isPending={tasks.pendingIds.has(task.id)} hideLink />
              ))}
            </ul>
          ) : (
            <p className="px-2 py-1 text-xs text-[var(--text-muted)]">{t('tasks.entity.noOpen')}</p>
          )}

          {tasks.closed.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setShowClosed((value) => !value)}
                aria-expanded={showClosed}
                className="flex items-center gap-1 px-2 text-[11px] font-black text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <ChevronDown size={13} className={showClosed ? 'rotate-180 transition-transform' : 'transition-transform'} />
                {t('tasks.entity.closedGroup', { count: tasks.closed.length })}
              </button>
              {showClosed && (
                <ul className={`mt-1 ${listClass}`}>
                  {tasks.closed.map((task) => (
                    <TodoItemRow key={task.id} task={task} onToggle={handleToggle} onOpen={setOpenTaskId} isPending={tasks.pendingIds.has(task.id)} hideLink />
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}

      <TaskDrawer
        open={Boolean(openTaskId)}
        taskId={openTaskId}
        onClose={() => setOpenTaskId(null)}
        onUpdated={tasks.refetch}
        onDeleted={() => {
          setOpenTaskId(null)
          tasks.refetch()
        }}
      />
    </div>
  )
}
