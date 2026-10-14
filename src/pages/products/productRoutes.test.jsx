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
  [/\/product\/item-types\/4$/, { data: itemType }],
  [/\/product\/item-types\/5$/, { data: {
    id: 5, code: 'medicine', name: 'Medicine', kind: 'product', status: true,
    capabilities: [{ code: 'units', version: 1, config: { alternatives: [{ unit_id: 3, factor: 10, is_default: true }] } }],
    fulfillment_config: { default_relations: [{ child_product_id: 32, inclusion: 'included', quantity: 1 }] },
  } }],
  [/\/product\/units$/, { data: [{ id: 3, code: 'box', name: 'Box', type: 'count', decimals: 0, status: true }] }],
  [/\/product\/products\/31\/units$/, { data: [{ id: 50, unit_id: 1, factor: 1, price: 15000, is_default: true, unit: { id: 1, name: 'Piece' } }] }],
  [/\/product\/products\/31\/relations$/, { data: [{ id: 60, child_product_id: 32, inclusion: 'included', quantity: 1, price_override: 0, auto_add: true, sort_order: 1 }] }],
  [/\/product\/product-instances$/, { data: { data: [{ id: 70, product_id: 31, serial_number: 'AC12345678', availability_status: 'available', status: true }] } }],
  [/\/product\/info\/31$/, { data: product }],
  [/\/product\/data$/, { data: [product, service] }],
  [/\/category\/data$/, { data: [{ id: 1, name: 'Electronics', type: 'product', status: 1, children_recursive: [{ id: 2, name: 'Cooling', type: 'product', desc: 'ACs and fans', status: 1, data: JSON.stringify([{ brand: '' }]), children_recursive: [] }] }] }],
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
    ['/products/new', 'catalog.create.title.product'],
    ['/products/new?kind=service', 'catalog.create.title.service'],
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

  it('creates a product through the wizard: product, attached item, serials — in order', async () => {
    const router = renderAt('/products')
    fireEvent.click((await screen.findAllByText('catalog.list.products.create'))[0])
    await waitFor(() => expect(router.state.location.pathname).toBe('/products/new'))

    // 1. Basic data + item type (serial_tracking + warranty), loaded with GET /item-types/{id}
    fireEvent.change(await screen.findByLabelText('catalog.product.fields.name'), { target: { value: 'Fridge' } })
    fireEvent.change(screen.getByLabelText('catalog.product.fields.price'), { target: { value: '9000' } })
    fireEvent.change(await screen.findByLabelText('catalog.product.fields.itemType'), { target: { value: '4' } })
    await waitFor(() => expect(get.mock.calls.some(([url]) => url === '/api/tenant/product/item-types/4')).toBe(true))
    fireEvent.click(screen.getByText('actions.next'))

    // 2. Stock comes from serials for this type
    expect(await screen.findByText('catalog.create.stockFromInstances')).toBeTruthy()
    fireEvent.click(screen.getByText('actions.next'))
    // 3. Capabilities from the item type
    expect((await screen.findAllByText('catalog.capabilities.warranty.name')).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByText('actions.next'))
    // 4. Attach an included service
    fireEvent.click(await screen.findByText('catalog.create.addIncluded'))
    fireEvent.change(screen.getByLabelText('catalog.relations.fields.child'), { target: { value: '32' } })
    fireEvent.click(screen.getByText('actions.next'))
    // 5. Serials, checked against the type pattern
    fireEvent.change(await screen.findByRole('textbox', { name: 'catalog.instances.fields.serialNumbers' }), { target: { value: 'AC12345678' } })
    fireEvent.click(screen.getByText('actions.next'))
    // 6. Review → save
    expect(await screen.findByText('catalog.create.requestsTitle')).toBeTruthy()
    fireEvent.click(screen.getByText('catalog.create.save'))

    await waitFor(() => expect(router.state.location.pathname).toBe('/products/99'))
    const urls = post.mock.calls.map(([url]) => url)
    expect(urls).toEqual([
      '/api/tenant/product/create',
      '/api/tenant/product/products/99/relations',
      '/api/tenant/product/products/99/instances',
    ])
    expect(Object.fromEntries(post.mock.calls[0][1].entries())).toMatchObject({
      'products[0][name]': 'Fridge', 'products[0][price]': '9000', 'products[0][kind]': 'product', 'products[0][item_type_id]': '4', 'products[0][status]': '1',
    })
    expect(post.mock.calls[0][1].has('products[0][is_stock_tracked]')).toBe(false)
    expect(post.mock.calls[1][1]).toEqual({ child_product_id: '32', inclusion: 'included', quantity: 1, price_override: 0, auto_add: true, sort_order: 1 })
    expect(post.mock.calls[2][1]).toEqual({ instances: [{ serial_number: 'AC12345678' }] })
  })

  it('resumes after a failed request without creating the product twice', async () => {
    renderAt('/products/new')
    fireEvent.change(await screen.findByLabelText('catalog.product.fields.name'), { target: { value: 'Fridge' } })
    for (let step = 0; step < 3; step += 1) fireEvent.click(screen.getByText('actions.next'))
    fireEvent.click(await screen.findByText('catalog.create.addOptional'))
    fireEvent.change(screen.getByLabelText('catalog.relations.fields.child'), { target: { value: '32' } })
    fireEvent.click(screen.getByText('actions.next'))
    fireEvent.click(await screen.findByText('actions.next'))

    post.mockImplementationOnce(async () => ({ data: { data: [{ id: 99 }] } }))
    post.mockImplementationOnce(async () => { throw Object.assign(new Error('fail'), { response: { data: { message: 'relation failed' } } }) })
    fireEvent.click(await screen.findByText('catalog.create.save'))
    expect(await screen.findByText('relation failed')).toBeTruthy()

    fireEvent.click(screen.getByText('catalog.create.retry'))
    await waitFor(() => expect(post).toHaveBeenCalledTimes(3))
    expect(post.mock.calls.map(([url]) => url)).toEqual([
      '/api/tenant/product/create',
      '/api/tenant/product/products/99/relations',
      '/api/tenant/product/products/99/relations',
    ])
  })

  it('builds an item type from a template on its own page and returns to the product wizard', async () => {
    const router = renderAt('/products/item-types/new?kind=product&returnTo=/products/new')
    fireEvent.click(await screen.findByText('catalogSetup.templates.medicine.name'))
    // The template fills the basics (name, code) and suggests "box × 10", matched to the tenant's unit "box".
    expect(await screen.findByDisplayValue('medicine')).toBeTruthy()
    for (let step = 0; step < 4; step += 1) fireEvent.click(screen.getByText('actions.next'))
    fireEvent.click(await screen.findByText('catalogSetup.typeWizard.save'))
    await waitFor(() => expect(post).toHaveBeenCalledWith('/api/tenant/product/item-types', expect.objectContaining({
      code: 'medicine',
      kind: 'product',
      capabilities: expect.arrayContaining([{ code: 'units', version: 1, config: { alternatives: [{ unit_id: '3', factor: 10, is_default: false }] } }]),
    })))
    await waitFor(() => expect(`${router.state.location.pathname}${router.state.location.search}`).toBe('/products/new?item_type=1'))
  })

  it('validates each stage before moving on', async () => {
    renderAt('/products/item-types/new')
    fireEvent.click(await screen.findByText('catalogSetup.typeWizard.templates.manual'))
    fireEvent.click(await screen.findByText('actions.next'))
    expect(await screen.findByText('catalog.validation.nameRequired')).toBeTruthy()
  })

  it('shows the setup guide only where no item type of that kind exists', async () => {
    renderAt('/products/services')
    expect(await screen.findByText('catalogSetup.guide.title.service')).toBeTruthy()
    cleanup()
    renderAt('/products')
    expect((await screen.findAllByText('catalog.list.products.title')).length).toBeGreaterThan(0)
    await waitFor(() => expect(get.mock.calls.some(([url]) => url.endsWith('/product/item-types'))).toBe(true))
    expect(screen.queryByText('catalogSetup.guide.title.product')).toBeNull()
  })

  it('fills a new product with the default units and attached items of its type', async () => {
    renderAt('/products/new?item_type=5')
    expect(await screen.findByText('catalog.create.typeDefaultsApplied')).toBeTruthy()
  })

  it('shows every step without an item type and only what applies with one', async () => {
    renderAt('/products/new')
    expect((await screen.findAllByText('catalog.create.steps.instances.title')).length).toBeGreaterThan(0)
    cleanup()
    renderAt('/products/new?item_type=5')
    expect(await screen.findByText('catalog.create.typeDefaultsApplied')).toBeTruthy()
    expect(screen.queryByText('catalog.create.steps.instances.title')).toBeNull()
  })

  it('shows the category path with the details of each level', async () => {
    renderAt('/products/new')
    const select = await screen.findByLabelText('catalog.product.fields.category')
    await waitFor(() => expect(select.querySelectorAll('option').length).toBeGreaterThan(2))
    fireEvent.change(select, { target: { value: '2' } })
    expect(await screen.findByText('ACs and fans')).toBeTruthy()
    expect(screen.getByText('productSetup.category.level.parent')).toBeTruthy()
    expect(screen.getByText('productSetup.category.level.selected')).toBeTruthy()
  })

  it('adds a category and an item type quickly from the wizard', async () => {
    renderAt('/products/new')
    fireEvent.click((await screen.findAllByText('productSetup.quickCategory.open'))[0])
    fireEvent.change(await screen.findByLabelText('productSetup.quickCategory.name'), { target: { value: 'Fans' } })
    fireEvent.submit(screen.getByLabelText('productSetup.quickCategory.name').closest('form'))
    await waitFor(() => expect(post.mock.calls.some(([url]) => url === '/api/tenant/category/create')).toBe(true))

    fireEvent.click((await screen.findAllByText('productSetup.quickType.open'))[0])
    fireEvent.change(await screen.findByLabelText('catalog.itemTypes.fields.name'), { target: { value: 'Fans' } })
    fireEvent.submit(screen.getByLabelText('catalog.itemTypes.fields.name').closest('form'))
    await waitFor(() => expect(post).toHaveBeenCalledWith('/api/tenant/product/item-types', expect.objectContaining({ code: 'fans', name: 'Fans', kind: 'product' })))
  })

  it('keeps the product as a draft when opening the full item type page, and restores it', async () => {
    const router = renderAt('/products/new')
    fireEvent.change(await screen.findByLabelText('catalog.product.fields.name'), { target: { value: 'Window AC' } })
    fireEvent.click((await screen.findAllByText('productSetup.quickType.open'))[0])
    fireEvent.click(await screen.findByText('catalogSetup.quickType.openFull'))
    await waitFor(() => expect(router.state.location.pathname).toBe('/products/item-types/new'))
    const returnTo = new URLSearchParams(router.state.location.search).get('returnTo')
    expect(returnTo).toMatch(/^\/products\/new\?draft=/)
    cleanup()
    renderAt(`${returnTo}&item_type=4`)
    expect(await screen.findByDisplayValue('Window AC')).toBeTruthy()
    expect(await screen.findByText('productSetup.drafts.restored')).toBeTruthy()
  })

  it('quick adds items with Enter and lists them in the side panel', async () => {
    renderAt('/products/new?kind=service')
    fireEvent.click(await screen.findByLabelText('productSetup.quickAdd.toggle'))
    const name = await screen.findByLabelText('catalog.product.fields.name')
    fireEvent.change(name, { target: { value: 'Deep cleaning' } })
    fireEvent.change(screen.getByLabelText('catalog.product.fields.price'), { target: { value: '300' } })
    fireEvent.submit(name.closest('form'))
    await waitFor(() => expect(post.mock.calls.some(([url]) => url === '/api/tenant/product/create')).toBe(true))
    expect(await screen.findByText('Deep cleaning')).toBeTruthy()
    expect(name.value).toBe('')
    fireEvent.click(screen.getByText('productSetup.quickAdd.showAll.service'))
    expect(await screen.findByText('Installation')).toBeTruthy()
  })

  it('shows the overview with totals and warns about missing service types', async () => {
    renderAt('/products/overview')
    expect((await screen.findAllByText('productOverview.title')).length).toBeGreaterThan(0)
    expect(await screen.findByText('productOverview.alerts.noTypes.service')).toBeTruthy()
    expect(screen.queryByText('productOverview.alerts.noTypes.product')).toBeNull()
    expect(screen.getByText('productOverview.section.title.product')).toBeTruthy()
  })

  it('lists every field with completeness, no stat tiles, and opens the quick drawer from the name', async () => {
    renderAt('/products')
    expect((await screen.findAllByText('Split AC')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('productDetails.columns.completeness').length).toBeGreaterThan(0)
    expect(screen.queryByText('catalog.list.activeCount')).toBeNull()
    fireEvent.click(screen.getAllByLabelText('dataTable.openDrawer')[0])
    expect(await screen.findByText('productDetails.drawer.openPage')).toBeTruthy()
    expect(screen.getByText('productDetails.completeness.action')).toBeTruthy()
  })

  it('completes only the missing data with a guide and saves once', async () => {
    renderAt('/products/31/complete')
    expect((await screen.findAllByText('productDetails.complete.steps.category.title')).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByText('productDetails.complete.later'))
    fireEvent.change(await screen.findByLabelText('catalog.product.fields.description'), { target: { value: 'Inverter, 1.5 HP' } })
    fireEvent.click(screen.getByText('actions.next'))
    fireEvent.click(await screen.findByText('productDetails.complete.later'))
    fireEvent.click(await screen.findByText('productDetails.complete.save'))
    await waitFor(() => expect(post.mock.calls.some(([url]) => url === '/api/tenant/product/update/31')).toBe(true))
  })
})
