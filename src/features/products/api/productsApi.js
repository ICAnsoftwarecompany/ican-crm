import httpClient from '../../../services/httpClient'
import { toFormData } from '../../../services/apiPayload'

function appendProductField(formData, index, key, value) {
  if (value === undefined || value === null || value === '') return

  const isFile = typeof File !== 'undefined' && value instanceof File
  const normalizedValue = Array.isArray(value) || (typeof value === 'object' && !isFile)
    ? JSON.stringify(value)
    : value

  formData.append(`products[${index}][${key}]`, normalizedValue)
}

function toProductsFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()
  const products = Array.isArray(payload.products) ? payload.products : [payload]

  products.forEach((product, index) => {
    appendProductField(formData, index, 'name', product.name)
    appendProductField(formData, index, 'price', product.price)
    appendProductField(formData, index, 'desc', product.desc)
    appendProductField(formData, index, 'image', product.image)
    appendProductField(formData, index, 'data', product.data)
    appendProductField(formData, index, 'status', product.status)
    appendProductField(formData, index, 'category_id', product.category_id)
    appendProductField(formData, index, 'type', product.type)
  })

  return formData
}

export const productsApi = {
  createProduct: async (payload) => {
    const res = await httpClient.post('/api/tenant/product/create', toProductsFormData(payload))
    return res.data
  },

  updateProduct: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/product/update/${id}`, toFormData(payload))
    return res.data
  },

  getProducts: async (params) => {
    const res = await httpClient.get('/api/tenant/product/data', { params })
    return res.data
  },

  getProductInfo: async (id, params) => {
    const res = await httpClient.get(`/api/tenant/product/info/${id}`, { params })
    return res.data
  },
}
