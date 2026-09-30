// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const call = (method, url, data, { token, params } = {}) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params, headers: token ? { Authorization: `Bearer ${token}` } : {} }, { latency: 0 })
const S = '/api/tenant/service'

async function portalToken() {
  const account = (await call('get', '/api/tenant/portal/accounts')).data.data[0]
  await call('post', '/api/portal/auth/otp', { target: account.phone })
  return (await call('post', '/api/portal/auth/verify', { target: account.phone, code: '123456' })).data.data.token
}

describe('AI agent, health and advanced analytics mocks', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('shipping')
    resetMockDb()
  })

  it('answers a portal customer from their own data and hands over on request with a case', async () => {
    const token = await portalToken()
    expect((await call('get', '/api/portal/settings')).data.data.ai_agent).toBe(true)
    let conversation = (await call('post', '/api/portal/assistant/messages', { message: 'where is my shipment?' }, { token })).data.data
    expect(conversation.messages.at(-1)).toMatchObject({ role: 'ai', tools: ['read_records'] })
    conversation = (await call('post', '/api/portal/assistant/messages', { message: 'I want to talk to a person', conversation_id: conversation.id }, { token })).data.data
    expect(conversation).toMatchObject({ status: 'handed_off', handoff_reason: 'customer_asked', case: { case_number: expect.stringMatching(/^CS-/) } })
    const list = (await call('get', `${S}/ai/agent/conversations`)).data
    expect(list.summary).toMatchObject({ total: 4, handed_off: 2 })
  })

  it('refuses when the agent is off, and test console never opens cases', async () => {
    const settings = (await call('get', `${S}/ai/settings`)).data.data
    const customer = (await call('get', `${S}/customers/lookup`, null, { params: { search: '' } })).data.data[0]
    const test = (await call('post', `${S}/ai/agent/test`, { customer_id: customer.id, message: 'I want a refund' })).data.data
    expect(test).toMatchObject({ status: 'handed_off', handoff_reason: 'sensitive_money', case: null })
    await call('put', `${S}/ai/settings`, { features: { ...settings.features, agent: false } })
    await expect(call('post', `${S}/ai/agent/test`, { customer_id: customer.id, message: 'hi' })).rejects.toMatchObject({ response: { status: 403 } })
  })

  it('scores customer health with factors and lists by band; advanced report has aging and workload', async () => {
    const list = (await call('get', `${S}/health`)).data
    expect(Object.values(list.meta.counts).reduce((a, b) => a + b, 0)).toBeGreaterThan(0)
    const one = (await call('get', `${S}/customers/${list.data[0].customer.id}/health`)).data.data
    expect(one).toMatchObject({ score: expect.any(Number), band: expect.stringMatching(/healthy|watch|at_risk/) })
    const report = (await call('get', `${S}/reports/advanced`, null, { params: { period: '30d' } })).data.data
    expect(report.aging.map((bucket) => bucket.key)).toEqual(['0_1', '1_3', '3_7', '7_plus'])
    expect(report.aging.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(report.backlog)
    expect(report.workload.length).toBeGreaterThan(0)
  })

  it('prorates a subscription change made today', async () => {
    const subscription = (await call('get', '/api/tenant/subscriptions', null, { params: { per_page: 50 } })).data.data.find((entry) => entry.status === 'active')
    const target = subscription.plan.price * 2
    const quote = (await call('post', `/api/tenant/subscriptions/${subscription.id}/change-preview`, { price: target })).data.data
    expect(quote.net).toBeCloseTo(quote.charge_new - quote.credit_unused, 2)
    const changed = (await call('patch', `/api/tenant/subscriptions/${subscription.id}`, { version: subscription.version, pending_change: { price: target, effective: 'now' } })).data.data
    expect(changed.plan.price).toBe(target)
    expect(changed.adjustments[0]).toMatchObject({ type: 'proration', net: quote.net })
  })
})
