import { describe, expect, it } from 'vitest'
import { getAdSetOptionsForObjective, isAdSetCompatibleWithObjective } from './metaAdSetCompatibility'

describe('Meta ad set compatibility', () => {
  it('uses landing-page optimization for website traffic', () => {
    expect(getAdSetOptionsForObjective('OUTCOME_TRAFFIC', 'website')).toMatchObject({
      goals: ['LANDING_PAGE_VIEWS', 'LINK_CLICKS'],
      defaultGoal: 'LANDING_PAGE_VIEWS',
    })
  })

  it('lets Meta choose the default goal when the request guide omits optimization_goal', () => {
    expect(getAdSetOptionsForObjective('OUTCOME_LEADS', 'instant_form').defaultGoal).toBe('')
  })

  it('rejects an optimization goal from a different campaign objective', () => {
    expect(isAdSetCompatibleWithObjective('OUTCOME_AWARENESS', {
      conversionLocation: 'default',
      performanceGoal: 'OFFSITE_CONVERSIONS',
    })).toBe(false)
  })
})
