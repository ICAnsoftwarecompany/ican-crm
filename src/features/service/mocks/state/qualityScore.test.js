import { describe, expect, it } from 'vitest'
import { cesSummary, isLowScore, npsSummary, weightedScore, weightsValid } from './qualityScore'

describe('qualityScore', () => {
  const criteria = [{ key: 'a', weight: 60 }, { key: 'b', weight: 40 }]
  it('weights checklist scores to a percent', () => {
    expect(weightedScore(criteria, { a: 5, b: 5 })).toBe(100)
    expect(weightedScore(criteria, { a: 5, b: 0 })).toBe(60)
    expect(weightedScore(criteria, { a: 3, b: 4 })).toBe(68)
    expect(weightsValid(criteria)).toBe(true)
    expect(weightsValid([{ key: 'a', weight: 90 }])).toBe(false)
  })
  it('computes NPS and CES', () => {
    const nps = npsSummary([10, 9, 8, 7, 6, 0].map((score) => ({ score })))
    expect(nps).toMatchObject({ count: 6, promoters: 2, passives: 2, detractors: 2, score: 0 })
    expect(cesSummary([7, 6, 2].map((score) => ({ score })))).toMatchObject({ average: 5, easy_percent: 67 })
    expect(isLowScore('nps', 6)).toBe(true)
    expect(isLowScore('csat', 3)).toBe(false)
  })
})
