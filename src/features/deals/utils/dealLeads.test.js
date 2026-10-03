import { describe, expect, it } from 'vitest'
import { buildDealLeadIndex, filterDealLeads, getDealLeadStatus, isDealLeadStale, normalizeDealLead, summarizeDealLeads } from './dealLeads'

const rows = [
  { id: 1, lead_id: 100, stage_id: 5, owner_id: 7, status: 'open', estimated_value: '1000', lead: { name: 'Ahmed', phone: '010', customer_id: 900 } },
  { id: 2, lead_id: 101, stage_id: 6, status: 'won', estimated_value: 590, lead: { name: 'Sara' } },
  { id: 3, lead_id: 102, stage_id: 5, lost_at: '2026-09-01', lead: { name: 'Mona' } },
].map(normalizeDealLead)

describe('normalizeDealLead', () => {
  it('keeps the deal-lead id as id and exposes lead / customer ids', () => {
    expect(rows[0]).toMatchObject({ id: 1, leadId: 100, customerId: 900, name: 'Ahmed', stageId: 5, ownerId: 7, estimatedValue: 1000 })
  })

  it('derives the status from lost_at / won_at when status is missing', () => {
    expect(rows[2].status).toBe('lost')
    expect(getDealLeadStatus({ won_at: 'x' })).toBe('won')
    expect(getDealLeadStatus({})).toBe('open')
  })
})

describe('filterDealLeads', () => {
  it('filters by status, stage, unassigned and search', () => {
    expect(filterDealLeads(rows, { status: 'open' }).map((lead) => lead.id)).toEqual([1])
    expect(filterDealLeads(rows, { stageId: 5 }).map((lead) => lead.id)).toEqual([1, 3])
    expect(filterDealLeads(rows, { unassigned: true }).map((lead) => lead.id)).toEqual([2, 3])
    expect(filterDealLeads(rows, { search: 'sar' }).map((lead) => lead.id)).toEqual([2])
  })
})

describe('summaries and indexes', () => {
  it('counts statuses, pipeline value and won value', () => {
    expect(summarizeDealLeads(rows)).toEqual({ total: 3, open: 1, won: 1, lost: 1, unassigned: 0, pipelineValue: 1000, wonValue: 590 })
  })

  it('indexes lead and customer ids as strings', () => {
    const index = buildDealLeadIndex(rows)
    expect(index.leadIds.has('101')).toBe(true)
    expect(index.customerIds.has('900')).toBe(true)
  })

  it('marks open leads without activity for 7+ days as stale', () => {
    const now = new Date('2026-10-03T12:00:00')
    expect(isDealLeadStale({ status: 'open', lastActivityAt: '2026-09-20' }, now)).toBe(true)
    expect(isDealLeadStale({ status: 'won', lastActivityAt: '2026-09-20' }, now)).toBe(false)
    expect(isDealLeadStale({ status: 'open', lastActivityAt: '2026-10-01' }, now)).toBe(false)
  })
})
