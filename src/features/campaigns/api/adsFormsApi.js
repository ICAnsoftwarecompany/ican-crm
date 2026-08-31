import httpClient from '../../../services/httpClient'

export const adsFormsApi = {
  saveAdsForm: async (payload) => {
    const res = await httpClient.post('/api/tenant/ads-forms/save/ads-form', payload)
    return res.data
  },

  updateAdsForm: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/ads-forms/edite/ads-form/${id}`, payload)
    return res.data
  },

  getActiveAdsForms: async (params) => {
    const res = await httpClient.get('/api/tenant/ads-forms/active', { params })
    return res.data
  },

  getInactiveAdsForms: async (params) => {
    const res = await httpClient.get('/api/tenant/ads-forms/inactive', { params })
    return res.data
  },

  getAdsFormDetails: async (id, params) => {
    const res = await httpClient.get(`/api/tenant/ads-forms/details/${id}`, { params })
    return res.data
  },
}
