import { describe, expect, it } from 'vitest'
import { buildDealsComparison, dealTimeProgress, normalizeDealOverview, normalizeDealOwners } from './dealAnalytics'
import { buildDealCompleteness, completenessTone } from './dealCompleteness'

// Exactly the backend responses (Postman "Deal Analytics" examples).
const overviewResponse = {
  message: 'تم استرجاع بيانات الـ Deal بنجاح.',
  data: {
    deal: { name: 'Q4 Sales Deal', status: 'active', start_date: '2026-10-01T00:00:00.000000Z', end_date: '2026-12-31T00:00:00.000000Z', target_revenue: '500000.00', target_leads: 1000 },
    stats: { total_leads: 3, won: 2, lost: 1, open: 0, revenue: 580, achievement_percentage: 0.12 },
    stages_summary: [{ id: 1, name: 'New Lead', leads_count: 1 }, { id: 2, name: 'Negotiation', leads_count: 1 }, { id: 3, name: 'Won', leads_count: 0 }],
  },
}
const ownersResponse = {
  message: 'ok',
  data: [
    { owner_id: 1, leads_count: 3, revenue: '580.00', won_count: '2', owner: { id: 1, name: 'admin', email: 'test008@example.com' } },
    { owner_id: 4, leads_count: 5, revenue: '0.00', won_count: '0', owner: { id: 4, name: 'Nour' } },
  ],
}

describe('deal analytics', () => {
  it('normalizes the overview (achievement is already a percent)', () => {
    expect(normalizeDealOverview(overviewResponse)).toEqual({
      deal: { name: 'Q4 Sales Deal', status: 'active', startDate: '2026-10-01', endDate: '2026-12-31', targetRevenue: 500000, targetLeads: 1000 },
      stats: { total: 3, won: 2, lost: 1, open: 0, revenue: 580, achievement: 0.12, winRate: 66.7, leadsProgress: 0.3 },
      stages: [{ id: '1', name: 'New Lead', count: 1 }, { id: '2', name: 'Negotiation', count: 1 }, { id: '3', name: 'Won', count: 0 }],
    })
    expect(normalizeDealOverview(null)).toBeNull()
  })

  it('normalizes owners (string numbers) and ranks by revenue', () => {
    expect(normalizeDealOwners(ownersResponse)).toEqual([
      { id: '1', name: 'admin', email: 'test008@example.com', leads: 3, won: 2, revenue: 580, winRate: 66.7 },
      { id: '4', name: 'Nour', email: '', leads: 5, won: 0, revenue: 0, winRate: 0 },
    ])
  })

  it('computes time progress and the comparison rows', () => {
    expect(dealTimeProgress('2026-10-01', '2026-10-11', new Date('2026-10-06T00:00:00'))).toMatchObject({ daysLeft: 6, totalDays: 11 })
    expect(dealTimeProgress('', '2026-10-11')).toBeNull()
    const rows = buildDealsComparison([{ dealId: 1, overview: normalizeDealOverview(overviewResponse) }, { dealId: 2, name: 'B', overview: null }])
    expect(rows[0]).toMatchObject({ dealId: '1', name: 'Q4 Sales Deal', loaded: true, revenue: 580, targetRevenue: 500000 })
    expect(rows[1]).toMatchObject({ dealId: '2', name: 'B', loaded: false, revenue: null })
  })
})

describe('deal completeness', () => {
  it('scores the known checklist items and lists the missing ones', () => {
    const deal = { name: 'X', start_date: '2026-10-01', end_date: '2026-12-31', target_leads: 100, target_revenue: 0, pipeline_template_id: 5 }
    const result = buildDealCompleteness(deal, { productsCount: 1, teamCount: 0, leadsCount: 3 })
    expect(result).toMatchObject({ done: 5, total: 9, score: 56, missing: ['description', 'targetRevenue', 'owner', 'team'], unknown: [] })
    expect(completenessTone(result.score)).toBe('mid')
  })

  it('leaves unknown quick info out of the score', () => {
    const result = buildDealCompleteness({ description: 'd', start_date: 'a', end_date: 'b', target_leads: 1, target_revenue: 1, owner_id: 2, stages: [{ id: 1 }] })
    expect(result).toMatchObject({ done: 6, total: 6, score: 100, unknown: ['products', 'team', 'leads'] })
    expect(completenessTone(100)).toBe('full')
  })
})
