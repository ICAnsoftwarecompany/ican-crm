import httpClient from '../../../services/httpClient'

export const integrationsApi = {
  getIntegrations: async (params) => {
    const res = await httpClient.get('/api/tenant/integrations/get', { params })
    return res.data
  },

  updateIntegration: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/integrations/edite/intgration/${id}`, payload)
    return res.data
  },

  saveIntegration: async (payload) => {
    const res = await httpClient.post('/api/tenant/integrations/save/intgration', payload)
    return res.data
  },
}
