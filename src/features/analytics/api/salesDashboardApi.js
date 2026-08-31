import httpClient from '../../../services/httpClient'

export const salesDashboardApi = {
  getMyLeads: async (params) => {
    const res = await httpClient.get('/api/tenant/sales/dashboard/my-leads', { params })
    return res.data
  },

  getMyTeams: async (params) => {
    const res = await httpClient.get('/api/tenant/sales/dashboard/my-teams', { params })
    return res.data
  },
}
