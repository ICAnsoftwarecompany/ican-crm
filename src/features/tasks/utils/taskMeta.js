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

/** To-Dos (`type: 'todo'`) have their own page (/todo); task lists leave them out. */
export function isTodoTask(task) {
  return getTaskType(task) === 'todo'
}

export function withoutTodos(tasks) {
  return (Array.isArray(tasks) ? tasks : []).filter((task) => !isTodoTask(task))
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

/**
 * `due_date` as "YYYY-MM-DD". The API returns a Laravel date cast ("2026-10-02T00:00:00.000000Z"):
 * only the date part is meant — reading it as a UTC instant would shift it to another day in some
 * time zones, and joining it with the time gave an invalid date (tasks vanished from every list).
 */
export function getTaskDueDate(task) {
  const raw = String(task?.due_date || task?.dueDate || '').trim()
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : raw
}

/**
 * `due_time` as "HH:mm", or '' when the task has no time. The backend stores "00:00:00" when no
 * time was sent, so midnight is read as "no time" (a date-only task, due by the end of that day).
 */
export function getTaskDueTime(task) {
  const raw = String(task?.due_time || task?.dueTime || '').trim()
  const match = raw.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ''
  const value = `${match[1].padStart(2, '0')}:${match[2]}`
  return value === '00:00' ? '' : value
}

export function getTaskDateTime(task) {
  const dueDate = getTaskDueDate(task)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return null
  const [year, month, day] = dueDate.split('-').map(Number)
  const [hours, minutes] = (getTaskDueTime(task) || '00:00').split(':').map(Number)
  const date = new Date(year, month - 1, day, hours, minutes)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Assignees as `[{ id, name }]` (names when the API includes the user objects). */
export function getTaskAssignees(task) {
  if (!task) return []
  const byId = new Map()
  const add = (user, fallbackId) => {
    const id = user?.id ?? user?.user_id ?? fallbackId
    if (id === undefined || id === null || id === '') return
    const key = String(id)
    const name = user?.name || user?.username || byId.get(key)?.name || ''
    byId.set(key, { id: key, name })
  }
  ;(Array.isArray(task.users) ? task.users : []).forEach((user) => (typeof user === 'object' ? add(user) : add(null, user)))
  ;(Array.isArray(task.assignments) ? task.assignments : []).forEach((item) => add(item?.user, item?.user_id))
  if (task.user && typeof task.user === 'object') add(task.user)
  return [...byId.values()]
}

/**
 * Ids of the users a task is assigned to, whatever shape the API used: `users[]`, `assignments[]`
 * (`{ user_id, user }` — the current tasks API), or a single `user` / `assigned_to` / `user_id`.
 */
export function getTaskUserIds(task) {
  if (!task) return []
  const ids = []
  const push = (value) => {
    const id = value !== null && typeof value === 'object' ? (value.id ?? value.user_id ?? value.userId) : value
    if (id !== undefined && id !== null && id !== '') ids.push(String(id))
  }
  ;(Array.isArray(task.users) ? task.users : []).forEach(push)
  ;(Array.isArray(task.assignments) ? task.assignments : []).forEach((item) => push(item?.user_id ?? item?.user))
  ;[task.user, task.assigned_user, task.assignedTo, task.assigned_to, task.user_id].forEach((value) => {
    if (value !== undefined && value !== null && value !== '') push(value)
  })
  return [...new Set(ids)]
}

/**
 * The moment a task is late after. A task with a date but no time (a To-Do "by Thursday") is due
 * by the end of that day, not at 00:00 — otherwise it would be overdue from the first minute.
 */
export function getTaskDeadline(task) {
  const due = getTaskDateTime(task)
  if (!due) return null
  if (getTaskDueTime(task)) return due
  const end = new Date(due)
  end.setHours(23, 59, 59, 999)
  return end
}

export function isTaskCompleted(task) {
  return String(task?.status || '').toLowerCase() === 'completed'
}

export function isTaskClosed(task) {
  const status = String(task?.status || '').toLowerCase()
  return status === 'completed' || status === 'cancelled'
}

export function isTaskOverdue(task, now = new Date()) {
  const deadline = getTaskDeadline(task)
  if (!deadline) return false
  return deadline.getTime() < now.getTime() && !isTaskClosed(task)
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

  const users = Array.isArray(task?.users) && task.users.length
    ? task.users
    : (Array.isArray(task?.assignments) ? task.assignments.map((item) => item?.user || { id: item?.user_id }) : [])
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
