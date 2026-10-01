import { getAdSetOptionsForObjective } from '../config/metaAdSetCompatibility'
import { getCallToActions } from '../config/metaCallToActions'
import { getCampaignPreset } from '../config/campaignPresets'
import { createDefaultManualPlacements, getUnsupportedPlatforms } from '../config/metaPlacements'
import { hasRestrictedTargeting, normalizeSpecialAdCategories, RESTRICTED_TARGETING } from '../config/metaSpecialAdCategories'
import { DEFAULT_EVENT_BY_OBJECTIVE } from '../config/metaConversionEvents'
import { createDefaultAd, createDefaultAdSet, createId, createInitialPublishState, createInitialWizardState } from './initialWizardState'

export const WIZARD_ACTIONS = {
  SET_OBJECTIVE: 'SET_OBJECTIVE',
  APPLY_PRESET: 'APPLY_PRESET',
  UPDATE_CAMPAIGN: 'UPDATE_CAMPAIGN',
  UPDATE_AD_SET: 'UPDATE_AD_SET',
  ADD_AD_SET: 'ADD_AD_SET',
  DUPLICATE_AD_SET: 'DUPLICATE_AD_SET',
  REMOVE_AD_SET: 'REMOVE_AD_SET',
  SET_ACTIVE_AD_SET: 'SET_ACTIVE_AD_SET',
  ADD_AD: 'ADD_AD',
  DUPLICATE_AD: 'DUPLICATE_AD',
  REMOVE_AD: 'REMOVE_AD',
  UPDATE_AD: 'UPDATE_AD',
  SET_ACTIVE_AD: 'SET_ACTIVE_AD',
  UPDATE_LEAD_ROUTING: 'UPDATE_LEAD_ROUTING',
  SET_STAGE: 'SET_STAGE',
  SET_FOCUSED_FIELD: 'SET_FOCUSED_FIELD',
  TOUCH_FIELD: 'TOUCH_FIELD',
  SHOW_ALL_ERRORS: 'SHOW_ALL_ERRORS',
  SET_LAST_SAVED: 'SET_LAST_SAVED',
  UPDATE_PUBLISH: 'UPDATE_PUBLISH',
  RESET_PUBLISH: 'RESET_PUBLISH',
  LOAD_DRAFT: 'LOAD_DRAFT',
  CLEAR_DRAFT: 'CLEAR_DRAFT',
}

// UI-only actions never mark the draft as changed.
const NON_DIRTY_ACTIONS = new Set([
  WIZARD_ACTIONS.SET_STAGE,
  WIZARD_ACTIONS.SET_FOCUSED_FIELD,
  WIZARD_ACTIONS.TOUCH_FIELD,
  WIZARD_ACTIONS.SHOW_ALL_ERRORS,
  WIZARD_ACTIONS.SET_LAST_SAVED,
  WIZARD_ACTIONS.SET_ACTIVE_AD_SET,
  WIZARD_ACTIONS.SET_ACTIVE_AD,
  WIZARD_ACTIONS.LOAD_DRAFT,
  WIZARD_ACTIONS.CLEAR_DRAFT,
])

// Actions that change what would be sent to Meta. After a failed/partial
// publish, editing already-created objects can't be re-sent, so the
// wizard only keeps remote ids and lets the next publish resume.
export function wizardReducer(state, action) {
  const next = reduce(state, action)
  if (next === state || NON_DIRTY_ACTIONS.has(action.type)) return next
  return { ...next, meta: { ...next.meta, dirty: true } }
}

