// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

window.matchMedia = window.matchMedia || (() => ({
  matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
}))

const createMock = vi.fn(() => Promise.resolve())
vi.mock('../../hooks/useCurrentUserId', () => ({ useCurrentUserId: () => 9 }))
vi.mock('../../hooks/useTasks', () => ({ useTaskMutations: () => ({ create: { mutateAsync: createMock, isPending: false } }) }))

const { TaskQuickAdd } = await import('./TaskQuickAdd')
const { TaskGroupedList } = await import('./TaskGroupedList')

afterEach(() => {
  cleanup()
  createMock.mockClear()
})

describe('TaskQuickAdd', () => {
  it('Enter creates a follow-up due today for me; the kind can be switched first', async () => {
    render(<TaskQuickAdd />)
    fireEvent.click(screen.getByRole('radio', { name: /activities.type.call/ }))
    const input = screen.getByLabelText('tasks.list.quickAdd.label')
    fireEvent.change(input, { target: { value: 'Call Mona' } })
    fireEvent.submit(input.closest('form'))
    await Promise.resolve()
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Call Mona', type: 'call', users: [9], taskable_type: '' }))
  })

  it('"More details" hands the typed values to the full form', () => {
    const onOpenFull = vi.fn()
    render(<TaskQuickAdd onOpenFull={onOpenFull} />)
    fireEvent.change(screen.getByLabelText('tasks.list.quickAdd.label'), { target: { value: 'Offer' } })
    fireEvent.click(screen.getByText('tasks.list.quickAdd.moreDetails'))
    expect(onOpenFull).toHaveBeenCalledWith(expect.objectContaining({ title: 'Offer', type: 'follow_up' }))
  })
})

describe('TaskGroupedList', () => {
  const pad = (value) => String(value).padStart(2, '0')
  const d = new Date()
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  it('groups rows, shows assignees and the link, folds done, and ticks a task', () => {
    const onToggle = vi.fn()
    const onOpen = vi.fn()
    const tasks = [
      { id: 1, title: 'Old call', type: 'call', status: 'pending', due_date: '2020-01-01', taskable_type: 'App\\Models\\Lead', taskable_id: 3, assignments: [{ user_id: 1, user: { id: 1, name: 'Admin User' } }] },
      { id: 2, title: 'Today meeting', type: 'meeting', status: 'pending', due_date: `${today}T00:00:00.000000Z`, due_time: '23:59:00' },
      { id: 3, title: 'Closed one', type: 'email', status: 'completed', due_date: today },
    ]
    render(<TaskGroupedList tasks={tasks} onToggle={onToggle} onOpen={onOpen} />)

    expect(screen.getByLabelText('tasks.list.groups.overdue')).toBeTruthy()
    expect(screen.getByLabelText('tasks.list.groups.today')).toBeTruthy()
    expect(screen.getByText('#3')).toBeTruthy()
    expect(screen.getByText('AU')).toBeTruthy()
    expect(screen.queryByText('Closed one')).toBeNull()
    fireEvent.click(screen.getByText('tasks.list.groups.done'))
    expect(screen.getByText('Closed one')).toBeTruthy()

    fireEvent.click(screen.getAllByLabelText('tasks.todo.complete')[0])
    expect(onToggle).toHaveBeenCalledWith(tasks[0])
    fireEvent.click(screen.getByText('Today meeting'))
    expect(onOpen).toHaveBeenCalledWith(2)
  })

  it('empty state', () => {
    render(<TaskGroupedList tasks={[]} emptyText="nothing" />)
    expect(screen.getByText('nothing')).toBeTruthy()
  })
})
