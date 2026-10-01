import { extractList } from '../../../../shared/utils/apiResponse'
import { WIZARD_DATA_SOURCES } from '../config/wizardCapabilities'
import { searchLocationCatalog } from '../domain/geoTargeting'
import { metaWizardApi } from './metaWizardApi'
import { MOCK_GEO_LOCATIONS } from './mock/metaGeoLocations'
import { MOCK_CUSTOM_AUDIENCES, MOCK_DETAILED_TARGETING, MOCK_LANGUAGES } from './mock/metaTargetingMock'
import { MOCK_APPS, MOCK_INSTAGRAM_ACCOUNTS, MOCK_LEAD_FORMS, MOCK_MEDIA_LIBRARY, MOCK_PAGE_POSTS, MOCK_PIXELS, MOCK_WHATSAPP_NUMBERS } from './mock/metaAssetsMock'
import { estimateReachLocally } from '../domain/reachEstimate'

// One adapter per asset: returns `{ items, isMock }` so the UI can badge
// demo data. Live responses are normalized to the mock shapes here, and
// nowhere else.

const mockDelay = (value) => new Promise((resolve) => { setTimeout(() => resolve(value), 180) })
const bilingual = (value) => (typeof value === 'object' && value ? value : { en: value || '', ar: value || '' })

function normalizeGeo(row) {
  return {
    key: String(row.key),
    type: row.type,
    countryCode: row.country_code,
    regionKey: row.region_id ? String(row.region_id) : undefined,
    name: bilingual(row.name),
    latitude: row.latitude,
    longitude: row.longitude,
    supportsRadius: row.supports_city ?? row.type === 'city',
    context: [row.region, row.country_name].filter(Boolean).join(', '),
  }
}

