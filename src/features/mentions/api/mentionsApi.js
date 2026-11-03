import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/mentions'

// Keep the backend contract unchanged. Authentication and api_password are handled by httpClient.
export const mentionsApi = {
  getTypes: async () => (await httpClient.get(`${BASE_PATH}/types`)).data,
  getMine: async (params) => (await httpClient.get(`${BASE_PATH}/mine`, { params })).data,
  getSent: async (params) => (await httpClient.get(`${BASE_PATH}/sent`, { params })).data,
  getUnseenCount: async () => (await httpClient.get(`${BASE_PATH}/unseen-count`)).data,
  getEntity: async (entityType, entityId, params) => (await httpClient.get(`${BASE_PATH}/entity`, {
    params: { ...params, entity_type: entityType, entity_id: entityId },
  })).data,
  create: async (payload) => (await httpClient.post(BASE_PATH, payload)).data,
  markSeen: async (id) => (await httpClient.post(`${BASE_PATH}/${encodeURIComponent(id)}/seen`)).data,
  markManySeen: async (payload) => (await httpClient.post(`${BASE_PATH}/seen`, payload)).data,
  remove: async (id) => (await httpClient.delete(`${BASE_PATH}/${encodeURIComponent(id)}`)).data,
}
