const CONFIG = Object.freeze({
  OUTCOME_AWARENESS: {
    default: ['REACH', 'IMPRESSIONS'],
  },
  OUTCOME_TRAFFIC: {
    website: ['LANDING_PAGE_VIEWS', 'LINK_CLICKS'],
    messenger: [],
    whatsapp: [],
  },
  OUTCOME_ENGAGEMENT: {
    messenger: [],
    whatsapp: [],
    instagram_direct: [],
    post: [],
    page: [],
    video: [],
    event: [],
  },
  OUTCOME_LEADS: {
    instant_form: [],
    messenger: [],
    instagram_direct: [],
    phone_call: [],
    website: [],
  },
  OUTCOME_SALES: {
    website: ['OFFSITE_CONVERSIONS'],
    messenger: [],
    whatsapp: [],
    phone_call: [],
  },
  OUTCOME_APP_PROMOTION: {
    app: [],
  },
})

export function getAdSetOptionsForObjective(objective, conversionLocation = '') {
  const locationGoals = CONFIG[objective] || {}
  const goals = locationGoals[conversionLocation] || []

  return {
    locations: Object.keys(locationGoals),
    goals,
    defaultGoal: goals[0] || '',
  }
}

export function isAdSetCompatibleWithObjective(objective, adSet) {
  const options = getAdSetOptionsForObjective(objective, adSet?.conversionLocation)
  return options.locations.includes(adSet?.conversionLocation)
    && (!adSet?.performanceGoal || options.goals.includes(adSet.performanceGoal))
}
