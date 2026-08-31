import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, KanbanSquare, ListTodo, Plus, Search, Table2 } from 'lucide-react'
import { toast } from 'sonner'

import { TaskCalendarView } from '../../features/tasks/components/TaskCalendarView'
import { TaskDrawer } from '../../features/tasks/components/TaskDrawer'
import { TaskFormDialog } from '../../features/tasks/components/TaskFormDialog'
import { TaskKanbanView } from '../../features/tasks/components/TaskKanbanView'
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
  const typeMeta = getTaskTypeMeta(task?.type)
  const priorityMeta = getTaskPriorityMeta(task?.priority)
  const statusMeta = getTaskStatusMeta(task?.status)
  const overdue = isTaskOverdue(task)
  const due = getTaskDateTime(task)
  const dueLabel = due
    ? due.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
    : 'بدون موعد'
  const TypeIcon = typeMeta.icon

  return (
    <article className="rounded-xl border border-[#D7EEF0] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <TypeIcon size={14} className="shrink-0 text-[#007A80]" />
            <h3 className="truncate text-sm font-black text-[#0F172A]">{getTaskTitle(task)}</h3>
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

function ViewSwitcher({ value, onChange }) {
  const options = [
    { id: 'list', label: 'List', icon: Table2 },
    { id: 'board', label: 'Board', icon: KanbanSquare },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ]

  return (
    <div className="inline-flex rounded-lg border border-[#D7EEF0] bg-white p-1">
      {options.map((option) => {
        const Icon = option.icon
        const active = value === option.id

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              'inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-black transition-colors',
              active
                ? 'bg-[#E8F9FA] text-[#007A80]'
                : 'text-[#64748B] hover:bg-[#F8FEFF]',
            ].join(' ')}
          >
            <Icon size={13} />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createInitialValues, setCreateInitialValues] = useState(null)
  const [optimisticStatuses, setOptimisticStatuses] = useState({})
  const [search, setSearch] = useState('')
  const [activeQuickFilter, setActiveQuickFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

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
  const typeOptions = useMemo(() => getTaskTypeOptions(tasks), [tasks])

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
      toast.success('تم إنشاء المهمة')
      setIsCreateOpen(false)
      setCreateInitialValues(null)
      tasksQuery.refetch()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر إنشاء المهمة'))
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
      toast.success('تم تحديث حالة المهمة')
    } catch (error) {
      setOptimisticStatuses((current) => {
        const next = { ...current }
        delete next[taskId]
        return next
      })
      toast.error(extractMessage(error, 'تعذر تحديث حالة المهمة'))
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
    title: 'المهام',
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
        <span className="font-latin hidden lg:inline">New Task</span>
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

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D7EEF0] bg-[#F8FEFF] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-black text-[#0F172A]">إدارة المهام</h1>
            <p className="text-xs font-semibold text-[#64748B]">متابعة مهام الفريق، المواعيد، الأولويات، والتنبيهات.</p>
          </div>
          <label className="relative w-full max-w-xs">
            <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="بحث بالعنوان أو الوصف"
              className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-white ps-8 pe-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
            />
          </label>

          <ViewSwitcher value={view} onChange={setView} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <SummaryCard title="كل المهام" value={metrics.total} active={activeQuickFilter === 'all'} onClick={() => setActiveQuickFilter('all')} />
          <SummaryCard title="اليوم" value={metrics.today} active={activeQuickFilter === 'today'} onClick={() => setActiveQuickFilter('today')} />
          <SummaryCard title="متأخرة" value={metrics.overdue} active={activeQuickFilter === 'overdue'} onClick={() => setActiveQuickFilter('overdue')} />
          <SummaryCard title="قيد التنفيذ" value={metrics.inProgress} active={activeQuickFilter === 'in_progress'} onClick={() => setActiveQuickFilter('in_progress')} />
          <SummaryCard title="مكتملة" value={metrics.completed} active={activeQuickFilter === 'completed'} onClick={() => setActiveQuickFilter('completed')} />
          <SummaryCard title="عاجلة" value={metrics.urgent} active={activeQuickFilter === 'urgent'} onClick={() => setActiveQuickFilter('urgent')} />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-[11px] font-bold text-[#64748B]">
            فلتر الحالة
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-9 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-semibold"
            >
              <option value="all">كل الحالات</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{getTaskStatusMeta(status).label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-[11px] font-bold text-[#64748B]">
            فلتر النوع
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-9 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-semibold"
            >
              <option value="all">كل الأنواع</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>{getTaskTypeMeta(type).label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-2">
        {tasksQuery.isLoading && (
          <div className="rounded-xl border border-[#D7EEF0] bg-white p-4 text-sm font-semibold text-[#64748B]">جاري تحميل المهام...</div>
        )}

        {!tasksQuery.isLoading && !visibleTasks.length && (
          <div className="rounded-xl border border-dashed border-[#D7EEF0] bg-white p-4 text-sm font-semibold text-[#64748B]">
            لا توجد مهام مطابقة للفلاتر الحالية.
          </div>
        )}

        {!tasksQuery.isLoading && view === 'list' && visibleTasks.map((task) => (
          <button key={task.id || `${task.title}-${task.due_date || ''}`} type="button" className="w-full text-start" onClick={() => openTask(task.id)}>
            <TaskCard task={task} />
          </button>
        ))}

        {!tasksQuery.isLoading && view === 'board' && (
          <TaskKanbanView
            tasks={visibleTasks}
            onOpenTask={openTask}
            onStatusChange={handleStatusChange}
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

      <TaskFormDialog
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
          setCreateInitialValues(null)
        }}
        onSubmit={handleCreateTask}
        isSaving={mutations.create.isPending}
        initialValues={createInitialValues}
        title="إنشاء مهمة جديدة"
        description="حدد بيانات المهمة الأساسية والربط المطلوب."
        submitLabel="إنشاء المهمة"
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
    </div>
  )
}
