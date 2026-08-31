import httpClient from '../../../services/httpClient'

export const interestedsApi = {
  save: async (payload) => {
    const res = await httpClient.post('/api/tenant/interesteds/save', payload)
    return res.data
  },

  update: async (payload) => {
    const res = await httpClient.post('/api/tenant/interesteds/edite', payload)
    return res.data
  },

  delete: async (payload) => {
    const res = await httpClient.post('/api/tenant/interesteds/delete', payload)
    return res.data
  },
}
