import { describe, expect, it } from 'vitest'
import { getTaskDateTime, getTaskDueDate, getTaskDueTime, getTaskUserIds, isTaskOverdue } from './taskMeta'
import { groupTodoItems, isTaskOnMyList } from './todoPeriods'
import { taskToFormValues } from './taskPayload'
import { todoToFormValues } from './todoForm'

// A To-Do exactly as `GET /api/tenant/tasks` returns it (2026-10-02), trimmed to the fields that matter.
const apiTodo = {
  id: 3,
  title: 'ss;s;',
  type: 'todo',
  priority: 'medium',
  status: 'pending',
  visibility: 'private',
  due_date: '2026-10-02T00:00:00.000000Z',
  due_time: '00:00:00',
  taskable_type: null,
  taskable_id: null,
  created_by: 1,
  assignments: [{ id: 2, task_id: 3, user_id: 1, status: 'pending', user: { id: 1, name: 'admin' } }],
}

describe('API task shape (Laravel date cast + assignments)', () => {
  it('reads the date part and treats a midnight time as "no time"', () => {
    expect(getTaskDueDate(apiTodo)).toBe('2026-10-02')
    expect(getTaskDueTime(apiTodo)).toBe('')
    const due = getTaskDateTime(apiTodo)
    expect(due).not.toBeNull()
    expect([due.getFullYear(), due.getMonth(), due.getDate()]).toEqual([2026, 9, 2])
  })

  it('keeps a real time, trimmed to HH:mm', () => {
    expect(getTaskDueTime({ due_time: '14:30:00' })).toBe('14:30')
    expect(getTaskDateTime({ due_date: '2026-10-02T00:00:00.000000Z', due_time: '14:30:00' }).getHours()).toBe(14)
  })

  it('reads assignees from assignments', () => {
    expect(getTaskUserIds(apiTodo)).toEqual(['1'])
    expect(isTaskOnMyList(apiTodo, 1)).toBe(true)
    expect(isTaskOnMyList(apiTodo, 2)).toBe(false)
  })

  it('shows in Today on its day, not overdue until the day is over', () => {
    const morning = new Date(2026, 9, 2, 9, 0)
    expect(groupTodoItems([apiTodo], 'today', morning).untimed.map((task) => task.id)).toEqual([3])
    expect(isTaskOverdue(apiTodo, morning)).toBe(false)
    expect(isTaskOverdue(apiTodo, new Date(2026, 9, 3, 9, 0))).toBe(true)
  })

  it('opens in the forms with plain date / time values', () => {
    expect(taskToFormValues(apiTodo)).toMatchObject({ due_date: '2026-10-02', due_time: '', users: [1] })
    expect(todoToFormValues(apiTodo, new Date(2026, 9, 5))).toMatchObject({ when: 'date', date: '2026-10-02', time: '', users: [1] })
  })
})
