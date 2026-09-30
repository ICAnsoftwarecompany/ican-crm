// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const call = (method, url, data, { token, params } = {}) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params, headers: token ? { Authorization: `Bearer ${token}` } : {} }, { latency: 0 })
const P = '/api/portal'

async function signIn(target) {
  await call('post', `${P}/auth/otp`, { target })
  return (await call('post', `${P}/auth/verify`, { target, code: '123456' })).data.data
}
async function accountPhone(id) {
  return (await mockAdapter({ method: 'get', url: '/api/tenant/portal/accounts' }, { latency: 0 })).data.data.find((account) => account.id === id)
}

describe('portal mock API', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('school')
    resetMockDb()
  })

  it('does not reveal unknown accounts and limits OTP attempts', async () => {
    expect((await call('post', `${P}/auth/otp`, { target: '+200000000000' })).data.data.sent).toBe(true)
    await expect(call('post', `${P}/auth/verify`, { target: '+200000000000', code: '123456' })).rejects.toMatchObject({ response: { status: 422 } })
    const guardian = await accountPhone('pa-1')
    await call('post', `${P}/auth/otp`, { target: guardian.phone })
    for (let n = 0; n < 5; n += 1) await expect(call('post', `${P}/auth/verify`, { target: guardian.phone, code: '000000' })).rejects.toMatchObject({ response: { status: 422 } })
    await expect(call('post', `${P}/auth/verify`, { target: guardian.phone, code: '123456' })).rejects.toMatchObject({ response: { status: 429 } })
  })

  it('scopes everything by the active membership and policy (guardian)', async () => {
    const guardian = await accountPhone('pa-1')
    const session = await signIn(guardian.phone)
    expect(session.permissions['record:enrollment']).toEqual(['view'])
    expect(session.memberships).toHaveLength(2)
    const records = (await call('get', `${P}/records`, null, { token: session.token })).data.data
    const customerId = session.memberships[0].customer.id
    expect(records.every((record) => record.type.key === 'enrollment')).toBe(true)
    const cases = (await call('get', `${P}/cases`, null, { token: session.token })).data.data
    const all = (await mockAdapter({ method: 'get', url: '/api/tenant/service/cases', params: { per_page: 200, view: 'all' } }, { latency: 0 })).data.data
    expect(cases.length).toBe(all.filter((item) => item.customer?.id === customerId).length)
    await expect(call('get', `${P}/assets`, null, { token: session.token })).rejects.toMatchObject({ response: { status: 403 } })
    await expect(call('get', `${P}/records`)).rejects.toMatchObject({ response: { status: 401 } })
  })

  it('switches membership, requests a catalog service and replies', async () => {
    const guardian = await accountPhone('pa-1')
    const session = await signIn(guardian.phone)
    await expect(call('post', `${P}/catalog/sc-certificate/request`, { answers: {} }, { token: session.token })).rejects.toMatchObject({ response: { status: 422 } })
    const created = (await call('post', `${P}/catalog/sc-certificate/request`, { answers: { purpose: 'Visa' } }, { token: session.token })).data.data
    expect(created.case_number).toMatch(/^CS-/)
    const replied = (await call('post', `${P}/cases/${created.id}/reply`, { body: 'Thanks' }, { token: session.token })).data.data
    expect(replied.messages.at(-1)).toMatchObject({ from: 'customer', body: 'Thanks' })
    const switched = (await call('post', `${P}/me/switch`, { membership_id: 'pm-extra' }, { token: session.token })).data.data
    expect(switched.active_membership_id).toBe('pm-extra')
    await expect(call('get', `${P}/cases/${created.id}`, null, { token: session.token })).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('pays through the gateway mock and staff sign-out ends the session', async () => {
    const guardian = await accountPhone('pa-1')
    const session = await signIn(guardian.phone)
    const schedules = (await call('get', `${P}/schedules`, null, { token: session.token })).data.data
    if (schedules.length) {
      const target = schedules.find((entry) => entry.totals.outstanding > 0)
      if (target) expect((await call('post', `${P}/payments`, { schedule_id: target.id, amount: 1 }, { token: session.token })).data.data.status).toBe('succeeded')
    }
    await mockAdapter({ method: 'post', url: '/api/tenant/portal/accounts/pa-1/revoke-sessions' }, { latency: 0 })
    await new Promise((resolve) => setTimeout(resolve, 5))
    await expect(call('get', `${P}/me`, null, { token: session.token })).rejects.toMatchObject({ response: { status: 401 } })
  })
})

describe('portal B2B + guest tracking', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('shipping')
    resetMockDb()
  })

  it('accounting cannot create shipments; admin manages company users', async () => {
    const accounting = await signIn('user2@merchant.example')
    expect(accounting.permissions['record:shipment']).toEqual(['view'])
    await expect(call('get', `${P}/org/users`, null, { token: accounting.token })).rejects.toMatchObject({ response: { status: 403 } })
    const admin = (await call('post', `${P}/auth/login`, { email: 'user1@merchant.example', password: 'Portal@123' })).data.data
    const users = (await call('get', `${P}/org/users`, null, { token: admin.token })).data.data
    expect(users.length).toBeGreaterThanOrEqual(2)
    await call('post', `${P}/org/users`, { name: 'New', email: 'new@merchant.example', role_id: 'warehouse' }, { token: admin.token }).catch((error) => expect(error.response.status).toBe(422))
    expect((await call('post', `${P}/org/users`, { name: 'New', email: 'new@merchant.example', role_id: 'operations' }, { token: admin.token })).data.data.invited).toBe(true)
    await expect(call('post', `${P}/auth/login`, { email: 'user1@merchant.example', password: 'wrong' })).rejects.toMatchObject({ response: { status: 422 } })
  })

  it('guest sees one shipment after OTP', async () => {
    const first = (await mockAdapter({ method: 'get', url: '/api/tenant/service/records', params: { per_page: 50 } }, { latency: 0 })).data.data[0]
    const step1 = (await call('post', `${P}/track`, { reference: first.reference_no })).data.data
    expect(step1.otp_sent).toBe(true)
    expect((await call('post', `${P}/track`, { reference: 'NOPE-1' })).data.data.otp_sent).toBe(true)
    const tracked = (await call('post', `${P}/track`, { reference: first.reference_no, code: '123456' })).data.data
    expect(tracked).toMatchObject({ reference_no: first.reference_no })
    expect(tracked.customer).toBeUndefined()
  })
})
