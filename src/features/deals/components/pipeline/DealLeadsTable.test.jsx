// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { DealLeadsTable } from './DealLeadsTable'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key, i18n: { language: 'en' } }) }))
vi.mock('../../../lead-tasks', () => ({ useLeadTasksColumn: () => ({ id: 'leadTasks', accessor: 'leadTasksCount' }) }))
vi.mock('../../../../shared/components/data-table', () => ({
  DataTable: ({ data, columns, onRowClick }) => <div onClick={() => onRowClick(data[0])}>{columns[0].render(data[0])}</div>,
}))
afterEach(cleanup)

function setup() {
  const row = { id: 12, leadId: 16, customerId: 8, name: 'Tower customer' }
  const actions = { onOpen: vi.fn() }
  render(<MemoryRouter><DealLeadsTable dealId={14} leads={[row]} stages={[]} stageMap={new Map()} ownerNames={new Map()} actions={actions} /></MemoryRouter>)
  return { actions, row }
}

it('opens the drawer once from the adjacent icon or an ordinary name click', () => {
  const { actions, row } = setup()
  fireEvent.click(screen.getByRole('button', { name: 'dealWorkspace.leads.actions.open' }))
  expect(actions.onOpen).toHaveBeenCalledTimes(1)
  expect(actions.onOpen).toHaveBeenCalledWith(row)
  fireEvent.click(screen.getByRole('link'))
  expect(actions.onOpen).toHaveBeenCalledTimes(2)
})

it('preserves native modified-click navigation to the deal-specific lead page', () => {
  const { actions } = setup()
  const link = screen.getByRole('link')
  expect(link.getAttribute('href')).toBe('/deals/14/leads/12')
  expect(fireEvent.click(link, { ctrlKey: true })).toBe(true)
  expect(fireEvent.click(link, { metaKey: true })).toBe(true)
  expect(actions.onOpen).not.toHaveBeenCalled()
})
