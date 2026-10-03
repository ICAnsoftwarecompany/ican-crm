import httpClient from '../../../services/httpClient'

// Postman "Deals Workspace → Leads" + "Contracts → lead won". Every deal-lead route is under
// `/api/tenant/deals/leads/...` (NOT `/deal-leads/...` as the markdown doc says — the collection wins).
const BASE_PATH = '/api/tenant/deals'

export const dealLeadsApi = {
  getAll: async (dealId, params) => (await httpClient.get(`${BASE_PATH}/${dealId}/leads`, { params })).data,
  /** `{ deal_id, lead_ids: [], owner_id?, stage_id? }` → `{ added, existing, added_count, existing_count }` */
  addExisting: async (payload) => (await httpClient.post(`${BASE_PATH}/leads/add-existing`, payload)).data,
  /** `{ deal_id, name, phone, email?, company?, source?, owner_id?, note?, attributes?, interesteds? }` */
  create: async (payload) => (await httpClient.post(`${BASE_PATH}/leads/create`, payload)).data,
  /** `{ deal_id, deal_lead_ids: [], owner_id }` */
  bulkAssign: async (payload) => (await httpClient.post(`${BASE_PATH}/leads/bulk-assign`, payload)).data,
  /** `{ stage_id }` — moves the stage only; never wins or loses the lead. */
  changeStage: async (dealLeadId, payload) => (await httpClient.post(`${BASE_PATH}/leads/${dealLeadId}/change-stage`, payload)).data,
  /** `{ deal_lead_id, items: [{ product_id, quantity, unit_price, discount }] }` */
  syncProducts: async (payload) => (await httpClient.post(`${BASE_PATH}/leads/products/sync`, payload)).data,
  // `productsc` is the backend's spelling (typo kept until the backend renames the route).
  getProducts: async (dealLeadId, params) => (await httpClient.get(`${BASE_PATH}/leads/${dealLeadId}/productsc`, { params })).data,
  /** Won flow: items + payment terms → the created contract (one backend transaction). */
  markWon: async (dealLeadId, payload) => (await httpClient.post(`${BASE_PATH}/leads/${dealLeadId}/won`, payload)).data,
  /** `{ reason }` — price | competitor | no_budget | no_response | not_interested | timing | other */
  markLost: async (dealLeadId, payload) => (await httpClient.post(`${BASE_PATH}/leads/${dealLeadId}/lost`, payload)).data,

  // Planned (docs/deals/DEALS-WORKSPACE-SPEC.md §9) — gated by DEAL_API_STATUS.
  importFile: async (formData) => (await httpClient.post(`${BASE_PATH}/leads/import`, formData)).data,
  distribute: async (dealId, payload) => (await httpClient.post(`${BASE_PATH}/${dealId}/leads/distribute`, payload)).data,
  remove: async (dealLeadId) => (await httpClient.delete(`${BASE_PATH}/leads/${dealLeadId}`)).data,
  reopen: async (dealLeadId) => (await httpClient.post(`${BASE_PATH}/leads/${dealLeadId}/reopen`)).data,
}
