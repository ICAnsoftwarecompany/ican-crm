// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const D = '/api/tenant/service/deliveries'
const RM = '/api/tenant/billing/cod-remittances'

describe('deliveries + COD mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('shipping')
    resetMockDb()
  })

  it('dispatches, records failed attempts and fails after the third', async () => {
    const list = (await request('get', D, null, { status: 'unassigned' })).data
    expect(list.summary.unassigned).toBeGreaterThan(0)
    const target = list.data[0]
    await expect(request('post', `${D}/${target.record_id}/assign`, { courier_id: 'nope' })).rejects.toMatchObject({ response: { status: 422 } })
    expect((await request('post', `${D}/${target.record_id}/assign`, { courier_id: 'res-c1' })).data.data.status).toBe('assigned')
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await request('post', `${D}/${target.record_id}/out-for-delivery`)
      const result = (await request('post', `${D}/${target.record_id}/attempts`, { outcome: 'no_answer' })).data.data
      expect(result.status).toBe(attempt < 3 ? 'assigned' : 'failed')
    }
    const entries = (await request('get', `/api/tenant/service/records/${target.record_id}/entries`)).data.data
    expect(entries.filter((entry) => entry.entry_type === 'delivery_attempt').length).toBeGreaterThanOrEqual(3)
  })

  it('needs proof of delivery and the exact COD amount', async () => {
    const out = (await request('get', D, null, { status: 'out_for_delivery' })).data.data.find((entry) => entry.cod_amount > 0)
    const url = `${D}/${out.record_id}/attempts`
    await expect(request('post', url, { outcome: 'delivered', pod: { method: 'signature' }, cod_collected: out.cod_amount })).rejects.toMatchObject({ response: { status: 422 } })
    await expect(request('post', url, { outcome: 'delivered', pod: { method: 'otp', receiver_name: 'X', otp: '12' }, cod_collected: out.cod_amount })).rejects.toMatchObject({ response: { status: 422 } })
    await expect(request('post', url, { outcome: 'delivered', pod: { method: 'signature', receiver_name: 'X' }, cod_collected: out.cod_amount - 1 })).rejects.toMatchObject({ response: { status: 422 } })
    const done = (await request('post', url, { outcome: 'delivered', pod: { method: 'otp', receiver_name: 'X', otp: '4821' }, cod_collected: out.cod_amount })).data.data
    expect(done).toMatchObject({ status: 'delivered', cod_collected: out.cod_amount })
  })

  it('builds a remittance from unremitted COD, deducts fees, then pays it', async () => {
    const pending = (await request('get', `${RM}/pending`)).data.data
    expect(pending.length).toBeGreaterThan(0)
    const group = pending[0]
    const created = (await request('post', RM, { customer_id: group.customer.id })).data.data
    expect(created).toMatchObject({ status: 'draft', total_collected: group.total_collected, net_amount: group.total_collected - group.fees_deducted })
    expect((await request('get', `${RM}/pending`)).data.data.find((entry) => entry.customer.id === group.customer.id)).toBeUndefined()
    await expect(request('post', RM, { customer_id: group.customer.id })).rejects.toMatchObject({ response: { status: 409 } })
    expect((await request('post', `${RM}/${created.id}/pay`, { external_ref: 'TRX-1' })).data.data.status).toBe('paid')
    await expect(request('delete', `${RM}/${created.id}`)).rejects.toMatchObject({ response: { status: 409 } })
  })
})
