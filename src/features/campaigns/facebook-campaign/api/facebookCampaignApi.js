import httpClient from '../../../../services/httpClient'

const TENANT_FACEBOOK = '/api/tenant/facebook'
const TENANT_CAMPAIGNS = '/api/tenant/campaigns'

function requireMainServerUrl() {
  const value = import.meta.env.VITE_MAIN_SERVER_URL?.trim().replace(/\/$/, '')
  if (!value) throw new Error('VITE_MAIN_SERVER_URL is required for Facebook sub-login.')
  return value
}

export function normalizeFacebookAdAccountId(value) {
  if (value === undefined || value === null) return value

  const accountId = String(value).trim()
  if (!accountId) return accountId

  return accountId.startsWith('act_') ? accountId : `act_${accountId}`
}

function normalizeAdAccountPayload(payload) {
  if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'ad_account_id')) return payload

  return {
    ...payload,
    ad_account_id: normalizeFacebookAdAccountId(payload.ad_account_id),
  }
}

export const facebookCampaignApi = {
  getCampaigns: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/get`, { params: normalizeAdAccountPayload(params) })).data,
  syncCampaigns: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/sync`, { params: normalizeAdAccountPayload(params) })).data,
  createCampaign: async (payload) => (await httpClient.post(`${TENANT_FACEBOOK}/campaigns/create`, normalizeAdAccountPayload(payload))).data,
  getCampaignAdSets: async (campaignId, params) => (await httpClient.get(`${TENANT_CAMPAIGNS}/${campaignId}/adsets`, { params })).data,

  createAdSet: async (payload) => (await httpClient.post(`${TENANT_FACEBOOK}/adset/create`, normalizeAdAccountPayload(payload))).data,
  getAdSets: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/adset/get`, { params: normalizeAdAccountPayload(params) })).data,
  syncAdSets: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/adset/sync`, { params: normalizeAdAccountPayload(params) })).data,
  getAdSetAds: async (adSetId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/adsets/${adSetId}/ads`, { params })).data,
  getAdInsights: async (adId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/ads/${adId}/insights`, { params })).data,

  getPagePosts: async (pageId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/pages/${pageId}/posts`, { params })).data,
  getPostEngagement: async (postId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/posts/${postId}/engagement`, { params })).data,
  getPostComments: async (postId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/posts/${postId}/comments`, { params })).data,

  createSubLoginInvite: async (payload) => (await httpClient.post(`${requireMainServerUrl()}/api/tenant/facebook/login/invite/create`, payload)).data,
  revokeSubLoginInvite: async (inviteId, params) => (await httpClient.get(`${requireMainServerUrl()}/api/tenant/facebook/login/invite/revoke/${inviteId}`, { params })).data,
  getSubLoginInvites: async (params) => (await httpClient.post(`${TENANT_FACEBOOK}/login/invite`, null, { params })).data,
  getMySubLoginInvites: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/login/invite/my`, { params })).data,
  openSubLogin: async (tenant, inviteToken, params) => (
    await httpClient.get(`${requireMainServerUrl()}/api/facebook/sub-login/${tenant}/${inviteToken}`, { params })
  ).data,
}
