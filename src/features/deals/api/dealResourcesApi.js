import httpClient from '../../../services/httpClient'

// Postman "Deals Workspace → Deal Teams" (team members + deal products).
const BASE_PATH = '/api/tenant/deals'

export const dealResourcesApi = {
  getTeam: async (dealId, params) => (await httpClient.get(`${BASE_PATH}/${dealId}/team`, { params })).data,
  /** `{ deal_id, user_id | team_id, role }` — a user OR a team per call, never both. */
  addTeamMember: async (payload) => (await httpClient.post(`${BASE_PATH}/team`, payload)).data,
  removeTeamMember: async (memberId) => (await httpClient.delete(`${BASE_PATH}/team/${memberId}`)).data,
  /** Planned: change the role of an existing member. */
  updateTeamMember: async (memberId, payload) => (await httpClient.post(`${BASE_PATH}/team/${memberId}`, payload)).data,

  getProducts: async (dealId, params) => (await httpClient.get(`${BASE_PATH}/${dealId}/products`, { params })).data,
  /** `{ deal_id, product_ids: [] }` */
  addProducts: async (payload) => (await httpClient.post(`${BASE_PATH}/products`, payload)).data,
  removeProduct: async (dealId, productId) => (await httpClient.delete(`${BASE_PATH}/${dealId}/products/${productId}`)).data,
}
