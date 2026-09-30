import { describe, expect, it } from 'vitest'
import { buildAssigneeBreakdown, countBy } from './activityReport'

const activities = [
  { id: 1, status: 'completed', priority: 'high', assignedUser: { id: 7, name: 'Mona' } },
  { id: 2, status: 'scheduled', priority: 'high', assignedUser: { id: 7, name: 'Mona' }, late: true },
  { id: 3, status: 'cancelled', priority: 'low', assignedUser: { id: 9, name: 'Ali' } },
  { id: 4, status: 'scheduled', priority: '', assignedUser: null },
]

describe('buildAssigneeBreakdown', () => {
  it('groups by user, counts outcomes and computes completion rate', () => {
    const rows = buildAssigneeBreakdown(activities, (activity) => Boolean(activity.late))
    expect(rows[0]).toEqual({ key: '7', name: 'Mona', total: 2, completed: 1, overdue: 1, cancelled: 0, completionRate: 50 })
    expect(rows.find((row) => row.key === '9')).toMatchObject({ cancelled: 1, completionRate: 0 })
  })

  it('puts activities without an assignee in one unassigned row with a null name', () => {
    const rows = buildAssigneeBreakdown(activities)
    const unassigned = rows.find((row) => row.name === null)
    expect(unassigned.total).toBe(1)
  })

  it('returns an empty list for no data', () => {
    expect(buildAssigneeBreakdown()).toEqual([])
  })
})

describe('countBy', () => {
  it('counts values and groups empty ones under null, most frequent first', () => {
    expect(countBy(activities, (activity) => activity.priority)).toEqual([
      { key: 'high', count: 2 },
      { key: 'low', count: 1 },
      { key: null, count: 1 },
    ])
  })
})