function reduce(state, action) {
  switch (action.type) {
    case WIZARD_ACTIONS.SET_OBJECTIVE:
      return setObjective(state, action.objective, { presetId: '' })

    case WIZARD_ACTIONS.APPLY_PRESET: {
      const preset = getCampaignPreset(action.presetId)
      if (!preset) return state
      const withObjective = setObjective(state, preset.objective, { presetId: preset.id })
      return {
        ...withObjective,
        adSets: withObjective.adSets.map((adSet) => applyLocationChange(preset.objective, adSet, preset.conversionLocation, preset.performanceGoal)),
      }
    }

    case WIZARD_ACTIONS.UPDATE_CAMPAIGN: {
      const patch = { ...action.patch }
      if (patch.specialAdCategories) patch.specialAdCategories = normalizeSpecialAdCategories(patch.specialAdCategories)
      const campaign = normalizeBudgetOwner({ ...state.campaign, ...patch })
      const restricted = hasRestrictedTargeting(campaign.specialAdCategories)
      return {
        ...state,
        campaign,
        adSets: restricted ? state.adSets.map(applyRestrictedTargeting) : state.adSets,
      }
    }

    case WIZARD_ACTIONS.UPDATE_AD_SET:
      return mapAdSet(state, action.adSetId, (adSet) => {
        const patch = { ...action.patch }
        if (patch.conversionLocation !== undefined && patch.conversionLocation !== adSet.conversionLocation) {
          return normalizeBudgetOwner(applyLocationChange(state.objective, { ...adSet, ...patch }, patch.conversionLocation, patch.performanceGoal))
        }
        const updated = normalizeBudgetOwner({ ...adSet, ...patch })
        return hasRestrictedTargeting(state.campaign.specialAdCategories) ? applyRestrictedTargeting(updated) : updated
      })

    case WIZARD_ACTIONS.ADD_AD_SET: {
      const template = state.adSets[state.adSets.length - 1]
      const adSet = createDefaultAdSet({
        conversionLocation: template?.conversionLocation || '',
        performanceGoal: template?.performanceGoal || '',
        index: nextIndex(state.adSets),
      })
      // New ad sets start with the same audience basics so users only change what differs.
      if (template) adSet.audience = { ...structuredCloneSafe(template.audience) }
      return withActiveAdSet({ ...state, adSets: [...state.adSets, adSet] }, adSet)
    }

    case WIZARD_ACTIONS.DUPLICATE_AD_SET: {
      const source = state.adSets.find((adSet) => adSet.id === action.adSetId)
      if (!source) return state
      const copy = cloneAdSet(source, nextIndex(state.adSets))
      const index = state.adSets.indexOf(source)
      const adSets = [...state.adSets.slice(0, index + 1), copy, ...state.adSets.slice(index + 1)]
      return withActiveAdSet({ ...state, adSets }, copy)
    }

    case WIZARD_ACTIONS.REMOVE_AD_SET: {
      if (state.adSets.length <= 1) return state
      const adSets = state.adSets.filter((adSet) => adSet.id !== action.adSetId)
      const activeAdSetId = state.meta.activeAdSetId === action.adSetId ? adSets[0].id : state.meta.activeAdSetId
      return { ...state, adSets, meta: { ...state.meta, activeAdSetId } }
    }

    case WIZARD_ACTIONS.SET_ACTIVE_AD_SET:
      return { ...state, meta: { ...state.meta, activeAdSetId: action.adSetId } }

    case WIZARD_ACTIONS.ADD_AD: {
      const adSet = state.adSets.find((item) => item.id === action.adSetId)
      if (!adSet) return state
      const ad = createDefaultAd({ conversionLocation: adSet.conversionLocation, index: nextIndex(adSet.ads) })
      const updated = mapAdSet(state, adSet.id, (item) => ({ ...item, ads: [...item.ads, ad] }))
      return setActiveAd(updated, adSet.id, ad.id)
    }

    case WIZARD_ACTIONS.DUPLICATE_AD: {
      const adSet = state.adSets.find((item) => item.id === action.adSetId)
      const source = adSet?.ads.find((ad) => ad.id === action.adId)
      if (!source) return state
      const copy = { ...structuredCloneSafe(source), id: createId('ad'), nameIndex: nextIndex(adSet.ads), name: source.name ? `${source.name} (2)` : '' }
      const index = adSet.ads.indexOf(source)
      const updated = mapAdSet(state, adSet.id, (item) => ({ ...item, ads: [...item.ads.slice(0, index + 1), copy, ...item.ads.slice(index + 1)] }))
      return setActiveAd(updated, adSet.id, copy.id)
    }

    case WIZARD_ACTIONS.REMOVE_AD: {
      const adSet = state.adSets.find((item) => item.id === action.adSetId)
      if (!adSet || adSet.ads.length <= 1) return state
      const ads = adSet.ads.filter((ad) => ad.id !== action.adId)
      const updated = mapAdSet(state, adSet.id, (item) => ({ ...item, ads }))
      return state.meta.activeAdIdByAdSet?.[adSet.id] === action.adId ? setActiveAd(updated, adSet.id, ads[0].id) : updated
    }

    case WIZARD_ACTIONS.UPDATE_AD:
      return mapAdSet(state, action.adSetId, (adSet) => ({
        ...adSet,
        ads: adSet.ads.map((ad) => (ad.id === action.adId ? { ...ad, ...action.patch } : ad)),
      }))

    case WIZARD_ACTIONS.SET_ACTIVE_AD:
      return setActiveAd(state, action.adSetId, action.adId)

    case WIZARD_ACTIONS.UPDATE_LEAD_ROUTING:
      return { ...state, leadRouting: { ...state.leadRouting, ...action.patch } }

    case WIZARD_ACTIONS.SET_STAGE: {
      const visitedStages = state.meta.visitedStages?.includes(action.stage) ? state.meta.visitedStages : [...(state.meta.visitedStages || []), action.stage]
      return { ...state, meta: { ...state.meta, currentStage: action.stage, visitedStages, focusedField: null } }
    }

    case WIZARD_ACTIONS.SET_FOCUSED_FIELD:
      return state.meta.focusedField === action.fieldId ? state : { ...state, meta: { ...state.meta, focusedField: action.fieldId } }

    case WIZARD_ACTIONS.TOUCH_FIELD:
      return state.meta.touched?.[action.path] ? state : { ...state, meta: { ...state.meta, touched: { ...state.meta.touched, [action.path]: true } } }

    case WIZARD_ACTIONS.SHOW_ALL_ERRORS:
      return { ...state, meta: { ...state.meta, showAllErrors: action.value ?? true } }

    case WIZARD_ACTIONS.SET_LAST_SAVED:
      return { ...state, meta: { ...state.meta, lastSavedAt: action.timestamp, dirty: false } }

    case WIZARD_ACTIONS.UPDATE_PUBLISH:
      return { ...state, publish: { ...state.publish, ...action.patch } }

    case WIZARD_ACTIONS.RESET_PUBLISH:
      return { ...state, publish: createInitialPublishState() }

    case WIZARD_ACTIONS.LOAD_DRAFT:
      return { ...action.state, meta: { ...action.state.meta, dirty: false, focusedField: null } }

    case WIZARD_ACTIONS.CLEAR_DRAFT:
      return createInitialWizardState()

    default:
      return state
  }
}

