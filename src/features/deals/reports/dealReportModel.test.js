import { describe, expect, it } from 'vitest'
import { buildDealReport, buildDealsHubReport } from './dealReportModel'

const now = new Date('2026-10-03T12:00:00')
const leads = [
  { id: 1, status: 'open', stageId: 10, ownerId: 5, source: 'facebook', createdAt: '2026-10-01', estimatedValue: 100 },
  { id: 2, status: 'won', stageId: 12, ownerId: 5, source: 'facebook', createdAt: '2026-09-28', closedAt: '2026-10-02', estimatedValue: 590 },
  { id: 3, status: 'lost', stageId: 13, source: 'google', createdAt: '2026-09-20', closedAt: '2026-10-01', lostReason: 'price' },
  { id: 4, status: 'open', stageId: 11, source: '', createdAt: '2026-06-01', estimatedValue: 50 },
]
const stages = [{ id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }]

describe('buildDealReport', () => {
  it('counts created / won / lost in range, win rate and pipeline value', () => {
    const report = buildDealReport({ leads, stages, contracts: [{ total: 590, signedAt: '2026-10-02' }], range: '7d', now })
    expect(report).toMatchObject({ created: 2, won: 1, lost: 1, winRate: 50, revenue: 590, pipelineValue: 150, openCount: 2 })
    expect(report.byStage).toEqual([{ key: '10', value: 1 }, { key: '11', value: 1 }, { key: '12', value: 0 }, { key: '13', value: 0 }])
    expect(report.lostReasons).toEqual([{ key: 'price', value: 1 }])
    expect(report.dailyClosed.at(-2)).toMatchObject({ won: 1, lost: 0 })
  })
})

describe('buildDealsHubReport', () => {
  it('sums deals, active ones and contract revenue', () => {
    const report = buildDealsHubReport({
      deals: [{ statusValue: 'active', target_revenue: '1000', created_at: '2026-10-01' }, { statusValue: 'draft', created_at: '2026-01-01' }],
      contracts: [{ total: 200, dealId: 1, signedAt: '2026-10-02' }],
      range: '30d',
      now,
    })
    expect(report).toMatchObject({ total: 2, active: 1, created: 1, contracts: 1, revenue: 200, targetRevenue: 1000 })
  })
})
