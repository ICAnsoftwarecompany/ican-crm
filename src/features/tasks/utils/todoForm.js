/**
 * The To-Do form model. A To-Do only asks for what a to-do needs — a title and *when* — and
 * everything else is optional (notes, priority, a linked customer, a reminder). It is still saved
 * as a task (`type: 'todo'`) through `buildTaskPayload`, so the API and all list rules are shared.
 * Pure — tested in todoForm.test.js.
 */
import { addDays, formatDateInput, isSameDay, toDate } from '../../../shared/utils/dateTime'
import { resolveTaskableAlias } from '../constants/taskableTypes'
import { buildTaskPayload, TASK_FORM_DEFAULTS } from './taskPayload'
import { getTaskPeriod } from './todoPeriods'
import { getTaskDueDate, getTaskDueTime, getTaskUserIds } from './taskMeta'

/** "When" choices, in the order the form shows them. */
export const TODO_WHEN_OPTIONS = ['today', 'tomorrow', 'week', 'month', 'date']

export const TODO_PRIORITIES = ['low', 'medium', 'high', 'urgent']

export const TODO_FORM_DEFAULTS = {
  title: '',
  description: '',
  when: 'today',
  date: '',
  time: '',
  priority: 'medium',
  reminder_type: 'system',
  reminder_before: '30',
  reminder_unit: 'minutes',
  taskable_type: '',
  taskable_id: '',
  taskable_name: '',
  users: [],
}

/** An existing To-Do (from the API) → To-Do form values. */
export function todoToFormValues(task = {}, now = new Date()) {
  const period = getTaskPeriod(task)
  const dueDate = getTaskDueDate(task)
  const due = toDate(dueDate)
  let when = 'date'
  if (period === 'week' || period === 'month') when = period
  else if (period === 'day' && due && isSameDay(due, now)) when = 'today'
  else if (period === 'day' && due && isSameDay(due, addDays(now, 1))) when = 'tomorrow'
  else if (!dueDate) when = 'today'

  return {
    ...TODO_FORM_DEFAULTS,
    title: task?.title || '',
    description: task?.description || '',
    when,
    date: when === 'date' ? dueDate : '',
    time: when === 'date' ? getTaskDueTime(task) : '',
    priority: task?.priority || 'medium',
    reminder_type: task?.reminder_type || 'system',
    reminder_before: task?.reminder_before === undefined || task?.reminder_before === null ? '30' : String(task.reminder_before),
    reminder_unit: task?.reminder_unit || 'minutes',
    taskable_type: resolveTaskableAlias(task?.taskable_type),
    taskable_id: task?.taskable_id ? String(task.taskable_id) : '',
    taskable_name: task?.taskable?.name || '',
    users: getTaskUserIds(task).map(Number).filter(Number.isFinite),
  }
}

/** True when the To-Do has an exact time (only then a reminder makes sense). */
export function todoHasTime(values) {
  return values?.when === 'date' && Boolean(values?.date) && Boolean(values?.time)
}

/**
 * To-Do form values → the task request body.
 * today / tomorrow → a day To-Do on that date · week / month → the current period ·
 * date → that date, at a time when given. The reminder is sent only with a time.
 */
export function buildTodoPayload(values = {}, { currentUserId, now = new Date() } = {}) {
  const when = TODO_WHEN_OPTIONS.includes(values.when) ? values.when : 'today'
  const schedule = {
    today: { period_type: 'day', period_date: formatDateInput(now) },
    tomorrow: { period_type: 'day', period_date: formatDateInput(addDays(now, 1)) },
    week: { period_type: 'week', period_date: formatDateInput(now) },
    month: { period_type: 'month', period_date: formatDateInput(now) },
    date: { period_type: '', due_date: values.date || formatDateInput(now), due_time: values.date ? (values.time || '') : '' },
  }[when]
  const withTime = todoHasTime({ ...values, when })

  return buildTaskPayload({
    ...TASK_FORM_DEFAULTS,
    title: values.title,
    description: values.description,
    type: 'todo',
    priority: values.priority || 'medium',
    visibility: 'private',
    ...schedule,
    reminder_type: withTime ? (values.reminder_type || 'system') : '',
    reminder_before: withTime ? (values.reminder_before ?? '') : '',
    reminder_unit: withTime ? (values.reminder_unit || 'minutes') : '',
    taskable_type: values.taskable_type,
    taskable_id: values.taskable_id,
    users: values.users,
  }, { currentUserId, now })
}
