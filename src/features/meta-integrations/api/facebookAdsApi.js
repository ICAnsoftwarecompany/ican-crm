import httpClient from '../../../services/httpClient'

export const facebookAdsApi = {
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
}
