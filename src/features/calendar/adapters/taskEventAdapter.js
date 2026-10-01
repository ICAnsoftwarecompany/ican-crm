import { getTaskDateTime, getTaskDueTime, getTaskTitle } from '../../tasks/utils/taskMeta'
import { buildTaskPayload, taskToFormValues } from '../../tasks/utils/taskPayload'

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
 * The task update endpoint expects the full record — there is no confirmed partial-patch contract,
 * so a drag-to-reschedule rebuilds the whole payload with the same builder TaskForm uses
 * (`features/tasks/utils/taskPayload`). A dragged period To-Do becomes a dated To-Do (its period is
 * cleared), and a personal task stays personal (no default lead link).
 */
export function buildTaskUpdatePayload(task, overrides = {}) {
  return {
    ...buildTaskPayload({ ...taskToFormValues(task), period_type: '' }),
    ...overrides,
  }
}
