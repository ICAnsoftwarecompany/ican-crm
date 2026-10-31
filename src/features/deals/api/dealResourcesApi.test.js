import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dealResourcesApi } from './dealResourcesApi'

const { post, get, patch, remove } = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn(), patch: vi.fn(), remove: vi.fn() }))
vi.mock('../../../services/httpClient', () => ({ default: { post, get, patch, delete: remove } }))
beforeEach(() => { [post, get, patch, remove].forEach((mock) => mock.mockReset()) })

describe('deal product attachment request', () => {
  it('posts products with details to the deal-scoped endpoint', async () => {
    post.mockResolvedValue({ data: { success: true } })
    const payload = { products: [{ product_id: 1, details: { quantity: 2, unit_price: 750, discount: 50 } }, { product_id: 2, details: { package: 'premium', notes: 'Special' } }] }
    await expect(dealResourcesApi.addProducts(12, payload)).resolves.toEqual({ success: true })
    expect(post).toHaveBeenCalledWith('/api/tenant/deals/12/products', payload)
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('propagates server errors rather than reporting attachment success', async () => {
    const failure = Object.assign(new Error('Failed to attach products.'), { response: { status: 500 } })
    post.mockRejectedValue(failure)
    await expect(dealResourcesApi.addProducts(12, { products: [{ product_id: 1, details: {} }] })).rejects.toThrow('Failed to attach products.')
  })
  it('reads, patches and removes using product ID, never the association ID', async () => {
    get.mockResolvedValue({ data: {} }); patch.mockResolvedValue({ data: {} }); remove.mockResolvedValue({ data: {} })
    await dealResourcesApi.getProducts(12)
    await dealResourcesApi.getProduct(12, 1)
    await dealResourcesApi.updateProduct(12, 1, { details: { quantity: 3, unit_price: 900 } })
    await dealResourcesApi.removeProduct(12, 1)
    expect(get).toHaveBeenCalledWith('/api/tenant/deals/12/products', { params: undefined })
    expect(get).toHaveBeenCalledWith('/api/tenant/deals/12/products/1')
    expect(patch).toHaveBeenCalledWith('/api/tenant/deals/12/products/1', { details: { quantity: 3, unit_price: 900 } })
    expect(remove).toHaveBeenCalledWith('/api/tenant/deals/12/products/1')
  })
})
