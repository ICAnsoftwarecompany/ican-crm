// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from '../../../locales/index.js'

const post = vi.fn()
vi.mock('../../../services/httpClient', () => ({ default: { get: vi.fn().mockResolvedValue({ data: { data: [] } }), post: (...args) => post(...args) } }))
vi.mock('../../teams/hooks/useTeams', () => ({ useTeams: () => ({ data: [{ id: 7, name: 'Cairo sales' }] }) }))
vi.mock('../../definitions/hooks/useDefinitions', () => ({ useStatuses: () => ({ data: [{ id: 1, name: 'New' }] }), useTags: () => ({ data: [{ id: 3, name: 'Meta' }] }) }))

const { MetaCampaignWizard } = await import('./MetaCampaignWizard')

const center = {
  tenantId: 'tenant-1',
  accountId: '123',
  accounts: [{ account_id: '123', name: 'Main account', currency: 'EGP', timezone_name: 'Africa/Cairo' }],
  integrations: { facebook_pages: [{ page_id: 'page-1', name: 'Clinic Page' }] },
  platform: { id: 'meta' },
}

function renderWizard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/campaigns/meta/create']}>
        <MetaCampaignWizard center={center} />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeAll(async () => {
  await i18n.use(initReactI18next).init({ lng: 'en', fallbackLng: 'en', defaultNS: 'common', resources, interpolation: { escapeValue: false } })
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  post.mockReset()
})

const continueButton = () => screen.getByRole('button', { name: /^Continue/ })

describe('MetaCampaignWizard (smoke)', () => {
  it('guides a leads campaign from template to a resumable publish', async () => {
    renderWizard()
    expect(screen.getByText('What do you want this campaign to achieve?')).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/campaignWizard\./)

    fireEvent.click(screen.getByRole('radio', { name: /Leads via Instant Form/ }))
    fireEvent.click(continueButton())
    expect(screen.getByText('Campaign details and budget')).toBeTruthy()

    // Required fields block "Continue" and are explained inline.
    fireEvent.click(continueButton())
    expect(await screen.findAllByText('Choose the Facebook Page the ads will run from.')).not.toHaveLength(0)

    fireEvent.change(screen.getByLabelText(/^Facebook Page/), { target: { value: 'page-1' } })
    fireEvent.change(screen.getByLabelText(/^Daily budget/), { target: { value: '500' } })
    fireEvent.click(continueButton())
    expect(screen.getByText('Ad sets: destination, audience and placements')).toBeTruthy()

    // Meta-style location search (demo catalog) adds a city with a radius.
    fireEvent.change(screen.getByRole('combobox', { name: /Search a country/ }), { target: { value: 'alex' } })
    const listbox = await screen.findByRole('listbox', {}, { timeout: 3000 })
    const option = await within(listbox).findByRole('option', { name: /^Alexandria\s*City/ }, { timeout: 3000 })
    fireEvent.click(within(option).getAllByRole('button')[0])
    expect(await screen.findByText('Included (2)')).toBeTruthy()
    expect(screen.getByText('+40 km')).toBeTruthy()

    fireEvent.click(continueButton())
    expect(screen.getByText('Ads are saved in the draft for now')).toBeTruthy()
    fireEvent.click(continueButton())
    expect(screen.getByText('Review and publish')).toBeTruthy()

    post.mockImplementation(async (url) => (url.includes('campaigns/create') ? { data: { data: { campaign_id: 'c-1' } } } : { data: { data: { id: 's-1' } } }))
    fireEvent.click(screen.getByRole('button', { name: /Publish campaign/ }))
    expect(await screen.findByText('Campaign and ad sets published')).toBeTruthy()

    const [campaignCall, adSetCall] = post.mock.calls
    expect(campaignCall[1]).toMatchObject({ objective: 'OUTCOME_LEADS', page_id: 'page-1', status: 'PAUSED', daily_budget: 50000, ad_account_id: 'act_123' })
    expect(adSetCall[1]).toMatchObject({ campaign_id: 'c-1', destination_type: 'ON_AD', optimization_goal: 'LEAD_GENERATION' })
    expect(adSetCall[1].targeting.geo_locations.cities[0]).toMatchObject({ radius: 40, distance_unit: 'kilometer' })
  })

  it('autosaves real edits into the drafts panel and never saves an empty wizard', async () => {
    renderWizard()
    await act(async () => { await new Promise((resolve) => { setTimeout(resolve, 1100) }) })
    expect(screen.getAllByText('Your drafts appear here. Every change is saved automatically.')).not.toHaveLength(0)

    fireEvent.click(screen.getByRole('radio', { name: /WhatsApp messages/ }))
    await waitFor(() => expect(screen.getAllByText('Untitled campaign').length).toBeGreaterThan(0), { timeout: 3000 })
    const stored = Object.keys(window.localStorage).find((key) => key.startsWith('ican-campaign-wizard-drafts:v2:tenant-1:meta:123'))
    expect(stored).toBeTruthy()
  })
})
