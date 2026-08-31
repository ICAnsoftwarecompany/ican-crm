import httpClient from '../../../services/httpClient'
import { toFormData } from '../../../services/apiPayload'

export const teamsApi = {
  createTeam: async (payload) => {
    const res = await httpClient.post('/api/tenant/teams/create', payload)
    return res.data
  },

  updateTeam: async (teamId, payload) => {
    const res = await httpClient.post(`/api/tenant/teams/update/${teamId}`, toFormData(payload))
    return res.data
  },

  getTeams: async (params) => {
    const res = await httpClient.get('/api/tenant/teams/get', { params })
    return res.data
  },

  attachMembers: async (teamId, payload) => {
    const res = await httpClient.post(`/api/tenant/teams/attach-members/${teamId}`, payload)
    return res.data
  },

  detachMembers: async (teamId, payload) => {
    const res = await httpClient.post(`/api/tenant/teams/detach-members/${teamId}`, payload)
    return res.data
  },
}
