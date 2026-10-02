/**
 * Pure helpers for "My Work". No React, no i18n, no API — every rule about what counts as
 * "mine", "today" and "overdue" lives here so it is tested once and reused by every section.
 */

const CLOSED_ACTIVITY_STATUSES = new Set(['completed', 'cancelled'])
const CLOSED_TASK_STATUSES = new Set(['completed', 'cancelled'])

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

function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isSameCalendarDay(left, right) {
  return Boolean(left && right)
    && left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

/**
 * An activity (normalized call/meeting) is mine when I am the assignee or a participant.
 * Internal meetings usually have participants but no single assignee.
 */
export function isMyActivity(activity, userId) {
  if (!activity || userId === undefined || userId === null) return false
  if (sameId(personId(activity.assignedUser), userId)) return true
  const participants = Array.isArray(activity.participants) ? activity.participants : []
  return participants.some((participant) => sameId(personId(participant?.user ?? participant), userId))
}

/** A task is mine when I am its user/assignee, one of its users, or one of its assignments. */
export function isMyTask(task, userId) {
  if (!task || userId === undefined || userId === null) return false
  const direct = task.user ?? task.assigned_user ?? task.assignedTo ?? task.assigned_to ?? task.user_id
  if (sameId(personId(direct), userId)) return true
  const users = Array.isArray(task.users) ? task.users : []
  if (users.some((user) => sameId(personId(user), userId))) return true
  // Current tasks API: assignees come as `assignments: [{ user_id, user }]`.
  const assignments = Array.isArray(task.assignments) ? task.assignments : []
  return assignments.some((item) => sameId(item?.user_id ?? personId(item?.user), userId))
}

export function isOpenActivity(activity) {
  return !CLOSED_ACTIVITY_STATUSES.has(String(activity?.status || '').toLowerCase())
}

export function isOpenTask(task) {
  return !CLOSED_TASK_STATUSES.has(String(task?.status || '').toLowerCase())
}

/** Open activities that start today, earliest first. */
export function getTodayActivities(activities = [], now = new Date()) {
  return activities
    .filter((activity) => isOpenActivity(activity) && isSameCalendarDay(toDate(activity.startAt), now))
    .sort((left, right) => toDate(left.startAt) - toDate(right.startAt))
}

/**
 * Open tasks due today or earlier (overdue first), then undated ones are left out on purpose:
 * "My Work" is about what needs attention now.
 * @param {(task: object) => Date|null} getDueDate
 */
export function getDueTasks(tasks = [], getDueDate, now = new Date()) {
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return tasks
    .filter(isOpenTask)
    .map((task) => ({ task, due: getDueDate(task) }))
    .filter(({ due }) => due && due.getTime() <= endOfToday.getTime())
    .sort((left, right) => left.due - right.due)
    .map(({ task }) => task)
}

/**
 * One list of everything overdue across sources, oldest first.
 * @returns {{ key: string, kind: 'call'|'meeting'|'task', id: *, title: string, dueAt: Date, source: object }[]}
 */
export function buildOverdueItems({ activities = [], tasks = [], isActivityOverdue, getTaskDue, isTaskLate }) {
  const activityItems = activities
    .filter((activity) => isOpenActivity(activity) && isActivityOverdue(activity))
    .map((activity) => ({
      key: `activity-${activity.id}`,
      kind: activity.type === 'call' ? 'call' : 'meeting',
      id: activity.id,
      title: activity.title,
      dueAt: toDate(activity.startAt),
      source: activity,
    }))

  const taskItems = tasks
    .filter((task) => isOpenTask(task) && isTaskLate(task))
    .map((task) => ({
      key: `task-${task.id}`,
      kind: 'task',
      id: task.id,
      title: task.title || task.name || '',
      dueAt: getTaskDue(task),
      source: task,
    }))

  return [...activityItems, ...taskItems]
    .filter((item) => item.dueAt)
    .sort((left, right) => left.dueAt - right.dueAt)
}

/** Newest first by created date; items without a date go last. */
export function sortNewestFirst(items = [], getDate = (item) => item?.created_at || item?.createdAt) {
  return [...items].sort((left, right) => {
    const a = toDate(getDate(left))
    const b = toDate(getDate(right))
    if (!a && !b) return 0
    if (!a) return 1
    if (!b) return -1
    return b - a
  })
}
