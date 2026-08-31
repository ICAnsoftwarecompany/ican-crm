import httpClient from '../../../services/httpClient'

export const campaignAdsApi = {
  // saveAd: async (payload) => {
  //   const res = await httpClient.post('/api/tenant/ads/save/ads', payload)
  //   return res.data
  // },

  updateAd: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/ads/edite/ads/${id}`, payload)
    return res.data
  },

  getActiveAds: async (params) => {
    const res = await httpClient.get('/api/tenant/ads/active', { params })
    return res.data
  },

  getInactiveAds: async (params) => {
    const res = await httpClient.get('/api/tenant/ads/inactive', { params })
    return res.data
  },

  getAdDetails: async (id, params) => {
    const res = await httpClient.get(`/api/tenant/ads/details/${id}`, { params })
    return res.data
  },
}
