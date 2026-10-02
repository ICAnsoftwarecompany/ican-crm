import { describe, expect, it } from 'vitest'
import {
  buildTodoSchedule,
  countOpenTodoItems,
  getPeriodRange,
  groupTodoItems,
  isOpenInCurrentPeriod,
  isTaskOnMyList,
} from './todoPeriods'
import { getTaskDeadline, isTaskOverdue } from './taskMeta'

// Wednesday 7 Oct 2026, 10:00 local. Week (Saturday start) = Sat 3 Oct → Fri 9 Oct.
const NOW = new Date(2026, 9, 7, 10, 0)
const ids = (list) => list.map((task) => task.id)

describe('getPeriodRange', () => {
  it('day, week (Saturday start) and month', () => {
    const day = getPeriodRange('day', NOW)
    expect(day.start.getDate()).toBe(7)
    expect(day.end.getHours()).toBe(23)

    const week = getPeriodRange('week', NOW)
    expect(week.start.getDate()).toBe(3)
    expect(week.start.getDay()).toBe(6)
    expect(week.end.getDate()).toBe(9)

    const month = getPeriodRange('month', NOW)
    expect(month.start.getDate()).toBe(1)
    expect(month.end.getDate()).toBe(31)
  })

  it('honours another week start', () => {
    expect(getPeriodRange('week', NOW, 0).start.getDate()).toBe(4)
  })
})

describe('buildTodoSchedule', () => {
  it('a week To-Do is due by the last day of the week, with no time', () => {
    expect(buildTodoSchedule('week', NOW)).toEqual({
      due_date: '2026-10-09', due_time: '', period_type: 'week', period_date: '2026-10-03',
    })
  })

  it('month and day', () => {
    expect(buildTodoSchedule('month', NOW).due_date).toBe('2026-10-31')
    expect(buildTodoSchedule('day', NOW)).toMatchObject({ due_date: '2026-10-07', period_date: '2026-10-07' })
  })

  it('returns null for no period', () => {
    expect(buildTodoSchedule('', NOW)).toBeNull()
  })
})

describe('deadline and overdue', () => {
  it('a date-only task is due at the end of that day, not at midnight', () => {
    const task = { due_date: '2026-10-07', due_time: '' }
    expect(getTaskDeadline(task).getHours()).toBe(23)
    expect(isTaskOverdue(task, NOW)).toBe(false)
  })

  it('a timed task is overdue after its time; closed tasks never are', () => {
    expect(isTaskOverdue({ due_date: '2026-10-07', due_time: '09:00' }, NOW)).toBe(true)
    expect(isTaskOverdue({ due_date: '2026-10-07', due_time: '09:00', status: 'completed' }, NOW)).toBe(false)
    expect(isTaskOverdue({ due_date: '2026-10-07', due_time: '09:00', status: 'cancelled' }, NOW)).toBe(false)
  })
})

describe('groupTodoItems', () => {
  const tasks = [
    { id: 1, due_date: '2026-10-07', due_time: '14:00', status: 'pending' },
    { id: 2, due_date: '2026-10-07', due_time: '', status: 'pending', priority: 'urgent' },
    { id: 3, due_date: '2026-10-07', due_time: '', status: 'pending', priority: 'low' },
    { id: 4, due_date: '2026-10-05', due_time: '', status: 'pending' },
    { id: 5, due_date: '2026-10-09', due_time: '', status: 'pending', period_type: 'week', period_date: '2026-10-03' },
    { id: 6, due_date: '2026-10-07', due_time: '08:00', status: 'completed' },
    { id: 7, due_date: '2026-10-20', due_time: '', status: 'pending' },
    { id: 8, status: 'pending' },
    { id: 9, due_date: '2026-10-07', due_time: '', status: 'cancelled' },
  ]

  it('today: overdue, timed, untimed by priority, carried week To-Do, done', () => {
    const groups = groupTodoItems(tasks, 'today', NOW)
    expect(ids(groups.overdue)).toEqual([4])
    expect(ids(groups.timed)).toEqual([1])
    expect(ids(groups.untimed)).toEqual([2, 3])
    expect(ids(groups.carried)).toEqual([5])
    expect(ids(groups.undated)).toEqual([8])
    expect(ids(groups.done)).toEqual([6])
    expect(countOpenTodoItems(groups)).toBe(6)
  })

  it('week: everything due this week (past days included), nothing carried', () => {
    const groups = groupTodoItems(tasks, 'week', NOW)
    expect(ids(groups.overdue)).toEqual([])
    expect(ids(groups.timed)).toEqual([1])
    expect(ids(groups.untimed)).toEqual(expect.arrayContaining([2, 3, 4, 5]))
    expect(ids(groups.carried)).toEqual([])
  })

  it('month includes later dates; undated To-Dos sit in their own group', () => {
    const groups = groupTodoItems(tasks, 'month', NOW)
    expect(ids(groups.untimed)).toContain(7)
    expect(ids([...groups.timed, ...groups.untimed])).not.toContain(8)
    expect(ids(groups.undated)).toEqual([8])
    expect(groupTodoItems(tasks, 'overdue', NOW).undated).toEqual([])
  })

  it('overdue: open tasks past their deadline, oldest first', () => {
    const groups = groupTodoItems([
      ...tasks,
      { id: 10, due_date: '2026-10-01', due_time: '', status: 'in_progress' },
    ], 'overdue', NOW)
    expect(ids(groups.overdue)).toEqual([10, 4])
  })

  it('a week To-Do without a period from the backend still shows in the week view', () => {
    const groups = groupTodoItems([{ id: 11, due_date: '2026-10-09', due_time: '', status: 'pending' }], 'week', NOW)
    expect(ids(groups.untimed)).toEqual([11])
  })
})

describe('isOpenInCurrentPeriod', () => {
  it('only open week/month To-Dos of the current period', () => {
    expect(isOpenInCurrentPeriod({ period_type: 'week', period_date: '2026-10-03', due_date: '2026-10-09' }, NOW)).toBe(true)
    expect(isOpenInCurrentPeriod({ period_type: 'week', period_date: '2026-09-26', due_date: '2026-10-02' }, NOW)).toBe(false)
    expect(isOpenInCurrentPeriod({ period_type: 'day', due_date: '2026-10-07' }, NOW)).toBe(false)
    expect(isOpenInCurrentPeriod({ period_type: 'month', due_date: '2026-10-31', status: 'completed' }, NOW)).toBe(false)
  })
})

describe('isTaskOnMyList', () => {
  it('assignee, one of the users, or the creator of a task with no users', () => {
    expect(isTaskOnMyList({ users: [{ id: 2 }] }, 2)).toBe(true)
    expect(isTaskOnMyList({ user_id: '2' }, 2)).toBe(true)
    expect(isTaskOnMyList({ users: [], created_by: 2 }, 2)).toBe(true)
    expect(isTaskOnMyList({ users: [{ id: 3 }], created_by: 2 }, 2)).toBe(false)
    expect(isTaskOnMyList({ users: [{ id: 3 }] }, null)).toBe(false)
  })
})
