import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenPage}
        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-black text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent-soft)]"
        title={t('tasks.sidebarPanel.openPage')}
      >
        <ExternalLink size={13} />
        {t('tasks.sidebarPanel.openButton')}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        title={t('tasks.sidebarPanel.close')}
      >
        <X size={15} />
      </button>
    </div>
  )
}

function TaskRow({ task, active = false, onClick }) {
  const { t, i18n } = useTranslation()
  const typeMeta = getTaskTypeMeta(task?.type, t)
  const priorityMeta = getTaskPriorityMeta(task?.priority, t)
  const statusMeta = getTaskStatusMeta(task?.status, t)
  const dueLabel = formatTaskDateLabel(task, i18n.language, t)
  const overdue = isTaskOverdue(task)
  const TypeIcon = typeMeta.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-xl border p-2 text-start transition-colors',
        active ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]',
      ].join(' ')}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <TypeIcon size={14} className="shrink-0 text-[var(--brand-accent)]" />
            <h4 className="truncate text-xs font-black text-[var(--text)]">{getTaskTitle(task, t)}</h4>
          </div>
          <p className="mt-1 truncate text-[11px] font-semibold text-[var(--text-muted)]">{getTaskAssigneeLabel(task, t)}</p>
        </div>

        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-black ${priorityMeta.className}`}>
          {priorityMeta.label}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)]">
        <span className={`rounded-full px-1.5 py-0.5 ${statusMeta.tone}`}>{statusMeta.label}</span>
        <span className={overdue ? 'text-red-600' : ''}>{dueLabel}</span>
      </div>
    </button>
  )
}

export function TasksSidebarPanel({ open, onClose }) {
  const { t, i18n } = useTranslation()
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
      toast.success(t('tasks.drawer.markedRead'))
      tasksQuery.refetch()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || t('tasks.sidebarPanel.markReadFailed'))
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
      toast.success(t('tasks.drawer.statusUpdated'))
      tasksQuery.refetch()
      selectedTaskInfoQuery.refetch()
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || t('tasks.sidebarPanel.statusUpdateFailed'))
    }
  }

  const renderDetail = () => {
    if (!selectedTask) {
      return (
        <div className="flex h-full min-h-52 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] text-center text-xs font-semibold text-[var(--text-muted)]">
          {t('tasks.sidebarPanel.selectTaskHint')}
        </div>
      )
    }

    const typeMeta = getTaskTypeMeta(taskDetails?.type, t)
    const TypeIcon = typeMeta.icon
    const statusMeta = getTaskStatusMeta(taskDetails?.status, t)
    const priorityMeta = getTaskPriorityMeta(taskDetails?.priority, t)
    const dueDate = formatTaskDateLabel(taskDetails, i18n.language, t)
    const overdue = isTaskOverdue(taskDetails)
    const quickIcon = getTaskQuickStatusIcon(taskDetails)
    const QuickIcon = quickIcon

    return (
      <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
            <TypeIcon size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-[var(--text)]">{getTaskTitle(taskDetails, t)}</h3>
            <p className="truncate text-xs font-semibold text-[var(--text-muted)]">{typeMeta.label}</p>
          </div>
        </div>

        {getTaskDescription(taskDetails) && (
          <p className="rounded-lg bg-[var(--surface-2)] p-2 text-xs leading-5 text-[var(--text)]">{getTaskDescription(taskDetails)}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <span className={`rounded-lg px-2 py-1 text-center ${statusMeta.tone}`}>{statusMeta.label}</span>
          <span className={`rounded-lg border px-2 py-1 text-center ${priorityMeta.className}`}>{priorityMeta.label}</span>
          <span className={`col-span-2 rounded-lg bg-[var(--surface-2)] px-2 py-1 text-center ${overdue ? 'text-red-600' : 'text-[var(--text-muted)]'}`}>
            {dueDate}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleMarkRead}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-black text-[var(--brand-accent)]"
          >
            <CheckCircle2 size={13} />
            {t('tasks.drawer.markAsRead')}
          </button>

          <button
            type="button"
            onClick={handleQuickStatus}
            disabled={!canTransitionTask(taskDetails)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-black text-[var(--brand-accent)] disabled:opacity-40"
          >
            <QuickIcon size={13} />
            {getTaskQuickStatusLabel(taskDetails, t)}
          </button>
        </div>
      </div>
    )
  }

  return (
    <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[var(--border)] bg-[var(--surface)] shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
      style={{ transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})` }}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <header className="border-b border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <ListTodo size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-[var(--text)]">{t('tasks.sidebarPanel.title')}</h2>
                <p className="truncate text-xs font-semibold text-[var(--text-muted)]">{t('tasks.sidebarPanel.totalTodaySummary', { total: metrics.total, today: metrics.today })}</p>
              </div>
            </div>
            <HeaderActions onOpenPage={handleOpenPage} onClose={onClose} />
          </div>
        </header>

        <div className="border-b border-[var(--border)] bg-[var(--surface)] p-3">
          <label className="relative block">
            <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('tasks.sidebarPanel.searchPlaceholder')}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] ps-8 pe-3 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
            />
          </label>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-black">
            <span className="rounded-full bg-[#EEF8FF] px-2 dark:bg-[#172554] dark:text-[#93c5fd] py-1 text-[#2563EB]">{t('tasks.sidebarPanel.inProgressChip', { count: metrics.inProgress })}</span>
            <span className="rounded-full bg-[#FFF4E5] px-2 dark:bg-[#451a03] dark:text-[#fdba74] py-1 text-[#B45309]">{t('tasks.sidebarPanel.overdueChip', { count: metrics.overdue })}</span>
            <span className="rounded-full bg-[#ECFDF3] px-2 dark:bg-[#052e16] dark:text-[#86efac] py-1 text-[#047857]">{t('tasks.sidebarPanel.completedChip', { count: metrics.completed })}</span>
            <span className="rounded-full bg-[#FEE2E2] px-2 dark:bg-[#450a0a] dark:text-[#fca5a5] py-1 text-[#B91C1C]">{t('tasks.sidebarPanel.urgentChip', { count: metrics.urgent })}</span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1.05fr_1fr]">
          <div className="min-h-0 overflow-y-auto border-b border-[var(--border)] p-3 md:border-b-0 md:border-e">
            {tasksQuery.isLoading ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-center text-xs font-semibold text-[var(--text-muted)]">
                <Loader2 size={16} className="mx-auto mb-2 animate-spin text-[var(--brand-accent)]" />
                {t('tasks.sidebarPanel.loadingTasks')}
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
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-3 text-center text-xs font-semibold text-[var(--text-muted)]">
                {t('tasks.sidebarPanel.noMatchingTasks')}
              </div>
            )}

            <button
              type="button"
              onClick={() => tasksQuery.refetch()}
              className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-black text-[var(--brand-accent)]"
            >
              <RefreshCcw size={13} className={tasksQuery.isFetching ? 'animate-spin' : ''} />
              {t('tasks.sidebarPanel.refresh')}
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