export const metaAssetsSource = {
  async searchGeoLocations({ query, accountId }) {
    if (WIZARD_DATA_SOURCES.geoLocations !== 'live') return { items: await mockDelay(searchLocationCatalog(MOCK_GEO_LOCATIONS, query)), isMock: true }
    return { items: extractList(await metaWizardApi.searchGeoLocations({ query, accountId })).map(normalizeGeo), isMock: false }
  },

  // Bulk paste matches locally in mock mode; in live mode each line is a search.
  geoCatalogForBulk() {
    return WIZARD_DATA_SOURCES.geoLocations === 'live' ? null : MOCK_GEO_LOCATIONS
  },

  async searchInterests({ query, accountId }) {
    if (WIZARD_DATA_SOURCES.interests !== 'live') {
      const needle = String(query || '').trim().toLowerCase()
      const items = MOCK_DETAILED_TARGETING.filter((item) => !needle || item.name.en.toLowerCase().includes(needle) || item.name.ar.includes(query.trim()))
      return { items: await mockDelay(items.slice(0, 12)), isMock: true }
    }
    const rows = extractList(await metaWizardApi.searchInterests({ query, accountId }))
    return { items: rows.map((row) => ({ id: String(row.id), type: row.type || 'interests', name: bilingual(row.name), path: row.path || [], audienceSize: row.audience_size_upper_bound || row.audience_size })), isMock: false }
  },

  async getLanguages({ accountId }) {
    if (WIZARD_DATA_SOURCES.languages !== 'live') return { items: MOCK_LANGUAGES, isMock: true }
    return { items: extractList(await metaWizardApi.getLanguages({ accountId })).map((row) => ({ id: row.key ?? row.id, name: bilingual(row.name) })), isMock: false }
  },

  async getCustomAudiences({ accountId }) {
    if (WIZARD_DATA_SOURCES.customAudiences !== 'live') return { items: await mockDelay(MOCK_CUSTOM_AUDIENCES), isMock: true }
    return { items: extractList(await metaWizardApi.getCustomAudiences({ accountId })).map((row) => ({ id: String(row.id), name: row.name, subtype: row.subtype, approximateCount: row.approximate_count_upper_bound })), isMock: false }
  },

  async getReachEstimate({ accountId, adSet, targeting, specialAdCategories }) {
    if (WIZARD_DATA_SOURCES.reachEstimate !== 'live') return { ...estimateReachLocally(adSet, specialAdCategories), isMock: true }
    const response = await metaWizardApi.getReachEstimate({ accountId, targeting, optimizationGoal: adSet.performanceGoal })
    const data = response?.data ?? response
    return { lower: data?.users_lower_bound, upper: data?.users_upper_bound, isMock: false }
  },

  async getLeadForms({ pageId }) {
    if (WIZARD_DATA_SOURCES.leadForms !== 'live') return { items: await mockDelay(MOCK_LEAD_FORMS), isMock: true }
    return { items: extractList(await metaWizardApi.getLeadForms({ pageId })).map((row) => ({ id: String(row.id), name: row.name, status: row.status, formType: row.is_optimized_for_quality ? 'higher_intent' : 'more_volume', questions: (row.questions || []).map((question) => question.type), leadsCount: row.leads_count, createdTime: row.created_time })), isMock: false }
  },

  async getMediaLibrary({ accountId }) {
    if (WIZARD_DATA_SOURCES.mediaLibrary !== 'live') return { items: await mockDelay(MOCK_MEDIA_LIBRARY), isMock: true }
    return { items: extractList(await metaWizardApi.getMediaLibrary({ accountId })).map((row) => ({ id: String(row.hash || row.id), type: row.type || (row.video_id ? 'video' : 'image'), name: row.name, width: row.width, height: row.height, url: row.url || row.thumbnail_url, durationSeconds: row.length })), isMock: false }
  },

  async getPixels({ accountId }) {
    if (WIZARD_DATA_SOURCES.pixels !== 'live') return { items: await mockDelay(MOCK_PIXELS), isMock: true }
    return { items: extractList(await metaWizardApi.getPixels({ accountId })).map((row) => ({ id: String(row.id), name: row.name, lastFiredTime: row.last_fired_time })), isMock: false }
  },

  async getApps({ accountId }) {
    if (WIZARD_DATA_SOURCES.apps !== 'live') return { items: await mockDelay(MOCK_APPS), isMock: true }
    return { items: extractList(await metaWizardApi.getApps({ accountId })).map((row) => ({ id: String(row.id), name: row.name, objectStoreUrl: row.object_store_urls?.google_play || row.object_store_urls?.itunes || row.object_store_url })), isMock: false }
  },

  async getPagePosts({ pageId }) {
    if (WIZARD_DATA_SOURCES.pagePosts !== 'live' || !pageId) return { items: MOCK_PAGE_POSTS, isMock: true }
    try {
      const rows = extractList(await metaWizardApi.getPagePosts({ pageId }), ['posts'])
      return { items: rows.map((row) => ({ id: String(row.id), message: row.message || row.story || '', createdTime: row.created_time })), isMock: false }
    } catch {
      return { items: MOCK_PAGE_POSTS, isMock: true }
    }
  },
}

/** Instagram accounts linked to the connected Pages (integration payload). */
export function getInstagramAccounts(integrations) {
  const fromPages = (integrations?.facebook_pages || [])
    .map((page) => page.instagram_business_account || page.instagram_account || page.instagram)
    .filter((value) => value && typeof value === 'object')
    .map((value) => ({ id: String(value.id), username: value.username || value.name || String(value.id) }))
  const fromIntegration = Array.isArray(integrations?.instagram) ? integrations.instagram.map((value) => ({ id: String(value.id || value.instagram_id), username: value.username || value.name })) : []
  const items = [...fromPages, ...fromIntegration].filter((item) => item.id && item.id !== 'undefined')
  return items.length ? { items, isMock: false } : { items: MOCK_INSTAGRAM_ACCOUNTS, isMock: true }
}

/** WhatsApp Business numbers already connected to the CRM. */
export function getWhatsappNumbers(integrations) {
  const raw = integrations?.whatsapp
  const list = Array.isArray(raw) ? raw : raw?.phone_numbers || raw?.numbers || (raw?.phone_number ? [raw] : [])
  const items = list
    .map((value) => ({ id: String(value.id || value.phone_number_id || value.phone_number), displayPhoneNumber: value.display_phone_number || value.phone_number || value.phone, verifiedName: value.verified_name || value.name }))
    .filter((item) => item.displayPhoneNumber)
  return items.length ? { items, isMock: false } : { items: MOCK_WHATSAPP_NUMBERS, isMock: true }
}
