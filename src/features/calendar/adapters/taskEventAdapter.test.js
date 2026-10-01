import { describe, expect, it } from 'vitest'
import { buildTaskUpdatePayload, taskToCalendarEvent, tasksToCalendarEvents } from './taskEventAdapter'

describe('taskToCalendarEvent', () => {
  it('maps a task with a due date and time to a timed calendar event', () => {
    const event = taskToCalendarEvent({ id: 1, title: 'Call the customer', due_date: '2026-09-18', due_time: '10:30' })

    expect(event.id).toBe('task-1')
    expect(event.sourceId).toBe('tasks')
    expect(event.title).toBe('Call the customer')
    expect(event.allDay).toBe(false)
    expect(event.start.getHours()).toBe(10)
    expect(event.start.getMinutes()).toBe(30)
  })

  it('treats a task with only a due date (no time) as all-day', () => {
    const event = taskToCalendarEvent({ id: 2, title: 'Follow up', due_date: '2026-09-18', due_time: '' })
    expect(event.allDay).toBe(true)
  })

  it('returns null for a task with no due date at all (nothing to plot)', () => {
    expect(taskToCalendarEvent({ id: 3, title: 'No date' })).toBeNull()
  })

  it('returns null for a task with no id', () => {
    expect(taskToCalendarEvent({ title: 'No id', due_date: '2026-09-18' })).toBeNull()
  })

  it('falls back to the camelCase field spellings', () => {
    const event = taskToCalendarEvent({ id: 4, title: 'Camel', dueDate: '2026-09-18', dueTime: '09:00' })
    expect(event).not.toBeNull()
    expect(event.allDay).toBe(false)
  })
})

describe('tasksToCalendarEvents', () => {
  it('drops undatable tasks and keeps the rest', () => {
    const events = tasksToCalendarEvents([
      { id: 1, title: 'A', due_date: '2026-09-18' },
      { id: 2, title: 'B' },
    ])
    expect(events).toHaveLength(1)
    expect(events[0].id).toBe('task-1')
  })

  it('returns an empty array for no input', () => {
    expect(tasksToCalendarEvents()).toEqual([])
  })
})

describe('buildTaskUpdatePayload', () => {
  it('keeps the lead link of a linked task and applies the new date', () => {
    const payload = buildTaskUpdatePayload(
      { id: 1, title: 'Call', type: 'call', taskable_type: 'App\\Models\\Lead', taskable_id: 5, due_date: '2026-09-18', due_time: '10:00' },
      { due_date: '2026-09-20' },
    )
    expect(payload).toMatchObject({ taskable_type: 'App\\Models\\Lead', taskable_id: '5', due_date: '2026-09-20', due_time: '10:00' })
  })

  it('never attaches a lead to a personal To-Do', () => {
    const payload = buildTaskUpdatePayload({ id: 2, title: 'Mine', type: 'todo', due_date: '2026-09-18' }, { due_date: '2026-09-19' })
    expect(payload).toMatchObject({ taskable_type: '', taskable_id: '', period_type: '', due_date: '2026-09-19' })
  })
})
