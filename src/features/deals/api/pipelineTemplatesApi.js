import httpClient from '../../../services/httpClient'

// Postman "Deals Workspace → Pipeline Template": reads and delete live on `/api/pipeline-templates`,
// create and update ("update + sync") on `/api/tenant/pipeline-templates`. Kept exactly as the collection
// has them (changed 2026-10-03 — create/update used to post to `/api/pipeline-templates`).
const READ_PATH = '/api/pipeline-templates'
const WRITE_PATH = '/api/tenant/pipeline-templates'

export const pipelineTemplatesApi = {
  getAll: async (params) => (await httpClient.get(READ_PATH, { params })).data,
  getById: async (id, params) => (await httpClient.get(`${READ_PATH}/${id}`, { params })).data,
  create: async (payload) => (await httpClient.post(WRITE_PATH, payload)).data,
  update: async (id, payload) => (await httpClient.post(`${WRITE_PATH}/${id}`, payload)).data,
  delete: async (id) => (await httpClient.delete(`${READ_PATH}/${id}`)).data,
}
