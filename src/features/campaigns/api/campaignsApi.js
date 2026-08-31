import httpClient from '../../../services/httpClient'

export const campaignsApi = {
  saveCampaign: async (payload) => {
    const res = await httpClient.post('/api/tenant/campaigns/save/campaign', payload)
    return res.data
  },

  updateCampaign: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/campaigns/edite/campaign/${id}`, payload)
    return res.data
  },

  getActiveCampaigns: async (params) => {
    const res = await httpClient.get('/api/tenant/campaigns/active', { params })
    return res.data
  },

  getInactiveCampaigns: async (params) => {
    const res = await httpClient.get('/api/tenant/campaigns/inactive', { params })
    return res.data
  },

  getCampaignDetails: async (id, params) => {
    const res = await httpClient.get(`/api/tenant/campaigns/details/${id}`, { params })
    return res.data
  },
}
