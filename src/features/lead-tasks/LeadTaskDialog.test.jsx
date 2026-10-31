// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock('../tasks', async () => ({ ...await import('../tasks/utils/taskPayload'), useCurrentUserId: () => 2, useTaskMutations: () => ({ create: { mutateAsync: mocks.create } }) }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
vi.mock('../../shared/components/overlays/AppDrawer', () => ({ AppDrawer: ({ children }) => <div>{children}</div> }))
import { LeadTaskDialog } from './LeadTaskDialog'
afterEach(() => { cleanup(); mocks.create.mockReset() })

it('creates independent copies with text, checklist and attachment', async () => {
  mocks.create.mockResolvedValue({})
  const onClose = vi.fn()
  render(<LeadTaskDialog targets={[{ id: '15', name: 'A' }, { id: '16', name: 'B' }]} onClose={onClose} />)
  fireEvent.change(screen.getByLabelText('tasks.form.titleLabel'), { target: { value: 'Prepare quote' } })
  fireEvent.click(screen.getByRole('button', { name: 'customers.leadTasks.addItem' }))
  fireEvent.change(screen.getByLabelText('customers.leadTasks.item'), { target: { value: 'Call' } })
  const file = new File(['quote'], 'quote.txt')
  fireEvent.change(screen.getByLabelText('tasks.form.attachmentsLabel'), { target: { files: [file] } })
  expect(screen.getByLabelText('customers.leadTasks.reminder').disabled).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'customers.leadTasks.add' }))
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  expect(mocks.create.mock.calls.map(([payload]) => payload.taskable_id)).toEqual(['15', '16'])
  expect(mocks.create.mock.calls[0][0]).toMatchObject({ description: '- [ ] Call', attachments: [file] })
})

it('blocks saving invalid selections', () => {
  render(<LeadTaskDialog targets={[]} invalidCount={1} onClose={vi.fn()} />)
  expect(screen.getByRole('alert').textContent).toBe('customers.leadTasksInvalidTargets')
  expect(screen.getByRole('button', { name: 'customers.leadTasks.add' }).disabled).toBe(true)
})
