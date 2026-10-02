/**
 * Groups for task lists (/tasks list view, header Tasks panel): by when they are due.
 * Pure — tested in taskGroups.test.js.
 */
import { endOfDay, startOfDay } from '../../../shared/utils/dateTime'
import { getTaskDeadline, isTaskClosed } from './taskMeta'

export const TASK_GROUP_ORDER = ['overdue', 'today', 'upcoming', 'undated', 'done']

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 }

function rank(task) {
  return PRIORITY_RANK[String(task?.priority || '').toLowerCase()] ?? 2
}

function byDeadline(left, right) {
  const diff = (getTaskDeadline(left)?.getTime() ?? Infinity) - (getTaskDeadline(right)?.getTime() ?? Infinity)
  return diff || rank(left) - rank(right)
}

/**
 * - `overdue`  open, deadline passed (oldest first)
 * - `today`    open, due later today (by time)
 * - `upcoming` open, due after today (soonest first)
 * - `undated`  open, no due date (by priority)
 * - `done`     completed or cancelled (most recent deadline first)
 */
export function groupTasksByDue(tasks = [], now = new Date()) {
  const groups = { overdue: [], today: [], upcoming: [], undated: [], done: [] }
  const todayEnd = endOfDay(now)
  const todayStart = startOfDay(now)

  ;(Array.isArray(tasks) ? tasks : []).filter(Boolean).forEach((task) => {
    if (isTaskClosed(task)) {
      groups.done.push(task)
      return
    }
    const deadline = getTaskDeadline(task)
    if (!deadline) groups.undated.push(task)
    else if (deadline < now) groups.overdue.push(task)
    else if (deadline <= todayEnd && deadline >= todayStart) groups.today.push(task)
    else groups.upcoming.push(task)
  })

  groups.overdue.sort(byDeadline)
  groups.today.sort(byDeadline)
  groups.upcoming.sort(byDeadline)
  groups.undated.sort((left, right) => rank(left) - rank(right) || Number(right?.id || 0) - Number(left?.id || 0))
  groups.done.sort((left, right) => byDeadline(right, left))
  return groups
}
