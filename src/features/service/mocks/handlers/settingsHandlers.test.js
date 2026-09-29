// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })

const base = '/api/tenant/service'

describe('settings mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('lists seeded configuration resources', async () => {
    for (const path of ['case-types', 'queues', 'sla-policies', 'business-calendars', 'escalation-rules']) {
      const { data } = await request('get', `${base}/${path}`)
      expect(data.data.length).toBeGreaterThan(0)
    }
  })

  it('validates case types (required label, unique key)', async () => {
    const existing = (await request('get', `${base}/case-types`)).data.data[0]
    await expect(request('post', `${base}/case-types`, { label: { ar: '', en: '' }, key: existing.key })).rejects.toMatchObject({
      response: { status: 422, data: { code: 'VALIDATION_FAILED', errors: { label: ['required'], key: ['taken'] } } },
    })
  })

  it('new case types appear in the case setup; updates are persisted', async () => {
    const created = await request('post', `${base}/case-types`, { label: { ar: 'اختبار', en: 'Test' }, key: 'test_type', active: true })
    expect(created.status).toBe(201)
    const setup = (await request('get', '/api/tenant/service/cases/setup')).data.data
    expect(setup.case_types.some((type) => type.key === 'test_type')).toBe(true)

    await request('patch', `${base}/case-types/${created.data.data.id}`, { active: false })
    const after = (await request('get', '/api/tenant/service/cases/setup')).data.data
    expect(after.case_types.some((type) => type.key === 'test_type')).toBe(false)
  })

  it('refuses to delete items that are in use (409) and deletes unused ones (204)', async () => {
    const type = (await request('get', `${base}/case-types`)).data.data[0]
    await expect(request('delete', `${base}/case-types/${type.id}`)).rejects.toMatchObject({
      response: { status: 409, data: { code: 'RESOURCE_IN_USE' } },
    })
    const calendar = (await request('get', `${base}/business-calendars`)).data.data[0]
    await expect(request('delete', `${base}/business-calendars/${calendar.id}`)).rejects.toMatchObject({
      response: { status: 409 },
    })
    const rule = (await request('get', `${base}/escalation-rules`)).data.data[0]
    const deleted = await request('delete', `${base}/escalation-rules/${rule.id}`)
    expect(deleted.status).toBe(204)
  })

  it('validates SLA targets', async () => {
    await expect(request('post', `${base}/sla-policies`, { name: { en: 'X' }, first_response_minutes: 0, resolution_minutes: 60 })).rejects.toMatchObject({
      response: { status: 422, data: { errors: { first_response_minutes: ['required'] } } },
    })
  })
})
