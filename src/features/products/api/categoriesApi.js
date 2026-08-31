import httpClient from '../../../services/httpClient'
import { toFormData } from '../../../services/apiPayload'

export const categoriesApi = {
  createCategory: async (payload) => {
    const res = await httpClient.post('/api/tenant/category/create', toFormData(payload))
    return res.data
  },

  updateCategory: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/category/update/${id}`, toFormData(payload))
    return res.data
  },

  getCategories: async (params) => {
    const res = await httpClient.get('/api/tenant/category/data', { params })
    return res.data
  },

  getCategoryInfo: async (id, params) => {
    const res = await httpClient.get(`/api/tenant/category/info/${id}`, { params })
    return res.data
  },
}
