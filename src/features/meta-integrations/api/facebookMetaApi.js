import httpClient from '../../../services/httpClient'

export const facebookMetaApi = {
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
