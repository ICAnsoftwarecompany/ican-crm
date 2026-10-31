// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CustomerDealsWorkspace } from './CustomerDealsWorkspace'
import { CustomerDealsDrawerSection } from './CustomerDealsDrawerSection'
import { CustomerDealsCount } from './CustomerDealsCount'
import { useCustomerDealColumns } from './useCustomerDealColumns'
import { DoneCustomerDrawer } from '../../../pages/customers/components/DoneCustomerDrawer'
import { customerDealsPath, normalizeCustomerDeals } from './customerDealsModel'

window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('../../../services/httpClient', () => ({ default: { get } }))
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key, i18n: { language: 'en', dir: () => 'ltr' } }) }))
vi.mock('../../tasks', () => ({ EntityTasksPanel: () => null }))

const response = { success: true, data: {
  customer: { id: 11, name: 'Ahmed', phone: '01000', email: 'ahmed@example.com' },
  summary: { deals_count: 2, won: 1, open: 0, lost: 1, total_won_value: 290 },
  deals: [
    { id: 84, deal_id: 5, status: 'won', won_value: '290.00', deal: { name: 'Purchased product', description: 'Ahmed - Lead-Center' }, products: [{ id: 1, product: { name: 'Medicine X' }, quantity: 2, unit_price: 150, discount: 10, total_price: 290 }], contracts: [{ id: 8, contract_number: 'CT-123', total_amount: 290, down_payment: 100, payment_type: 'installment', payment_plan: { number_of_installments: 5, installments: [{ id: 1, installment_number: 1, amount: 38, paid_amount: 38, status: 'paid', due_date: '2026-10-01' }] } }] },
    { id: 85, deal_id: 6, status: 'lost', deal: { name: 'Lost transaction' }, products: [], contracts: [] },
  ],
} }

function mount(node = <CustomerDealsWorkspace customerId="11" selectedDealId="5" />) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<MemoryRouter><QueryClientProvider client={client}>{node}</QueryClientProvider></MemoryRouter>)
}
afterEach(() => { cleanup(); get.mockReset() })

describe('Customer Deals 360', () => {
  it('shows a customer deal count and links using customer ID', async () => {
    get.mockResolvedValue({ data: response })
    mount(<CustomerDealsCount customerId={11} />)
    expect(await screen.findByText('2')).toBeTruthy()
    expect(screen.getByRole('link').getAttribute('href')).toBe('/customers/11/deals')
  })

  it('limits the done drawer to supplied table columns and customer deals', async () => {
    get.mockResolvedValue({ data: response })
    mount(<DoneCustomerDrawer open customer={{ id: 11, name: 'Ahmed', phone: '01000', company: 'Hidden company', private_note: 'Hidden note' }} columns={[{ id: 'name', accessor: 'name', header: 'Name' }, { id: 'phone', accessor: 'phone', header: 'Phone' }]} onClose={() => {}} />)
    expect(await screen.findByText('Purchased product')).toBeTruthy()
    expect(screen.getByText('01000')).toBeTruthy()
    expect(screen.queryByText('Hidden company')).toBeNull()
    expect(screen.queryByText('Hidden note')).toBeNull()
    expect(screen.queryByRole('tab')).toBeNull()
    expect(get.mock.calls.every(([url]) => url === '/api/tenant/customers/11/deals')).toBe(true)
  })

  it('creates a separate numbered column per transaction and leaves missing transactions empty', async () => {
    get.mockResolvedValue({ data: response })
    function TableProbe() {
      const { rows, columns } = useCustomerDealColumns([{ id: 11 }], true)
      return <div>{columns.map((column) => <section key={column.id} data-testid={column.id}>{column.render(rows[0])}</section>)}</div>
    }
    mount(<TableProbe />)
    await screen.findByText('Purchased product')
    expect(screen.getByTestId('customer_deal_1')).toBeTruthy()
    expect(screen.getByTestId('customer_deal_2')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'customers.deals360.openDeal: Lost transaction' }).getAttribute('href')).toBe('/customers/11/deals?deal=6')
  })

  it('shows customer deals in the drawer with customer and selected-deal page links', async () => {
    get.mockResolvedValue({ data: response })
    mount(<CustomerDealsDrawerSection customerId={11} />)
    const dealLink = await screen.findByRole('link', { name: 'customers.deals360.openDeal: Purchased product' })
    expect(dealLink.getAttribute('href')).toBe('/customers/11/deals?deal=5')
    expect(screen.getByRole('link', { name: 'customers.deals360.openCustomerDeals' }).getAttribute('href')).toBe('/customers/11/deals')
    expect(screen.getByText(/Medicine X/)).toBeTruthy()
    expect(get).toHaveBeenCalledWith('/api/tenant/customers/11/deals')
  })

  it('loads the selected contract by its own ID through the contract details endpoint', async () => {
    get.mockImplementation(async (url) => ({ data: url === '/api/tenant/deals/contract/8'
      ? { data: { id: 8, contract_number: 'CT-LIVE', deal_id: 5, total_amount: 500, down_payment: 200, lead: { name: 'Ahmed' }, payment_plan: { installments: [] } } }
      : response }))
    mount()
    await screen.findByText('CT-123')
    expect(get).not.toHaveBeenCalledWith('/api/tenant/deals/contract/8', expect.anything())
    fireEvent.click(screen.getByText('customers.deals360.viewContract'))
    expect(await screen.findByText('CT-LIVE')).toBeTruthy()
    expect(get).toHaveBeenCalledWith('/api/tenant/deals/contract/8', { params: undefined })
  })

  it('builds reusable customer routes and handles empty responses', () => {
    expect(customerDealsPath(11)).toBe('/customers/11/deals')
    expect(customerDealsPath(11, 5)).toBe('/customers/11/deals?deal=5')
    expect(normalizeCustomerDeals({})).toEqual({ customer: {}, summary: {}, deals: [] })
  })

  it('loads the customer endpoint and renders Lead-Center transactions, products, contracts and installments', async () => {
    get.mockResolvedValue({ data: response })
    mount()
    expect(await screen.findByText('Ahmed')).toBeTruthy()
    expect(get).toHaveBeenCalledWith('/api/tenant/customers/11/deals')
    expect(screen.getByText('Purchased product').closest('details').open).toBe(true)
    expect(screen.getByText('Medicine X')).toBeTruthy()
    expect(screen.getByText('CT-123')).toBeTruthy()
    expect(screen.getByText('customers.deals360.states.paid')).toBeTruthy()
    expect(screen.getAllByText('customers.deals360.openDeal')[0].getAttribute('href')).toBe('/deals/5')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'CT-123' } })
    expect(screen.queryByText('Lost transaction')).toBeNull()
    fireEvent.click(screen.getByText('customers.deals360.lost', { selector: 'button' }))
    expect(screen.getByText('customers.deals360.noMatches')).toBeTruthy()
  })

  it('shows the empty state', async () => {
    get.mockResolvedValue({ data: { success: true, data: { customer: {}, deals: [] } } })
    mount()
    expect(await screen.findByText('customers.deals360.empty')).toBeTruthy()
  })

  it('shows an error and retries without changing the endpoint', async () => {
    get.mockRejectedValueOnce(new Error('failed')).mockResolvedValue({ data: response })
    mount()
    expect(await screen.findByRole('alert')).toBeTruthy()
    fireEvent.click(screen.getByText('customers.deals360.retry'))
    await waitFor(() => expect(screen.getByText('Ahmed')).toBeTruthy())
  })
})
