import httpClient from '../../../services/httpClient'

// Planned (docs/deals/DEALS-WORKSPACE-SPEC.md §9.6) — gated by DEAL_API_STATUS.dealAi. AI runs on the server:
// the frontend never sends a model key or a prompt template, only the question and the deal id.
const BASE_PATH = '/api/tenant/deals'

export const dealAiApi = {
  getInsights: async (dealId) => (await httpClient.get(`${BASE_PATH}/${dealId}/ai/insights`)).data,
  ask: async (dealId, payload) => (await httpClient.post(`${BASE_PATH}/${dealId}/ai/ask`, payload)).data,
}
