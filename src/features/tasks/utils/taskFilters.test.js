import { describe, expect, it } from 'vitest'
import { countSmartViews, filterTasks } from './taskFilters'

const NOW = new Date(2026, 9, 7, 10, 0)
const tasks = [
  { id: 1, title: 'Call Ahmed', type: 'call', status: 'pending', due_date: '2026-10-05', taskable_type: 'App\\Models\\Lead', taskable_id: 3 },
  { id: 2, title: 'Meeting', type: 'meeting', status: 'in_progress', due_date: '2026-10-07', due_time: '15:00' },
  { id: 3, title: 'Send offer', type: 'email', status: 'completed', due_date: '2026-10-07', taskable_type: 'App\\Models\\Customer', taskable_id: 8 },
  { id: 4, title: 'Follow up', type: 'follow_up', status: 'pending' },
]
const ids = (list) => list.map((task) => task.id)

describe('filterTasks', () => {
  it('smart views', () => {
    expect(ids(filterTasks(tasks, { view: 'today' }, NOW))).toEqual([2, 3])
    expect(ids(filterTasks(tasks, { view: 'overdue' }, NOW))).toEqual([1])
    expect(ids(filterTasks(tasks, { view: 'in_progress' }, NOW))).toEqual([2])
  })

  it('status, kind, linked-to and search combine', () => {
    expect(ids(filterTasks(tasks, { link: 'personal' }, NOW))).toEqual([2, 4])
    expect(ids(filterTasks(tasks, { link: 'lead' }, NOW))).toEqual([1])
    expect(ids(filterTasks(tasks, { type: 'email', status: 'completed' }, NOW))).toEqual([3])
    expect(ids(filterTasks(tasks, { search: 'ahmed' }, NOW))).toEqual([1])
  })
})

describe('countSmartViews', () => {
  it('counts each view', () => {
    expect(countSmartViews(tasks, NOW)).toEqual({ total: 4, today: 2, overdue: 1, inProgress: 1 })
  })
})
