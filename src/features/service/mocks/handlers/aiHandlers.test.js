// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const call = (method, url, data, params) => mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const S = '/api/tenant/service'
const status = (promise) => promise.then((response) => response.status, (error) => error.response.status)

describe('AI mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('devices')
    resetMockDb()
  })

  it('triages new text and exposes signals on cases', async () => {
    const result = (await call('post', `${S}/ai/triage`, { subject: 'التكييف فيه عطل', description: 'محتاج صيانة ضروري' })).data.data
    expect(result).toMatchObject({ type_id: 'ct-maintenance', signals: { urgency: 'high' } })
    const cases = (await call('get', `${S}/cases`, null, { per_page: 5, view: 'all' })).data.data
    expect(cases[0].ai_signals).toMatchObject({ sentiment: expect.any(String), urgency: expect.any(String) })
  })

  it('summarizes, drafts a reply with KB sources, counts usage and feedback', async () => {
    const item = (await call('get', `${S}/cases`, null, { per_page: 1, view: 'open' })).data.data[0]
    const summary = (await call('post', `${S}/cases/${item.id}/ai/summary`)).data.data
    expect(summary).toMatchObject({ ask: expect.any(String), waiting_on: expect.stringMatching(/team|customer/) })
    const draft = (await call('post', `${S}/cases/${item.id}/ai/suggest-reply`, { language: 'en' })).data.data
    expect(draft.body).toMatch(/Hi|Dear/)
    await call('post', `${S}/cases/${item.id}/ai/feedback`, { feature: 'suggested_reply', accepted: true })
    const usage = (await call('get', `${S}/ai/usage`)).data.data
    expect(usage.counts).toMatchObject({ summaries: 97, suggested_reply: 189 })
    expect(usage.acceptance.suggested_reply).toBe(69)
  })

  it('respects feature switches, blocked topics and the monthly limit', async () => {
    const settings = (await call('get', `${S}/ai/settings`)).data.data
    await call('put', `${S}/ai/settings`, { features: { ...settings.features, summaries: false } })
    const item = (await call('get', `${S}/cases`, null, { per_page: 1 })).data.data[0]
    expect(await status(call('post', `${S}/cases/${item.id}/ai/summary`))).toBe(403)
    await call('put', `${S}/ai/settings`, { blocked_topics: [item.subject.split(' ')[0]] })
    expect((await call('post', `${S}/cases/${item.id}/ai/suggest-reply`)).data.data).toMatchObject({ blocked: true })
    await call('put', `${S}/ai/settings`, { monthly_limit: 10 })
    expect(await status(call('post', `${S}/ai/triage`, { subject: 'x' }))).toBe(429)
  })

  it('suggests agents and marks a duplicate (closed, linked both ways)', async () => {
    const [a, b] = (await call('get', `${S}/cases`, null, { per_page: 2, view: 'open' })).data.data
    const agents = (await call('get', `${S}/cases/${a.id}/ai/assignment`)).data.data
    expect(agents.length).toBeGreaterThan(0)
    expect(agents[0].reasons).toContain('load')
    const closed = (await call('post', `${S}/cases/${a.id}/mark-duplicate`, { of_case_id: b.id, version: a.version })).data.data
    expect(closed).toMatchObject({ duplicate_of: { id: b.id }, resolution_code: 'duplicate', status: { category: 'closed' } })
    expect(await status(call('post', `${S}/cases/${b.id}/mark-duplicate`, { of_case_id: b.id }))).toBe(422)
  })
})
