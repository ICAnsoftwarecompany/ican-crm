import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ListTodo, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { WorkflowLauncher } from '../../features/workflow-engine'

import { TaskBoard } from '../../features/tasks/components/board/TaskBoard'
import { TaskCalendarView } from '../../features/tasks/components/TaskCalendarView'
import { TaskDrawer } from '../../features/tasks/components/TaskDrawer'
import { TaskFormDialog } from '../../features/tasks/components/TaskFormDialog'
import { TasksWorkspace } from '../../features/tasks/components/workspace/TasksWorkspace'
import { TasksWorkspaceHeader } from '../../features/tasks/components/workspace/TasksWorkspaceHeader'
import { TasksWorkspaceSidebar } from '../../features/tasks/components/workspace/TasksWorkspaceSidebar'
import { useTaskMutations, useTasks } from '../../features/tasks/hooks/useTasks'
import {
  getTaskDateTime,
  getTaskPriorityMeta,
  getTaskStatusMeta,
  getTaskStatusOptions,
  getTaskSummaryMetrics,
  getTaskTitle,
  getTaskTypeMeta,
  getTaskTypeOptions,
  isTaskOverdue,
  taskMatchesQuery,
} from '../../features/tasks/utils/taskMeta'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { extractMessage } from '../../shared/utils/apiResponse'
import { formatDate as formatDateWithLocale } from '../../shared/utils/dateTime'

function SummaryCard({ title, value, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl border px-3 py-2 text-start transition-colors',
        active
          ? 'border-[#7FDDE1] bg-[#F3FDFF]'
          : 'border-[#D7EEF0] bg-white hover:bg-[#F8FEFF]',
      ].join(' ')}
    >
      <div className="text-[11px] font-bold text-[#64748B]">{title}</div>
      <div className="mt-1 text-lg font-black text-[#0F172A]">{value}</div>
    </button>
  )
}

