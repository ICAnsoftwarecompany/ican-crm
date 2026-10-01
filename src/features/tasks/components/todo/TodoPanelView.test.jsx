// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TodoPanelView } from './TodoPanelView'

afterEach(cleanup)

const today = new Date()
const pad = (value) => String(value).padStart(2, '0')
const todayDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

function makeTodo(overrides = {}) {
  return {
    groups: { overdue: [], timed: [], untimed: [], carried: [], done: [] },
    counts: { today: 0, week: 0, month: 0, overdue: 0 },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    quickAdd: vi.fn(() => Promise.resolve()),
    isAdding: false,
    toggleDone: vi.fn(() => Promise.resolve('completed')),
    pendingIds: new Set(),
    ...overrides,
  }
}

describe('TodoPanelView', () => {
  it('shows the empty state and the quick add for today', () => {
    render(<TodoPanelView todo={makeTodo()} view="today" />)
    expect(screen.getByText('tasks.todo.empty.today')).toBeTruthy()
    expect(screen.getByLabelText('tasks.todo.quickAdd.label')).toBeTruthy()
  })

  it('has no quick add in the overdue view', () => {
    render(<TodoPanelView todo={makeTodo()} view="overdue" />)
    expect(screen.queryByLabelText('tasks.todo.quickAdd.label')).toBeNull()
  })

  it('renders groups, a linked task chip, and ticks a task', () => {
    const task = { id: 1, title: 'Call Ahmed', type: 'call', due_date: todayDate, due_time: '23:59', taskable_type: 'App\\Models\\Lead', taskable_id: 15 }
    const todo = makeTodo({ groups: { overdue: [], timed: [task], untimed: [{ id: 2, title: 'Write report', type: 'todo', due_date: todayDate }], carried: [], done: [] } })
    const onOpenTask = vi.fn()
    render(<TodoPanelView todo={todo} view="today" onOpenTask={onOpenTask} />)

    expect(screen.getByText('Call Ahmed')).toBeTruthy()
    expect(screen.getByText('Write report')).toBeTruthy()
    expect(screen.getByLabelText('tasks.todo.groups.timed')).toBeTruthy()
    expect(screen.getByText('#15')).toBeTruthy()

    fireEvent.click(screen.getAllByLabelText('tasks.todo.complete')[0])
    expect(todo.toggleDone).toHaveBeenCalledWith(task)

    fireEvent.click(screen.getByText('Write report'))
    expect(onOpenTask).toHaveBeenCalledWith(2)
  })

  it('caps rows per group and says how many more', () => {
    const untimed = [1, 2, 3].map((id) => ({ id, title: `T${id}`, type: 'todo', due_date: todayDate }))
    render(<TodoPanelView todo={makeTodo({ groups: { overdue: [], timed: [], untimed, carried: [], done: [] } })} view="today" maxRows={2} />)
    expect(screen.queryByText('T3')).toBeNull()
    expect(screen.getByText('tasks.todo.more')).toBeTruthy()
  })

  it('sends a quick add title for the view', async () => {
    const todo = makeTodo()
    render(<TodoPanelView todo={todo} view="week" />)
    const input = screen.getByLabelText('tasks.todo.quickAdd.label')
    fireEvent.change(input, { target: { value: 'Prepare offer' } })
    fireEvent.submit(input.closest('form'))
    expect(todo.quickAdd).toHaveBeenCalledWith('Prepare offer', 'week')
  })
})
