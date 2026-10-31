// @vitest-environment jsdom
// Lead won / lost dialogs (2026-10-15) against a fake backend shaped like the Postman collection.
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'

window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))

const routes = [
  [/\/definitions\/status$/, { data: { lead: [{ id: 4, status: 'Sale', type: 'lead', active: 1, is_deal: 1 }, { id: 5, status: 'Lost', type: 'lead', active: 1, is_lost: 1 }] } }],
  [/\/definitions\/lost-reasons$/, { data: [{ id: 1, name: 'High cost', code: 'HIGH_COST', is_active: true, sort_order: 1 }, { id: 2, name: 'Old', is_active: false, sort_order: 2 }] }],
  [/\/product\/data$/, { data: [{ id: 41, name: 'Villa 12', price: 9000, kind: 'product', status: 1 }] }],
  [/\/api\/tenant\/deals$/, { data: [{ id: 7, name: 'Villas deal', status: 'active' }] }],
]
const get = vi.fn(async (url) => ({ data: (routes.find(([pattern]) => pattern.test(url)) || [null, { data: [] }])[1] }))
const post = vi.fn(async () => ({ data: { data: { id: 1 } } }))
vi.mock('../../../services/httpClient', () => ({ default: { get: (...args) => get(...args), post: (...args) => post(...args), put: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))
const i18n = { language: 'en', dir: () => 'ltr', changeLanguage: async () => {}, on() {}, off() {} }
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key, i18n }), Trans: ({ children }) => children, initReactI18next: { type: '3rdParty', init() {} } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() } }))

const { LeadLostDialog, LeadWonDialog } = await import('./index')

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}{location.search}</output>
}

function renderWith(node) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const view = render(<MemoryRouter><QueryClientProvider client={client}>{node}<LocationProbe /></QueryClientProvider></MemoryRouter>)
  return { client, rerender: (next) => view.rerender(<MemoryRouter><QueryClientProvider client={client}>{next}</QueryClientProvider></MemoryRouter>) }
}
const formDataObject = (body) => Object.fromEntries(body.entries())
function submitWon() {
  for (let index = 0; index < 2; index += 1) {
    const next = screen.queryByText('customers.wonSteps.next')
    if (next) fireEvent.click(next)
  }
  fireEvent.submit(document.getElementById('form-dialog'))
}

afterEach(() => {
  cleanup()
  post.mockClear()
})

