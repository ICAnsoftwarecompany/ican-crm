import { describe, expect, it } from 'vitest'
import {
  buildOverdueItems,
  getDueTasks,
  getTodayActivities,
  isMyActivity,
  isMyTask,
  isOpenActivity,
  sortNewestFirst,
} from './myWorkItems'

const NOW = new Date(2026, 9, 1, 12, 0, 0)
const at = (day, hour) => new Date(2026, 9, day, hour, 0, 0).toISOString()

describe('isMyActivity', () => {
  it('matches the assignee', () => {
    expect(isMyActivity({ assignedUser: { id: 7 } }, 7)).toBe(true)
    expect(isMyActivity({ assignedUser: { id: '7' } }, 7)).toBe(true)
  })

  it('matches a participant (internal meetings), in any shape', () => {
    expect(isMyActivity({ participants: [{ id: 3 }, { user: { id: 7 } }] }, 7)).toBe(true)
    expect(isMyActivity({ participants: [7] }, '7')).toBe(true)
  })

  it('is false without a user id or a match', () => {
    expect(isMyActivity({ assignedUser: { id: 7 } }, null)).toBe(false)
    expect(isMyActivity({ assignedUser: { id: 8 }, participants: [] }, 7)).toBe(false)
    expect(isMyActivity({ assignedUser: null }, 7)).toBe(false)
  })
})

describe('isMyTask', () => {
  it('matches the direct user or any listed user', () => {
    expect(isMyTask({ user: { id: 5 } }, 5)).toBe(true)
    expect(isMyTask({ assigned_to: 5 }, 5)).toBe(true)
    expect(isMyTask({ users: [{ id: 1 }, { id: 5 }] }, 5)).toBe(true)
    expect(isMyTask({ users: [{ id: 1 }] }, 5)).toBe(false)
  })
})

describe('getTodayActivities', () => {
  it('keeps open activities starting today, sorted by time', () => {
    const list = [
      { id: 1, status: 'scheduled', startAt: at(1, 15) },
      { id: 2, status: 'scheduled', startAt: at(1, 9) },
      { id: 3, status: 'completed', startAt: at(1, 10) },
      { id: 4, status: 'scheduled', startAt: at(2, 9) },
      { id: 5, status: 'scheduled', startAt: null },
    ]
    expect(getTodayActivities(list, NOW).map((item) => item.id)).toEqual([2, 1])
  })
})

describe('getDueTasks', () => {
  it('returns open tasks due by end of today, earliest first, skipping undated', () => {
    const due = { a: new Date(2026, 8, 30), b: new Date(2026, 9, 1, 18), c: new Date(2026, 9, 2), d: null }
    const tasks = [
      { id: 'b', status: 'pending' },
      { id: 'a', status: 'in_progress' },
      { id: 'c', status: 'pending' },
      { id: 'd', status: 'pending' },
      { id: 'e', status: 'completed' },
    ]
    const result = getDueTasks(tasks, (task) => due[task.id] || null, NOW)
    expect(result.map((task) => task.id)).toEqual(['a', 'b'])
  })
})

describe('buildOverdueItems', () => {
  it('merges overdue activities and tasks, oldest first', () => {
    const items = buildOverdueItems({
      activities: [
        { id: 1, type: 'call', title: 'Call', status: 'scheduled', startAt: at(1, 9), late: true },
        { id: 2, type: 'meeting', title: 'Done', status: 'completed', startAt: at(1, 8), late: true },
        { id: 3, type: 'meeting', title: 'Future', status: 'scheduled', startAt: at(3, 8), late: false },
      ],
      tasks: [{ id: 9, title: 'Task', status: 'pending', late: true }],
      isActivityOverdue: (activity) => activity.late,
      isTaskLate: (task) => task.late,
      getTaskDue: () => new Date(2026, 8, 29),
    })
    expect(items.map((item) => item.key)).toEqual(['task-9', 'activity-1'])
    expect(items[1].kind).toBe('call')
  })
})

describe('isOpenActivity / sortNewestFirst', () => {
  it('treats completed and cancelled as closed', () => {
    expect(isOpenActivity({ status: 'Completed' })).toBe(false)
    expect(isOpenActivity({ status: 'in_progress' })).toBe(true)
  })

  it('sorts by created date, undated last', () => {
    const list = [{ id: 1, created_at: at(1, 9) }, { id: 2 }, { id: 3, created_at: at(1, 11) }]
    expect(sortNewestFirst(list).map((item) => item.id)).toEqual([3, 1, 2])
  })
})
