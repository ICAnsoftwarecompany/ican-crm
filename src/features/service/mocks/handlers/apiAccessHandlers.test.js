// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const C = '/api/tenant/api-clients'
const W = '/api/tenant/webhook-subscriptions'
const status = (promise) => promise.then((response) => response.status, (error) => error.response.status)

describe('API clients and webhooks mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('shipping')
    resetMockDb()
  })

  it('shows a key once, stores only a prefix, rotates it', async () => {
    const created = (await request('post', C, { name: 'Shop', scopes: ['cases.write'], rate_limit: 60 })).data
    expect(created.key).toMatch(/^ick_live_[A-Za-z0-9]{32}$/)
    expect(created.data).toMatchObject({ key_prefix: created.key.slice(0, 13), key_last4: created.key.slice(-4) })
    const listed = (await request('get', C)).data.data.find((entry) => entry.id === created.data.id)
    expect(JSON.stringify(listed)).not.toContain(created.key)
    const rotated = (await request('post', `${C}/${created.data.id}/rotate`)).data
    expect(rotated.key).not.toBe(created.key)
    expect(await status(request('post', `${C}/ac-old/rotate`))).toBe(409)
  })

  it('limits a customer-bound key to its scopes and validates limits', async () => {
    const customer = (await request('get', C)).data.data.find((entry) => entry.bound_customer_id).bound_customer_id
    await expect(request('post', C, { name: 'B2B', scopes: ['billing.read'], bound_customer_id: customer })).rejects.toMatchObject({ response: { data: { errors: { scopes: ['not_allowed_for_bound'] } } } })
    await expect(request('post', C, { name: 'x', scopes: ['cases.read'], ip_allowlist: ['10.0.0.300'] })).rejects.toMatchObject({ response: { status: 422 } })
    await expect(request('post', C, { name: 'x', scopes: ['cases.read'], rate_limit: 5 })).rejects.toMatchObject({ response: { status: 422 } })
    expect(await status(request('delete', `${C}/ac-erp`))).toBe(409)
  })

  it('creates https webhooks with a one-time secret, tests and redelivers', async () => {
    expect(await status(request('post', W, { name: 'x', url: 'http://plain.example.com', events: ['contract.signed'] }))).toBe(422)
    const created = (await request('post', W, { name: 'Ops', url: 'https://ops.example.com/hook', events: ['service.case.created'] })).data
    expect(created.secret).toMatch(/^whsec_/)
    expect(created.data.secret_last4).toBe(created.secret.slice(-4))
    const ping = (await request('post', `${W}/${created.data.id}/test`)).data.data
    expect(ping).toMatchObject({ event_name: 'service.ping', status: 'delivered', response_code: 200 })

    const bi = (await request('get', W)).data.data.find((entry) => entry.id === 'wh-bi')
    expect(bi).toMatchObject({ consecutive_failures: 3, failed_24h: 3 })
    const failed = (await request('get', `${W}/wh-bi/deliveries`, null, { status: 'failed' })).data.data
    expect(failed.every((entry) => entry.status !== 'delivered')).toBe(true)
    const { id, attempts, event_id: eventId } = failed[0]
    const redelivered = (await request('post', `/api/tenant/webhook-deliveries/${id}/redeliver`)).data.data
    expect(redelivered).toMatchObject({ status: 'delivered', attempts: attempts + 1, event_id: eventId })
    expect(await status(request('post', `/api/tenant/webhook-deliveries/${id}/redeliver`))).toBe(409)
  })
})
