// The Meta objective → conversion location → optimization goal matrix.
//
// This is the single source of truth for "what combinations can a user
// build". Every step (Ad Sets, Ads, validation, payload building) reads
// from here, so adding a new Meta option means editing this file only.
//
// Location ids are CRM-side ids (stable in saved drafts); `destinationType`
// is the value Meta's ad set API expects in `destination_type`.
// Verify against the current Marketing API reference when Meta ships a new
// Graph API version — see pages/campaigns/pages/CampaignCreatePage/README_AR.md, section 11.

export const CONVERSION_LOCATIONS = Object.freeze({
  default: { destinationType: undefined, requires: [] },
  website: { destinationType: 'WEBSITE', requires: [] },
  app: { destinationType: 'APP', requires: ['app'] },
  website_and_app: { destinationType: 'WEBSITE', requires: ['app'] },
  instant_form: { destinationType: 'ON_AD', requires: ['leadForm'] },
  messenger: { destinationType: 'MESSENGER', requires: [] },
  whatsapp: { destinationType: 'WHATSAPP', requires: ['whatsapp'] },
  instagram_direct: { destinationType: 'INSTAGRAM_DIRECT', requires: ['instagram'] },
  messaging_apps: { destinationType: 'MESSAGING_MESSENGER_WHATSAPP', requires: ['whatsapp'] },
  instagram_profile: { destinationType: 'INSTAGRAM_PROFILE', requires: ['instagram'] },
  phone_call: { destinationType: 'PHONE_CALL', requires: ['phone'] },
  post: { destinationType: 'ON_POST', requires: [] },
  video: { destinationType: 'ON_VIDEO', requires: [] },
  page: { destinationType: 'ON_PAGE', requires: [] },
  event: { destinationType: 'ON_EVENT', requires: ['event'] },
})

