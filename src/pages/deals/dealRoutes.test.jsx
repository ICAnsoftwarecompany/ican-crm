// @vitest-environment jsdom
// Smoke test of the whole deals area (2026-10-03): every hub and workspace page renders against a fake
// backend that answers like the Postman "Deals Workspace" collection; the won / lost dialogs open from the board.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

window.matchMedia = window.matchMedia || (() => ({
  matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
}))
window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} }
window.scrollTo = window.scrollTo || (() => {})

const stages = [
  { id: 10, name: 'New', order: 1, color: '#3498db' },
  { id: 11, name: 'Negotiation', order: 2, color: '#f39c12' },
  { id: 12, name: 'Won', order: 3, is_won_stage: true, color: '#2ecc71' },
  { id: 13, name: 'Lost', order: 4, is_lost_stage: true, color: '#e74c3c' },
]
const deal = { id: 1, name: 'Q4 Sales Deal', status: 'active', type: 'sales', start_date: '2026-10-01', end_date: '2026-12-31', target_revenue: 500000, target_leads: 100, pipeline_template_id: 5, stages }
const leads = [
  { id: 101, lead_id: 15, stage_id: 10, owner_id: 2, status: 'open', estimated_value: 1000, lead: { name: 'Ahmed Ali', phone: '01000000001' }, created_at: '2026-10-02' },
  { id: 102, lead_id: 16, stage_id: 11, status: 'open', lead: { name: 'Sara Hassan', phone: '01000000002' }, created_at: '2026-10-02' },
  { id: 103, lead_id: 17, stage_id: 12, status: 'won', won_at: '2026-10-02', estimated_value: 590, lead: { name: 'Mona Adel' } },
]
const contract = {
  id: 15, contract_number: 'CT-8F3A21BC', deal_id: 1, deal_lead_id: 103, lead_id: 17, total_amount: '590.00', down_payment: '100.00', payment_type: 'installment', status: 'active', signed_at: '2026-10-02T10:00:00Z',
  payment_plan: { id: 7, plan_type: 'installment', number_of_installments: 1, frequency: 'monthly', installments: [{ installment_number: 1, due_date: '2026-11-01', amount: '490.00', status: 'pending' }] },
}

const routes = [
  [/\/api\/tenant\/deals\/contracts\/15$/, { data: contract }],
  [/\/api\/tenant\/deals\/contracts$/, { data: [contract] }],
  [/\/api\/tenant\/deals\/1\/leads$/, { data: leads }],
  [/\/api\/tenant\/deals\/1\/team$/, { data: [{ id: 1, user_id: 2, role: 'manager', user: { id: 2, name: 'Karim' } }, { id: 2, team_id: 3, role: 'sales_rep', team: { id: 3, name: 'Team A', users: [{ id: 4, name: 'Nour' }] } }] }],
  [/\/api\/tenant\/deals\/1\/products$/, { data: [{ id: 1, product_id: 9, product: { id: 9, name: 'Premium package', price: 150 } }] }],
  [/\/api\/tenant\/deals\/1\/analytics\/\w+$/, { data: {} }],
  [/\/api\/tenant\/deals\/leads\/\d+\/productsc$/, { data: [] }],
  [/\/api\/tenant\/deals\/1$/, { data: deal }],
  [/\/api\/tenant\/deals$/, { data: [deal] }],
  [/\/api\/tenant\/product\/data$/, { data: [{ id: 30, name: 'Villas', products: [{ id: 31, name: 'Villa 12', price: 9000000, category_id: 30, unit_mode: 'unique' }, { id: 32, name: 'Sedan X', price: 800000, category_id: 30, available_units: 5 }] }] }],
  [/\/api\/tenant\/users\/get$/, { data: [{ id: 2, name: 'Karim' }, { id: 4, name: 'Nour' }] }],
  [/\/api\/pipeline-templates$/, { data: [{ id: 5, name: 'Sales Pipeline', type: 'sales', stages }] }],
]

const get = vi.fn(async (url) => {
  const match = routes.find(([pattern]) => pattern.test(url))
  return { data: match ? match[1] : { data: [] } }
})
const post = vi.fn(async (url) => {
  if (url.endsWith('/won')) return { data: { data: contract } }
  if (url === '/api/tenant/pipeline-templates') return { data: { data: { id: 77 } } }
  if (url === '/api/tenant/deals') return { data: { data: { id: 88 } } }
  return { data: {} }
})
vi.mock('../../services/httpClient', () => ({
  default: { get: (...args) => get(...args), post: (...args) => post(...args), put: vi.fn(async () => ({ data: {} })), patch: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({ data: {} })) },
}))

