import { describe, expect, it } from 'vitest'
import { buildTaskPayload, TASK_FORM_DEFAULTS, taskToFormValues } from './taskPayload'

const NOW = new Date(2026, 9, 7, 10, 0) // Wednesday

describe('buildTaskPayload', () => {
  it('a linked call keeps its exact time and sends the backend model name', () => {
    const payload = buildTaskPayload({
      ...TASK_FORM_DEFAULTS,
      title: '  Call Ahmed ',
      type: 'call',
      due_date: '2026-10-08',
      due_time: '14:30',
      taskable_type: 'lead',
      taskable_id: '15',
      users: ['2'],
    }, { currentUserId: 9, now: NOW })

    expect(payload).toMatchObject({
      title: 'Call Ahmed',
      type: 'call',
      due_date: '2026-10-08',
      due_time: '14:30',
      taskable_type: 'App\\Models\\Lead',
      taskable_id: '15',
      users: [2],
    })
    expect(payload).not.toHaveProperty('period_type')
    expect(payload).not.toHaveProperty('taskable_name')
  })

  it('a week To-Do: due by the end of the week, private, assigned to me, no link', () => {
    const payload = buildTaskPayload({
      ...TASK_FORM_DEFAULTS,
      title: 'Prepare offer',
      type: 'todo',
      visibility: '',
      period_type: 'week',
      period_date: '2026-10-07',
    }, { currentUserId: 9, now: NOW })

    expect(payload).toMatchObject({
      type: 'todo',
      visibility: 'private',
      due_date: '2026-10-09',
      due_time: '',
      period_type: 'week',
      period_date: '2026-10-03',
      taskable_type: '',
      taskable_id: '',
      users: [9],
    })
  })

  it('a To-Do with an exact time sends an empty period', () => {
    const payload = buildTaskPayload({
      ...TASK_FORM_DEFAULTS, title: 'Send report', type: 'todo', due_date: '2026-10-07', due_time: '17:00',
    }, { currentUserId: 9, now: NOW })
    expect(payload).toMatchObject({ due_date: '2026-10-07', due_time: '17:00', period_type: '', period_date: '' })
  })

  it('a time without a date is dropped', () => {
    const payload = buildTaskPayload({ ...TASK_FORM_DEFAULTS, title: 'x', due_time: '10:00' })
    expect(payload.due_time).toBe('')
  })

  it('a To-Do linked to a customer keeps the link', () => {
    const payload = buildTaskPayload({
      ...TASK_FORM_DEFAULTS, title: 'x', type: 'todo', period_type: 'day', taskable_type: 'customer', taskable_id: 4,
    }, { now: NOW })
    expect(payload).toMatchObject({ taskable_type: 'App\\Models\\Customer', taskable_id: '4', due_date: '2026-10-07' })
  })
})

describe('taskToFormValues', () => {
  it('reads an API task back into form values with aliases', () => {
    const values = taskToFormValues({
      title: 'T', type: 'todo', taskable_type: 'App\\Models\\Lead', taskable_id: 3,
      users: [{ id: 2 }, 5], period_type: 'week', period_date: '2026-10-03', reminder_before: 0,
    })
    expect(values).toMatchObject({
      taskable_type: 'lead', taskable_id: '3', users: [2, 5], period_type: 'week', period_date: '2026-10-03', reminder_before: '0',
    })
  })

  it('round-trips without changing the schedule', () => {
    const task = { title: 'T', type: 'meeting', due_date: '2026-10-08', due_time: '11:00', users: [] }
    const payload = buildTaskPayload(taskToFormValues(task))
    expect(payload).toMatchObject({ due_date: '2026-10-08', due_time: '11:00', taskable_type: '', taskable_id: '' })
  })
})
