// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })

const S = '/api/tenant/service'

describe('assets & entitlements mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('lists assets with warranty status and returns detail with history and entitlements', async () => {
    const { data } = await request('get', `${S}/assets`, null, { per_page: 50 })
    expect(data.meta.total).toBe(12)
    const detail = (await request('get', `${S}/assets/${data.data[0].id}`)).data.data
    expect(detail.warranties.length).toBeGreaterThan(0)
    expect(detail.entitlements.length).toBeGreaterThan(0)
    expect(Array.isArray(detail.service_history)).toBe(true)
  })

  it('computes balance from the ledger and blocks consuming an exhausted entitlement', async () => {
    const exhausted = (await request('get', `${S}/entitlements/ent-v-1`)).data.data
    expect(exhausted.balance).toEqual({ quota: 4, used: 4, remaining: 0 })
    expect(exhausted.status).toBe('exhausted')
    await expect(request('post', `${S}/entitlements/ent-v-1/transactions`, { type: 'consume', quantity: 1, reason: 'Visit' })).rejects.toMatchObject({
      response: { status: 409, data: { code: 'ENTITLEMENT_NOT_AVAILABLE' } },
    })
    const restored = (await request('post', `${S}/entitlements/ent-v-1/transactions`, { type: 'restore', quantity: 1, reason: 'Visit cancelled' })).data.data
    expect(restored.balance.remaining).toBe(1)
  })

  it('checks coverage for a customer and case type', async () => {
    const asset = (await request('get', `${S}/assets/asset-1`)).data.data
    const covered = (await request('post', `${S}/entitlements/check`, { customer_id: asset.customer_id, case_type_id: 'ct-maintenance' })).data.data
    expect(['covered', 'exhausted', 'expired']).toContain(covered.result)
    const none = (await request('post', `${S}/entitlements/check`, { customer_id: 'nobody' })).data.data
    expect(none.result).toBe('not_covered')
  })

  it('transfers an asset with history and rejects duplicate serials', async () => {
    const moved = (await request('post', `${S}/assets/asset-2/transfer`, { to_customer_id: 'cust-9', reason: 'Sold' })).data.data
    expect(moved.customer_id).toBe('cust-9')
    expect(moved.transfers).toHaveLength(1)
    await expect(request('post', `${S}/assets`, { customer_id: 'cust-1', item_id: 'p-ac-15', serial_number: moved.serial_number })).rejects.toMatchObject({
      response: { status: 422, data: { errors: { serial_number: ['taken'] } } },
    })
  })

  it('gives subscription templates entitlements without assets', async () => {
    setActiveMockTemplate('shipping')
    expect((await request('get', `${S}/assets`)).data.meta.total).toBe(0)
    expect((await request('get', `${S}/entitlements`)).data.meta.total).toBeGreaterThan(0)
  })
})
