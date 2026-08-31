import httpClient from '../../../services/httpClient'

export const facebookApi = {
  createCampaign: async (payload) => {
    const res = await httpClient.post('/api/facebook/campaign/create', payload)
    return res.data
  },

  createAdSet: async (payload) => {
    const res = await httpClient.post('/api/facebook/adset/create', payload)
    return res.data
  },

  createAd: async (payload) => {
    const res = await httpClient.post('/api/facebook/ad/create', payload)
    return res.data
  },

  createLeadForm: async (tenant, payload) => {
    const res = await httpClient.post(`/api/facebook/lead-form/create/${tenant}`, payload)
    return res.data
  },

  connect: async (tenant, params) => {
    const res = await httpClient.get(`/api/facebook/connect/${tenant}`, { params })
    return res.data
  },

  getPages: async (tenant, params) => {
    const res = await httpClient.get(`/api/tenant/facebook/pages/${tenant}`, { params })
    return res.data
  },

  refreshToken: async (tenant, params) => {
    const res = await httpClient.get(`/api/facebook/refresh-token/${tenant}`, { params })
    return res.data
  },

  getAssets: async (tenant, params) => {
    const res = await httpClient.get(`/api/facebook/assets/${tenant}`, { params })
    return res.data
  },
}
