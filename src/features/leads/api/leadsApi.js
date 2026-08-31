import httpClient from '../../../services/httpClient'

export const leadsApi = {
  saveAction: async (payload) => {
    const res = await httpClient.post('/api/tenant/leads/save/action', payload)
    return res.data
  },

  updateTag: async (payload) => {
    const res = await httpClient.post('/api/tenant/leads/update-tag', payload)
    return res.data
  },

  getLogs: async (params) => {
    const res = await httpClient.get('/api/tenant/leads/logs', { params })
    return res.data
  },

  getLeadLog: async (leadId, params) => {
    const res = await httpClient.get(`/api/tenant/leads/lead/log/${leadId}`, { params })
    return res.data
  },

  distributeManually: async (payload) => {
    const res = await httpClient.post('/api/tenant/leads/manual/lead/distribution', payload)
    return res.data
  },
}

