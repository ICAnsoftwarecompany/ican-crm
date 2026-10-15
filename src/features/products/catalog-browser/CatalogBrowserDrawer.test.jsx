// @vitest-environment jsdom
// Catalog browser side panel (2026-10-15): kind tabs, type / category filters, click → full data → back.
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }))
window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} }

const routes = [
  [/\/product\/item-types$/, { data: [{ id: 2, name: 'Real estate', kind: 'product', status: true, capabilities: [{ code: 'unique_unit' }] }, { id: 3, name: 'Tours', kind: 'service', status: true, capabilities: [] }] }],
  [/\/product\/data$/, { data: [
    { id: 41, name: 'Villa 12', price: 9000000, kind: 'product', item_type_id: 2, status: 1, category: { id: 1, name: 'Villas' } },
    { id: 42, name: 'Sharm trip', price: 5000, kind: 'service', item_type_id: 3, status: 1, category: { id: 2, name: 'Trips' } },
    { id: 43, name: 'Old flat', price: 100, kind: 'product', item_type_id: 2, status: 0 },
  ] }],
  [/\/product\/info\/42$/, { data: { id: 42, name: 'Sharm trip', price: 5000, kind: 'service', item_type_id: 3, status: 1, description: 'Five days' } }],
]
const get = vi.fn(async (url) => ({ data: (routes.find(([pattern]) => pattern.test(url)) || [null, { data: [] }])[1] }))
vi.mock('../../../services/httpClient', () => ({ default: { get: (...args) => get(...args), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))
vi.mock('../../../services/apiBaseUrl', () => ({ resolveApiBaseURL: () => 'https://tenant.example.com' }))
const i18n = { language: 'en', dir: () => 'ltr', changeLanguage: async () => {}, on() {}, off() {} }
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key, i18n }), Trans: ({ children }) => children, initReactI18next: { type: '3rdParty', init() {} } }))

const { CatalogBrowserDrawer } = await import('./CatalogBrowserDrawer')

function renderBrowser() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter><CatalogBrowserDrawer open onClose={() => {}} /></MemoryRouter>
    </QueryClientProvider>
  )
}

afterEach(cleanup)

describe('CatalogBrowserDrawer', () => {
  it('filters by kind, type and inactive, then opens an item in place and goes back', async () => {
    renderBrowser()
    expect(await screen.findByText('Villa 12')).toBeTruthy()
    expect(screen.queryByText('Old flat')).toBeNull()

    fireEvent.click(screen.getByLabelText('catalog.browser.showInactive'))
    expect(await screen.findByText('Old flat')).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: /catalog.browser.kinds.service/ }))
    expect(screen.queryByText('Villa 12')).toBeNull()
    const typeSelect = screen.getByLabelText('catalog.browser.itemType')
    expect(within(typeSelect).getAllByRole('option').map((option) => option.textContent)).toEqual(['catalog.browser.allTypes', 'Tours'])

    fireEvent.click(screen.getByText('Sharm trip'))
    expect(await screen.findByText('Five days')).toBeTruthy()
    fireEvent.click(screen.getByText('catalog.browser.back'))
    expect(await screen.findByText('Sharm trip')).toBeTruthy()
    expect(screen.queryByText('Five days')).toBeNull()
  })
})
