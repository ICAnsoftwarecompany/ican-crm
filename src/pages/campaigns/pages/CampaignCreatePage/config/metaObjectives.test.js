import { describe, expect, it } from 'vitest'
import { isMetaCampaignObjective, META_CAMPAIGN_OBJECTIVES } from './metaObjectives'

describe('Meta campaign objectives', () => {
  it('contains the complete objective set accepted by the API', () => {
    expect(META_CAMPAIGN_OBJECTIVES).toEqual([
      'OUTCOME_AWARENESS',
      'OUTCOME_TRAFFIC',
      'OUTCOME_ENGAGEMENT',
      'OUTCOME_LEADS',
      'OUTCOME_SALES',
      'OUTCOME_APP_PROMOTION',
    ])
  })

  it('rejects unsupported objective values', () => {
    expect(isMetaCampaignObjective('LINK_CLICKS')).toBe(false)
  })
})
