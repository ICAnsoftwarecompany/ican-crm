import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/deals'

export const dealLeadsApi = {
  getAll: async (dealId, params) => (await httpClient.get(`${BASE_PATH}/${dealId}/leads`, { params })).data,
  addExisting: async (payload) => (await httpClient.post(`${BASE_PATH}/leads/add-existing`, payload)).data,
  create: async (payload) => (await httpClient.post(`${BASE_PATH}/leads/create`, payload)).data,
  bulkAssign: async (payload) => (await httpClient.post(`${BASE_PATH}/leads/bulk-assign`, payload)).data,
  changeStage: async (dealLeadId, payload) => (await httpClient.post(`${BASE_PATH}/leads/${dealLeadId}/change-stage`, payload)).data,
  syncProducts: async (payload) => (await httpClient.post(`${BASE_PATH}/leads/products/sync`, payload)).data,
  getProducts: async (dealLeadId, params) => (await httpClient.get(`${BASE_PATH}/leads/${dealLeadId}/productsc`, { params })).data,
}
