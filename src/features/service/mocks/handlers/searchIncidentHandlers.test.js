// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const call = (method, url, data, { params, token } = {}) => mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params, headers: token ? { Authorization: `Bearer ${token}` } : {} }, { latency: 0 })
const S = '/api/tenant/service'

describe('service search and major incidents', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('devices')
    resetMockDb()
  })

  it('searches across requests, customers, assets and articles', async () => {
    const item = (await call('get', `${S}/cases`, null, { params: { per_page: 1 } })).data.data[0]
    const byNumber = (await call('get', `${S}/search`, null, { params: { q: item.case_number } })).data.data
    expect(byNumber.groups[0]).toMatchObject({ key: 'cases', items: [expect.objectContaining({ id: item.id })] })
    const byPhone = (await call('get', `${S}/search`, null, { params: { q: item.customer.phone } })).data.data
    expect(byPhone.groups.map((group) => group.key)).toContain('customers')
    expect((await call('get', `${S}/search`, null, { params: { q: 'x' } })).data.data.groups).toEqual([])
  })

  it('declares, links, posts public updates to linked requests and shows them in the portal', async () => {
    const [a, b] = (await call('get', `${S}/cases`, null, { params: { per_page: 2, view: 'open' } })).data.data
    const incident = (await call('post', `${S}/incidents`, { title: 'Outage', severity: 'critical', case_ids: [a.id] })).data.data
    const linked = (await call('post', `${S}/incidents/${incident.id}/link`, { case_numbers: [b.case_number, 'CS-NOPE'] })).data.data
    expect(linked.linked_count).toBe(2)
    await expect(call('post', `${S}/incidents/${incident.id}/link`, { case_numbers: ['CS-NOPE'] })).rejects.toMatchObject({ response: { status: 422 } })
    await call('post', `${S}/incidents/${incident.id}/updates`, { status: 'monitoring', message: 'Fixed, watching', public: true, notify_linked: true })
    const activities = (await call('get', `${S}/cases/${a.id}/activities`)).data.data
    expect(activities.some((entry) => entry.type === 'reply' && entry.body === 'Fixed, watching')).toBe(true)
    const account = (await call('get', '/api/tenant/portal/accounts')).data.data[0]
    await call('post', '/api/portal/auth/otp', { target: account.phone })
    const token = (await call('post', '/api/portal/auth/verify', { target: account.phone, code: '123456' })).data.data.token
    const banner = (await call('get', '/api/portal/incidents/active', null, { token })).data.data
    expect(banner.map((entry) => entry.title)).toContain('Outage')
    const resolved = (await call('post', `${S}/incidents/${incident.id}/updates`, { status: 'resolved', message: 'Done' })).data.data
    expect(resolved.resolved_at).toBeTruthy()
    await expect(call('post', `${S}/incidents/${incident.id}/updates`, { status: 'monitoring', message: 'x' })).rejects.toMatchObject({ response: { status: 409 } })
  })
})
