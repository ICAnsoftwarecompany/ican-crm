/**
 * Quick-add model for tasks: a title, a kind and a rough "when" become a full task request.
 * Pure — tested in taskQuickAdd.test.js.
 */
import { addDays, formatDateInput } from '../../../shared/utils/dateTime'
import { buildTaskPayload, TASK_FORM_DEFAULTS } from './taskPayload'

export const QUICK_TASK_TYPES = ['follow_up', 'call', 'meeting', 'email']
export const QUICK_TASK_WHEN = ['today', 'tomorrow', 'none']

/** Form values for a quick task — also what "More details" opens the full form with. */
export function quickTaskValues({ title, type = 'follow_up', when = 'today' }, now = new Date()) {
  const dueDate = when === 'today' ? formatDateInput(now) : when === 'tomorrow' ? formatDateInput(addDays(now, 1)) : ''
  return {
    ...TASK_FORM_DEFAULTS,
    title: String(title || '').trim(),
    type: QUICK_TASK_TYPES.includes(type) ? type : 'follow_up',
    visibility: 'shared',
    due_date: dueDate,
    due_time: '',
    reminder_before: '',
  }
}

/** The request body: assigned to me, no link, due today / tomorrow / no date. */
export function buildQuickTaskPayload(input, { currentUserId, now = new Date() } = {}) {
  const values = quickTaskValues(input, now)
  const me = Number(currentUserId)
  return buildTaskPayload({ ...values, users: Number.isFinite(me) && currentUserId !== null ? [me] : [] }, { currentUserId, now })
}