describe('LeadLostDialog', () => {
  it('needs a defined reason, then posts multipart lost_reason_id + note once per lead', async () => {
    const onDone = vi.fn()
    renderWith(<LeadLostDialog open customers={[{ id: 1, lead: { id: 5 } }, { id: 2, lead: { id: 6 } }]} onClose={() => {}} onDone={onDone} />)
    expect(await screen.findByText('High cost')).toBeTruthy()
    expect(screen.queryByText('Old')).toBeNull()

    fireEvent.submit(document.getElementById('form-dialog'))
    expect(await screen.findByText('customers.leadOutcome.lost.reasonRequired')).toBeTruthy()
    expect(post).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('High cost'))
    fireEvent.change(screen.getByPlaceholderText('customers.leadOutcome.lost.notePlaceholder'), { target: { value: 'too expensive' } })
    fireEvent.submit(document.getElementById('form-dialog'))
    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(post.mock.calls.map((call) => call[0])).toEqual(['/api/tenant/leads/5/lost', '/api/tenant/leads/save/action', '/api/tenant/leads/6/lost', '/api/tenant/leads/save/action'])
    expect(formDataObject(post.mock.calls[0][1])).toEqual({ lost_reason_id: '1', note: 'too expensive' })
    expect(post.mock.calls[1][1]).toEqual(expect.objectContaining({ lead_id: 5, new_status_id: 5, new_status_title: 'Lost', data: expect.objectContaining({ source: 'lead_center_lost', close_type: 'lost', lost_reason_id: 1, note: 'too expensive' }) }))
  })

  it('requires a choice among active lost statuses and blocks saving without one', async () => {
    const { client } = renderWith(<LeadLostDialog open customers={[{ id: 1, lead: { id: 5 } }]} onClose={() => {}} />)
    await screen.findByText('Lost')
    fireEvent.click(await screen.findByText('High cost'))
    await act(async () => client.setQueryData(['statuses', 'list', undefined], { data: { lead: [
      { id: 5, status: 'Lost A', active: 1, is_lost: 1 },
      { id: 6, status: 'Lost B', active: 1, is_lost: 1 },
      { id: 7, status: 'Other', active: 1, is_lost: 0 },
      { id: 8, status: 'Inactive lost', active: 0, is_lost: 1 },
    ] } }))
    await screen.findByText('Lost B')
    expect(screen.queryByText('Other')).toBeNull()
    expect(screen.queryByText('Inactive lost')).toBeNull()
    fireEvent.submit(document.getElementById('form-dialog'))
    await screen.findByText('customers.lostStatusSync.required')
    expect(post).not.toHaveBeenCalled()
    await act(async () => client.setQueryData(['statuses', 'list', undefined], { data: { lead: [] } }))
    await screen.findByText('customers.lostStatusSync.noStatuses')
    fireEvent.submit(document.getElementById('form-dialog'))
    expect(post).not.toHaveBeenCalled()
  })

  it('only closes with the close icon and retries status without recording loss twice', async () => {
    let attempts = 0
    post.mockImplementation(async (url) => {
      if (url === '/api/tenant/leads/save/action' && attempts++ === 0) throw new Error('Status failed')
      return { data: { data: { id: 1 } } }
    })
    const onDone = vi.fn()
    const onClose = vi.fn()
    renderWith(<LeadLostDialog open customers={[{ id: 1, lead: { id: 9 } }]} onClose={onClose} onDone={onDone} />)
    await screen.findByText('Lost')
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.queryByText('actions.cancel')).toBeNull()
    fireEvent.click(await screen.findByText('High cost'))
    fireEvent.submit(document.getElementById('form-dialog'))
    await screen.findByText('customers.lostStatusSync.partialFailure')
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.submit(document.getElementById('form-dialog'))
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1))
    expect(post.mock.calls.filter(([url]) => url === '/api/tenant/leads/9/lost')).toHaveLength(1)
    expect(post.mock.calls.filter(([url]) => url === '/api/tenant/leads/save/action')).toHaveLength(2)
    expect(onClose).toHaveBeenCalledTimes(1)
    post.mockImplementation(async () => ({ data: { data: { id: 1 } } }))
  })
})