function setObjective(state, objective, { presetId }) {
  if (state.objective === objective && state.presetId === presetId) return state
  return {
    ...state,
    objective,
    presetId,
    adSets: state.adSets.map((adSet) => {
      const options = getAdSetOptionsForObjective(objective, adSet.conversionLocation)
      if (options.locations.includes(adSet.conversionLocation)) {
        return options.goals.includes(adSet.performanceGoal) ? adSet : { ...adSet, performanceGoal: options.defaultGoal }
      }
      const fallback = getAdSetOptionsForObjective(objective)
      return applyLocationChange(objective, adSet, fallback.defaultLocation || '', undefined)
    }),
  }
}

/** Keeps goal, placements, CTAs and events consistent with a new destination. */
export function applyLocationChange(objective, adSet, conversionLocation, performanceGoal) {
  const options = getAdSetOptionsForObjective(objective, conversionLocation)
  const goal = performanceGoal && options.goals.includes(performanceGoal) ? performanceGoal : options.defaultGoal
  const unsupported = getUnsupportedPlatforms(conversionLocation)
  const manual = Object.fromEntries(Object.entries(adSet.placements?.manual || createDefaultManualPlacements(conversionLocation)).filter(([platform]) => !unsupported.includes(platform)))
  const allowedCtas = getCallToActions(conversionLocation)
  return {
    ...adSet,
    conversionLocation,
    performanceGoal: goal,
    customEventType: adSet.customEventType || DEFAULT_EVENT_BY_OBJECTIVE[objective] || '',
    placements: { ...adSet.placements, manual },
    ads: (adSet.ads || []).map((ad) => (allowedCtas.includes(ad.callToAction) ? ad : { ...ad, callToAction: allowedCtas[0] })),
  }
}

