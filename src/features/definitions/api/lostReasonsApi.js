import httpClient from '../../../services/httpClient'

const BASE = '/api/tenant/definitions/lost-reasons'

/**
 * Lead lost reasons (Postman "Definitions → lead lost resons", 2026-10-15). JSON bodies:
 * `{ name, code, description, is_active, sort_order }`; create = POST, update = PUT.
 */
export const lostReasonsApi = {
  list: async (params) => (await httpClient.get(BASE, { params })).data,
  get: async (id) => (await httpClient.get(`${BASE}/${id}`)).data,
  create: async (payload) => (await httpClient.post(BASE, payload)).data,
  update: async (id, payload) => (await httpClient.put(`${BASE}/${id}`, payload)).data,
  remove: async (id) => (await httpClient.delete(`${BASE}/${id}`)).data,
}
