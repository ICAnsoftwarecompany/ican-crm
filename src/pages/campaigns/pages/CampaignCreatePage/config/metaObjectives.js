export const META_CAMPAIGN_OBJECTIVES = Object.freeze([
  'OUTCOME_AWARENESS',
  'OUTCOME_TRAFFIC',
  'OUTCOME_ENGAGEMENT',
  'OUTCOME_LEADS',
  'OUTCOME_SALES',
  'OUTCOME_APP_PROMOTION',
])

export function isMetaCampaignObjective(value) {
  return META_CAMPAIGN_OBJECTIVES.includes(value)
}
