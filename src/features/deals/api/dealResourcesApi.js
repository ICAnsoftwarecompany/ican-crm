import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/deals'

export const dealResourcesApi = {
  getTeam: async (dealId, params) => (await httpClient.get(`${BASE_PATH}/${dealId}/team`, { params })).data,
  addTeamMember: async (payload) => (await httpClient.post(`${BASE_PATH}/team`, payload)).data,
  removeTeamMember: async (memberId) => (await httpClient.delete(`${BASE_PATH}/team/${memberId}`)).data,

  getProducts: async (dealId, params) => (await httpClient.get(`${BASE_PATH}/${dealId}/products`, { params })).data,
  addProducts: async (payload) => (await httpClient.post(`${BASE_PATH}/products`, payload)).data,
  removeProduct: async (dealId, productId) => (await httpClient.delete(`${BASE_PATH}/${dealId}/products/${productId}`)).data,
}
