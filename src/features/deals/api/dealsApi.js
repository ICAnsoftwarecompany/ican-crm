import httpClient from '../../../services/httpClient'

// Postman "Deals Workspace → Deals". Update is POST (not PUT) on the backend.
const BASE_PATH = '/api/tenant/deals'

export const dealsApi = {
  getAll: async (params) => (await httpClient.get(BASE_PATH, { params })).data,
  getById: async (id, params) => (await httpClient.get(`${BASE_PATH}/${id}`, { params })).data,
  create: async (payload) => (await httpClient.post(BASE_PATH, payload)).data,
  update: async (id, payload) => (await httpClient.post(`${BASE_PATH}/${id}`, payload)).data,
  delete: async (id) => (await httpClient.delete(`${BASE_PATH}/${id}`)).data,

  // Planned (docs/deals/DEALS-WORKSPACE-SPEC.md §9) — gated by DEAL_API_STATUS.
  getActivityLog: async (id, params) => (await httpClient.get(`${BASE_PATH}/${id}/activity-log`, { params })).data,
  getSettings: async (id) => (await httpClient.get(`${BASE_PATH}/${id}/settings`)).data,
  updateSettings: async (id, payload) => (await httpClient.post(`${BASE_PATH}/${id}/settings`, payload)).data,
}
