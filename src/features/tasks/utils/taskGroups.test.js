import { describe, expect, it } from 'vitest'
import { groupTasksByDue } from './taskGroups'

const NOW = new Date(2026, 9, 7, 10, 0)
const ids = (list) => list.map((task) => task.id)

describe('groupTasksByDue', () => {
  const tasks = [
    { id: 1, due_date: '2026-10-05', status: 'pending' },
    { id: 2, due_date: '2026-10-07', due_time: '09:00', status: 'pending' },
    { id: 3, due_date: '2026-10-07', due_time: '15:00', status: 'in_progress' },
    { id: 4, due_date: '2026-10-07', status: 'pending' },
    { id: 5, due_date: '2026-10-09', status: 'pending' },
    { id: 6, status: 'pending', priority: 'low' },
    { id: 7, status: 'pending', priority: 'urgent' },
    { id: 8, due_date: '2026-10-06', status: 'completed' },
    { id: 9, due_date: '2026-10-01', status: 'cancelled' },
    { id: 10, due_date: '2026-10-07T00:00:00.000000Z', due_time: '00:00:00', status: 'pending' },
  ]

  it('splits by deadline: overdue (incl. a passed time today), today, upcoming, undated, done', () => {
    const groups = groupTasksByDue(tasks, NOW)
    expect(ids(groups.overdue)).toEqual([1, 2])
    expect(ids(groups.today)).toEqual([3, 4, 10])
    expect(ids(groups.upcoming)).toEqual([5])
    expect(ids(groups.undated)).toEqual([7, 6])
    expect(ids(groups.done)).toEqual([8, 9])
  })

  it('handles empty input', () => {
    expect(groupTasksByDue(undefined, NOW)).toEqual({ overdue: [], today: [], upcoming: [], undated: [], done: [] })
  })
})