// A lifetime budget always needs an end date; "never ends" clears it.
function normalizeBudgetOwner(owner) {
  if (!owner.schedule) return owner
  let schedule = owner.schedule
  if (owner.budgetType === 'lifetime' && schedule.endType !== 'scheduled') schedule = { ...schedule, endType: 'scheduled' }
  if (schedule.endType === 'never' && schedule.endTime) schedule = { ...schedule, endTime: '' }
  if (schedule.startType === 'now' && schedule.startTime) schedule = { ...schedule, startTime: '' }
  const bidAmount = ['cost_cap', 'bid_cap'].includes(owner.bidStrategy) ? owner.bidAmount : ''
  const roasFloor = owner.bidStrategy === 'minimum_roas' ? owner.roasFloor : ''
  const dayparting = owner.dayparting && owner.budgetType !== 'lifetime' && owner.dayparting.enabled ? { ...owner.dayparting, enabled: false } : owner.dayparting
  if (schedule === owner.schedule && bidAmount === owner.bidAmount && roasFloor === owner.roasFloor && dayparting === owner.dayparting) return owner
  return { ...owner, schedule, bidAmount, roasFloor, ...(owner.dayparting ? { dayparting } : {}) }
}

function applyRestrictedTargeting(adSet) {
  const audience = adSet.audience
  if (audience.ageMin === RESTRICTED_TARGETING.ageMin && audience.ageMax === RESTRICTED_TARGETING.ageMax && audience.genders === 'all') return adSet
  return { ...adSet, audience: { ...audience, ageMin: RESTRICTED_TARGETING.ageMin, ageMax: RESTRICTED_TARGETING.ageMax, genders: 'all' } }
}

function mapAdSet(state, adSetId, update) {
  let changed = false
  const adSets = state.adSets.map((adSet) => {
    if (adSet.id !== adSetId) return adSet
    changed = true
    return update(adSet)
  })
  return changed ? { ...state, adSets } : state
}

function withActiveAdSet(state, adSet) {
  return {
    ...state,
    meta: {
      ...state.meta,
      activeAdSetId: adSet.id,
      activeAdIdByAdSet: { ...state.meta.activeAdIdByAdSet, [adSet.id]: adSet.ads[0]?.id },
    },
  }
}

function setActiveAd(state, adSetId, adId) {
  return { ...state, meta: { ...state.meta, activeAdSetId: adSetId, activeAdIdByAdSet: { ...state.meta.activeAdIdByAdSet, [adSetId]: adId } } }
}

function nextIndex(items) {
  return Math.max(0, ...items.map((item) => item.nameIndex || 0)) + 1
}

function cloneAdSet(source, nameIndex) {
  const copy = structuredCloneSafe(source)
  return {
    ...copy,
    id: createId('adset'),
    nameIndex,
    name: source.name ? `${source.name} (2)` : '',
    ads: copy.ads.map((ad) => ({ ...ad, id: createId('ad') })),
  }
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value))
}
