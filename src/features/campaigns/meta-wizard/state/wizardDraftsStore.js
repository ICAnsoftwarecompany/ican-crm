// Multi-draft persistence (browser-local). Scoped to tenant + platform +
// ad account so tenants sharing a browser never see each other's drafts.
// Swap these functions for API calls once drafts move server-side — the
// wizard only uses listDrafts/loadDraft/saveDraft/deleteDraft/duplicateDraft.
import { normalizeSpecialAdCategories } from '../config/metaSpecialAdCategories'
import { getAdSetOptionsForObjective } from '../config/metaAdSetCompatibility'
import { MOCK_GEO_LOCATIONS } from '../data/mock/metaGeoLocations'
import { toTargetedLocation } from '../domain/geoTargeting'
import { createDefaultAd, createDefaultAdSet, createId, createInitialPublishState, createInitialWizardState, WIZARD_STATE_VERSION } from './initialWizardState'

const STORE_VERSION = 2
const MAX_DRAFTS = 30

export function buildDraftsKey({ tenantId, platformId, accountId }) {
  return `ican-campaign-wizard-drafts:v${STORE_VERSION}:${tenantId || 'unknown'}:${platformId || 'unknown'}:${accountId || 'unknown'}`
}

function buildLegacyKey({ tenantId, platformId, accountId }) {
  return `ican-campaign-wizard-draft:${tenantId || 'unknown'}:${platformId || 'unknown'}:${accountId || 'unknown'}`
}

function readStore(scope, storage) {
  try {
    const raw = storage.getItem(buildDraftsKey(scope))
    const parsed = raw ? JSON.parse(raw) : null
    const store = parsed?.version === STORE_VERSION && parsed.drafts && typeof parsed.drafts === 'object' ? parsed : { version: STORE_VERSION, drafts: {} }
    return migrateLegacyDraft(scope, store, storage)
  } catch {
    return { version: STORE_VERSION, drafts: {} }
  }
}

function writeStore(scope, store, storage) {
  try {
    storage.setItem(buildDraftsKey(scope), JSON.stringify(store))
    return true
  } catch {
    return false
  }
}

function migrateLegacyDraft(scope, store, storage) {
  try {
    const raw = storage.getItem(buildLegacyKey(scope))
    if (!raw) return store
    const parsed = JSON.parse(raw)
    storage.removeItem(buildLegacyKey(scope))
    if (parsed?._version !== 1 || !parsed.state) return store
    const migrated = migrateDraftState(parsed.state)
    if (!hasMeaningfulContent(migrated)) return store
    const next = { ...store, drafts: { ...store.drafts, [migrated.draftId]: migrated } }
    writeStore(scope, next, storage)
    return next
  } catch {
    return store
  }
}

/** Brings any saved draft (v1 or older v2) up to the current shape. */
export function migrateDraftState(saved) {
  const base = createInitialWizardState({ draftId: saved?.draftId })
  if (!saved || typeof saved !== 'object') return base
  const objective = saved.objective || ''
  const campaign = { ...base.campaign, ...saved.campaign, specialAdCategories: normalizeSpecialAdCategories(saved.campaign?.specialAdCategories || []) }
  campaign.schedule = { ...base.campaign.schedule, ...saved.campaign?.schedule }

  const adSets = (saved.adSets?.length ? saved.adSets : base.adSets).map((adSet, index) => migrateAdSet(adSet, index, objective))
  const activeAdSetId = adSets.some((adSet) => adSet.id === saved.meta?.activeAdSetId) ? saved.meta.activeAdSetId : adSets[0].id
  const activeAdIdByAdSet = Object.fromEntries(adSets.map((adSet) => [adSet.id, adSet.ads.some((ad) => ad.id === saved.meta?.activeAdIdByAdSet?.[adSet.id]) ? saved.meta.activeAdIdByAdSet[adSet.id] : adSet.ads[0].id]))

  return {
    ...base,
    version: WIZARD_STATE_VERSION,
    draftId: saved.draftId || base.draftId,
    presetId: saved.presetId || '',
    objective,
    campaign,
    adSets,
    leadRouting: { ...base.leadRouting, ...saved.leadRouting },
    meta: {
      ...base.meta,
      ...saved.meta,
      activeAdSetId,
      activeAdIdByAdSet,
      touched: saved.meta?.touched || {},
      visitedStages: saved.meta?.visitedStages || [saved.meta?.currentStage || 'objective'],
      createdAt: saved.meta?.createdAt || saved.meta?.lastSavedAt || base.meta.createdAt,
      focusedField: null,
      dirty: false,
    },
    publish: { ...createInitialPublishState(), ...saved.publish },
  }
}

