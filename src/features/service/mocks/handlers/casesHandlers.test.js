// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })

const base = '/api/tenant/service/cases'

describe('cases mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('lists open cases with Laravel pagination meta', async () => {
    const { data } = await request('get', base, null, { view: 'open', per_page: 5 })
    expect(data.data).toHaveLength(5)
    expect(data.meta).toMatchObject({ current_page: 1, per_page: 5 })
    data.data.forEach((item) => expect(['open', 'in_progress', 'pending']).toContain(item.status.category))
  })

  it('returns counts per view that match the lists', async () => {
    const summary = (await request('get', `${base}/summary`)).data.data.views
    const all = (await request('get', base, null, { view: 'all', per_page: 100 })).data.meta.total
    expect(summary.all).toBe(all)
    expect(summary.open).toBeGreaterThan(0)
  })

  it('creates a case in the initial status and validates required fields', async () => {
    await expect(request('post', base, { subject: '' })).rejects.toMatchObject({
      response: { status: 422, data: { code: 'VALIDATION_FAILED' } },
    })
    const setup = (await request('get', `${base}/setup`)).data.data
    const created = await request('post', base, { subject: 'New', type_id: setup.case_types[0].id, customer_id: 'cust-1' })
    expect(created.status).toBe(201)
    expect(created.data.data.status.key).toBe('new')
  })

  it('enforces transitions, required fields and versions', async () => {
    const setup = (await request('get', `${base}/setup`)).data.data
    const created = (await request('post', base, { subject: 'X', type_id: setup.case_types[0].id, customer_id: 'cust-1' })).data.data
    const url = `${base}/${created.id}/transition`

    await expect(request('post', url, { to_status_id: 'st-closed', version: created.version })).rejects.toMatchObject({
      response: { status: 409, data: { code: 'CASE_TRANSITION_NOT_ALLOWED' } },
    })

    const open = (await request('post', url, { to_status_id: 'st-open', version: created.version })).data.data
    expect(open.status.key).toBe('open')

    await expect(request('post', url, { to_status_id: 'st-progress', version: created.version })).rejects.toMatchObject({
      response: { status: 409, data: { code: 'CONFLICT_VERSION' } },
    })

    await expect(request('post', url, { to_status_id: 'st-resolved', version: open.version })).rejects.toMatchObject({
      response: { status: 422, data: { errors: { resolution_code: ['required'] } } },
    })

    const resolved = (
      await request('post', url, { to_status_id: 'st-resolved', version: open.version, resolution_code: 'fixed', resolution_summary: 'Done' })
    ).data.data
    expect(resolved.status.category).toBe('resolved')

    const activities = (await request('get', `${base}/${created.id}/activities`)).data.data
    expect(activities.filter((entry) => entry.type === 'status_change')).toHaveLength(2)
  })

  it('keeps internal notes and replies separate', async () => {
    await request('post', `${base}/case-1/notes`, { body: 'Internal' })
    await request('post', `${base}/case-1/reply`, { body: 'Hello' })
    const activities = (await request('get', `${base}/case-1/activities`)).data.data
    expect(activities.find((entry) => entry.body === 'Internal').visibility).toBe('internal')
    expect(activities.find((entry) => entry.body === 'Hello').visibility).toBe('customer')
  })

  it('reseeds case types when the industry template changes', async () => {
    const before = (await request('get', `${base}/setup`)).data.data.case_types.map((type) => type.key)
    setActiveMockTemplate('shipping')
    const after = (await request('get', `${base}/setup`)).data.data.case_types.map((type) => type.key)
    expect(after).not.toEqual(before)
    expect(after).toContain('delivery_issue')
  })
})
