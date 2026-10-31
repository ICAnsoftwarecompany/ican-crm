// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }))
vi.mock('../tasks', async () => ({ ...await import('../tasks/utils/taskMeta'), ...await import('../tasks/constants/taskableTypes'), TaskDrawer: ({ taskId }) => <div>task-{taskId}</div> }))
vi.mock('../../shared/components/overlays/AppDrawer', () => ({ AppDrawer: ({ children }) => <section>{children}</section> }))
import { LeadTasksCell } from './LeadTasksCell'
afterEach(cleanup)

it('opens the lead task list then the selected task without opening the customer row', () => {
  const onRow = vi.fn()
  render(<div onClick={onRow}><LeadTasksCell leadId={15} name="A" tasks={[{ id: 4, title: 'Call', status: 'pending', due_date: '2026-10-23' }]} now={new Date(2026, 9, 22).getTime()} /></div>)
  expect(screen.getByText('customers.leadTaskDisplay.remaining')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'customers.leadTaskDisplay.open' }))
  fireEvent.click(screen.getByRole('button', { name: 'Call' }))
  expect(screen.getByText('task-4')).toBeTruthy()
  expect(onRow).not.toHaveBeenCalled()
})

it('shows a load failure instead of a false zero count', () => {
  const retry = vi.fn()
  render(<LeadTasksCell leadId={15} tasks={[]} now={Date.now()} error={new Error('Unavailable')} onRetry={retry} />)
  expect(screen.queryByText('customers.leadTaskDisplay.count')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'tasks.entity.loadFailed' }))
  expect(retry).toHaveBeenCalled()
})
