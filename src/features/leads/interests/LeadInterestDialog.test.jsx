// @vitest-environment jsdom
// Smoke test of the lead interest dialog (2026-10-15) against a fake catalog: pick → details per capabilities → save
// sends the old request shape plus the fields that apply.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))

const realEstate = { id: 2, name: 'Real estate', kind: 'product', status: true, capabilities: [{ code: 'unique_unit', version: 1, config: {} }, { code: 'availability', version: 1, config: { hold_days: 7 } }] }
const tours = { id: 3, name: 'Tours', kind: 'service', status: true, capabilities: [{ code: 'scheduling', version: 1, config: {} }, { code: 'participants', version: 1, config: { min: 1, max: 6 } }] }
const villa = { id: 41, name: 'Villa 12', price: 9000000, kind: 'product', item_type_id: 2, status: 1 }
const tour = { id: 42, name: 'Sharm trip', price: 5000, kind: 'service', item_type_id: 3, status: 1 }
const insurance = { id: 43, name: 'Travel insurance', price: 300, kind: 'service', status: 1 }

const routes = [
  [/\/product\/item-types$/, { data: [realEstate, tours] }],
  [/\/product\/data$/, { data: [villa, tour, insurance] }],
  [/\/product\/products\/42\/relations$/, { data: [{ id: 9, child_product_id: 43, inclusion: 'optional', quantity: 1, child_product: insurance }] }],
  [/\/product\/products\/41\/relations$/, { data: [] }],
  [/\/product\/product-instances$/, { data: [
    { id: 70, product_id: 41, unit_attributes: { building: 'B2', unit: 'A-305' }, availability_status: 'available', status: true },
    { id: 71, product_id: 41, unit_attributes: { building: 'B2', unit: 'A-306' }, availability_status: 'sold', status: true },
  ] }],
]
const get = vi.fn(async (url) => ({ data: (routes.find(([pattern]) => pattern.test(url)) || [null, { data: [] }])[1] }))
const post = vi.fn(async () => ({ data: { data: { id: 1 } } }))
vi.mock('../../../services/httpClient', () => ({
  default: { get: (...args) => get(...args), post: (...args) => post(...args), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const i18n = { language: 'en', dir: () => 'ltr', changeLanguage: async () => {}, on() {}, off() {} }
const t = (key) => key
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t, i18n }), Trans: ({ children }) => children, initReactI18next: { type: '3rdParty', init() {} } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() } }))

const { LeadInterestDialog } = await import('./LeadInterestDialog')

function renderDialog(props = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const onSaved = vi.fn()
  render(
    <QueryClientProvider client={client}>
      <LeadInterestDialog open customer={{ id: 1, lead: { id: 5, name: 'Ahmed' } }} onClose={() => {}} onSaved={onSaved} {...props} />
    </QueryClientProvider>
  )
  return { onSaved }
}

afterEach(() => {
  cleanup()
  post.mockClear()
})

describe('LeadInterestDialog', () => {
  it('one-of-a-kind item: pick units (sold ones disabled) and save them', async () => {
    const { onSaved } = renderDialog()
    fireEvent.click(await screen.findByText('Villa 12'))
    const available = await screen.findByText('B2 · A-305')
    expect(screen.queryByText('leads.interestDialog.fields.quantity')).toBeNull()
    const sold = screen.getByText('B2 · A-306').closest('label').querySelector('input')
    expect(sold.disabled).toBe(true)
    fireEvent.click(available.closest('label').querySelector('input'))
    fireEvent.submit(document.getElementById('form-dialog'))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(post).toHaveBeenCalledWith('/api/tenant/interesteds/save', {
      lead_id: 5,
      interesteds: [{ product_id: 41, note: '', interest_level: 'high', item_type_id: 2, item_instance_ids: [70], estimated_value: 9000000 }],
    })
  })

  it('service: date, people and an optional add-on in the estimate', async () => {
    const { onSaved } = renderDialog()
    fireEvent.click(await screen.findByText('leads.interestDialog.kinds.service'))
    fireEvent.click(await screen.findByText('Sharm trip'))
    fireEvent.change(await screen.findByLabelText('leads.interestDialog.fields.participants'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('leads.interestDialog.fields.preferredDate'), { target: { value: '2026-11-01' } })
    fireEvent.click((await screen.findByText('Travel insurance')).closest('label').querySelector('input'))
    fireEvent.submit(document.getElementById('form-dialog'))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(post.mock.calls[0][1].interesteds[0]).toEqual({
      product_id: 42, note: '', interest_level: 'high', item_type_id: 3,
      preferred_date: '2026-11-01', participants: 2, optional_product_ids: [43], estimated_value: 10300,
    })
  })

  it('edit opens on the details of the saved product and sends the id', async () => {
    renderDialog({ interest: { id: 12, product_id: 42, interest_level: 'low', notes: 'later' } })
    expect(await screen.findByText('Sharm trip')).toBeTruthy()
    fireEvent.submit(document.getElementById('form-dialog'))
    await waitFor(() => expect(post).toHaveBeenCalled())
    expect(post.mock.calls[0][0]).toBe('/api/tenant/interesteds/edite')
    expect(post.mock.calls[0][1]).toMatchObject({ id: 12, lead_id: 5, interesteds: [{ id: 12, product_id: 42, interest_level: 'low', note: 'later' }] })
  })

  it('bulk: the same interest is saved once per selected lead (customers without a lead skipped)', async () => {
    const { onSaved } = renderDialog({ customer: null, customers: [{ id: 1, lead: { id: 5 } }, { id: 2, lead: { id: 6 } }, { id: 3 }] })
    expect(await screen.findByText('leads.interestDialog.skippedNoLead')).toBeTruthy()
    fireEvent.click(await screen.findByText('Travel insurance'))
    await screen.findByText('leads.interestDialog.fields.level')
    fireEvent.submit(document.getElementById('form-dialog'))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(post.mock.calls.map((call) => call[1].lead_id)).toEqual([5, 6])
    expect(post.mock.calls[0][1].interesteds[0]).toMatchObject({ product_id: 43, quantity: 1 })
  })
})