describe('LeadWonDialog', () => {
  it('opens the customer deals page after saving the contract action, using customer ID not lead ID', async () => {
    const customer = { id: 11, lead: { id: 99, name: 'Ahmed', interesteds: [{ product_id: 41 }] } }
    renderWith(<LeadWonDialog open customer={customer} onClose={() => {}} initialSaleStatusId={4} />)
    await waitFor(() => expect(screen.getByLabelText('dealWorkspace.closing.lines.product').value).toBe('41'))
    fireEvent.click(screen.getByText('customers.wonSteps.next'))
    fireEvent.click(screen.getByText('customers.wonSteps.next'))
    fireEvent.click(screen.getByLabelText('customers.wonDealFlow.contract'))
    expect(screen.getByTestId('location').textContent).toBe('/')
    fireEvent.submit(document.getElementById('form-dialog'))
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/customers/11/deals?deal=1'))
    expect(post).toHaveBeenCalledWith('/api/tenant/leads/save/action', expect.objectContaining({ lead_id: 99 }))
  })

  it('validates products, advances through payment and settings without saving, and keeps edits when going back', async () => {
    renderWith(<LeadWonDialog open customer={{ id: 1, lead: { id: 5, name: 'Ahmed' } }} onClose={() => {}} />)
    await screen.findByText('Villa 12')
    fireEvent.click(screen.getByText('customers.wonSteps.next'))
    await screen.findByText('dealWorkspace.closing.won.errors.itemsRequired')
    expect(post).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('dealWorkspace.closing.lines.product'), { target: { value: '41' } })
    fireEvent.change(screen.getByLabelText('dealWorkspace.closing.lines.quantity'), { target: { value: '2' } })
    fireEvent.click(screen.getByText('customers.wonSteps.next'))
    expect(screen.getByText('customers.wonSteps.payment').closest('button').getAttribute('aria-current')).toBe('step')
    fireEvent.click(screen.getByText('customers.wonSteps.next'))
    expect(screen.getByText('customers.wonSteps.settings').closest('button').getAttribute('aria-current')).toBe('step')
    expect(post).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('customers.wonSteps.previous'))
    fireEvent.click(screen.getByText('customers.wonSteps.previous'))
    expect(screen.getByLabelText('dealWorkspace.closing.lines.product').value).toBe('41')
    expect(screen.getByLabelText('dealWorkspace.closing.lines.quantity').value).toBe('2')
  })

  it('requires choosing among sale statuses and excludes normal and inactive statuses', async () => {
    const { client } = renderWith(<LeadWonDialog open customer={{ id: 1, lead: { id: 5, name: 'Ahmed', interesteds: [{ product_id: 41 }] } }} onClose={() => {}} />)
    await screen.findByText('Sale')
    await act(async () => client.setQueryData(['statuses', 'list', undefined], { data: { lead: [
      { id: 4, status: 'Sale A', is_deal: 1, active: 1 },
      { id: 6, status: 'Sale B', is_deal: 1, active: 1 },
      { id: 8, status: 'Normal', is_deal: 0, active: 1 },
      { id: 9, status: 'Disabled sale', is_deal: 1, active: 0 },
    ] } }))
    expect(await screen.findByText('Sale B')).toBeTruthy()
    expect(screen.queryByText('Normal')).toBeNull()
    expect(screen.queryByText('Disabled sale')).toBeNull()
    submitWon()
    expect(await screen.findByText('customers.wonStatusSync.required')).toBeTruthy()
    expect(post).not.toHaveBeenCalled()
  })

  it('blocks the sale when no sale statuses exist', async () => {
    const { client } = renderWith(<LeadWonDialog open customer={{ id: 1, lead: { id: 5, interesteds: [{ product_id: 41 }] } }} onClose={() => {}} />)
    await screen.findByText('Sale')
    await act(async () => client.setQueryData(['statuses', 'list', undefined], { data: { lead: [] } }))
    await screen.findByText('customers.wonStatusSync.noStatuses')
    submitWon()
    expect(post).not.toHaveBeenCalled()
  })

  it('keeps a manually selected product when the customer and catalog refresh', async () => {
    const customer = { id: 1, lead: { id: 5, name: 'Ahmed' } }
    const { client, rerender } = renderWith(<LeadWonDialog open customer={customer} onClose={() => {}} />)
    await screen.findByText('Villa 12')
    fireEvent.change(screen.getByLabelText('dealWorkspace.closing.lines.product'), { target: { value: '41' } })
    fireEvent.change(screen.getByLabelText('dealWorkspace.closing.lines.quantity'), { target: { value: '3' } })
    await client.invalidateQueries()
    rerender(<LeadWonDialog open customer={{ ...customer, lead: { ...customer.lead } }} onClose={() => {}} />)
    await waitFor(() => expect(screen.getByLabelText('dealWorkspace.closing.lines.product').value).toBe('41'))
    expect(screen.getByLabelText('dealWorkspace.closing.lines.quantity').value).toBe('3')
    rerender(<LeadWonDialog open={false} customer={customer} onClose={() => {}} />)
    rerender(<LeadWonDialog open customer={customer} onClose={() => {}} />)
    await waitFor(() => expect(screen.getByLabelText('dealWorkspace.closing.lines.product').value).toBe(''))
  })

  it('prefills lines from interests, requires a deal and posts the won body on directe/won', async () => {
    const onDone = vi.fn()
    const customer = { id: 1, lead: { id: 5, name: 'Ahmed', interesteds: [{ id: 3, product_id: 41, quantity: 2 }] } }
    renderWith(<LeadWonDialog open customer={customer} onClose={() => {}} onDone={onDone} />)
    await waitFor(() => expect(screen.getByLabelText('dealWorkspace.closing.lines.product').value).toBe('41'))

    fireEvent.click(screen.getByLabelText('customers.wonDealFlow.yes'))
    expect(await screen.findByText('Villas deal')).toBeTruthy()

    submitWon()
    expect(await screen.findByText('customers.leadOutcome.won.dealRequired')).toBeTruthy()
    expect(post).not.toHaveBeenCalled()

    fireEvent.change(screen.getByDisplayValue('customers.leadClose.chooseDeal'), { target: { value: '7' } })
    submitWon()
    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(post).toHaveBeenCalledWith('/api/tenant/deals/7/directe/won/5', {
      items: [{ product_id: 41, quantity: 2, unit_price: 9000, discount: 0 }],
      payment_type: 'cash',
      down_payment: 18000,
    })
    expect(post).toHaveBeenCalledWith('/api/tenant/leads/save/action', expect.objectContaining({
      lead_id: 5, new_status_id: 4, new_status_title: 'Sale', action: 'create_activity', type: 'status_change',
      data: expect.objectContaining({ source: 'lead_center_won', deal_id: '7', close_type: 'won', payment_type: 'cash', items: [{ product_id: 41, quantity: 2, unit_price: 9000, discount: 0 }] }),
    }))
  })

  it('creates a deal on submit and reuses it when retrying a failed win', async () => {
    const onDone = vi.fn()
    const customer = { id: 1, agent_id: 2, lead: { id: 5, name: 'Ahmed', interesteds: [{ product_id: 41, quantity: 2 }] } }
    post.mockImplementation(async (url) => {
      if (url === '/api/tenant/deals') return { data: { data: { id: 30 } } }
      throw new Error('Unable to save win')
    })
    renderWith(<LeadWonDialog open customer={customer} onClose={() => {}} onDone={onDone} />)
    await waitFor(() => expect(screen.getByLabelText('dealWorkspace.closing.lines.product').value).toBe('41'))
    expect(post).not.toHaveBeenCalled()
    submitWon()
    await screen.findByText('Unable to save win')
    expect(post.mock.calls[0]).toEqual(['/api/tenant/deals', expect.objectContaining({ name: 'Ahmed - Villa 12', description: 'Ahmed - Lead-Center', owner_id: 2, type: 'sales', status: 'active' })])
    expect(post.mock.calls[1][0]).toBe('/api/tenant/deals/30/directe/won/5')
    submitWon()
    await waitFor(() => expect(post.mock.calls.length).toBe(3))
    expect(post.mock.calls.filter(([url]) => url === '/api/tenant/deals')).toHaveLength(1)
    expect(onDone).not.toHaveBeenCalled()
    post.mockImplementation(async () => ({ data: { data: { id: 1 } } }))
  })

  it('does not dismiss on Escape or backdrop and closes with the close icon', async () => {
    const onClose = vi.fn()
    renderWith(<LeadWonDialog open customer={{ id: 1, lead: { id: 5 } }} onClose={onClose} />)
    await screen.findByText('Sale')
    const backgroundEscape = vi.fn()
    document.addEventListener('keydown', backgroundEscape)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(backgroundEscape).not.toHaveBeenCalled()
    document.removeEventListener('keydown', backgroundEscape)
    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.queryByText('actions.cancel')).toBeNull()
    fireEvent.click(screen.getByLabelText('actions.close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('retries only the status update after a successful sale', async () => {
    let attempts = 0
    post.mockImplementation(async (url) => {
      if (url === '/api/tenant/leads/save/action' && attempts++ === 0) throw new Error('Status failed')
      return { data: { data: { id: 30 } } }
    })
    const onDone = vi.fn()
    const onClose = vi.fn()
    renderWith(<LeadWonDialog open customer={{ id: 1, agent_id: 2, lead: { id: 5, name: 'Ahmed', interesteds: [{ product_id: 41 }] } }} onClose={onClose} onDone={onDone} />)
    await screen.findByText('Sale')
    await waitFor(() => expect(screen.getByLabelText('dealWorkspace.closing.lines.product').value).toBe('41'))
    submitWon()
    await screen.findByText('customers.wonStatusSync.partialFailure')
    expect(onClose).not.toHaveBeenCalled()
    expect(onDone).not.toHaveBeenCalled()
    submitWon()
    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(post.mock.calls.filter(([url]) => url === '/api/tenant/deals')).toHaveLength(1)
    expect(post.mock.calls.filter(([url]) => url === '/api/tenant/deals/30/directe/won/5')).toHaveLength(1)
    expect(post.mock.calls.filter(([url]) => url === '/api/tenant/leads/save/action')).toHaveLength(2)
    post.mockImplementation(async () => ({ data: { data: { id: 1 } } }))
  })
})
