// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const A = '/api/tenant/portal/accounts'

describe('portal admin mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('school')
    resetMockDb()
  })

  it('lists accounts with memberships and policy names', async () => {
    const accounts = (await request('get', A)).data.data
    expect(accounts[0].memberships[0]).toMatchObject({ membership_type: 'guardian', policy: { id: 'pp-guardian' } })
    expect(accounts[0].memberships).toHaveLength(2)
  })

  it('invites, refuses duplicates, adds and revokes access, signs out and disables', async () => {
    await expect(request('post', A, { name: 'X', customer_id: 'cust-1', membership_type: 'guardian', policy_id: 'pp-guardian' })).rejects.toMatchObject({ response: { status: 422 } })
    const created = (await request('post', A, { name: 'X', phone: '+201000000001', customer_id: 'cust-1', membership_type: 'guardian', policy_id: 'pp-guardian' })).data.data
    expect(created.status).toBe('invited')
    await expect(request('post', A, { name: 'Y', phone: '+201000000001', customer_id: 'cust-2', membership_type: 'self', policy_id: 'pp-student' })).rejects.toMatchObject({ response: { status: 409 } })
    await expect(request('post', `${A}/${created.id}/memberships`, { customer_id: 'cust-3', membership_type: 'organization_member', policy_id: 'pp-guardian' })).rejects.toMatchObject({ response: { status: 422 } })
    const added = (await request('post', `${A}/${created.id}/memberships`, { customer_id: 'cust-3', membership_type: 'self', policy_id: 'pp-student' })).data.data
    expect(added.memberships).toHaveLength(2)
    const revoked = (await request('delete', `${A}/${created.id}/memberships/${added.memberships[1].id}`)).data.data
    expect(revoked.memberships[1].status).toBe('revoked')
    expect((await request('post', `${A}/pa-1/revoke-sessions`)).data.data.active_sessions).toBe(0)
    expect((await request('patch', `${A}/pa-1`, { status: 'disabled' })).data.data.status).toBe('disabled')
  })

  it('protects policies in use and validates settings', async () => {
    await expect(request('delete', '/api/tenant/portal/policies/pp-guardian')).rejects.toMatchObject({ response: { status: 409 } })
    await expect(request('put', '/api/tenant/portal/settings', { brand_name: { ar: 'x', en: 'x' }, primary_color: 'red' })).rejects.toMatchObject({ response: { status: 422 } })
    expect((await request('put', '/api/tenant/portal/settings', { brand_name: { ar: 'x', en: 'x' }, primary_color: '#112233' })).data.data.primary_color).toBe('#112233')
    const catalog = (await request('get', '/api/tenant/service/catalog-items')).data.data
    expect(catalog.map((entry) => entry.id)).toContain('sc-certificate')
  })
})
