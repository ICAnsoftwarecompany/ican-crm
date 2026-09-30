import httpClient from '../../../../services/httpClient'
import { normalizeFacebookAdAccountId } from '../../facebook-campaign/api/facebookCampaignApi'

// Backend contracts the wizard is ready for. None of these exist yet
// except `pagePosts`; each is enabled by flipping its entry in
// config/wizardCapabilities.js to 'live'. Request/response shapes are
// documented in pages/campaigns/pages/CampaignCreatePage/README_AR.md, section 8.
const BASE = '/api/tenant/facebook'

const get = async (url, params) => (await httpClient.get(url, { params })).data
const post = async (url, payload) => (await httpClient.post(url, payload)).data
const account = (accountId) => normalizeFacebookAdAccountId(accountId)

export const metaWizardApi = {
  searchGeoLocations: ({ query, accountId }) => get(`${BASE}/targeting/search`, { type: 'adgeolocation', q: query, ad_account_id: account(accountId) }),
  searchInterests: ({ query, accountId }) => get(`${BASE}/targeting/search`, { type: 'adinterest', q: query, ad_account_id: account(accountId) }),
  getLanguages: ({ accountId }) => get(`${BASE}/targeting/locales`, { ad_account_id: account(accountId) }),
  getCustomAudiences: ({ accountId }) => get(`${BASE}/audiences`, { ad_account_id: account(accountId) }),
  getReachEstimate: ({ accountId, targeting, optimizationGoal }) => post(`${BASE}/targeting/reach-estimate`, { ad_account_id: account(accountId), targeting, optimization_goal: optimizationGoal }),
  getLeadForms: ({ pageId }) => get(`${BASE}/lead-forms`, { page_id: pageId }),
  getMediaLibrary: ({ accountId }) => get(`${BASE}/media`, { ad_account_id: account(accountId) }),
  getPixels: ({ accountId }) => get(`${BASE}/pixels`, { ad_account_id: account(accountId) }),
  getApps: ({ accountId }) => get(`${BASE}/apps`, { ad_account_id: account(accountId) }),
  getPagePosts: ({ pageId }) => get(`${BASE}/campaigns/pages/${pageId}/posts`),

  // Publishing (see publish/publishPlan.js)
  createAd: (payload) => post(`${BASE}/ad/create`, { ...payload, ad_account_id: account(payload.ad_account_id) }),
  createLeadForm: (payload) => post(`${BASE}/lead-forms/create`, payload),
  uploadMedia: (formData) => post(`${BASE}/media/upload`, formData),
}
