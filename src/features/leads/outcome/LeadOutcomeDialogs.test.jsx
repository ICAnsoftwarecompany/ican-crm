// @vitest-environment jsdom
// Lead won / lost dialogs (2026-10-15) against a fake backend shaped like the Postman collection.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))

const routes = [
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

function renderWith(node) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}>{node}</QueryClientProvider>)
}
const formDataObject = (body) => Object.fromEntries(body.entries())

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
    expect(post.mock.calls.map((call) => call[0])).toEqual(['/api/tenant/leads/5/lost', '/api/tenant/leads/6/lost'])
    expect(formDataObject(post.mock.calls[0][1])).toEqual({ lost_reason_id: '1', note: 'too expensive' })
  })
})

describe('LeadWonDialog', () => {
  it('prefills lines from interests, requires a deal and posts the won body on directe/won', async () => {
    const onDone = vi.fn()
    const customer = { id: 1, lead: { id: 5, name: 'Ahmed', interesteds: [{ id: 3, product_id: 41, quantity: 2 }] } }
    renderWith(<LeadWonDialog open customer={customer} onClose={() => {}} onDone={onDone} />)
    expect(await screen.findByText('Villas deal')).toBeTruthy()
    await waitFor(() => expect(screen.getByLabelText('dealWorkspace.closing.lines.product').value).toBe('41'))

    fireEvent.submit(document.getElementById('form-dialog'))
    expect(await screen.findByText('customers.leadOutcome.won.dealRequired')).toBeTruthy()
    expect(post).not.toHaveBeenCalled()

    fireEvent.change(screen.getByDisplayValue('customers.leadClose.chooseDeal'), { target: { value: '7' } })
    fireEvent.submit(document.getElementById('form-dialog'))
    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(post).toHaveBeenCalledWith('/api/tenant/deals/7/directe/won/5', {
      items: [{ product_id: 41, quantity: 2, unit_price: 9000, discount: 0 }],
      payment_type: 'cash',
      down_payment: 18000,
    })
  })
})
