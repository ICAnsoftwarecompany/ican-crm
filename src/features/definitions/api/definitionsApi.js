import httpClient from '../../../services/httpClient'
import { toFormData } from '../../../services/apiPayload'

export const definitionsApi = {
  createStatus: async (payload) => {
    const res = await httpClient.post('/api/tenant/definitions/create/status', toFormData(payload))
    return res.data
  },

  updateStatus: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/definitions/update/status/${id}`, toFormData(payload))
    return res.data
  },

  getStatuses: async (params) => {
    const res = await httpClient.get('/api/tenant/definitions/status', { params })
    return res.data
  },

  createTag: async (payload) => {
    const res = await httpClient.post('/api/tenant/definitions/create/tags', toFormData(payload))
    return res.data
  },

  updateTag: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/definitions/update/tags/${id}`, toFormData(payload))
    return res.data
  },

  getTags: async (params) => {
    const res = await httpClient.get('/api/tenant/definitions/tags', { params })
    return res.data
  },
}
