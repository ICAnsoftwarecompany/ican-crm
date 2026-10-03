import httpClient from '../../../services/httpClient'

// Postman "Deals Workspace → Deal Analytics": overview + owners are live. The collection's
// "analytics overview funnel" request points at `/overview` (copy-paste), and `/sources` is absent, so
// funnel and sources stay planned (DEAL_API_STATUS) — the UI computes them from the deal's leads meanwhile.
const BASE_PATH = '/api/tenant/deals'

export const dealAnalyticsApi = {
  getOverview: async (dealId) => (await httpClient.get(`${BASE_PATH}/${dealId}/analytics/overview`)).data,
  getOwners: async (dealId) => (await httpClient.get(`${BASE_PATH}/${dealId}/analytics/owners`)).data,
  getFunnel: async (dealId) => (await httpClient.get(`${BASE_PATH}/${dealId}/analytics/funnel`)).data,
  getSources: async (dealId) => (await httpClient.get(`${BASE_PATH}/${dealId}/analytics/sources`)).data,
}
