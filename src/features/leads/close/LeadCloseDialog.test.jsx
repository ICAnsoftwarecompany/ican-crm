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

const { useLeadCloseRequest } = await import('./useLeadCloseRequest')

// Same shape as GET /api/tenant/definitions/status.
const open = { id: 1, status: 'status1', is_lost: 0, is_deal: 0, is_retarget: 0, has_resone: 0 }
const won = { id: 2, status: 'حالة البيع القفل', is_lost: 0, is_deal: 1, is_retarget: 0, has_resone: 0 }
const lost = { id: 3, status: 'حالة الخسارة', is_lost: 1, is_deal: 0, is_retarget: 0, has_resone: 0 }
const retarget = { id: 4, status: 'Later', is_lost: 0, is_deal: 0, is_retarget: 1, has_resone: 0 }
const statuses = [open, won, lost, retarget]
const byId = new Map(statuses.map((status) => [String(status.id), status]))
const row = { id: 50, lead_id: 5, lead: { id: 5, name: 'Ahmed', status_type_id: 1, assigned_to: 3 } }

function Harness({ target, rows = [row], onPlain, list = statuses }) {
  const close = useLeadCloseRequest({ statuses: list, getOldStatus: (item) => byId.get(String(item.lead?.status_type_id)) })
  return (
    <>
      <button type="button" onClick={() => { if (!close.interceptStatusChange({ rows, status: target })) onPlain?.() }}>move</button>
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

  it('lost: requires a reason, then sends the body and creates the follow-up task', async () => {
    renderHarness({ target: lost })
    expect((await screen.findAllByText('customers.leadClose.titles.lost')).length).toBeGreaterThan(0)
    fireEvent.click(submitButton('customers.leadClose.submit.lost'))
    expect(await screen.findByText('customers.leadClose.errors.reasonRequired')).toBeTruthy()
    expect(post).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('radio', { name: 'customers.leadClose.reasons.price' }))
    fireEvent.change(screen.getByLabelText(/^customers.leadClose.fields.followUp/), { target: { value: '30' } })
    fireEvent.click(submitButton('customers.leadClose.submit.lost'))

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/api/tenant/leads/save/action')
    expect(body).toMatchObject({ lead_id: 5, new_status_id: 3, old_status_title: 'status1', data: { close_type: 'lost', reason_key: 'price', lost_reason_key: 'price' } })
    expect(post.mock.calls[1][0]).toBe('/api/tenant/tasks')
  })

  it('lost: offers the status own reasons when the backend sends them', async () => {
    const withReasons = { ...lost, reasons: [{ id: 31, key: 'budget', label: 'Budget', active: 1 }] }
    renderHarness({ target: withReasons, list: [open, won, withReasons] })
    fireEvent.click(await screen.findByRole('radio', { name: 'Budget' }))
    expect(screen.queryByRole('radio', { name: 'customers.leadClose.reasons.price' })).toBeNull()
    fireEvent.click(submitButton('customers.leadClose.submit.lost'))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post.mock.calls[0][1].data).toMatchObject({ reason_key: 'budget', reason_id: 31 })
  })

  it('retarget: closes with a required follow-up (30 days by default) and creates the task', async () => {
    renderHarness({ target: retarget })
    expect((await screen.findAllByText('customers.leadClose.titles.retarget')).length).toBeGreaterThan(0)
    fireEvent.click(submitButton('customers.leadClose.submit.retarget'))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    expect(post.mock.calls[0][1].data).toMatchObject({ close_type: 'retarget' })
    expect(post.mock.calls[0][1].data.follow_up_at).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('sale: blocked for a lead in an open deal, with a link to the deal', async () => {
    renderHarness({ target: won, rows: [{ ...row, lead: { ...row.lead, deals: [{ deal_id: 4, deal_name: 'Villas', status: 'open' }] } }] })
    expect(await screen.findByText('customers.leadClose.openDeal')).toBeTruthy()
    expect(screen.getByText('customers.leadClose.openDeal').closest('a').getAttribute('href')).toBe('/deals/4/pipeline')
    fireEvent.click(submitButton('customers.leadClose.submit.won'))
    expect(post).not.toHaveBeenCalled()
  })

  it('bulk sale: adds the leads to a deal on its first open stage instead', async () => {
    renderHarness({ target: won, rows: [row, { ...row, lead_id: 6, lead: { ...row.lead, id: 6 } }] })
    const picker = await screen.findByLabelText(/^customers.leadClose.fields.deal/)
    await waitFor(() => expect(screen.getByRole('option', { name: 'Villas' })).toBeTruthy())
    fireEvent.change(picker, { target: { value: '4' } })
    await waitFor(() => expect(get).toHaveBeenCalledWith('/api/tenant/deals/4', expect.anything()))
    await new Promise((resolve) => setTimeout(resolve, 0))
    fireEvent.click(submitButton('customers.leadClose.submit.deal'))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
    expect(post.mock.calls[0]).toEqual(['/api/tenant/deals/leads/add-existing', { deal_id: 4, lead_ids: [5, 6], stage_id: 40 }])
  })

  it('reopen needs a note', async () => {
    renderHarness({ target: open, rows: [{ ...row, lead: { ...row.lead, status_type_id: 3 } }] })
    fireEvent.click(submitButton('customers.leadClose.submit.reopen'))
    expect(await screen.findByText('customers.leadClose.errors.reopenNoteRequired')).toBeTruthy()
  })
})
