import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { ExternalLink, ListTodo, Plus, Search, X } from 'lucide-react'

import { Skeleton } from '../../../shared/components/feedback/Skeleton'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { useTaskToggle } from '../hooks/useTaskToggle'
import { useTaskMutations, useTasks } from '../hooks/useTasks'
import { countSmartViews } from '../utils/taskFilters'
import { taskMatchesQuery, withoutTodos } from '../utils/taskMeta'
import { TaskGroupedList } from './list/TaskGroupedList'
import { TaskQuickAdd } from './list/TaskQuickAdd'
import { TaskDrawer } from './TaskDrawer'
import { TaskFormDialog } from './TaskFormDialog'

const headerButtonClass = 'inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-black text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent-soft)]'

/**
 * Quick Tasks panel from the header: one column — search, quick add, tasks grouped by due date
 * (tick to complete), the task drawer on click. To-Dos are on their own panel.
 */
export function TasksSidebarPanel({ open, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [openTaskId, setOpenTaskId] = useState(null)
  const [createValues, setCreateValues] = useState(null)
  const tasksQuery = useTasks({ per_page: 40 })
  const { create } = useTaskMutations()
  const { toggle, pendingIds } = useTaskToggle()
  const list = useMemo(() => withoutTodos(tasksQuery.data), [tasksQuery.data])
  const metrics = useMemo(() => countSmartViews(list), [list])
  const filtered = useMemo(() => list.filter((task) => taskMatchesQuery(task, query)), [list, query])
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  const handleCreate = async (payload) => {
    try {
      await create.mutateAsync(payload)
      toast.success(t('tasks.page.createdToast'))
      setCreateValues(null)
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.page.createFailedToast')))
    }
  }

  return (
    <>
      <aside
        className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[var(--border)] bg-[var(--surface)] shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
        style={{ transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})` }}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <header className="border-b border-[var(--border)] bg-[var(--surface-2)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                  <ListTodo size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-[var(--text)]">{t('tasks.sidebarPanel.title')}</h2>
                  <p className="truncate text-xs font-semibold text-[var(--text-muted)]">
                    {t('tasks.list.panelSummary', { today: metrics.today, overdue: metrics.overdue })}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => setCreateValues({})} className={headerButtonClass}>
                  <Plus size={13} />
                  {t('tasks.todo.panel.newButton')}
                </button>
                <button type="button" onClick={() => { navigate('/tasks'); onClose?.() }} title={t('tasks.sidebarPanel.openPage')} className={headerButtonClass}>
                  <ExternalLink size={13} />
                  {t('tasks.sidebarPanel.openButton')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t('tasks.sidebarPanel.close')}
                  title={t('tasks.sidebarPanel.close')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </header>

          {open && (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              <label className="relative block">
                <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[var(--text-muted)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('tasks.sidebarPanel.searchPlaceholder')}
                  className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] ps-8 pe-3 text-xs font-semibold text-[var(--text)] outline-none focus:border-[var(--brand-accent)]"
                />
              </label>

              <TaskQuickAdd compact onOpenFull={setCreateValues} />

              {tasksQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-5/6" />
                </div>
              ) : (
                <TaskGroupedList
                  tasks={filtered}
                  onOpen={setOpenTaskId}
                  onToggle={toggle}
                  pendingIds={pendingIds}
                  compact
                  limit={8}
                  emptyText={query ? t('tasks.sidebarPanel.noMatchingTasks') : t('tasks.list.empty')}
                />
              )}
            </div>
          )}
        </div>
      </aside>

      <TaskFormDialog
        open={Boolean(createValues)}
        onClose={() => setCreateValues(null)}
        onSubmit={handleCreate}
        isSaving={create.isPending}
        initialValues={createValues}
        title={t('tasks.page.createTaskDialogTitle')}
        description={t('tasks.page.createTaskDialogDescription')}
        submitLabel={t('tasks.page.createTaskSubmitLabel')}
      />

      <TaskDrawer
        open={Boolean(openTaskId)}
        taskId={openTaskId}
        onClose={() => setOpenTaskId(null)}
        onUpdated={tasksQuery.refetch}
        onDeleted={() => setOpenTaskId(null)}
      />
    </>
  )
}
