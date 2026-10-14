import { useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ListTodo, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { WorkflowLauncher } from '../../features/workflow-engine'

import { TaskBoard } from '../../features/tasks/components/board/TaskBoard'
import { TaskCalendarView } from '../../features/tasks/components/TaskCalendarView'
import { TaskDrawer } from '../../features/tasks/components/TaskDrawer'
import { TaskFormDialog } from '../../features/tasks/components/TaskFormDialog'
import { TaskGroupedList } from '../../features/tasks/components/list/TaskGroupedList'
import { TaskQuickAdd } from '../../features/tasks/components/list/TaskQuickAdd'
import { TaskFiltersBar } from '../../features/tasks/components/workspace/TaskFiltersBar'
import { TasksWorkspace } from '../../features/tasks/components/workspace/TasksWorkspace'
import { TasksWorkspaceHeader } from '../../features/tasks/components/workspace/TasksWorkspaceHeader'
import { TasksWorkspaceSidebar } from '../../features/tasks/components/workspace/TasksWorkspaceSidebar'
import { useTaskToggle } from '../../features/tasks/hooks/useTaskToggle'
import { useTaskMutations, useTasks } from '../../features/tasks/hooks/useTasks'
import { countSmartViews, filterTasks } from '../../features/tasks/utils/taskFilters'
import { getTaskStatusOptions, getTaskTypeOptions, withoutTodos } from '../../features/tasks/utils/taskMeta'
import { Skeleton } from '../../shared/components/feedback/Skeleton'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { extractMessage } from '../../shared/utils/apiResponse'
import { formatDateInput, formatTimeInput } from '../../shared/utils/dateTime'

/**
 * /tasks — team and customer tasks (To-Dos live on /todo). List view: quick add + tasks grouped by
 * due date with tick-to-complete; board and calendar views; filters on one line; drawer via `?taskId=`.
 */
export function TasksPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const legacyTodoLink = searchParams.get('smart') === 'todo'
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createInitialValues, setCreateInitialValues] = useState(null)
  const [search, setSearch] = useState('')
  const [smartView, setSmartView] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [linkFilter, setLinkFilter] = useState('all')
  const [activeBoardId, setActiveBoardId] = useState('main')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const view = searchParams.get('view') || 'list'
  const taskIdParam = searchParams.get('taskId') || ''

  const tasksQuery = useTasks({ per_page: 100 })
  const mutations = useTaskMutations()
  const { toggle, pendingIds } = useTaskToggle()
  // To-Dos have their own page (/todo) since 2026-10-02.
  const tasks = useMemo(() => withoutTodos(tasksQuery.data), [tasksQuery.data])
  const metrics = useMemo(() => countSmartViews(tasks), [tasks])
  const statusOptions = useMemo(() => getTaskStatusOptions(tasks), [tasks])
  const typeOptions = useMemo(() => getTaskTypeOptions(tasks, t).filter((type) => type !== 'todo'), [tasks, t])
  const visibleTasks = useMemo(
    () => filterTasks(tasks, { view: smartView, status: statusFilter, type: typeFilter, link: linkFilter, search }),
    [linkFilter, search, smartView, statusFilter, tasks, typeFilter],
  )

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, String(value))
    else next.delete(key)
    setSearchParams(next)
  }
  const openTask = (taskId) => setParam('taskId', taskId)
  const closeTask = () => setParam('taskId', '')

  const openCreate = (values = null) => {
    setCreateInitialValues(values)
    setIsCreateOpen(true)
  }

  const handleCreateTask = async (payload) => {
    try {
      await mutations.create.mutateAsync(payload)
      toast.success(t('tasks.page.createdToast'))
      setIsCreateOpen(false)
      setCreateInitialValues(null)
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.page.createFailedToast')))
    }
  }

  const handleCreateFromCalendar = (date) => {
    const d = new Date(date)
    openCreate(Number.isNaN(d.getTime()) ? null : { due_date: formatDateInput(d), due_time: formatTimeInput(d) })
  }

  usePageHeader({
    title: t('nav.tasks'),
    icon: ListTodo,
    actions: (
      <button
        type="button"
        onClick={() => openCreate()}
        className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
      >
        <Plus size={14} />
        <span className="hidden lg:inline">{t('tasks.page.newTask')}</span>
      </button>
    ),
  })

  // Boards are static definitions (no backend yet); only the main board has a real count.
  const boardItems = [
    { id: 'main', name: t('tasks.page.mainBoard'), count: visibleTasks.length, accent: 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' },
    { id: 'sales', name: t('tasks.page.salesTeamBoard'), accent: 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#27254f] dark:text-[#a5b4fc]' },
    { id: 'followups', name: t('tasks.page.followUpsBoard'), accent: 'bg-[#FFF7ED] text-[#C2410C] dark:bg-[#431f0d] dark:text-[#fdba74]' },
  ]

  // Old link to the To-Do smart view (before To-Dos got their own page).
  if (legacyTodoLink) return <Navigate to="/todo" replace />

  const filtersBar = (
    <TaskFiltersBar
      statusOptions={statusOptions}
      typeOptions={typeOptions}
      status={statusFilter}
      type={typeFilter}
      link={linkFilter}
      onStatusChange={setStatusFilter}
      onTypeChange={setTypeFilter}
      onLinkChange={setLinkFilter}
    />
  )

  return (
    <>
      <TasksWorkspace
        sidebar={(
          <TasksWorkspaceSidebar
            boards={boardItems}
            activeSmartView={smartView}
            activeBoardId={activeBoardId}
            onSmartViewChange={setSmartView}
            onBoardChange={setActiveBoardId}
            onAddBoard={() => openCreate()}
            onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
            collapsed={sidebarCollapsed}
            metrics={metrics}
          />
        )}
        header={(
          <TasksWorkspaceHeader
            search={search}
            onSearchChange={setSearch}
            view={view}
            onViewChange={(next) => setParam('view', next)}
            onCreateTask={() => openCreate()}
            showFilters={view !== 'board'}
            filtersContent={view !== 'board' ? filtersBar : null}
            extraActions={(
              <WorkflowLauncher context={{ module: 'tasks', entity: 'task' }} variant="outline" size="sm">
                {t('workflow.builder.createAutomation')}
              </WorkflowLauncher>
            )}
          />
        )}
        sidebarCollapsed={sidebarCollapsed}
      >
        <section className="space-y-3">
          {view === 'list' && <TaskQuickAdd onOpenFull={openCreate} />}

          {tasksQuery.isLoading ? (
            <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-5/6" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          ) : tasksQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {t('tasks.todo.loadFailed')}{' '}
              <button type="button" onClick={() => tasksQuery.refetch()} className="font-black underline">{t('common.retry')}</button>
            </div>
          ) : (
            <>
              {view === 'list' && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 sm:p-3">
                  <TaskGroupedList
                    tasks={visibleTasks}
                    onOpen={openTask}
                    onToggle={toggle}
                    pendingIds={pendingIds}
                    emptyText={tasks.length ? t('tasks.page.noMatchingTasksFiltered') : t('tasks.list.empty')}
                  />
                </div>
              )}

              {view === 'board' && (
                <TaskBoard
                  boardId={activeBoardId}
                  tasks={visibleTasks}
                  onOpenTask={openTask}
                  onQuickComplete={toggle}
                  onCreateTask={(listId, titleValue, board) => {
                    if (!titleValue?.trim()) return
                    handleCreateTask({
                      title: titleValue.trim(),
                      description: '',
                      type: 'follow_up',
                      priority: 'medium',
                      status: 'pending',
                      visibility: 'shared',
                      // Board quick-add creates an unlinked task (no lead with an empty id).
                      taskable_type: '',
                      taskable_id: '',
                      due_date: '',
                      due_time: '',
                      users: [],
                      teams: [],
                      board_id: board || activeBoardId,
                      board_list_id: listId,
                    })
                  }}
                  onDeleteTask={(task) => {
                    if (!task?.id) return
                    mutations.remove.mutateAsync(task.id)
                      .then(() => toast.success(t('tasks.page.deletedToast')))
                      .catch((error) => toast.error(extractMessage(error, t('tasks.page.deleteFailedToast'))))
                  }}
                />
              )}

              {view === 'calendar' && (
                <TaskCalendarView tasks={visibleTasks} onOpenTask={openTask} onCreateAt={handleCreateFromCalendar} />
              )}
            </>
          )}
        </section>
      </TasksWorkspace>

      <TaskFormDialog
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
          setCreateInitialValues(null)
        }}
        onSubmit={handleCreateTask}
        isSaving={mutations.create.isPending}
        initialValues={createInitialValues}
        title={t('tasks.page.createTaskDialogTitle')}
        description={t('tasks.page.createTaskDialogDescription')}
        submitLabel={t('tasks.page.createTaskSubmitLabel')}
      />

      <TaskDrawer
        open={Boolean(taskIdParam)}
        taskId={taskIdParam}
        onClose={closeTask}
        onUpdated={tasksQuery.refetch}
        onDeleted={closeTask}
      />
    </>
  )
}