// Keys as text (like the other component tests), plus the i18n bits the shared UI reads.
const i18n = { language: 'en', dir: () => 'ltr', changeLanguage: async () => {}, on() {}, off() {} }
const t = (key) => key
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n }),
  Trans: ({ children }) => children,
  initReactI18next: { type: '3rdParty', init() {} },
}))

const { dealRoutes } = await import('./dealRoutes')

function renderAt(path) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(dealRoutes, { initialEntries: [path] })
  render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>)
  return router
}

afterEach(() => { cleanup(); window.localStorage.clear(); post.mockClear() })

describe('deals area', () => {
  it('lists deals in the hub', async () => {
    renderAt('/deals')
    // DataTable rows are virtualized (no layout in jsdom): check the page and the request instead.
    expect(await screen.findByText('dealWorkspace.createDeal')).toBeTruthy()
    await waitFor(() => expect(get.mock.calls.some(([url]) => url === '/api/tenant/deals')).toBe(true))
  })

  it('shows each deal with quick info on the board (products, team, last action)', async () => {
    renderAt('/deals?view=board')
    expect(await screen.findByText('Q4 Sales Deal')).toBeTruthy()
    // One product without stock data → "one product in units"; 2 team members; latest event = Mona won.
    expect(await screen.findByText('dealWorkspace.productMode.deal.single_product.title')).toBeTruthy()
    expect(await screen.findByText('dealWorkspace.quickInfo.teamCount')).toBeTruthy()
    expect(await screen.findByText(/^dealWorkspace\.quickInfo\.actions\.leadWon/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Q4 Sales Deal/ }).getAttribute('href')).toBe('/deals/1')
    // The sidebar offers creation and the calendar.
    expect(screen.getAllByText('dealWorkspace.hub.pages.new').length).toBeGreaterThan(0)
    expect(screen.getAllByText('dealWorkspace.hub.pages.calendar').length).toBeGreaterThan(0)
  })

  it('fetches the quick info of each deal for the table (same cache as the workspace)', async () => {
    renderAt('/deals')
    expect((await screen.findAllByText('dealWorkspace.quickInfo.lastAction')).length).toBeGreaterThan(0)
    await waitFor(() => {
      const urls = get.mock.calls.map(([url]) => url)
      expect(urls).toEqual(expect.arrayContaining(['/api/tenant/deals/1/team', '/api/tenant/deals/1/products', '/api/tenant/deals/1/leads']))
    })
  })

  it.each(['contracts', 'calendar', 'reports', 'pipelines'])('renders the hub page /deals/%s', async (page) => {
    renderAt(`/deals/${page}`)
    expect((await screen.findAllByText(`dealWorkspace.hub.pages.${page}`)).length).toBeGreaterThan(0)
  })

  it.each([
    ['', 'dealWorkspace.overview.byStage'],
    ['pipeline', 'Ahmed Ali'],
    ['pipeline?view=table', 'dealWorkspace.viewToggle.table'],
    ['contracts', 'dealWorkspace.pageDescriptions.contracts'],
    ['contracts?contract=15', 'CT-8F3A21BC'],
    ['team', 'Team A'],
    ['meetings', 'dealWorkspace.activities.meeting.withCustomer'],
    ['calls', 'dealWorkspace.activities.call.withCustomer'],
    ['tasks', 'dealWorkspace.tasks.addTodo'],
    ['products', 'Premium package'],
    ['reports', 'dealWorkspace.reports.charts.byStage'],
    ['calendar', 'dealWorkspace.pageDescriptions.calendar'],
    ['assistant', 'dealWorkspace.assistant.hintsTitle'],
    ['ai', 'dealWorkspace.pages.ai'],
    ['settings', 'dealWorkspace.settings.sections.general'],
  ])('renders the workspace page /deals/1/%s', async (path, text) => {
    renderAt(`/deals/1${path ? `/${path}` : ''}`)
    expect((await screen.findAllByText('Q4 Sales Deal')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText(text, {}, { timeout: 4000 })).length).toBeGreaterThan(0)
  })

  it('wins a lead from its drawer with the exact Postman body', async () => {
    renderAt('/deals/1/pipeline')
    fireEvent.click(await screen.findByText('Ahmed Ali'))
    const wonButtons = await screen.findAllByText('dealWorkspace.leads.actions.won')
    fireEvent.click(wonButtons[wonButtons.length - 1])
    await waitFor(() => expect(screen.getByText('dealWorkspace.closing.won.title')).toBeTruthy())

    // The deal sells one product → the line is pre-filled and locked (no picker); cash → exactly the Postman body.
    await waitFor(() => expect(screen.getAllByText('Premium package').length).toBeGreaterThan(0))
    expect(screen.queryAllByRole('combobox', { name: 'dealWorkspace.closing.lines.product' })).toHaveLength(0)
    fireEvent.click(screen.getByText('dealWorkspace.closing.won.submit'))
    await waitFor(() => expect(post.mock.calls.some(([url]) => url === '/api/tenant/deals/leads/101/won')).toBe(true))
    const [, body] = post.mock.calls.find(([url]) => url === '/api/tenant/deals/leads/101/won')
    expect(body).toEqual({ items: [{ product_id: 9, quantity: 1, unit_price: 150, discount: 0 }], payment_type: 'cash', down_payment: 150 })
  })

  it('closes a lead as lost with a reason', async () => {
    renderAt('/deals/1/pipeline')
    fireEvent.click(await screen.findByText('Sara Hassan'))
    const lostButtons = await screen.findAllByText('dealWorkspace.leads.actions.lost')
    fireEvent.click(lostButtons[lostButtons.length - 1])
    fireEvent.click(await screen.findByText('dealWorkspace.closing.lost.submit'))
    await waitFor(() => expect(post).toHaveBeenCalledWith('/api/tenant/deals/leads/102/lost', { reason: 'price' }))
  })

  it('creates a deal through the wizard: stages → data → products → team, in that request order', async () => {
    const router = renderAt('/deals/new')
    const next = () => fireEvent.click(screen.getByText('dealWorkspace.wizard.next'))

    // 1. Stages: define a new pipeline (default stages pre-filled).
    fireEvent.click(await screen.findByText('dealWorkspace.wizard.pipeline.new.title'))
    fireEvent.change(screen.getByLabelText('dealWorkspace.pipelines.name'), { target: { value: 'Villas pipeline' } })
    next()
    // 2. First data: the name is required.
    next()
    expect(await screen.findByText('dealWorkspace.wizard.errors.nameRequired')).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/^dealWorkspace.fields.name/), { target: { value: 'Villa 12 sale' } })
    next()
    // 3. Products: one unique piece → the "one piece" template.
    fireEvent.click(await screen.findByText('Villa 12'))
    expect((await screen.findAllByText(/^dealWorkspace.productMode.deal.single_unit.title/)).length).toBeGreaterThan(0)
    next()
    // 4. Team: one user as sales rep.
    await waitFor(() => expect(screen.getAllByRole('option', { name: 'Nour' }).length).toBeGreaterThan(0))
    fireEvent.change(screen.getByLabelText('dealWorkspace.team.add.kinds.user'), { target: { value: '4' } })
    fireEvent.click(screen.getByText('dealWorkspace.team.add.submit'))
    next()
    // 5. Review → create.
    fireEvent.click(await screen.findByText('dealWorkspace.wizard.create'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/deals/88'))

    const urls = post.mock.calls.map(([url]) => url)
    expect(urls).toEqual(['/api/tenant/pipeline-templates', '/api/tenant/deals', '/api/tenant/deals/team', '/api/tenant/deals/products'])
    const bodies = post.mock.calls.map(([, body]) => body)
    expect(bodies[0]).toMatchObject({ name: 'Villas pipeline', type: 'sales', status: true })
    expect(bodies[0].stages.filter((stage) => stage.is_won_stage)).toHaveLength(1)
    expect(bodies[1]).toMatchObject({ pipeline_template_id: 77, name: 'Villa 12 sale' })
    expect(bodies[2]).toEqual({ deal_id: 88, user_id: 4, role: 'sales_rep' })
    expect(bodies[3]).toEqual({ deal_id: 88, product_ids: [31] })
  })
})
