import { describe, expect, it } from 'vitest'
import { buildTodoPayload, TODO_FORM_DEFAULTS, todoHasTime, todoToFormValues } from './todoForm'

const NOW = new Date(2026, 9, 7, 10, 0) // Wednesday 7 Oct 2026; week = Sat 3 → Fri 9

describe('buildTodoPayload', () => {
  const base = { ...TODO_FORM_DEFAULTS, title: 'Write the report' }

  it('today: a private day To-Do for today, assigned to me, no time, no reminder', () => {
    expect(buildTodoPayload(base, { currentUserId: 9, now: NOW })).toMatchObject({
      type: 'todo',
      visibility: 'private',
      due_date: '2026-10-07',
      due_time: '',
      period_type: 'day',
      period_date: '2026-10-07',
      reminder_before: '',
      taskable_type: '',
      users: [9],
    })
  })

  it('tomorrow, week and month', () => {
    expect(buildTodoPayload({ ...base, when: 'tomorrow' }, { now: NOW })).toMatchObject({ due_date: '2026-10-08', period_type: 'day' })
    expect(buildTodoPayload({ ...base, when: 'week' }, { now: NOW })).toMatchObject({ due_date: '2026-10-09', period_type: 'week', period_date: '2026-10-03' })
    expect(buildTodoPayload({ ...base, when: 'month' }, { now: NOW })).toMatchObject({ due_date: '2026-10-31', period_type: 'month' })
  })

  it('a date with a time keeps the time and the reminder', () => {
    const payload = buildTodoPayload({ ...base, when: 'date', date: '2026-10-12', time: '17:00', reminder_before: '15' }, { now: NOW })
    expect(payload).toMatchObject({ due_date: '2026-10-12', due_time: '17:00', period_type: '', reminder_before: '15', reminder_unit: 'minutes' })
  })

  it('a date with no date picked falls back to today', () => {
    expect(buildTodoPayload({ ...base, when: 'date' }, { now: NOW })).toMatchObject({ due_date: '2026-10-07', due_time: '' })
  })

  it('an optional customer link and priority', () => {
    expect(buildTodoPayload({ ...base, priority: 'urgent', taskable_type: 'lead', taskable_id: '3' }, { now: NOW }))
      .toMatchObject({ priority: 'urgent', taskable_type: 'App\\Models\\Lead', taskable_id: '3' })
  })

  it('keeps the existing users when editing', () => {
    expect(buildTodoPayload({ ...base, users: [4, 5] }, { currentUserId: 9, now: NOW }).users).toEqual([4, 5])
  })
})

describe('todoToFormValues', () => {
  it('reads period To-Dos back as today / tomorrow / week / month', () => {
    expect(todoToFormValues({ period_type: 'day', due_date: '2026-10-07' }, NOW).when).toBe('today')
    expect(todoToFormValues({ period_type: 'day', due_date: '2026-10-08' }, NOW).when).toBe('tomorrow')
    expect(todoToFormValues({ period_type: 'week', due_date: '2026-10-09' }, NOW).when).toBe('week')
    expect(todoToFormValues({ period_type: 'month', due_date: '2026-10-31' }, NOW).when).toBe('month')
  })

  it('anything else is a date (with its time); no date at all is today', () => {
    expect(todoToFormValues({ due_date: '2026-10-12', due_time: '17:00' }, NOW)).toMatchObject({ when: 'date', date: '2026-10-12', time: '17:00' })
    expect(todoToFormValues({ due_date: '2026-10-09' }, NOW)).toMatchObject({ when: 'date', date: '2026-10-09' })
    expect(todoToFormValues({}, NOW).when).toBe('today')
  })

  it('round-trips a dated To-Do without changing it', () => {
    const task = { title: 'T', type: 'todo', due_date: '2026-10-12', due_time: '17:00', priority: 'high', taskable_type: 'App\\Models\\Lead', taskable_id: 3 }
    expect(buildTodoPayload(todoToFormValues(task, NOW), { now: NOW })).toMatchObject({
      due_date: '2026-10-12', due_time: '17:00', priority: 'high', taskable_type: 'App\\Models\\Lead', taskable_id: '3',
    })
  })
})

describe('todoHasTime', () => {
  it('only a date with a time', () => {
    expect(todoHasTime({ when: 'date', date: '2026-10-12', time: '10:00' })).toBe(true)
    expect(todoHasTime({ when: 'date', date: '2026-10-12' })).toBe(false)
    expect(todoHasTime({ when: 'today', time: '10:00' })).toBe(false)
  })
})
