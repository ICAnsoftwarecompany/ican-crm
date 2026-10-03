import httpClient from '../../../services/httpClient'

// Postman "Deals Workspace → Contracts". Contracts are created ONLY by the won flow (dealLeadsApi.markWon).
const BASE_PATH = '/api/tenant/deals/contracts'

export const contractsApi = {
  /** Filters: `deal_id`, `lead_id` (both optional). */
  getAll: async (params) => (await httpClient.get(BASE_PATH, { params })).data,
  getById: async (id, params) => (await httpClient.get(`${BASE_PATH}/${id}`, { params })).data,

  // Planned (docs/deals/DEALS-WORKSPACE-SPEC.md §9) — gated by DEAL_API_STATUS.installmentPayment.
  recordInstallmentPayment: async (contractId, installmentId, payload) => (
    await httpClient.post(`${BASE_PATH}/${contractId}/installments/${installmentId}/pay`, payload)
  ).data,
}
