import { CalendarClock, CheckCircle2, ClipboardCheck, Mail, PhoneCall, RefreshCcw } from 'lucide-react'

export function getTaskTypeMetaMap(t) {
  return {
    call: { label: t('activities.type.call'), icon: PhoneCall },
    email: { label: t('tasks.types.email'), icon: Mail },
    meeting: { label: t('activities.type.meeting'), icon: CalendarClock },
    follow_up: { label: t('activities.lifecycleActions.followUp'), icon: RefreshCcw },
    todo: { label: t('tasks.types.todo'), icon: ClipboardCheck },
  }
}

export function getTaskPriorityMetaMap(t) {
  return {
    low: { label: t('activities.scheduleDialog.priorityOptions.low'), className: 'bg-slate-50 text-slate-600 border-slate-200' },
    medium: { label: t('activities.scheduleDialog.priorityOptions.medium'), className: 'bg-blue-50 text-blue-700 border-blue-100' },
    high: { label: t('activities.scheduleDialog.priorityOptions.high'), className: 'bg-amber-50 text-amber-700 border-amber-100' },
    urgent: { label: t('activities.scheduleDialog.priorityOptions.urgent'), className: 'bg-red-50 text-red-700 border-red-100' },
  }
}

export function getTaskStatusMetaMap(t) {
  return {
    pending: { label: t('tasks.statuses.pending'), tone: 'bg-slate-100 text-slate-700' },
    in_progress: { label: t('tasks.statuses.in_progress'), tone: 'bg-blue-100 text-blue-700' },
    completed: { label: t('tasks.statuses.completed'), tone: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: t('tasks.statuses.cancelled'), tone: 'bg-zinc-200 text-zinc-700' },
  }
}

export const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']

export function getTaskTitle(task, t) {
  return task?.title || task?.name || (t ? t('tasks.fallback.untitledTask') : 'مهمة بدون عنوان')
}

export function getTaskDescription(task) {
  return task?.description || task?.desc || task?.note || ''
}

export function getTaskType(task) {
  return String(task?.type || 'todo').toLowerCase()
}

export function getTaskTypeMeta(type, t) {
  const map = getTaskTypeMetaMap(t)
  return map[String(type || '').toLowerCase()] || { label: type || t('tasks.types.todo'), icon: ClipboardCheck }
}

export function getTaskPriorityMeta(priority, t) {
  const map = getTaskPriorityMetaMap(t)
  return map[String(priority || '').toLowerCase()] || map.medium
}

export function getTaskStatusMeta(status, t) {
  const map = getTaskStatusMetaMap(t)
  return map[String(status || '').toLowerCase()] || { label: status || t('activities.preMeetingReport.options.unspecified'), tone: 'bg-slate-100 text-slate-700' }
}

export function getTaskDueDate(task) {
  return task?.due_date || task?.dueDate || ''
}

export function getTaskDueTime(task) {
  return task?.due_time || task?.dueTime || ''
}

export function getTaskDateTime(task) {
  const dueDate = getTaskDueDate(task)
  const dueTime = getTaskDueTime(task)
  if (!dueDate && !dueTime) return null

  const value = [dueDate, dueTime || '00:00'].join(' ').trim()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isTaskCompleted(task) {
  return String(task?.status || '').toLowerCase() === 'completed'
}

export function isTaskOverdue(task, now = new Date()) {
  const due = getTaskDateTime(task)
  if (!due) return false
  return due.getTime() < now.getTime() && !isTaskCompleted(task)
}

export function formatTaskDateLabel(task, locale, t) {
  const due = getTaskDateTime(task)
  if (!due) return t ? t('tasks.fallback.noDueDate') : 'بدون موعد'

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const sameDay = (a, b) => (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )

  const time = due.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true })

  if (!t) {
    if (sameDay(due, today)) return `اليوم • ${time}`
    if (sameDay(due, tomorrow)) return `غدًا • ${time}`
    const dateLabel = due.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })
    return `${dateLabel} • ${time}`
  }

  if (sameDay(due, today)) return t('tasks.dateLabels.atTime', { day: t('activities.derivedStates.today'), time })
  if (sameDay(due, tomorrow)) return t('tasks.dateLabels.atTime', { day: t('tasks.dateLabels.tomorrow'), time })

  const dateLabel = due.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })
  return t('tasks.dateLabels.atTime', { day: dateLabel, time })
}

