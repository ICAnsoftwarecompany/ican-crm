import { describe, expect, it } from 'vitest'
import { buildDealInsights, buildTargetPace } from './dealInsights'

const now = new Date('2026-10-03T12:00:00')
const deal = { target_revenue: 1000, start_date: '2026-09-01', end_date: '2026-10-31' }

describe('deal insights (rules, not AI)', () => {
  it('reports unassigned and stale leads first, then pacing', () => {
    const leads = [
      { status: 'open', ownerId: null, lastActivityAt: '2026-10-02', estimatedValue: 10 },
      { status: 'open', ownerId: 3, lastActivityAt: '2026-09-01', estimatedValue: 10 },
      { status: 'won', ownerId: 3, estimatedValue: 100 },
    ]
    const ids = buildDealInsights({ deal, leads, now }).map((item) => item.id)
    expect(ids[0]).toBe('unassignedLeads')
    expect(ids).toContain('staleLeads')
    expect(ids).toContain('behindTarget')
  })

  it('computes target pace and returns null without dates', () => {
    expect(buildTargetPace(deal, [{ status: 'won', estimatedValue: 100 }], now)).toMatchObject({ achievedPercent: 10, behind: true })
    expect(buildTargetPace({ target_revenue: 10 }, [], now)).toBeNull()
  })

  it('suggests adding leads to an empty deal', () => {
    expect(buildDealInsights({ deal: {}, leads: [], now }).map((item) => item.id)).toEqual(['noLeads'])
  })
})
