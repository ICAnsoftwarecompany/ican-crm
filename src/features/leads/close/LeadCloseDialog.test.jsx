// @vitest-environment jsdom
// Lead close flow (2026-10-04): a move to a lost status opens the dialog instead of changing the status;
// confirming sends the usual saveAction body (close data in `data`) and creates the follow-up task.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

const post = vi.fn(async () => ({ data: { status: true } }))
vi.mock('../../../services/httpClient', () => ({
  default: { get: vi.fn(async () => ({ data: {} })), post: (...args) => post(...args), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))
const t = (key, options) => (options?.count !== undefined ? `${key}:${options.count}` : key)
const i18n = { language: 'en', dir: () => 'ltr', changeLanguage: async () => {}, on() {}, off() {} }
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t, i18n }), Trans: ({ children }) => children, initReactI18next: { type: '3rdParty', init() {} } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

const { useLeadCloseRequest } = await import('./useLeadCloseRequest')

const open = { id: 1, status: 'New' }
const lost = { id: 8, status: 'Lost', is_lost: 1 }
const won = { id: 7, status: 'Sold', is_deal: 1 }
const statuses = [open, lost, won]
const byId = new Map(statuses.map((status) => [String(status.id), status]))
const row = { id: 50, lead_id: 5, lead: { id: 5, name: 'Ahmed', status_type_id: 1, assigned_to: 3 } }

function Harness({ target, rows = [row], onPlain }) {
  const close = useLeadCloseRequest({ statuses, getOldStatus: (item) => byId.get(String(item.lead?.status_type_id)) })
  return (
    <>
      <button type="button" onClick={() => { if (!close.interceptStatusChange({ rows, status: target })) onPlain() }}>move</button>
      {close.dialog}
    </>
  )
}

function renderHarness(props) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><Harness {...props} /></QueryClientProvider>)
}

afterEach(() => { cleanup(); post.mockClear() })

describe('lead close flow', () => {
  it('lets a plain status change through', () => {
    const onPlain = vi.fn()
    renderHarness({ target: { id: 2, status: 'Contacted' }, onPlain })
    fireEvent.click(screen.getByText('move'))
    expect(onPlain).toHaveBeenCalled()
    expect(screen.queryByText('customers.leadClose.titles.lost')).toBeNull()
  })

  it('requires a reason, then closes as lost and creates the follow-up task', async () => {
    renderHarness({ target: lost, onPlain: vi.fn() })
    fireEvent.click(screen.getByText('move'))
    expect((await screen.findAllByText('customers.leadClose.titles.lost')).length).toBeGreaterThan(0)

    fireEvent.click(screen.getAllByText('customers.leadClose.submit.lost').pop())
    expect(await screen.findByText('customers.leadClose.errors.reasonRequired')).toBeTruthy()
    expect(post).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('radio', { name: 'customers.leadClose.reasons.price' }))
    fireEvent.change(screen.getByLabelText(/^customers.leadClose.fields.followUp/), { target: { value: '30' } })
    fireEvent.click(screen.getAllByText('customers.leadClose.submit.lost').pop())

    await waitFor(() => expect(post).toHaveBeenCalledTimes(2))
    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/api/tenant/leads/save/action')
    expect(body).toMatchObject({ lead_id: 5, action: 'create_activity', new_status_id: 8, old_status_title: 'New', data: { source: 'lead_close', close_type: 'lost', lost_reason_key: 'price' } })
    expect(body.data.follow_up_at).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(post.mock.calls[1][0]).toBe('/api/tenant/tasks')
  })

  it('refuses a bulk win (each won lead has its own product and value)', async () => {
    renderHarness({ target: won, rows: [row, { ...row, lead_id: 6, lead: { ...row.lead, id: 6 } }], onPlain: vi.fn() })
    fireEvent.click(screen.getByText('move'))
    expect(await screen.findByText('customers.leadClose.errors.wonSingleOnly')).toBeTruthy()
  })

  it('asks for a note to reopen a closed lead', async () => {
    renderHarness({ target: open, rows: [{ ...row, lead: { ...row.lead, status_type_id: 8 } }], onPlain: vi.fn() })
    fireEvent.click(screen.getByText('move'))
    expect((await screen.findAllByText('customers.leadClose.titles.reopen')).length).toBeGreaterThan(0)
    fireEvent.click(screen.getAllByText('customers.leadClose.submit.reopen').pop())
    expect(await screen.findByText('customers.leadClose.errors.reopenNoteRequired')).toBeTruthy()
  })
})
