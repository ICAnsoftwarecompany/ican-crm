import { describe, expect, it } from 'vitest'
import { buildLeadsReport, getLeadAssigneeId, getLeadSource, getLeadStatusName } from './leadsReportModel'

const NOW = new Date(2026, 9, 10, 12)
const at = (d) => new Date(2026, 9, d, 9).toISOString()

const customers = [
  { created_at: at(9), lead: { status: { name: 'New' }, source: 'facebook', assigned_to: 5 } },
  { created_at: at(10), lead: { status: 'Won', source: 'whatsapp', assigned_to: null } },
  { created_at: at(8), lead: { status_name: 'New', source: { name: 'facebook' }, assigned_to: { id: 5 } } },
  { created_at: at(1), lead: { status: 'Lost', source: '' } },
]

describe('lead field readers', () => {
  it('read status, source and assignee in every shape the API returns', () => {
    expect(getLeadStatusName(customers[0])).toBe('New')
    expect(getLeadStatusName(customers[1])).toBe('Won')
    expect(getLeadStatusName(customers[2])).toBe('New')
    expect(getLeadSource(customers[2])).toBe('facebook')
    expect(getLeadAssigneeId(customers[2])).toBe(5)
    expect(getLeadAssigneeId(customers[1])).toBe('')
  })
})

describe('buildLeadsReport', () => {
  it('counts the range, previous range, unassigned and groups', () => {
    const report = buildLeadsReport(customers, '7d', NOW)
    expect(report.total).toBe(4)
    expect(report.created).toBe(3)
    expect(report.previousCreated).toBe(1)
    expect(report.createdDelta).toBe(200)
    expect(report.unassigned).toBe(1)
    expect(report.dailyCreated).toHaveLength(7)
    expect(report.byStatus[0]).toEqual({ key: 'New', value: 2 })
    expect(report.bySource).toEqual([{ key: 'facebook', value: 2 }, { key: 'whatsapp', value: 1 }])
    expect(report.byAssignee).toEqual([{ key: '5', value: 2 }, { key: '__none__', value: 1 }])
  })

  it('has no delta for "all"', () => {
    expect(buildLeadsReport(customers, 'all', NOW).createdDelta).toBeNull()
  })
})
