import httpClient from '../../../services/httpClient'
import { buildProductUpdateFormData, buildProductsFormData } from '../utils/catalogPayloads'

/**
 * Products — Postman "Products & Catalog" §3 (updated 2026-10-06).
 * Create accepts one product or `{ products: [...] }`; both go out as multipart so an image can be attached.
 */
export const productsApi = {
  createProducts: async (payload) => {
    const body = payload instanceof FormData
      ? payload
      : buildProductsFormData(Array.isArray(payload?.products) ? payload.products : payload)
    const res = await httpClient.post('/api/tenant/product/create', body)
    return res.data
  },

  /** Kept for older callers: creates a single product. */
  createProduct: async (payload) => productsApi.createProducts(payload),

  updateProduct: async (id, payload) => {
    const body = payload instanceof FormData ? payload : buildProductUpdateFormData(payload)
    const res = await httpClient.post(`/api/tenant/product/update/${id}`, body)
    return res.data
  },

  /** Filters: kind, item_type_id, category_id, status, search. */
  getProducts: async (params) => {
    const res = await httpClient.get('/api/tenant/product/data', { params })
    return res.data
  },

  getProductInfo: async (id, params) => {
    const res = await httpClient.get(`/api/tenant/product/info/${id}`, { params })
    return res.data
  },
}
