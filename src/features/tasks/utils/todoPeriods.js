/**
 * To-Do periods and list rules. Pure functions (no React, no i18n, no API) — every rule about
 * which task shows in "Today / This week / This month / Overdue" lives here and is tested.
 *
 * A To-Do is a normal task (`type: 'todo'`) that may belong to a period instead of an exact time.
 * The backend does not store periods yet, so a period To-Do is saved with `due_date` = the last day
 * of the period and no `due_time` ("by the end of this week"), plus `period_type` / `period_date`
 * for when the backend adds them. Every list below works from `due_date` alone; `period_type` only
 * adds the "still open in this period" group once the backend returns it.
 */
import { addDays, endOfDay, endOfMonth, formatDateInput, startOfDay, startOfMonth, startOfWeek, toDate } from '../../../shared/utils/dateTime'
import { getTaskDateTime, getTaskDeadline, getTaskDueTime, isTaskClosed, isTaskCompleted } from './taskMeta'

export const TODO_PERIODS = ['day', 'week', 'month']
export const TODO_VIEWS = ['today', 'week', 'month', 'overdue']

/** The period a view creates To-Dos in (quick add). `overdue` has none. */
export const VIEW_PERIOD = { today: 'day', week: 'week', month: 'month' }

export const DEFAULT_WEEK_START = 6 // Saturday (Sun–Thu work week), same as the calendar for 'ar'

export function isTodoPeriod(value) {
  return TODO_PERIODS.includes(value)
}

/** `{ start, end }` (Dates, inclusive) of the period containing `date`. */
export function getPeriodRange(period, date = new Date(), weekStartsOn = DEFAULT_WEEK_START) {
  const base = toDate(date) || new Date()
  if (period === 'week') {
    const start = startOfWeek(base, weekStartsOn)
    return { start, end: endOfDay(addDays(start, 6)) }
  }
  if (period === 'month') return { start: startOfMonth(base), end: endOfMonth(base) }
  return { start: startOfDay(base), end: endOfDay(base) }
}

/**
 * Schedule fields for a To-Do in a period: due by the last day of the period, no time.
 * `period_date` is normalized to the first day of the period.
 */
export function buildTodoSchedule(period, date = new Date(), weekStartsOn = DEFAULT_WEEK_START) {
  if (!isTodoPeriod(period)) return null
  const { start, end } = getPeriodRange(period, date, weekStartsOn)
  return {
    due_date: formatDateInput(end),
    due_time: '',
    period_type: period,
    period_date: formatDateInput(start),
  }
}

/** The task's period when the backend returns one, otherwise null. */
export function getTaskPeriod(task) {
  const value = String(task?.period_type || task?.periodType || '').toLowerCase()
  return isTodoPeriod(value) ? value : null
}

function inRange(date, range) {
  return Boolean(date) && date.getTime() >= range.start.getTime() && date.getTime() <= range.end.getTime()
}

/** Due inside the range (by its deadline), or — when the backend sends it — its period starts inside it. */
export function isTaskInRange(task, range) {
  if (inRange(getTaskDeadline(task), range)) return true
  const periodDate = toDate(task?.period_date || task?.periodDate)
  return Boolean(getTaskPeriod(task)) && inRange(periodDate, range)
}

/** An open period To-Do whose period contains `now` (shown in "Today" until it is done). */
export function isOpenInCurrentPeriod(task, now = new Date(), weekStartsOn = DEFAULT_WEEK_START) {
  const period = getTaskPeriod(task)
  if (!period || period === 'day' || isTaskClosed(task)) return false
  const range = getPeriodRange(period, now, weekStartsOn)
  return isTaskInRange(task, range)
}

function byDeadline(left, right) {
  return (getTaskDeadline(left)?.getTime() ?? Infinity) - (getTaskDeadline(right)?.getTime() ?? Infinity)
}

const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 }

function byPositionThenPriority(left, right) {
  const leftPos = Number(left?.position ?? Infinity)
  const rightPos = Number(right?.position ?? Infinity)
  if (leftPos !== rightPos) return leftPos - rightPos
  const rank = (task) => PRIORITY_RANK[String(task?.priority || '').toLowerCase()] ?? 2
  if (rank(left) !== rank(right)) return rank(left) - rank(right)
  return Number(left?.id || 0) - Number(right?.id || 0)
}

/**
 * Groups for a To-Do view:
 * - `overdue`  open, deadline passed (in "today" before the day starts; the whole list in "overdue")
 * - `timed`    open, due inside the view's range at a set time — by time
 * - `untimed`  open, due inside the range with no time (period To-Dos) — by position, then priority
 * - `carried`  "today" only: open week/month To-Dos of the current period not already listed
 * - `done`     completed inside the range
 */
export function groupTodoItems(tasks = [], view = 'today', now = new Date(), weekStartsOn = DEFAULT_WEEK_START) {
  const empty = { overdue: [], timed: [], untimed: [], carried: [], done: [] }
  const list = Array.isArray(tasks) ? tasks.filter(Boolean) : []

  if (view === 'overdue') {
    const overdue = list.filter((task) => !isTaskClosed(task) && getTaskDeadline(task) && getTaskDeadline(task) < now)
    return { ...empty, overdue: overdue.sort(byDeadline) }
  }

  const range = getPeriodRange(VIEW_PERIOD[view] || 'day', now, weekStartsOn)
  const groups = { overdue: [], timed: [], untimed: [], carried: [], done: [] }
  const listed = new Set()

  list.forEach((task) => {
    const deadline = getTaskDeadline(task)
    if (isTaskClosed(task)) {
      if (isTaskCompleted(task) && isTaskInRange(task, range)) groups.done.push(task)
      return
    }
    if (view === 'today' && deadline && deadline < range.start) {
      groups.overdue.push(task)
      listed.add(task)
      return
    }
    if (!isTaskInRange(task, range)) return
    listed.add(task)
    if (getTaskDueTime(task) && getTaskDateTime(task)) groups.timed.push(task)
    else groups.untimed.push(task)
  })

  if (view === 'today') {
    groups.carried = list.filter((task) => !listed.has(task) && isOpenInCurrentPeriod(task, now, weekStartsOn))
  }

  groups.overdue.sort(byDeadline)
  groups.timed.sort(byDeadline)
  groups.untimed.sort(byPositionThenPriority)
  groups.carried.sort(byPositionThenPriority)
  return groups
}

export function countOpenTodoItems(groups) {
  if (!groups) return 0
  return groups.overdue.length + groups.timed.length + groups.untimed.length + groups.carried.length
}

function sameId(left, right) {
  if (left === undefined || left === null || left === '') return false
  if (right === undefined || right === null || right === '') return false
  return String(left) === String(right)
}

function personId(person) {
  if (person === undefined || person === null) return null
  if (typeof person === 'string' || typeof person === 'number') return person
  return person.id ?? person.user_id ?? person.userId ?? null
}

/**
 * A task is on my list when I am its user / one of its users, or — when it has no users at all —
 * I created it (a personal To-Do saved before assignees were set).
 */
export function isTaskOnMyList(task, userId) {
  if (!task || userId === undefined || userId === null) return false
  const direct = task.user ?? task.assigned_user ?? task.assignedTo ?? task.assigned_to ?? task.user_id
  if (sameId(personId(direct), userId)) return true
  const users = Array.isArray(task.users) ? task.users : []
  if (users.some((user) => sameId(personId(user), userId))) return true
  const creator = task.created_by ?? task.createdBy ?? task.creator
  return !direct && users.length === 0 && sameId(personId(creator), userId)
}
