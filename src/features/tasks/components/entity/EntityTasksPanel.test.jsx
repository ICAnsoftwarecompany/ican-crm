// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// jsdom has no matchMedia; AppDrawer / AppModal read it.
window.matchMedia = window.matchMedia || (() => ({
  matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
}))

const entityState = { current: null }
const createMock = vi.fn(() => Promise.resolve())

vi.mock('../../hooks/useEntityTasks', () => ({ useEntityTasks: () => entityState.current }))
vi.mock('../../hooks/useCurrentUserId', () => ({ useCurrentUserId: () => 9 }))
vi.mock('../../hooks/useTasks', () => ({
  useTaskMutations: () => ({ create: { mutateAsync: createMock, isPending: false } }),
  useTaskInfo: () => ({ data: null, isLoading: false, refetch: vi.fn() }),
  useTasks: () => ({ data: [] }),
}))
vi.mock('../../../teams/hooks/useTeams', () => ({ useTeams: () => ({ data: [] }) }))
vi.mock('../../../users/hooks/useUsers', () => ({ useUsers: () => ({ data: [] }) }))
vi.mock('../../../customers', () => ({ useCustomers: () => ({ data: null }) }))

const { EntityTasksPanel } = await import('./EntityTasksPanel')

afterEach(() => {
  cleanup()
  createMock.mockClear()
})

function state(overrides = {}) {
  return {
    enabled: true,
    open: [],
    closed: [],
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    toggleDone: vi.fn(() => Promise.resolve('completed')),
    pendingIds: new Set(),
    ...overrides,
  }
}

const taskable = { type: 'lead', id: '3', name: 'Ahmed' }

describe('EntityTasksPanel', () => {
  it('says so when there is no record', () => {
    entityState.current = state({ enabled: false })
    render(<EntityTasksPanel taskable={null} />)
    expect(screen.getByText('tasks.entity.noRecord')).toBeTruthy()
  })

  it('shows the empty state with the three quick actions', () => {
    entityState.current = state()
    render(<EntityTasksPanel taskable={taskable} />)
    expect(screen.getByText('tasks.entity.empty')).toBeTruthy()
    expect(screen.getByLabelText('tasks.quickActions.task')).toBeTruthy()
    expect(screen.getByLabelText('tasks.quickActions.call')).toBeTruthy()
    expect(screen.getByLabelText('tasks.quickActions.meeting')).toBeTruthy()
  })

  it('lists open tasks, hides closed ones until expanded, and ticks a task', () => {
    const open = { id: 1, title: 'Call back', type: 'call', due_date: '2099-01-01', due_time: '10:00' }
    entityState.current = state({ open: [open], closed: [{ id: 2, title: 'Old', type: 'todo', status: 'completed' }] })
    render(<EntityTasksPanel taskable={taskable} />)

    expect(screen.getByText('Call back')).toBeTruthy()
    expect(screen.queryByText('Old')).toBeNull()
    fireEvent.click(screen.getByText('tasks.entity.closedGroup'))
    expect(screen.getByText('Old')).toBeTruthy()

    fireEvent.click(screen.getByLabelText('tasks.todo.complete'))
    expect(entityState.current.toggleDone).toHaveBeenCalledWith(open)
  })

  it('a quick action opens the form linked to the record and creates the task', async () => {
    entityState.current = state()
    render(<EntityTasksPanel taskable={taskable} />)
    fireEvent.click(screen.getByLabelText('tasks.quickActions.call'))

    const title = screen.getByPlaceholderText('tasks.form.titlePlaceholder')
    expect(title.value).toBe('tasks.quickActions.defaultTitle.call')
    expect(screen.queryByText('tasks.taskable.label')).toBeNull() // link is fixed, not editable

    fireEvent.submit(title.closest('form'))
    await Promise.resolve()
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      type: 'call',
      taskable_type: 'App\\Models\\Lead',
      taskable_id: '3',
      users: [9],
    }))
  })
})