// First goal in each list is the default Meta picks in Ads Manager.
const MATRIX = Object.freeze({
  OUTCOME_AWARENESS: {
    default: ['REACH', 'IMPRESSIONS', 'AD_RECALL_LIFT', 'THRUPLAY', 'TWO_SECOND_CONTINUOUS_VIDEO_VIEWS'],
  },
  OUTCOME_TRAFFIC: {
    website: ['LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
    app: ['LINK_CLICKS'],
    messenger: ['LINK_CLICKS'],
    whatsapp: ['LINK_CLICKS'],
    instagram_profile: ['VISIT_INSTAGRAM_PROFILE'],
    phone_call: ['LINK_CLICKS'],
  },
  OUTCOME_ENGAGEMENT: {
    messenger: ['CONVERSATIONS', 'LINK_CLICKS'],
    whatsapp: ['CONVERSATIONS', 'LINK_CLICKS'],
    instagram_direct: ['CONVERSATIONS', 'LINK_CLICKS'],
    messaging_apps: ['CONVERSATIONS'],
    post: ['POST_ENGAGEMENT', 'IMPRESSIONS', 'REACH'],
    video: ['THRUPLAY', 'TWO_SECOND_CONTINUOUS_VIDEO_VIEWS'],
    page: ['PAGE_LIKES'],
    event: ['EVENT_RESPONSES'],
    phone_call: ['QUALITY_CALL'],
    website: ['OFFSITE_CONVERSIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS'],
    app: ['OFFSITE_CONVERSIONS', 'LINK_CLICKS'],
  },
  OUTCOME_LEADS: {
    instant_form: ['LEAD_GENERATION', 'QUALITY_LEAD'],
    messenger: ['LEAD_GENERATION', 'CONVERSATIONS'],
    instagram_direct: ['LEAD_GENERATION', 'CONVERSATIONS'],
    whatsapp: ['CONVERSATIONS'],
    phone_call: ['QUALITY_CALL'],
    website: ['OFFSITE_CONVERSIONS', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
    app: ['OFFSITE_CONVERSIONS', 'LINK_CLICKS'],
  },
  OUTCOME_SALES: {
    website: ['OFFSITE_CONVERSIONS', 'VALUE', 'LANDING_PAGE_VIEWS', 'LINK_CLICKS', 'IMPRESSIONS', 'REACH'],
    app: ['OFFSITE_CONVERSIONS', 'VALUE', 'LINK_CLICKS'],
    website_and_app: ['OFFSITE_CONVERSIONS'],
    messenger: ['CONVERSATIONS', 'OFFSITE_CONVERSIONS'],
    whatsapp: ['CONVERSATIONS', 'OFFSITE_CONVERSIONS'],
    messaging_apps: ['CONVERSATIONS'],
    phone_call: ['QUALITY_CALL'],
  },
  OUTCOME_APP_PROMOTION: {
    app: ['APP_INSTALLS', 'OFFSITE_CONVERSIONS', 'VALUE', 'LINK_CLICKS'],
  },
})

// Goals that optimize for a Pixel / app event, so Meta needs a promoted
// object with the event to optimize for.
const CONVERSION_EVENT_GOALS = new Set(['OFFSITE_CONVERSIONS', 'VALUE'])

export const BILLING_EVENT_BY_GOAL = Object.freeze({
  THRUPLAY: 'THRUPLAY',
  LINK_CLICKS: 'IMPRESSIONS',
  PAGE_LIKES: 'IMPRESSIONS',
})

export function getAdSetOptionsForObjective(objective, conversionLocation = '') {
  const locationGoals = MATRIX[objective] || {}
  const goals = locationGoals[conversionLocation] || []
  const locations = Object.keys(locationGoals)
  return {
    locations,
    goals,
    defaultGoal: goals[0] || '',
    // Awareness has a single implicit destination — never ask the user.
    locationIsAutomatic: locations.length === 1 && locations[0] === 'default',
    defaultLocation: locations.length === 1 ? locations[0] : '',
  }
}

export function isAdSetCompatibleWithObjective(objective, adSet) {
  const options = getAdSetOptionsForObjective(objective, adSet?.conversionLocation)
  return options.locations.includes(adSet?.conversionLocation)
    && (!adSet?.performanceGoal || options.goals.includes(adSet.performanceGoal))
}

/**
 * Everything an ad set with this objective/location/goal must collect.
 * Returned as a set of requirement ids the UI and validator both use.
 */
export function getAdSetRequirements(objective, adSet) {
  const location = CONVERSION_LOCATIONS[adSet?.conversionLocation]
  const requirements = new Set(location?.requires || [])
  const goal = adSet?.performanceGoal
  const usesWebsite = ['website', 'website_and_app'].includes(adSet?.conversionLocation)
  if (usesWebsite && CONVERSION_EVENT_GOALS.has(goal)) requirements.add('pixel')
  if (adSet?.conversionLocation === 'app' && CONVERSION_EVENT_GOALS.has(goal)) requirements.add('appEvent')
  if (['messenger', 'whatsapp'].includes(adSet?.conversionLocation) && goal === 'OFFSITE_CONVERSIONS') requirements.add('pixel')
  if (objective === 'OUTCOME_AWARENESS' && goal === 'REACH') requirements.add('frequencyCap')
  if (goal === 'VALUE') requirements.add('valueBidding')
  // Ad-level needs.
  if (adSet?.conversionLocation === 'instant_form') requirements.add('leadForm')
  if (adSet?.conversionLocation === 'phone_call') requirements.add('phone')
  if (['website', 'website_and_app'].includes(adSet?.conversionLocation)) requirements.add('websiteUrl')
  if (['messenger', 'whatsapp', 'instagram_direct', 'messaging_apps'].includes(adSet?.conversionLocation)) requirements.add('messageTemplate')
  return requirements
}

export function isMessagingLocation(location) {
  return ['messenger', 'whatsapp', 'instagram_direct', 'messaging_apps'].includes(location)
}

export function isVideoGoal(goal) {
  return ['THRUPLAY', 'TWO_SECOND_CONTINUOUS_VIDEO_VIEWS'].includes(goal)
}
