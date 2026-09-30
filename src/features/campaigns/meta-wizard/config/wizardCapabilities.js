// Where each piece of wizard data comes from.
//
//   'mock'         → realistic demo data from ../data/mock (clearly badged in the UI)
//   'integrations' → derived from the tenant's connected Meta integration payload
//   'live'         → the backend endpoint documented in pages/campaigns/pages/CampaignCreatePage/README_AR.md
//
// When a backend endpoint ships, flip its entry to 'live' — no component
// changes are needed; the UI hides the "demo data" badge automatically.
export const WIZARD_DATA_SOURCES = Object.freeze({
  geoLocations: 'mock',
  interests: 'mock',
  languages: 'mock',
  customAudiences: 'mock',
  reachEstimate: 'mock',
  leadForms: 'mock',
  mediaLibrary: 'mock',
  pixels: 'mock',
  apps: 'mock',
  instagramAccounts: 'integrations',
  whatsappNumbers: 'integrations',
  pagePosts: 'live',
})

// Publishing capabilities. `createAds` stays false until the backend's
// create-ad and lead-form contracts are live; ads are then kept in the
// draft (status "pending API") instead of being silently dropped.
export const WIZARD_PUBLISH_CAPABILITIES = Object.freeze({
  createCampaign: true,
  createAdSets: true,
  createAds: false,
  createLeadForms: false,
  uploadMedia: false,
})

export function isMockSource(sourceId) {
  return WIZARD_DATA_SOURCES[sourceId] === 'mock'
}
