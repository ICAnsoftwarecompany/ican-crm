import { getAdSetOptionsForObjective } from '../config/metaAdSetCompatibility'
import { getCallToActions } from '../config/metaCallToActions'
import { getCampaignPreset } from '../config/campaignPresets'
import { locationDisplayName } from './geoTargeting'

// Human-friendly default names, used whenever the user leaves a name blank
// (Ads Manager does the same), so a missing name never blocks publishing.

function geoLabel(adSet, language) {
  const included = (adSet?.audience?.geo?.locations || []).filter((item) => item.mode !== 'exclude')
  if (!included.length) return ''
  const first = locationDisplayName(included[0], language)
  return included.length > 1 ? `${first} +${included.length - 1}` : first
}

export function getEffectiveCampaignName(state, t) {
  if (state.campaign.name?.trim()) return state.campaign.name.trim()
  const preset = getCampaignPreset(state.presetId)
  const label = preset ? t(`campaignWizard.presets.${preset.id}.title`) : state.objective ? t(`campaignWizard.objectives.${state.objective}.title`) : t('campaignWizard.names.campaign')
  const date = new Date(state.meta?.createdAt || Date.now())
  return `${label} — ${date.toISOString().slice(0, 10)}`
}

export function getEffectiveAdSetName(adSet, t, language) {
  if (adSet.name?.trim()) return adSet.name.trim()
  const location = adSet.conversionLocation ? t(`campaignWizard.locations.${adSet.conversionLocation}.title`) : t('campaignWizard.names.adSet')
  const geo = geoLabel(adSet, language)
  return [location, geo].filter(Boolean).join(' · ') || t('campaignWizard.names.adSetNumber', { count: adSet.nameIndex || 1 })
}

export function getEffectiveAdName(ad, t) {
  if (ad.name?.trim()) return ad.name.trim()
  return `${t(`campaignWizard.ads.formats.${ad.format}.title`)} ${ad.nameIndex || 1}`
}

export function describeAdSetDestination(state, adSet, t) {
  const options = getAdSetOptionsForObjective(state.objective, adSet.conversionLocation)
  const location = adSet.conversionLocation ? t(`campaignWizard.locations.${adSet.conversionLocation}.title`) : ''
  const goal = adSet.performanceGoal ? t(`campaignWizard.goals.${adSet.performanceGoal}.title`) : ''
  return { location, goal, isAutomatic: options.locationIsAutomatic, ctas: getCallToActions(adSet.conversionLocation) }
}
