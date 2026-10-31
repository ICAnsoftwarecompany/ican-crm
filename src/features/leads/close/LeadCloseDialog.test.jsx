// @vitest-environment jsdom
// Lead close flow (2026-10-04): moves to sale / lost / retarget statuses (or out of a closed one) open the
// dialog instead of a plain status change; confirming sends the usual saveAction body (close data in `data`),
// creates the follow-up task, or adds the leads to a deal.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

const deal = { id: 4, name: 'Villas', status: 'active', stages: [{ id: 40, name: 'New', order: 1 }, { id: 41, name: 'Won', order: 2, is_won_stage: true }] }
const get = vi.fn(async (url) => {
  if (url === '/api/tenant/deals') return { data: { data: [deal] } }
  if (url === '/api/tenant/deals/4') return { data: { data: deal } }
  return { data: {} }
})
const post = vi.fn(async () => ({ data: { status: true } }))
vi.mock('../../../services/httpClient', () => ({
  default: { get: (...args) => get(...args), post: (...args) => post(...args), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))
const t = (key, options) => (options?.count !== undefined ? `${key}:${options.count}` : key)
const i18n = { language: 'en', dir: () => 'ltr', changeLanguage: async () => {}, on() {}, off() {} }
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t, i18n }), Trans: ({ children }) => children, initReactI18next: { type: '3rdParty', init() {} } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))
vi.mock('../outcome/components/LeadWonDialog', () => ({ LeadWonDialog: ({ customer, initialSaleStatusId, onDone, onClose }) => <div data-testid="sale-wizard">{customer.lead_id}:{initialSaleStatusId}<button onClick={() => { onDone({ status: { id: initialSaleStatusId } }); onClose() }}>complete sale</button><button onClick={onClose}>close sale</button></div> }))
vi.mock('../outcome/components/LeadLostDialog', () => ({ LeadLostDialog: ({ customers, initialLostStatusId, onDone, onClose }) => <div data-testid="loss-dialog">{customers.length}:{initialLostStatusId}<button onClick={() => { onDone({ status: { id: initialLostStatusId }, done: customers.length }); onClose() }}>complete loss</button><button onClick={onClose}>close loss</button></div> }))

const { useLeadCloseRequest } = await import('./useLeadCloseRequest')

// Same shape as GET /api/tenant/definitions/status.
const open = { id: 1, status: 'status1', is_lost: 0, is_deal: 0, is_retarget: 0, has_resone: 0 }
const won = { id: 2, status: 'حالة البيع القفل', is_lost: 0, is_deal: 1, is_retarget: 0, has_resone: 0 }
const lost = { id: 3, status: 'حالة الخسارة', is_lost: 1, is_deal: 0, is_retarget: 0, has_resone: 0 }
const retarget = { id: 4, status: 'Later', is_lost: 0, is_deal: 0, is_retarget: 1, has_resone: 0 }
const statuses = [open, won, lost, retarget]
const byId = new Map(statuses.map((status) => [String(status.id), status]))
const row = { id: 50, lead_id: 5, lead: { id: 5, name: 'Ahmed', status_type_id: 1, assigned_to: 3 } }

function Harness({ target, rows = [row], onPlain, onDone, list = statuses }) {
  const close = useLeadCloseRequest({ statuses: list, getOldStatus: (item) => byId.get(String(item.lead?.status_type_id)) })
  return (
    <>
      <button type="button" onClick={() => { if (!close.interceptStatusChange({ rows, status: target, onDone })) onPlain?.() }}>move</button>
      {close.dialog}
    </>
  )
}

function renderHarness(props) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<MemoryRouter><QueryClientProvider client={client}><Harness {...props} /></QueryClientProvider></MemoryRouter>)
  fireEvent.click(screen.getByText('move'))
}
const submitButton = (key) => screen.getAllByText(key).pop()

afterEach(() => { cleanup(); post.mockClear(); get.mockClear() })

describe('lead close flow', () => {
  it('lets a plain status change through', () => {
    const onPlain = vi.fn()
    renderHarness({ target: { id: 9, status: 'Contacted' }, onPlain })
    expect(onPlain).toHaveBeenCalled()
  })

  it('lost: opens the customer loss dialog with the selected status and cancels without changing it', () => {
    const onDone = vi.fn()
    renderHarness({ target: lost, onDone })
    expect(screen.getByTestId('loss-dialog').textContent).toContain('1:3')
    expect(screen.queryByText('customers.leadClose.titles.lost')).toBeNull()
    fireEvent.click(screen.getByText('close loss'))
    expect(screen.queryByTestId('loss-dialog')).toBeNull()
    expect(post).not.toHaveBeenCalled()
    expect(onDone).not.toHaveBeenCalled()
  })

  it('lost: sends every selected customer to the loss dialog and reports completion only on success', () => {
    const onDone = vi.fn()
    renderHarness({ target: lost, onDone, rows: [row, { ...row, lead_id: 6 }] })
    expect(screen.getByTestId('loss-dialog').textContent).toContain('2:3')
    fireEvent.click(screen.getByText('complete loss'))
    expect(onDone).toHaveBeenCalledWith({ status: { id: 3 }, mode: 'lost', done: 2 })
    expect(screen.queryByTestId('loss-dialog')).toBeNull()
    expect(post).not.toHaveBeenCalled()
  })

  it('retarget: closes with a required follow-up (30 days by default) and creates the task', async () => {
    renderHarness({ target: retarget })
    expect((await screen.findAllByText('customers.leadClose.titles.retarget')).length).toBeGreaterThan(0)
    fireEvent.click(submitButton('customers.leadClose.submit.retarget'))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    expect(post.mock.calls[0][1].data).toMatchObject({ close_type: 'retarget' })
    expect(post.mock.calls[0][1].data.follow_up_at).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('sale: opens the transaction wizard and passes the selected sale status', async () => {
    renderHarness({ target: won, rows: [{ ...row, lead: { ...row.lead, deals: [{ deal_id: 4, deal_name: 'Villas', status: 'open' }] } }] })
    expect(screen.getByTestId('sale-wizard').textContent).toContain('5:2')
    expect(screen.queryByText('customers.leadClose.titles.won')).toBeNull()
    expect(post).not.toHaveBeenCalled()
  })

  it('bulk sale: records each customer through the wizard sequentially, never through the legacy close API', async () => {
    const onDone = vi.fn()
    renderHarness({ target: won, onDone, rows: [row, { ...row, lead_id: 6, lead: { ...row.lead, id: 6 } }] })
    expect(screen.getByTestId('sale-wizard').textContent).toContain('5:2')
    fireEvent.click(screen.getByText('complete sale'))
    expect(screen.getByTestId('sale-wizard').textContent).toContain('6:2')
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('close sale'))
    expect(screen.queryByTestId('sale-wizard')).toBeNull()
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ mode: 'won', done: 1 }))
    expect(post).not.toHaveBeenCalled()
  })

  it('reopen needs a note', async () => {
    renderHarness({ target: open, rows: [{ ...row, lead: { ...row.lead, status_type_id: 3 } }] })
    fireEvent.click(submitButton('customers.leadClose.submit.reopen'))
    expect(await screen.findByText('customers.leadClose.errors.reopenNoteRequired')).toBeTruthy()
  })
})
