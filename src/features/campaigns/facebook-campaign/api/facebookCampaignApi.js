import httpClient from '../../../../services/httpClient'

const TENANT_FACEBOOK = '/api/tenant/facebook'

function requireMainServerUrl() {
  const value = import.meta.env.VITE_MAIN_SERVER_URL?.trim().replace(/\/$/, '')
  if (!value) throw new Error('VITE_MAIN_SERVER_URL is required for Facebook sub-login.')
  return value
}

export const facebookCampaignApi = {
  getCampaigns: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/get`, { params })).data,
  syncCampaigns: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/sync`, { params })).data,
  createCampaign: async (payload) => (await httpClient.post(`${TENANT_FACEBOOK}/campaigns/create`, payload)).data,
  getCampaignAdSets: async (campaignId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/${campaignId}/adsets`, { params })).data,

  createAdSet: async (payload) => (await httpClient.post(`${TENANT_FACEBOOK}/adset/create`, payload)).data,
  getAdSets: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/adset/get`, { params })).data,
  syncAdSets: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/adset/sync`, { params })).data,
  getAdSetAds: async (adSetId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/adsets/${adSetId}/ads`, { params })).data,
  getAdInsights: async (adId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/ads/${adId}/insights`, { params })).data,

  getPagePosts: async (pageId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/pages/${pageId}/posts`, { params })).data,
  getPostEngagement: async (postId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/posts/${postId}/engagement`, { params })).data,
  getPostComments: async (postId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/campaigns/posts/${postId}/comments`, { params })).data,

  createSubLoginInvite: async (payload) => (await httpClient.post(`${TENANT_FACEBOOK}/login/invite/create`, payload)).data,
  revokeSubLoginInvite: async (inviteId, params) => (await httpClient.get(`${TENANT_FACEBOOK}/login/invite/revoke/${inviteId}`, { params })).data,
  getSubLoginInvites: async (params) => (await httpClient.post(`${TENANT_FACEBOOK}/login/invite`, null, { params })).data,
  getMySubLoginInvites: async (params) => (await httpClient.get(`${TENANT_FACEBOOK}/login/invite/my`, { params })).data,
  openSubLogin: async (tenant, inviteToken, params) => (
    await httpClient.get(`${requireMainServerUrl()}/api/facebook/sub-login/${tenant}/${inviteToken}`, { params })
  ).data,
}
