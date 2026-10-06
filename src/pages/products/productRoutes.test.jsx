// @vitest-environment jsdom
// Smoke test of Products & Services (2026-10-06): every page renders against a fake backend shaped like the
// Postman "Products & Catalog" collection, and the main writes send the collection's request bodies.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

window.matchMedia = window.matchMedia || (() => ({
  matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
}))
window.ResizeObserver = window.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} }
window.scrollTo = window.scrollTo || (() => {})

const itemType = {
  id: 4, code: 'appliance', name: 'Appliances', kind: 'product', service_model: 'B', status: true,
  capabilities: [{ code: 'serial_tracking', version: 1, config: { required: true, pattern: '^[A-Z0-9]{8,12}$' } }, { code: 'warranty', version: 1, config: { months: 24, starts_from: 'installation' } }],
  fulfillment_config: { creates: 'asset' },
}
const product = { id: 31, name: 'Split AC', price: 15000, kind: 'product', item_type_id: 4, is_stock_tracked: 1, stock_quantity: 25, status: 1, capability_values: { warranty: { months: 36 } }, created_at: '2026-10-01' }
const service = { id: 32, name: 'Installation', price: 0, kind: 'service', status: 1 }

const routes = [
  [/\/product\/item-types$/, { data: [itemType] }],
  [/\/product\/units$/, { data: [{ id: 3, code: 'box', name: 'Box', type: 'count', decimals: 0, status: true }] }],
  [/\/product\/products\/31\/units$/, { data: [{ id: 50, unit_id: 1, factor: 1, price: 15000, is_default: true, unit: { id: 1, name: 'Piece' } }] }],
  [/\/product\/products\/31\/relations$/, { data: [{ id: 60, child_product_id: 32, inclusion: 'included', quantity: 1, price_override: 0, auto_add: true, sort_order: 1 }] }],
  [/\/product\/product-instances$/, { data: { data: [{ id: 70, product_id: 31, serial_number: 'AC12345678', availability_status: 'available', status: true }] } }],
  [/\/product\/info\/31$/, { data: product }],
  [/\/product\/data$/, { data: [product, service] }],
  [/\/category\/data$/, { data: [] }],
]

const get = vi.fn(async (url) => {
  const match = routes.find(([pattern]) => pattern.test(url))
  return { data: match ? match[1] : { data: [] } }
})
const post = vi.fn(async (url) => {
  if (url.endsWith('/product/create')) return { data: { data: [{ id: 99 }] } }
  return { data: { data: { id: 1 } } }
})
const put = vi.fn(async () => ({ data: { data: {} } }))
vi.mock('../../services/httpClient', () => ({
  default: { get: (...args) => get(...args), post: (...args) => post(...args), put: (...args) => put(...args), patch: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({ data: {} })) },
}))

const i18n = { language: 'en', dir: () => 'ltr', changeLanguage: async () => {}, on() {}, off() {} }
const t = (key) => key
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t, i18n }),
  Trans: ({ children }) => children,
  initReactI18next: { type: '3rdParty', init() {} },
}))

const { productRoutes } = await import('./productRoutes')

function renderAt(path) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(productRoutes, { initialEntries: [path] })
  render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>)
  return router
}

afterEach(() => { cleanup(); window.localStorage.clear(); post.mockClear(); put.mockClear(); get.mockClear() })

describe('products area', () => {
  it.each([
    ['/products', 'catalog.list.products.title'],
    ['/products/services', 'catalog.list.services.title'],
    ['/products/instances', 'catalog.instances.pageTitle'],
    ['/products/item-types', 'catalog.itemTypes.pageTitle'],
    ['/products/units', 'catalog.units.pageTitle'],
  ])('renders %s', async (path, text) => {
    renderAt(path)
    expect((await screen.findAllByText(text)).length).toBeGreaterThan(0)
  })

  it('shows a product with its item type capabilities and effective values', async () => {
    renderAt('/products/31')
    expect((await screen.findAllByText('Split AC')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('catalog.capabilities.warranty.name')).length).toBeGreaterThan(0)
    // Product override (36 months) wins over the item type default (24).
    expect(await screen.findByText(/catalog\.capabilities\.fields\.months: 36/)).toBeTruthy()
  })

  it.each([
    ['units', '/api/tenant/product/products/31/units'],
    ['relations', '/api/tenant/product/products/31/relations'],
    ['instances', '/api/tenant/product/product-instances'],
  ])('loads the %s tab from its endpoint', async (tab, url) => {
    renderAt(`/products/31?tab=${tab}`)
    expect((await screen.findAllByText('Split AC')).length).toBeGreaterThan(0)
    await waitFor(() => expect(get.mock.calls.some(([called]) => called === url)).toBe(true))
  })

  it('adds serials with the collection body and checks the pattern', async () => {
    renderAt('/products/31?tab=instances')
    fireEvent.click(await screen.findByText('catalog.instances.add'))
    const textarea = await screen.findByRole('textbox', { name: 'catalog.instances.fields.serialNumbers' })
    fireEvent.change(textarea, { target: { value: 'AC12345678\nbad' } })
    fireEvent.submit(textarea.closest('form'))
    expect(await screen.findByText('catalog.instances.patternMismatch')).toBeTruthy()
    expect(post).not.toHaveBeenCalled()

    fireEvent.change(textarea, { target: { value: 'AC12345678\nAC12345679' } })
    fireEvent.submit(textarea.closest('form'))
    await waitFor(() => expect(post).toHaveBeenCalledWith('/api/tenant/product/products/31/instances', {
      instances: [{ serial_number: 'AC12345678' }, { serial_number: 'AC12345679' }],
    }))
  })

  it('creates a product as multipart with the collection field names', async () => {
    renderAt('/products')
    fireEvent.click((await screen.findAllByText('catalog.list.products.create'))[0])
    fireEvent.change(await screen.findByLabelText('catalog.product.fields.name'), { target: { value: 'Fridge' } })
    fireEvent.change(screen.getByLabelText('catalog.product.fields.price'), { target: { value: '9000' } })
    fireEvent.submit(screen.getByLabelText('catalog.product.fields.name').closest('form'))

    await waitFor(() => expect(post).toHaveBeenCalled())
    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/api/tenant/product/create')
    expect(Object.fromEntries(body.entries())).toMatchObject({
      'products[0][name]': 'Fridge', 'products[0][price]': '9000', 'products[0][kind]': 'product', 'products[0][status]': '1', 'products[0][is_stock_tracked]': '0',
    })
  })

  it('creates an item type with code, kind and capabilities', async () => {
    renderAt('/products/item-types')
    fireEvent.click((await screen.findAllByText('catalog.itemTypes.addTitle'))[0])
    fireEvent.change(await screen.findByLabelText('catalog.itemTypes.fields.name'), { target: { value: 'Medicine' } })
    fireEvent.change(screen.getByLabelText('catalog.itemTypes.fields.code'), { target: { value: 'medicine' } })
    fireEvent.submit(screen.getByLabelText('catalog.itemTypes.fields.name').closest('form'))
    await waitFor(() => expect(post).toHaveBeenCalledWith('/api/tenant/product/item-types', {
      code: 'medicine', name: 'Medicine', kind: 'product', status: true, capabilities: [],
    }))
  })
})
