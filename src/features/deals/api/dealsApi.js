import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/deals'

export const dealsApi = {
  getAll: async (params) => (await httpClient.get(BASE_PATH, { params })).data,
  getById: async (id, params) => (await httpClient.get(`${BASE_PATH}/${id}`, { params })).data,
  create: async (payload) => (await httpClient.post(BASE_PATH, payload)).data,
  update: async (id, payload) => (await httpClient.post(`${BASE_PATH}/${id}`, payload)).data,
  delete: async (id) => (await httpClient.delete(`${BASE_PATH}/${id}`)).data,
}
