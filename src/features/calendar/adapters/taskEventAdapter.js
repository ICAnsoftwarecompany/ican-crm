import { getTaskDateTime, getTaskDueTime, getTaskTitle } from '../../tasks/utils/taskMeta'

/**
 * Task -> CalendarEvent. Tasks store due date/time as two separate strings
 * (due_date + due_time) — see taskMeta.getTaskDateTime, which this reuses
 * instead of re-parsing the fields a second time.
 */
export function taskToCalendarEvent(task) {
  const start = getTaskDateTime(task)
  if (!task?.id || !start) return null

  return {
    id: `task-${task.id}`,
    sourceId: 'tasks',
    // No `t` available at this data-adapter layer; getTaskTitle falls back to
    // its Arabic default only when the task itself has no title (see taskMeta.js).
    title: getTaskTitle(task),
    start,
    end: start,
    allDay: !getTaskDueTime(task),
    status: task?.status,
    rawId: task.id,
    raw: task,
  }
}

export function tasksToCalendarEvents(tasks = []) {
  return tasks.map(taskToCalendarEvent).filter(Boolean)
}

/**
 * The task update endpoint expects the full record (see TaskForm's submit
 * and TaskDrawer's edit-mode initialValues, which this mirrors) — there is
 * no confirmed partial-patch contract, so a drag-to-reschedule must rebuild
 * the whole payload rather than sending just the changed date fields.
 */
export function buildTaskUpdatePayload(task, overrides = {}) {
  return {
    title: task?.title || '',
    description: task?.description || '',
    type: task?.type || 'todo',
    priority: task?.priority || 'medium',
    visibility: task?.visibility || 'shared',
    due_date: task?.due_date || '',
    due_time: task?.due_time || '',
    reminder_type: task?.reminder_type || 'system',
    reminder_before: String(task?.reminder_before || '30'),
    reminder_unit: task?.reminder_unit || 'minutes',
    taskable_type: task?.taskable_type || 'App\\Models\\Lead',
    taskable_id: task?.taskable_id || '',
    users: (task?.users || []).map((item) => Number(item?.id || item)).filter(Number.isFinite),
    teams: (task?.teams || []).map((item) => Number(item?.id || item)).filter(Number.isFinite),
    ...overrides,
  }
}
