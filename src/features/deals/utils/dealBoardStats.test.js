import { describe, expect, it } from 'vitest'
import { buildDealCardStats, resolveDealHealth, resolveDealTiming, sortDealsForBoard, summarizeDealColumn } from './dealBoardStats'

const now = new Date('2026-10-04T12:00:00')
const deal = { id: 1, statusValue: 'active', start_date: '2026-10-01', end_date: '2026-12-31', target_revenue: 500000, target_leads: 1000 }

describe('resolveDealTiming', () => {
  it('reads upcoming, running and ended periods', () => {
    expect(resolveDealTiming({ start_date: '2026-10-10' }, now)).toMatchObject({ phase: 'upcoming', days: 6 })
    expect(resolveDealTiming(deal, now)).toMatchObject({ phase: 'running', days: 89, elapsedPercent: 4 })
    expect(resolveDealTiming({ end_date: '2026-09-30' }, now)).toMatchObject({ phase: 'ended', days: 3 })
    expect(resolveDealTiming({}, now)).toBeNull()
  })
})

describe('resolveDealHealth', () => {
  const running = (elapsedPercent) => ({ phase: 'running', days: 10, elapsedPercent })
  it('compares achieved with elapsed', () => {
    expect(resolveDealHealth({ status: 'active', achievedPercent: 50, timing: running(55) })).toBe('onTrack')
    expect(resolveDealHealth({ status: 'active', achievedPercent: 30, timing: running(50) })).toBe('behind')
    expect(resolveDealHealth({ status: 'active', achievedPercent: 10, timing: running(60) })).toBe('atRisk')
  })
  it('cannot judge a draft deal, unknown progress or an ended deal that hit its target', () => {
    expect(resolveDealHealth({ status: 'draft', achievedPercent: 0, timing: running(90) })).toBeNull()
    expect(resolveDealHealth({ status: 'active', achievedPercent: null, timing: running(90) })).toBeNull()
    expect(resolveDealHealth({ status: 'active', achievedPercent: 100, timing: { phase: 'ended', days: 1, elapsedPercent: 100 } })).toBe('onTrack')
  })
})

describe('buildDealCardStats', () => {
  it('keeps lead numbers unknown until the leads load', () => {
    const stats = buildDealCardStats({ deal: { ...deal, leadsCount: 4 }, leads: null, now })
    expect(stats).toMatchObject({ loaded: false, leads: { total: 4, won: null }, wonRevenue: null, health: null })
  })

  it('counts leads, won revenue, open pipeline, win rate and alerts', () => {
    const leads = [
      { status: 'won', estimatedValue: 100000, ownerId: 1 },
      { status: 'lost', estimatedValue: 5000, ownerId: 1 },
      { status: 'open', estimatedValue: 20000, ownerId: null, lastActivityAt: '2026-09-01' },
      { status: 'open', estimatedValue: 0, ownerId: 2, lastActivityAt: '2026-10-03' },
    ]
    const stats = buildDealCardStats({ deal, leads, now })
    expect(stats).toMatchObject({
      loaded: true,
      leads: { total: 4, open: 2, won: 1, lost: 1 },
      wonRevenue: 100000, openValue: 20000, revenuePercent: 20, winRate: 50, unassigned: 1, stale: 1, health: 'onTrack',
    })
  })
})

describe('summarizeDealColumn / sortDealsForBoard', () => {
  it('sums targets and won revenue and counts deals needing attention', () => {
    expect(summarizeDealColumn([
      { targetRevenue: 100, wonRevenue: 40, health: 'atRisk' },
      { targetRevenue: null, wonRevenue: null, health: 'onTrack' },
    ])).toEqual({ count: 2, targetRevenue: 100, wonRevenue: 40, attention: 1 })
  })

  it('sorts by ending soon with undated deals last', () => {
    const deals = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const stats = new Map([
      ['1', { timing: null }],
      ['2', { timing: { phase: 'running', days: 30 } }],
      ['3', { timing: { phase: 'running', days: 5 } }],
    ])
    expect(sortDealsForBoard(deals, stats, 'endingSoon').map((row) => row.id)).toEqual([3, 2, 1])
  })
})
