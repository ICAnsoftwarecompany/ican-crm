import httpClient from '../../../services/httpClient'

export const linkProductsApi = {
  save: async (payload) => {
    const res = await httpClient.post('/api/tenant/link-products/save', payload)
    return res.data
  },

  updateStatus: async (payload) => {
    const res = await httpClient.post('/api/tenant/link-products/update-status', payload)
    return res.data
  },
}
