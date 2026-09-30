// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const call = (method, url, data, { token, params } = {}) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params, headers: token ? { Authorization: `Bearer ${token}` } : {} }, { latency: 0 })
const Q = '/api/tenant/service/quality'
const status = (promise) => promise.then((response) => response.status, (error) => error.response.status)

describe('quality and surveys mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('devices')
    resetMockDb()
  })

  it('requires weights that add up to 100', async () => {
    const bad = { name: { ar: 'x', en: 'x' }, subject_type: 'case', pass_score: 70, criteria: [{ key: 'a', label: { en: 'A' }, weight: 50 }] }
    await expect(call('post', `${Q}/checklists`, bad)).rejects.toMatchObject({ response: { data: { errors: { criteria: ['weights_100'] } } } })
    expect(await status(call('post', `${Q}/checklists`, { ...bad, criteria: [{ key: 'a', label: { en: 'A' }, weight: 100 }] }))).toBe(201)
  })

  it('scores a review with weights and needs RCA + corrective action when it fails', async () => {
    const pending = (await call('get', `${Q}/reviews`, null, { params: { status: 'pending' } })).data.data[0]
    const keys = pending.checklist.criteria.map((criterion) => criterion.key)
    await expect(call('patch', `${Q}/reviews/${pending.id}`, { scores: { [keys[0]]: 5 } })).rejects.toMatchObject({ response: { status: 422 } })
    const low = Object.fromEntries(keys.map((key) => [key, 2]))
    await expect(call('patch', `${Q}/reviews/${pending.id}`, { scores: low })).rejects.toMatchObject({ response: { data: { errors: { root_cause: ['required'], corrective_action: ['required'] } } } })
    const done = (await call('patch', `${Q}/reviews/${pending.id}`, { scores: low, root_cause: 'training', corrective_action: 'Coach on first reply' })).data.data
    expect(done).toMatchObject({ status: 'done', total: 40, passed: false })
    expect(await status(call('patch', `${Q}/reviews/${pending.id}`, { scores: low }))).toBe(409)
    const summary = (await call('get', `${Q}/summary`, null, { params: { period: '90d' } })).data.data
    expect(summary.root_causes.find((entry) => entry.cause === 'training').count).toBeGreaterThanOrEqual(1)
    expect(summary.criteria).toHaveLength(5)
  })

  it('samples resolved cases once and lets a supervisor queue one case', async () => {
    const first = (await call('post', `${Q}/sampling/run`)).data.data.created
    expect((await call('post', `${Q}/sampling/run`)).data.data.created).toBe(0)
    expect(first).toBeGreaterThanOrEqual(0)
    const item = (await call('get', '/api/tenant/service/cases', null, { params: { view: 'open', per_page: 1 } })).data.data[0]
    expect(await status(call('post', `${Q}/reviews`, { subject_id: item.id }))).toBe(201)
    expect(await status(call('post', `${Q}/reviews`, { subject_id: item.id }))).toBe(409)
  })

  it('lists NPS / CES separately and opens a case for a portal detractor', async () => {
    const nps = (await call('get', '/api/tenant/service/feedback/responses', null, { params: { survey: 'nps', period: '90d' } })).data.meta
    expect(nps.survey).toBe('nps')
    expect(nps.summary.count).toBeGreaterThan(5)
    expect(nps.summary.promoters + nps.summary.passives + nps.summary.detractors).toBe(nps.summary.count)
    expect(nps.summary.score).toBeGreaterThanOrEqual(-100)
    const account = (await call('get', '/api/tenant/portal/accounts')).data.data[0]
    await call('post', '/api/portal/auth/otp', { target: account.phone })
    const token = (await call('post', '/api/portal/auth/verify', { target: account.phone, code: '123456' })).data.data.token
    const survey = (await call('get', '/api/portal/surveys/active', null, { token })).data.data
    expect(survey).toMatchObject({ type: 'nps', scale: [0, 10] })
    await expect(call('post', '/api/portal/feedback', { survey_id: survey.id, score: 11 }, { token })).rejects.toMatchObject({ response: { status: 422 } })
    const before = (await call('get', '/api/tenant/service/cases', null, { params: { view: 'all', per_page: 200 } })).data.meta.total
    await call('post', '/api/portal/feedback', { survey_id: survey.id, score: 2, comment: 'Slow' }, { token })
    const after = (await call('get', '/api/tenant/service/cases', null, { params: { view: 'all', per_page: 200 } })).data.meta.total
    expect(after).toBe(before + 1)
    expect((await call('get', '/api/portal/surveys/active', null, { token })).data.data?.type).not.toBe('nps')
  })
})
