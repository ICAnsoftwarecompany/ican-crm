/**
 * One place that turns task form values into the create/update request, and a task back into form
 * values. Used by TaskForm, the To-Do quick add and the calendar's drag-to-reschedule, so every
 * entry point sends the same shape. Pure — tested in taskPayload.test.js.
 */
import { buildTaskablePayload, resolveTaskableAlias } from '../constants/taskableTypes'
import { buildTodoSchedule, DEFAULT_WEEK_START, getTaskPeriod, isTodoPeriod } from './todoPeriods'

export const TASK_FORM_DEFAULTS = {
  title: '',
  description: '',
  type: 'follow_up',
  priority: 'medium',
  visibility: 'shared',
  due_date: '',
  due_time: '',
  period_type: '',
  period_date: '',
  reminder_type: 'system',
  reminder_before: '30',
  reminder_unit: 'minutes',
  taskable_type: '',
  taskable_id: '',
  users: [],
  teams: [],
  attachments: [],
}

function toIdList(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => Number(item?.id ?? item)).filter(Number.isFinite)
}

/** A task from the API → form values (aliases, numeric ids, period when the backend sends it). */
export function taskToFormValues(task = {}) {
  return {
    ...TASK_FORM_DEFAULTS,
    title: task?.title || '',
    description: task?.description || '',
    type: task?.type || 'todo',
    priority: task?.priority || 'medium',
    visibility: task?.visibility || 'shared',
    due_date: task?.due_date || '',
    due_time: task?.due_time || '',
    period_type: getTaskPeriod(task) || '',
    period_date: task?.period_date || '',
    reminder_type: task?.reminder_type || 'system',
    reminder_before: String(task?.reminder_before ?? '30'),
    reminder_unit: task?.reminder_unit || 'minutes',
    taskable_type: resolveTaskableAlias(task?.taskable_type),
    taskable_id: task?.taskable_id ? String(task.taskable_id) : '',
    users: toIdList(task?.users),
    teams: toIdList(task?.teams),
  }
}

/**
 * Form values → request payload.
 * - To-Do with a period: due by the last day of the period, no time, plus `period_type`/`period_date`.
 * - To-Do with no users: assigned to the current user, so it shows on their list.
 * - Link: alias converted for the backend; no link → both taskable fields sent empty.
 */
export function buildTaskPayload(form = {}, { currentUserId, weekStartsOn = DEFAULT_WEEK_START, now = new Date() } = {}) {
  const type = form.type || 'todo'
  const isTodo = type === 'todo'
  const period = isTodo && isTodoPeriod(form.period_type) ? form.period_type : ''
  const schedule = period
    ? buildTodoSchedule(period, form.period_date || now, weekStartsOn)
    : { due_date: form.due_date || '', due_time: form.due_date ? (form.due_time || '') : '' }

  let users = toIdList(form.users)
  const me = Number(currentUserId)
  if (isTodo && !users.length && Number.isFinite(me) && currentUserId !== null && currentUserId !== '') users = [me]

  const payload = {
    title: String(form.title || '').trim(),
    description: String(form.description || '').trim(),
    type,
    priority: form.priority || 'medium',
    visibility: form.visibility || (isTodo ? 'private' : 'shared'),
    due_date: schedule.due_date,
    due_time: schedule.due_time,
    reminder_type: form.reminder_type || 'system',
    reminder_before: form.reminder_before === undefined || form.reminder_before === null ? '' : String(form.reminder_before),
    reminder_unit: form.reminder_unit || 'minutes',
    ...buildTaskablePayload(form.taskable_type, form.taskable_id),
    users,
    teams: toIdList(form.teams),
  }

  if (Array.isArray(form.attachments) && form.attachments.length) payload.attachments = form.attachments

  if (isTodo) {
    payload.period_type = period
    payload.period_date = period ? schedule.period_date : ''
  }

  return payload
}