function migrateAdSet(saved, index, objective) {
  const base = createDefaultAdSet({ conversionLocation: saved.conversionLocation || '', performanceGoal: saved.performanceGoal || '', index })
  const savedAudience = saved.audience || {}
  let geo = savedAudience.geo
  if (!geo) {
    // v1 stored ISO country codes only.
    const countries = savedAudience.countries?.length ? savedAudience.countries : ['EG']
    const locations = countries.map((code) => MOCK_GEO_LOCATIONS.find((item) => item.type === 'country' && item.countryCode === code) || { key: code, type: 'country', countryCode: code, name: { en: code, ar: code } })
    geo = { locationType: 'home_or_recent', locations: locations.map((item) => toTargetedLocation(item)) }
  }
  const audience = {
    ...base.audience,
    ...savedAudience,
    advantageAudience: savedAudience.advantageAudience ?? savedAudience.mode !== 'manual',
    geo,
    detailedTargeting: Array.isArray(savedAudience.detailedTargeting) ? savedAudience.detailedTargeting : [],
  }
  delete audience.countries
  delete audience.mode
  delete audience.exclusions
  delete audience.lookalikeAudienceIds
  const placements = saved.placements?.manual ? { ...base.placements, ...saved.placements } : base.placements
  const ads = (saved.ads?.length ? saved.ads : [null]).map((ad, adIndex) => (ad ? { ...createDefaultAd({ conversionLocation: base.conversionLocation, index: adIndex }), ...ad } : createDefaultAd({ conversionLocation: base.conversionLocation, index: adIndex })))
  const location = saved.conversionLocation || getAdSetOptionsForObjective(objective).defaultLocation || ''
  return {
    ...base,
    ...saved,
    id: saved.id || createId('adset'),
    nameIndex: saved.nameIndex || index + 1,
    conversionLocation: location,
    schedule: { ...base.schedule, ...saved.schedule },
    dayparting: { ...base.dayparting, ...saved.dayparting },
    useCampaignSchedule: saved.useCampaignSchedule ?? true,
    audience,
    placements,
    ads,
  }
}

export function hasMeaningfulContent(state) {
  return Boolean(state?.objective || state?.campaign?.name?.trim() || state?.campaign?.pageId || state?.campaign?.budgetAmount || state?.adSets?.some((adSet) => adSet.name?.trim()))
}

export function summarizeDraft(state) {
  return {
    id: state.draftId,
    name: state.campaign?.name || '',
    objective: state.objective || '',
    presetId: state.presetId || '',
    currentStage: state.meta?.currentStage || 'objective',
    createdAt: state.meta?.createdAt || null,
    updatedAt: state.meta?.lastSavedAt || state.meta?.createdAt || null,
    publishStatus: state.publish?.status || 'idle',
    adSetsCount: state.adSets?.length || 0,
    adsCount: (state.adSets || []).reduce((sum, adSet) => sum + (adSet.ads?.length || 0), 0),
  }
}

export function listDrafts(scope, storage = window.localStorage) {
  const store = readStore(scope, storage)
  return Object.values(store.drafts)
    .map((draft) => summarizeDraft(draft))
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
}

export function loadDraft(scope, draftId, storage = window.localStorage) {
  const draft = readStore(scope, storage).drafts[draftId]
  return draft ? migrateDraftState(draft) : null
}

export function saveDraft(scope, state, storage = window.localStorage) {
  const store = readStore(scope, storage)
  const drafts = { ...store.drafts, [state.draftId]: state }
  // Keep storage bounded: drop the oldest drafts beyond the limit.
  const ordered = Object.values(drafts).sort((a, b) => String(b.meta?.lastSavedAt || '').localeCompare(String(a.meta?.lastSavedAt || '')))
  const kept = Object.fromEntries(ordered.slice(0, MAX_DRAFTS).map((draft) => [draft.draftId, draft]))
  return writeStore(scope, { ...store, drafts: kept }, storage)
}

export function deleteDraft(scope, draftId, storage = window.localStorage) {
  const store = readStore(scope, storage)
  if (!store.drafts[draftId]) return false
  const drafts = { ...store.drafts }
  delete drafts[draftId]
  return writeStore(scope, { ...store, drafts }, storage)
}

export function duplicateDraft(scope, draftId, { copySuffix = ' (copy)' } = {}, storage = window.localStorage) {
  const source = loadDraft(scope, draftId, storage)
  if (!source) return null
  const now = new Date().toISOString()
  const copy = {
    ...JSON.parse(JSON.stringify(source)),
    draftId: createId('draft'),
    campaign: { ...source.campaign, name: source.campaign.name ? `${source.campaign.name}${copySuffix}` : '' },
    publish: createInitialPublishState(),
    meta: { ...source.meta, createdAt: now, lastSavedAt: now, dirty: false },
  }
  saveDraft(scope, copy, storage)
  return copy
}
