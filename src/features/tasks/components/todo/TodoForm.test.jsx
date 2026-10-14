// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../hooks/useCurrentUserId', () => ({ useCurrentUserId: () => 9 }))
vi.mock('../../../customers', () => ({ useCustomers: () => ({ data: null }) }))

const { TodoForm } = await import('./TodoForm')

afterEach(cleanup)

describe('TodoForm', () => {
  it('needs only a title: saves a private To-Do for today assigned to me', async () => {
    const onSubmit = vi.fn()
    render(<TodoForm onSubmit={onSubmit} />)

    const submit = screen.getByText('tasks.todo.form.submit').closest('button')
    expect(submit.disabled).toBe(true)

    fireEvent.change(screen.getByLabelText('tasks.todo.form.titleLabel'), { target: { value: 'Call the bank' } })
    expect(submit.disabled).toBe(false)
    fireEvent.submit(submit.closest('form'))
    await Promise.resolve()

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Call the bank', type: 'todo', visibility: 'private', period_type: 'day', due_time: '', users: [9],
    }))
  })

  it('shows date and time only for "pick a date", and hides customer/reminder under more options', () => {
    render(<TodoForm onSubmit={vi.fn()} />)
    expect(screen.queryByText('tasks.todo.form.timeOptional')).toBeNull()
    expect(screen.queryByText('tasks.taskable.label')).toBeNull()

    fireEvent.click(screen.getByText('tasks.todo.form.when.date'))
    expect(screen.getByText('tasks.todo.form.timeOptional')).toBeTruthy()

    fireEvent.click(screen.getByText('tasks.todo.form.moreOptions'))
    expect(screen.getByText('tasks.taskable.label')).toBeTruthy()
    expect(screen.getByText('tasks.todo.form.reminderNeedsTime')).toBeTruthy()
  })

  it('this week', async () => {
    const onSubmit = vi.fn()
    render(<TodoForm onSubmit={onSubmit} initialValues={{ title: 'Offer', when: 'week' }} />)
    fireEvent.submit(screen.getByLabelText('tasks.todo.form.titleLabel').closest('form'))
    await Promise.resolve()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ period_type: 'week' }))
  })
})
