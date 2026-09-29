// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const P = '/api/tenant/billing/payment-plans'

describe('billing plan mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('returns the plans assigned to an item (nearest scope wins, exclusions hide)', async () => {
    const plans = (await request('get', P, null, { item_id: 'p-ac-15' })).data.data
    expect(plans.map((plan) => plan.id).sort()).toEqual(['pp-12m', 'pp-24m'])
    await request('post', '/api/tenant/billing/payment-plan-assignments', { scope_type: 'item', scope_id: 'p-ac-15', payment_plan_id: 'pp-24m', is_excluded: true })
    expect((await request('get', P, null, { item_id: 'p-ac-15' })).data.data.map((plan) => plan.id)).toEqual(['pp-12m'])
  })

  it('previews without saving and validates input', async () => {
    const preview = (await request('post', `${P}/pp-12m/preview`, { item_id: 'p-ac-15', contract_date: '2026-10-01' })).data.data
    expect(preview.final_price).toBe(18500)
    expect(preview.totals.in_price).toBe(18500)
    expect(preview.lines).toHaveLength(13)
    await expect(request('post', `${P}/pp-12m/preview`, { price: 0, contract_date: '2026-10-01' })).rejects.toMatchObject({ response: { status: 422 } })
  })

  it('versions plans on edit and refuses to delete assigned plans', async () => {
    const plan = (await request('get', `${P}/pp-12m`)).data.data
    const saved = (await request('patch', `${P}/pp-12m`, { ...plan, name: { ar: 'x', en: 'x' } })).data.data
    expect(saved.version).toBe(2)
    await expect(request('delete', `${P}/pp-12m`)).rejects.toMatchObject({ response: { status: 409 } })
  })
})
