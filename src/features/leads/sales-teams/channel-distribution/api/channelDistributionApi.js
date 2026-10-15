import httpClient from '../../../../../services/httpClient'

const SETTINGS = '/api/tenant/channel/distribution-settings'
const RULES = '/api/tenant/channel/assignment-rules'

/**
 * Chat distribution per channel (2026-10-16). Settings = one per channel (strategy + fallback); assignment rules =
 * which users receive the channel's chats and in what order (priority). All JSON.
 */
export const channelDistributionApi = {
  getSettings: async (params) => (await httpClient.get(SETTINGS, { params })).data,
  createSetting: async (payload) => (await httpClient.post(SETTINGS, payload)).data,
  updateSetting: async (id, payload) => (await httpClient.put(`${SETTINGS}/${id}`, payload)).data,
  deleteSetting: async (id) => (await httpClient.delete(`${SETTINGS}/${id}`)).data,

  getRules: async (params) => (await httpClient.get(RULES, { params })).data,
  createRule: async (payload) => (await httpClient.post(RULES, payload)).data,
  updateRule: async (id, payload) => (await httpClient.put(`${RULES}/${id}`, payload)).data,
  deleteRule: async (id) => (await httpClient.delete(`${RULES}/${id}`)).data,
}