function TaskCard({ task }) {
  const { t, i18n } = useTranslation()
  const typeMeta = getTaskTypeMeta(task?.type, t)
  const priorityMeta = getTaskPriorityMeta(task?.priority, t)
  const statusMeta = getTaskStatusMeta(task?.status, t)
  const overdue = isTaskOverdue(task)
  const due = getTaskDateTime(task)
  const dueLabel = due
    ? formatDateWithLocale(due, i18n.language, { dateStyle: 'medium', timeStyle: 'short' })
    : t('tasks.fallback.noDueDate')
  const TypeIcon = typeMeta.icon

  return (
    <article className="rounded-xl border border-[#D7EEF0] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <TypeIcon size={14} className="shrink-0 text-[#007A80]" />
            <h3 className="truncate text-sm font-black text-[#0F172A]">{getTaskTitle(task, t)}</h3>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-black ${priorityMeta.className}`}>
          {priorityMeta.label}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
        <span className={`rounded-full px-2 py-1 ${statusMeta.tone}`}>{statusMeta.label}</span>
        <span className={overdue ? 'text-red-600' : 'text-[#64748B]'}>{dueLabel}</span>
      </div>
    </article>
  )
}

export function TasksPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createInitialValues, setCreateInitialValues] = useState(null)
  const [optimisticStatuses, setOptimisticStatuses] = useState({})
  const [search, setSearch] = useState('')
  const [activeQuickFilter, setActiveQuickFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeBoardId, setActiveBoardId] = useState('main')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const view = searchParams.get('view') || 'list'
  const taskIdParam = searchParams.get('taskId') || ''

  const tasksQuery = useTasks({ per_page: 100 })
  const mutations = useTaskMutations()
  const tasks = Array.isArray(tasksQuery.data) ? tasksQuery.data : []

  const mergedTasks = useMemo(() => (
    tasks.map((task) => {
      const optimisticStatus = optimisticStatuses[task?.id]
      if (!optimisticStatus) return task
      return { ...task, status: optimisticStatus }
    })
  ), [optimisticStatuses, tasks])

  const metrics = getTaskSummaryMetrics(tasks)
  const statusOptions = useMemo(() => getTaskStatusOptions(tasks), [tasks])
  const typeOptions = useMemo(() => getTaskTypeOptions(tasks, t), [tasks, t])

  const setView = (nextView) => {
    const next = new URLSearchParams(searchParams)
    next.set('view', nextView)
    setSearchParams(next)
  }

  const openTask = (taskId) => {
    const next = new URLSearchParams(searchParams)
    next.set('taskId', String(taskId))
    setSearchParams(next)
  }

  const closeTask = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('taskId')
    setSearchParams(next)
  }

  const handleCreateTask = async (payload) => {
    try {
      await mutations.create.mutateAsync(payload)
      toast.success(t('tasks.page.createdToast'))
      setIsCreateOpen(false)
      setCreateInitialValues(null)
      tasksQuery.refetch()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.page.createFailedToast')))
    }
  }

  const handleStatusChange = async (taskIdRaw, nextStatus) => {
    const taskId = Number(taskIdRaw)
    if (!Number.isFinite(taskId) || !nextStatus) return

    setOptimisticStatuses((current) => ({ ...current, [taskId]: nextStatus }))

    try {
      await mutations.changeStatus.mutateAsync({
        taskId,
        payload: { status: nextStatus },
      })
      toast.success(t('tasks.drawer.statusUpdated'))
    } catch (error) {
      setOptimisticStatuses((current) => {
        const next = { ...current }
        delete next[taskId]
        return next
      })
      toast.error(extractMessage(error, t('tasks.page.statusUpdateFailed')))
    } finally {
      tasksQuery.refetch()
    }
  }

  const handleCreateFromCalendar = (date) => {
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) {
      setCreateInitialValues(null)
      setIsCreateOpen(true)
      return
    }

    const pad = (part) => String(part).padStart(2, '0')
    const dueDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    const dueTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`

    setCreateInitialValues({ due_date: dueDate, due_time: dueTime })
    setIsCreateOpen(true)
  }

  usePageHeader({
    title: t('nav.tasks'),
    icon: ListTodo,
    actions: (
      <button
        type="button"
        onClick={() => {
          setCreateInitialValues(null)
          setIsCreateOpen(true)
        }}
        className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
      >
        <Plus size={14} />
        <span className="font-latin hidden lg:inline">{t('tasks.page.newTask')}</span>
      </button>
    ),
  })

  const visibleTasks = useMemo(() => {
    return mergedTasks.filter((task) => {
      if (!taskMatchesQuery(task, search)) return false

      if (statusFilter !== 'all' && String(task?.status || '').toLowerCase() !== statusFilter) return false
      if (typeFilter !== 'all' && String(task?.type || '').toLowerCase() !== typeFilter) return false

      if (activeQuickFilter === 'today') {
        const due = getTaskDateTime(task)
        if (!due) return false
        const now = new Date()
        return (
          due.getFullYear() === now.getFullYear() &&
          due.getMonth() === now.getMonth() &&
          due.getDate() === now.getDate()
        )
      }

      if (activeQuickFilter === 'overdue') return isTaskOverdue(task)
      if (activeQuickFilter === 'in_progress') return String(task?.status || '').toLowerCase() === 'in_progress'
      if (activeQuickFilter === 'completed') return String(task?.status || '').toLowerCase() === 'completed'
      if (activeQuickFilter === 'urgent') return String(task?.priority || '').toLowerCase() === 'urgent'

      return true
    })
  }, [activeQuickFilter, mergedTasks, search, statusFilter, typeFilter])

  const selectedTask = useMemo(() => (
    visibleTasks.find((task) => String(task?.id) === String(taskIdParam))
    || mergedTasks.find((task) => String(task?.id) === String(taskIdParam))
    || null
  ), [mergedTasks, taskIdParam, visibleTasks])

  const boardItems = [
    { id: 'main', name: t('tasks.page.mainBoard'), count: visibleTasks.length, accent: 'bg-[#E8F9FA] text-[#007A80]' },
    { id: 'sales', name: t('tasks.page.salesTeamBoard'), count: Math.max(0, Math.ceil(visibleTasks.length / 2)), accent: 'bg-[#EEF2FF] text-[#4F46E5]' },
    { id: 'followups', name: t('tasks.page.followUpsBoard'), count: Math.max(0, Math.ceil(visibleTasks.length / 3)), accent: 'bg-[#FFF7ED] text-[#C2410C]' },
  ]

  const filterContent = (
    <>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <SummaryCard title={t('tasks.page.allTasks')} value={metrics.total} active={activeQuickFilter === 'all'} onClick={() => setActiveQuickFilter('all')} />
        <SummaryCard title={t('activities.derivedStates.today')} value={metrics.today} active={activeQuickFilter === 'today'} onClick={() => setActiveQuickFilter('today')} />
        <SummaryCard title={t('tasks.page.overdueFilter')} value={metrics.overdue} active={activeQuickFilter === 'overdue'} onClick={() => setActiveQuickFilter('overdue')} />
        <SummaryCard title={t('activities.status.in_progress')} value={metrics.inProgress} active={activeQuickFilter === 'in_progress'} onClick={() => setActiveQuickFilter('in_progress')} />
        <SummaryCard title={t('tasks.statuses.completed')} value={metrics.completed} active={activeQuickFilter === 'completed'} onClick={() => setActiveQuickFilter('completed')} />
        <SummaryCard title={t('activities.scheduleDialog.priorityOptions.urgent')} value={metrics.urgent} active={activeQuickFilter === 'urgent'} onClick={() => setActiveQuickFilter('urgent')} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="grid gap-1 text-[11px] font-bold text-[#64748B]">
          {t('tasks.page.statusFilterLabel')}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-semibold"
          >
            <option value="all">{t('activities.form.allStatuses')}</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{getTaskStatusMeta(status, t).label}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-[11px] font-bold text-[#64748B]">
          {t('tasks.page.typeFilterLabel')}
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-9 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-semibold"
          >
            <option value="all">{t('tasks.page.allTypes')}</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>{getTaskTypeMeta(type, t).label}</option>
            ))}
          </select>
        </label>
      </div>
    </>
  )

  return (
    <>
      <TasksWorkspace
        sidebar={(
          <TasksWorkspaceSidebar
            boards={boardItems}
            activeSmartView={activeQuickFilter}
            activeBoardId={activeBoardId}
            onSmartViewChange={setActiveQuickFilter}
            onBoardChange={setActiveBoardId}
            onAddBoard={() => setIsCreateOpen(true)}
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
            onViewChange={setView}
            onCreateTask={() => {
              setCreateInitialValues(null)
              setIsCreateOpen(true)
            }}
            showFilters={view !== 'board'}
            filtersContent={view !== 'board' ? filterContent : null}
            extraActions={(
              <WorkflowLauncher context={{ module: 'tasks', entity: 'task' }} variant="outline" size="sm">
                {t('workflow.builder.createAutomation')}
              </WorkflowLauncher>
            )}
          />
        )}
        sidebarCollapsed={sidebarCollapsed}
      >
        <section className="space-y-2">
          {tasksQuery.isLoading && (
            <div className="rounded-xl border border-[#D7EEF0] bg-white p-4 text-sm font-semibold text-[#64748B]">{t('tasks.sidebarPanel.loadingTasks')}</div>
          )}

          {!tasksQuery.isLoading && !visibleTasks.length && (
            <div className="rounded-xl border border-dashed border-[#D7EEF0] bg-white p-4 text-sm font-semibold text-[#64748B]">
              {t('tasks.page.noMatchingTasksFiltered')}
            </div>
          )}

          {!tasksQuery.isLoading && view === 'list' && visibleTasks.map((task) => (
            <button key={task.id || `${task.title}-${task.due_date || ''}`} type="button" className="w-full text-start" onClick={() => openTask(task.id)}>
              <TaskCard task={task} />
            </button>
          ))}

          {!tasksQuery.isLoading && view === 'board' && (
            <TaskBoard
              boardId={activeBoardId}
              tasks={visibleTasks}
              onOpenTask={openTask}
              onQuickComplete={(task) => {
                if (!task?.id) return
                handleStatusChange(task.id, 'completed')
              }}
              onCreateTask={(listId, titleValue, board) => {
                if (!titleValue || !titleValue.trim()) return

                const payload = {
                  title: titleValue.trim(),
                  description: '',
                  type: 'follow_up',
                  priority: 'medium',
                  status: 'pending',
                  visibility: 'shared',
                  taskable_type: 'App\\Models\\Lead',
                  taskable_id: '',
                  due_date: '',
                  due_time: '',
                  users: [],
                  teams: [],
                  attachments: [],
                  board_id: board || activeBoardId,
                  board_list_id: listId,
                }

                mutations.create.mutateAsync(payload).then(() => {
                  toast.success(t('tasks.page.createdToast'))
                  tasksQuery.refetch()
                }).catch((error) => {
                  toast.error(extractMessage(error, t('tasks.page.createFailedToast')))
                })
              }}
              onDeleteTask={(task) => {
                if (!task?.id) return
                mutations.remove.mutateAsync(task.id).then(() => {
                  toast.success(t('tasks.page.deletedToast'))
                  tasksQuery.refetch()
                }).catch((error) => {
                  toast.error(extractMessage(error, t('tasks.page.deleteFailedToast')))
                })
              }}
            />
          )}

          {!tasksQuery.isLoading && view === 'calendar' && (
            <TaskCalendarView
              tasks={visibleTasks}
              onOpenTask={openTask}
              onCreateAt={handleCreateFromCalendar}
            />
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
        taskId={selectedTask?.id || taskIdParam}
        onClose={closeTask}
        onUpdated={tasksQuery.refetch}
        onDeleted={() => {
          closeTask()
          tasksQuery.refetch()
        }}
      />
    </>
  )
}
