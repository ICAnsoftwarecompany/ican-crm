import i18n from 'i18next'

export const LEAD_TASKABLE_TYPE = 'App\\Models\\Lead'

export const TASK_TYPES = [
  { value: 'follow_up', get label() { return i18n.t('customers.tasksTab.types.follow_up') } },
  { value: 'call', get label() { return i18n.t('customers.tasksTab.types.call') } },
  { value: 'email', get label() { return i18n.t('customers.tasksTab.types.email') } },
  { value: 'meeting', get label() { return i18n.t('customers.tasksTab.types.meeting') } },
  { value: 'todo', get label() { return i18n.t('customers.tasksTab.types.todo') } },
]

export const TASK_PRIORITIES = [
  { value: 'low', get label() { return i18n.t('customers.tasksTab.priorities.low') }, className: 'bg-slate-50 text-slate-600 border-slate-200' },
  { value: 'medium', get label() { return i18n.t('customers.tasksTab.priorities.medium') }, className: 'bg-blue-50 text-blue-700 border-blue-100' },
  { value: 'high', get label() { return i18n.t('customers.tasksTab.priorities.high') }, className: 'bg-amber-50 text-amber-700 border-amber-100' },
  { value: 'urgent', get label() { return i18n.t('customers.tasksTab.priorities.urgent') }, className: 'bg-red-50 text-red-700 border-red-100' },
]

export const TASK_STATUSES = {
  pending: 'customers.tasksTab.statuses.pending',
  in_progress: 'customers.tasksTab.statuses.in_progress',
  completed: 'customers.tasksTab.statuses.completed',
  cancelled: 'customers.tasksTab.statuses.cancelled',
}

export function getLeadTaskableId(customer) {
  return customer?.lead?.id ?? customer?.lead_id ?? customer?.id
}

export function getTaskTitle(task) {
  return task?.title || task?.name || i18n.t('customers.tasksTab.untitled')
}

export function getTaskDescription(task) {
  return task?.description || task?.desc || task?.note || ''
}

export function getTaskTypeLabel(type) {
  return TASK_TYPES.find((item) => item.value === type)?.label || type || i18n.t('customers.tasksTab.types.todo')
}

export function getTaskPriorityMeta(priority) {
  return TASK_PRIORITIES.find((item) => item.value === priority) || TASK_PRIORITIES[1]
}

export function getTaskStatusLabel(status) {
  return TASK_STATUSES[status] ? i18n.t(TASK_STATUSES[status]) : status || i18n.t('customers.activityTimeline.sources.unspecified')
}

export function getTaskDueDateTime(task) {
  const dueDate = task?.due_date || task?.dueDate
  const dueTime = task?.due_time || task?.dueTime
  if (!dueDate && !dueTime) return ''
  return [dueDate, dueTime].filter(Boolean).join(' ')
}

export function taskBelongsToLead(task, leadId) {
  if (!leadId) return true

  const possibleIds = [
    task?.taskable_id,
    task?.taskable?.id,
    task?.lead_id,
    task?.lead?.id,
  ].filter((value) => value !== undefined && value !== null && value !== '')

  if (!possibleIds.length) return true
  return possibleIds.some((value) => String(value) === String(leadId))
}