export function getTaskUnread(task) {
  if (typeof task?.is_read === 'boolean') return !task.is_read
  if (task?.read_at) return false
  if (task?.readAt) return false
  return false
}

export function getTaskAssigneeLabel(task, t) {
  const user = task?.user || task?.assigned_user || task?.assignedTo
  const username = user?.name || user?.username
  if (username) return username

  const users = Array.isArray(task?.users) ? task.users : []
  if (users.length === 1) return users[0]?.name || users[0]?.username || (t ? t('tasks.fallback.oneUser') : 'مستخدم واحد')
  if (users.length > 1) return t ? t('tasks.fallback.multipleUsers', { count: users.length }) : `${users.length} مستخدمين`

  return t ? t('tasks.fallback.unassigned') : 'غير مسند'
}

export function getTaskSummaryMetrics(tasks = []) {
  const now = new Date()
  const isToday = (date) => {
    if (!date) return false
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    )
  }

  return tasks.reduce((acc, task) => {
    const status = String(task?.status || '').toLowerCase()
    const priority = String(task?.priority || '').toLowerCase()
    const due = getTaskDateTime(task)

    acc.total += 1
    if (isToday(due)) acc.today += 1
    if (isTaskOverdue(task, now)) acc.overdue += 1
    if (status === 'in_progress') acc.inProgress += 1
    if (status === 'completed') acc.completed += 1
    if (priority === 'urgent') acc.urgent += 1
    if (getTaskUnread(task)) acc.unread += 1

    return acc
  }, {
    total: 0,
    today: 0,
    overdue: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0,
    unread: 0,
  })
}

export function taskMatchesQuery(task, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return true

  const haystack = [
    getTaskTitle(task),
    getTaskDescription(task),
    task?.type,
    task?.status,
    task?.priority,
  ].join(' ').toLowerCase()

  return haystack.includes(q)
}

export function getTaskStatusOptions(tasks = []) {
  const set = new Set(tasks.map((task) => String(task?.status || '').toLowerCase()).filter(Boolean))
  if (!set.size) return TASK_STATUSES
  return Array.from(set)
}

export function getTaskTypeOptions(tasks = [], t) {
  const set = new Set(tasks.map((task) => String(task?.type || '').toLowerCase()).filter(Boolean))
  if (!set.size) return Object.keys(getTaskTypeMetaMap(t))
  return Array.from(set)
}

export function getTaskPriorityOptions(tasks = [], t) {
  const set = new Set(tasks.map((task) => String(task?.priority || '').toLowerCase()).filter(Boolean))
  if (!set.size) return Object.keys(getTaskPriorityMetaMap(t))
  return Array.from(set)
}

export function canTransitionTask(task) {
  const status = String(task?.status || '').toLowerCase()
  return status !== 'completed' && status !== 'cancelled'
}

export function getTaskQuickStatus(task) {
  if (String(task?.status || '').toLowerCase() === 'pending') return 'in_progress'
  if (String(task?.status || '').toLowerCase() === 'in_progress') return 'completed'
  return 'in_progress'
}

export function getTaskQuickStatusLabel(task, t) {
  if (String(task?.status || '').toLowerCase() === 'pending') return t('tasks.quickStatus.start')
  if (String(task?.status || '').toLowerCase() === 'in_progress') return t('tasks.quickStatus.complete')
  return t('tasks.quickStatus.markInProgress')
}

export function getTaskQuickStatusIcon(task) {
  if (String(task?.status || '').toLowerCase() === 'pending') return RefreshCcw
  if (String(task?.status || '').toLowerCase() === 'in_progress') return CheckCircle2
  return RefreshCcw
}
