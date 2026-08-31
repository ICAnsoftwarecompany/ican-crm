export const LEAD_TASKABLE_TYPE = 'App\\Models\\Lead'

export const TASK_TYPES = [
  { value: 'follow_up', label: 'متابعة' },
  { value: 'call', label: 'مكالمة' },
  { value: 'email', label: 'بريد' },
  { value: 'meeting', label: 'اجتماع' },
  { value: 'todo', label: 'مهمة' },
]

export const TASK_PRIORITIES = [
  { value: 'low', label: 'منخفضة', className: 'bg-slate-50 text-slate-600 border-slate-200' },
  { value: 'medium', label: 'متوسطة', className: 'bg-blue-50 text-blue-700 border-blue-100' },
  { value: 'high', label: 'عالية', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  { value: 'urgent', label: 'عاجلة', className: 'bg-red-50 text-red-700 border-red-100' },
]

export const TASK_STATUSES = {
  pending: 'قيد الانتظار',
  in_progress: 'جاري العمل',
  completed: 'مكتملة',
  cancelled: 'ملغاة',
}

export function getLeadTaskableId(customer) {
  return customer?.lead?.id ?? customer?.lead_id ?? customer?.id
}

export function getTaskTitle(task) {
  return task?.title || task?.name || 'مهمة بدون عنوان'
}

export function getTaskDescription(task) {
  return task?.description || task?.desc || task?.note || ''
}

export function getTaskTypeLabel(type) {
  return TASK_TYPES.find((item) => item.value === type)?.label || type || 'مهمة'
}

export function getTaskPriorityMeta(priority) {
  return TASK_PRIORITIES.find((item) => item.value === priority) || TASK_PRIORITIES[1]
}

export function getTaskStatusLabel(status) {
  return TASK_STATUSES[status] || status || 'غير محدد'
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
