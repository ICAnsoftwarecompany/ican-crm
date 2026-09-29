// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })

describe('reports, feedback and saved views mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('returns an overview report with KPIs, trend and breakdowns', async () => {
    const report = (await request('get', '/api/tenant/service/reports/overview', null, { period: '30d' })).data.data
    expect(report.kpis.created).toBeGreaterThan(0)
    expect(report.trend).toHaveLength(30)
    expect(report.sla.met + report.sla.breached).toBeGreaterThan(0)
    expect(report.csat.distribution).toHaveLength(5)
    const typed = report.by_type.reduce((sum, entry) => sum + entry.count, 0)
    expect(typed).toBe(report.kpis.created)
    const weekly = (await request('get', '/api/tenant/service/reports/overview', null, { period: '90d' })).data.data
    expect(weekly.trend).toHaveLength(13)
  })

  it('lists CSAT responses with case info and a summary; filters by score', async () => {
    const { data } = await request('get', '/api/tenant/service/feedback/responses', null, { per_page: 5 })
    expect(data.data.length).toBeGreaterThan(0)
    expect(data.data[0].case.case_number).toMatch(/^CS-/)
    expect(data.meta.summary.count).toBeGreaterThan(0)
    const low = (await request('get', '/api/tenant/service/feedback/responses', null, { score: 1, per_page: 100 })).data.data
    low.forEach((entry) => expect(entry.score).toBe(1))
  })

  it('exposes csat on resolved cases', async () => {
    const { data } = await request('get', '/api/tenant/service/cases', null, { view: 'closed', per_page: 100 })
    expect(data.data.some((item) => item.csat && item.csat.score >= 1)).toBe(true)
  })

  it('saves private views for the current user', async () => {
    const created = await request('post', '/api/tenant/saved-views', { entity: 'service_case', name: 'Mine urgent', filters: { view: 'mine', priority: 'urgent' } })
    expect(created.data.data).toMatchObject({ visibility: 'private', entity: 'service_case' })
    const list = (await request('get', '/api/tenant/saved-views', null, { entity: 'service_case' })).data.data
    expect(list.some((view) => view.id === created.data.data.id)).toBe(true)
    await expect(request('post', '/api/tenant/saved-views', { entity: 'service_case', name: '' })).rejects.toMatchObject({ response: { status: 422 } })
  })
})
