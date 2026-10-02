// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../hooks/useCurrentUserId', () => ({ useCurrentUserId: () => 9 }))
vi.mock('../../users/hooks/useUsers', () => ({ useUsers: () => ({ data: [{ id: 9, name: 'Me Self' }, { id: 4, name: 'Sara Ali' }] }) }))
vi.mock('../../teams/hooks/useTeams', () => ({ useTeams: () => ({ data: [] }) }))
vi.mock('../../customers', () => ({ useCustomers: () => ({ data: null }) }))

const { TaskForm } = await import('./TaskForm')

afterEach(cleanup)

describe('TaskForm', () => {
  it('a new task is assigned to me; extra fields stay folded', () => {
    render(<TaskForm onSubmit={vi.fn()} />)
    expect(screen.getByText('tasks.form.me')).toBeTruthy()
    expect(screen.queryByText('tasks.form.descriptionLabel')).toBeNull()
    fireEvent.click(screen.getByText('tasks.form.moreOptions'))
    expect(screen.getByText('tasks.form.descriptionLabel')).toBeTruthy()
  })

  it('kind, today, a teammate found by search, and the priority end up in the request', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} />)
    fireEvent.change(screen.getByLabelText('tasks.form.titleLabel'), { target: { value: 'Visit client' } })
    fireEvent.click(screen.getByRole('radio', { name: /activities.type.meeting/ }))
    fireEvent.click(screen.getByText('tasks.form.when.today'))
    fireEvent.change(screen.getByLabelText('tasks.form.searchPeople'), { target: { value: 'sara' } })
    fireEvent.click(screen.getByText('Sara Ali'))
    fireEvent.click(screen.getByText('activities.scheduleDialog.priorityOptions.high'))
    fireEvent.submit(screen.getByLabelText('tasks.form.titleLabel').closest('form'))
    await Promise.resolve()

    const pad = (value) => String(value).padStart(2, '0')
    const d = new Date()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Visit client',
      type: 'meeting',
      priority: 'high',
      due_date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      users: [9, 4],
    }))
  })

  it('does not offer the To-Do kind for a new task', () => {
    render(<TaskForm onSubmit={vi.fn()} />)
    expect(screen.queryByRole('radio', { name: /tasks.types.todo/ })).toBeNull()
  })
})
