import httpClient from '../../../services/httpClient'

export const leadAssignmentApi = {
  distributeManually: async (payload) => (await httpClient.post('/api/tenant/leads/manual/lead/distribution', payload)).data,
  createRule: async (payload) => {
    const res = await httpClient.post('/api/tenant/lead-assignment/create/rule', payload)
    return res.data
  },

  updateRule: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/lead-assignment/update/rule/${id}`, payload)
    return res.data
  },

  getRules: async (params) => {
    const res = await httpClient.get('/api/tenant/lead-assignment/rules', { params })
    return res.data
  },
}
