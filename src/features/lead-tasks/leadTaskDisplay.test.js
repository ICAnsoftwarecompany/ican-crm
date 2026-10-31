import { expect, it, vi } from 'vitest'
vi.mock('../tasks', async () => ({ ...await import('../tasks/utils/taskMeta'), ...await import('../tasks/constants/taskableTypes') }))
import { indexLeadTasks, leadTaskCountdown, leadTasksTimeline } from './leadTaskDisplay'

it('indexes only actual lead-linked tasks without mixing entity IDs', () => {
  const tasks = [{ id: 1, taskable_type: 'App\\Models\\Lead', taskable_id: 15 }, { id: 2, taskable_type: 'customer', taskable_id: 15 }, { id: 3 }]
  expect(indexLeadTasks(tasks).get('15')).toEqual([tasks[0]])
})

it('counts down the earliest open deadline, marks overdue and ignores closed/undated tasks', () => {
  const now = new Date(2026, 9, 22, 12).getTime()
  const task = { id: 1, due_date: '2026-10-23', due_time: '14:30', status: 'pending' }
  expect(leadTaskCountdown([task, { id: 2, status: 'completed', due_date: '2026-10-01' }, { id: 3 }], now)).toMatchObject({ task, overdue: false, days: 1, hours: 2, minutes: 30 })
  expect(leadTaskCountdown([{ ...task, due_date: '2026-10-21' }], now).overdue).toBe(true)
  expect(leadTaskCountdown([{ id: 3 }], now)).toBeNull()
  expect(leadTaskCountdown([{ ...task, due_date: '2026-10-22', due_time: '' }], now)).toMatchObject({ overdue: false, hours: 12 })
})

it('places task creation in the timeline without pretending a future deadline already happened', () => {
  const task = { id: 4, title: 'Call', created_at: '2026-10-22T10:00:00Z', due_date: '2026-10-30' }
  expect(leadTasksTimeline([task])[0]).toMatchObject({ id: 'lead-task-4', type: 'task', date: task.created_at, title: 'Call', task })
})
