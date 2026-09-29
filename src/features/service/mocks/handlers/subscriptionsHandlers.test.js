// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const S = '/api/tenant/subscriptions'
const get = async (id) => (await request('get', `${S}/${id}`)).data.data

describe('subscription mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('seeds every lifecycle state and rolls them to today', async () => {
    const list = (await request('get', S, null, { per_page: 50 })).data.data
    const byId = Object.fromEntries(list.map((entry) => [entry.id, entry]))
    expect(byId['sub-1'].status).toBe('active')
    expect(byId['sub-2'].status).toBe('past_due')
    expect(byId['sub-3'].status).toBe('suspended')
    expect(byId['sub-4'].cancel_at_period_end).toBe(true)
    expect(byId['sub-5'].renewal_due).toBe(true)
    expect(byId['sub-6'].status).toBe('expired')
    expect(byId['sub-7'].status).toBe('trial')
    expect((await request('get', S, null, { status: 'renewal_due' })).data.data.map((entry) => entry.id)).toContain('sub-5')
  })

  it('paying the overdue period reactivates a non-payment suspension', async () => {
    const suspended = await get('sub-3')
    await expect(request('post', `${S}/sub-3/resume`)).rejects.toMatchObject({ response: { status: 409 } })
    const overdue = suspended.periods.find((period) => period.status === 'overdue')
    const paid = (await request('post', `${S}/sub-3/periods/${overdue.id}/pay`, { method: 'cash' })).data.data
    expect(paid.status).toBe('active')
    expect(paid.events[0].type).toBe('payment_received')
  })

  it('cancels now or at period end, suspends/resumes manually and renews manual plans', async () => {
    const scheduled = (await request('post', `${S}/sub-1/cancel`, { mode: 'period_end', reason: 'moving' })).data.data
    expect(scheduled).toMatchObject({ status: 'active', cancel_at_period_end: true })
    expect((await request('post', `${S}/sub-1/resume`)).data.data.cancel_at_period_end).toBe(false)
    expect((await request('post', `${S}/sub-1/suspend`, { reason: 'audit' })).data.data.status).toBe('suspended')
    expect((await request('post', `${S}/sub-1/resume`)).data.data.status).toBe('active')
    await expect(request('post', `${S}/sub-1/cancel`, {})).rejects.toMatchObject({ response: { status: 422 } })
    expect((await request('post', `${S}/sub-1/cancel`, { mode: 'now', reason: 'x' })).data.data.status).toBe('cancelled')

    const before = await get('sub-5')
    const renewed = (await request('post', `${S}/sub-5/renew`)).data.data
    expect(renewed.periods).toHaveLength(before.periods.length + 1)
    expect(renewed.renewal_due).toBe(false)
    const restarted = (await request('post', `${S}/sub-6/renew`)).data.data
    expect(restarted.status).toBe('active')
    await expect(request('post', `${S}/sub-2/renew`)).rejects.toMatchObject({ response: { status: 409 } })
  })

  it('schedules a plan change for the next period', async () => {
    const changed = (await request('patch', `${S}/sub-2`, { pending_change: { price: 5000 } })).data.data
    expect(changed.pending_change).toMatchObject({ price: 5000, effective_date: changed.current_period_end })
  })

  it('creates a real subscription when a contract with a plan item is handed off', async () => {
    const C = '/api/tenant/contracts'
    const contract = (await request('post', C, { customer_id: 'cust-1', type_id: 'ctt-maintenance', items: [{ item_id: 's-amc', quantity: 1 }] })).data.data
    await request('post', `${C}/${contract.id}/send`)
    await request('post', `${C}/${contract.id}/sign`, { signer_type: 'customer', signer_name: 'A' })
    await request('post', `${C}/${contract.id}/sign`, { signer_type: 'company', signer_name: 'B' })
    const list = (await request('get', S, null, { search: contract.contract_number.slice(-3) })).data.data
    const created = list.find((entry) => entry.contract_id === contract.id)
    expect(created).toMatchObject({ status: 'active', item_id: 's-amc' })
  })
})
