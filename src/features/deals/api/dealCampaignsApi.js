import httpClient from '../../../services/httpClient'

// Postman "Deal Campaign" (2026-10-16): the campaigns a deal is linked to. `campaign_ids` are CRM campaign ids
// (`GET /campaigns/active|inactive`); one link row per campaign (`DealCampaignId`).
const BASE_PATH = '/api/tenant/deals'

export const dealCampaignsApi = {
  getAll: async (dealId, params) => (await httpClient.get(`${BASE_PATH}/${dealId}/campaigns`, { params })).data,
  /** `{ campaign_ids: [], is_active }` — `is_active`: the link is live (the campaign's leads flow into the deal). */
  attach: async (dealId, payload) => (await httpClient.post(`${BASE_PATH}/${dealId}/campaigns`, payload)).data,
  /** `{ is_active }` on one link row. */
  update: async (dealCampaignId, payload) => (await httpClient.put(`${BASE_PATH}/deal-campaigns/${dealCampaignId}`, payload)).data,
  detach: async (dealCampaignId) => (await httpClient.delete(`${BASE_PATH}/deal-campaigns/${dealCampaignId}`)).data,
  /** One campaign's info as the deals module sees it. */
  getCampaignInfo: async (campaignId, params) => (await httpClient.get(`${BASE_PATH}/campaigns/${campaignId}`, { params })).data,
}
