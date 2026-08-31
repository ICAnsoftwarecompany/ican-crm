import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  ExternalLink,
  ListTodo,
  Loader2,
  RefreshCcw,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { useTaskInfo, useTaskMutations, useTasks } from '../hooks/useTasks'
import {
  canTransitionTask,
  formatTaskDateLabel,
  getTaskAssigneeLabel,
  getTaskDateTime,
  getTaskDescription,
  getTaskPriorityMeta,
  getTaskQuickStatus,
  getTaskQuickStatusIcon,
  getTaskQuickStatusLabel,
  getTaskStatusMeta,
  getTaskSummaryMetrics,
  getTaskTitle,
  getTaskTypeMeta,
  isTaskOverdue,
  taskMatchesQuery,
} from '../utils/taskMeta'

function HeaderActions({ onOpenPage, onClose }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenPage}
        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#00878D] transition-colors hover:bg-[#E8F9FA]"
        title="فتح صفحة المهام"
      >
        <ExternalLink size={13} />
        فتح
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827]"
        title="إغلاق"
      >
        <X size={15} />
      </button>
    </div>
  )
}

function TaskRow({ task, active = false, onClick }) {
  const typeMeta = getTaskTypeMeta(task?.type)
  const priorityMeta = getTaskPriorityMeta(task?.priority)
  const statusMeta = getTaskStatusMeta(task?.status)
  const dueLabel = formatTaskDateLabel(task)
  const overdue = isTaskOverdue(task)
  const TypeIcon = typeMeta.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-xl border p-2 text-start transition-colors',
        active ? 'border-[#7FDDE1] bg-[#F3FDFF]' : 'border-[#E5EEF0] bg-white hover:bg-[#F8FEFF]',
      ].join(' ')}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <TypeIcon size={14} className="shrink-0 text-[#007A80]" />
            <h4 className="truncate text-xs font-black text-[#0F172A]">{getTaskTitle(task)}</h4>
          </div>
          <p className="mt-1 truncate text-[11px] font-semibold text-[#64748B]">{getTaskAssigneeLabel(task)}</p>
        </div>

        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-black ${priorityMeta.className}`}>
          {priorityMeta.label}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#64748B]">
        <span className={`rounded-full px-1.5 py-0.5 ${statusMeta.tone}`}>{statusMeta.label}</span>
        <span className={overdue ? 'text-red-600' : ''}>{dueLabel}</span>
      </div>
    </button>
  )
}

export function TasksSidebarPanel({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const tasksQuery = useTasks({ per_page: 40 })
  const list = Array.isArray(tasksQuery.data) ? tasksQuery.data : []
  const metrics = getTaskSummaryMetrics(list)
  const filteredTasks = useMemo(() => list.filter((task) => taskMatchesQuery(task, query)), [list, query])

  const selectedTask = useMemo(() => (
    filteredTasks.find((task) => String(task?.id) === String(selectedTaskId))
    || list.find((task) => String(task?.id) === String(selectedTaskId))
    || null
  ), [filteredTasks, list, selectedTaskId])

  const selectedTaskInfoQuery = useTaskInfo(selectedTask?.id)
  const taskDetails = selectedTaskInfoQuery.data?.data || selectedTask
  const mutations = useTaskMutations()

  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  const handleOpenPage = () => {
    navigate('/tasks')
    onClose?.()
  }

  const handleMarkRead = async () => {
    if (!taskDetails?.id) return

    try {
      await mutations.markAsRead.mutateAsync(taskDetails.id)
      toast.success('تم تعليم المهمة كمقروءة')
      tasksQuery.refetch()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر تحديث حالة القراءة')
    }
  }

  const handleQuickStatus = async () => {
    if (!taskDetails?.id || !canTransitionTask(taskDetails)) return

    const nextStatus = getTaskQuickStatus(taskDetails)

    try {
      await mutations.changeStatus.mutateAsync({
        taskId: taskDetails.id,
        payload: { status: nextStatus },
      })
      toast.success('تم تحديث حالة المهمة')
      tasksQuery.refetch()
      selectedTaskInfoQuery.refetch()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر تحديث الحالة')
    }
  }

  const renderDetail = () => {
    if (!selectedTask) {
      return (
        <div className="flex h-full min-h-52 items-center justify-center rounded-xl border border-dashed border-[#D7EEF0] bg-[#F8FEFF] text-center text-xs font-semibold text-[#64748B]">
          اختر مهمة من القائمة لعرض التفاصيل.
        </div>
      )
    }

    const typeMeta = getTaskTypeMeta(taskDetails?.type)
    const TypeIcon = typeMeta.icon
    const statusMeta = getTaskStatusMeta(taskDetails?.status)
    const priorityMeta = getTaskPriorityMeta(taskDetails?.priority)
    const dueDate = formatTaskDateLabel(taskDetails)
    const overdue = isTaskOverdue(taskDetails)
    const quickIcon = getTaskQuickStatusIcon(taskDetails)
    const QuickIcon = quickIcon

    return (
      <div className="space-y-3 rounded-xl border border-[#E5EEF0] bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
            <TypeIcon size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-[#0F172A]">{getTaskTitle(taskDetails)}</h3>
            <p className="truncate text-xs font-semibold text-[#64748B]">{typeMeta.label}</p>
          </div>
        </div>

        {getTaskDescription(taskDetails) && (
          <p className="rounded-lg bg-[#F8FEFF] p-2 text-xs leading-5 text-[#334155]">{getTaskDescription(taskDetails)}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <span className={`rounded-lg px-2 py-1 text-center ${statusMeta.tone}`}>{statusMeta.label}</span>
          <span className={`rounded-lg border px-2 py-1 text-center ${priorityMeta.className}`}>{priorityMeta.label}</span>
          <span className={`col-span-2 rounded-lg bg-[#F8FEFF] px-2 py-1 text-center ${overdue ? 'text-red-600' : 'text-[#475569]'}`}>
            {dueDate}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleMarkRead}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-[11px] font-black text-[#007A80]"
          >
            <CheckCircle2 size={13} />
            تعليم كمقروءة
          </button>

          <button
            type="button"
            onClick={handleQuickStatus}
            disabled={!canTransitionTask(taskDetails)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-[11px] font-black text-[#007A80] disabled:opacity-40"
          >
            <QuickIcon size={13} />
            {getTaskQuickStatusLabel(taskDetails)}
          </button>
        </div>
      </div>
    )
  }

  return (
    <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[#DDECEF] bg-white shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
      style={{ transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})` }}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <header className="border-b border-[#E5EEF0] bg-[#F8FEFF] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#00878D]">
                <ListTodo size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-[#111827]">المهام السريعة</h2>
                <p className="truncate text-xs font-semibold text-[#64748B]">إجمالي {metrics.total} • اليوم {metrics.today}</p>
              </div>
            </div>
            <HeaderActions onOpenPage={handleOpenPage} onClose={onClose} />
          </div>
        </header>

        <div className="border-b border-[#EEF2F4] bg-white p-3">
          <label className="relative block">
            <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[#94A3B8]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في المهام..."
              className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] ps-8 pe-3 text-xs font-semibold text-[#0F172A] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
            />
          </label>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-black">
            <span className="rounded-full bg-[#EEF8FF] px-2 py-1 text-[#2563EB]">قيد التنفيذ {metrics.inProgress}</span>
            <span className="rounded-full bg-[#FFF4E5] px-2 py-1 text-[#B45309]">متأخرة {metrics.overdue}</span>
            <span className="rounded-full bg-[#ECFDF3] px-2 py-1 text-[#047857]">مكتملة {metrics.completed}</span>
            <span className="rounded-full bg-[#FEE2E2] px-2 py-1 text-[#B91C1C]">عاجلة {metrics.urgent}</span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1.05fr_1fr]">
          <div className="min-h-0 overflow-y-auto border-b border-[#EEF2F4] p-3 md:border-b-0 md:border-e">
            {tasksQuery.isLoading ? (
              <div className="rounded-xl border border-[#E5EEF0] bg-white p-3 text-center text-xs font-semibold text-[#64748B]">
                <Loader2 size={16} className="mx-auto mb-2 animate-spin text-[#007A80]" />
                جاري تحميل المهام...
              </div>
            ) : filteredTasks.length ? (
              <div className="space-y-2">
                {filteredTasks.slice(0, 30).map((task) => (
                  <TaskRow
                    key={task.id || `${task.title}-${task.due_date || ''}`}
                    task={task}
                    active={String(selectedTaskId) === String(task.id)}
                    onClick={() => setSelectedTaskId(String(task.id || ''))}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D7EEF0] bg-[#F8FEFF] p-3 text-center text-xs font-semibold text-[#64748B]">
                لا توجد مهام مطابقة.
              </div>
            )}

            <button
              type="button"
              onClick={() => tasksQuery.refetch()}
              className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[#D7EEF0] bg-white px-2 text-[11px] font-black text-[#007A80]"
            >
              <RefreshCcw size={13} className={tasksQuery.isFetching ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto p-3">
            {renderDetail()}
          </div>
        </div>
      </div>
    </aside>
  )
}
