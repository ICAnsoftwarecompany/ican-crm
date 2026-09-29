// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })

const C = '/api/tenant/contracts'
const H = '/api/tenant/service/handoffs'

async function signedContract(items) {
  const created = (await request('post', C, { customer_id: 'cust-1', type_id: 'ctt-sales', items })).data.data
  let contract = (await request('post', `${C}/${created.id}/send`, { version: created.version })).data.data
  contract = (await request('post', `${C}/${contract.id}/sign`, { version: contract.version, signer_type: 'customer', signer_name: 'Customer' })).data.data
  expect(contract.status).toBe('partially_signed')
  return (await request('post', `${C}/${contract.id}/sign`, { version: contract.version, signer_type: 'company', signer_name: 'Agent' })).data.data
}

describe('contracts & handoffs mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('signing a B-model product creates asset + warranty + entitlement + work order through the handoff', async () => {
    const assetsBefore = (await request('get', '/api/tenant/service/assets')).data.meta.total
    const contract = await signedContract([{ item_id: 'p-ac-15', quantity: 1 }, { item_id: 's-install', quantity: 1 }])
    expect(contract.status).toBe('signed')
    const handoff = (await request('get', `${H}/${contract.handoff.id}`)).data.data
    expect(handoff.status).toBe('pending')
    expect(handoff.created_entities.map((entry) => entry.type).sort()).toEqual(['asset', 'warranty', 'work_order'])
    expect((await request('get', '/api/tenant/service/assets')).data.meta.total).toBe(assetsBefore + 1)
  })

  it('a line without fulfillment config puts the handoff in needs_review without failing the rest', async () => {
    const contract = await signedContract([{ item_id: 'p-ac-3', quantity: 1 }, { item_id: 'p-filter', quantity: 2 }])
    const handoff = (await request('get', `${H}/${contract.handoff.id}`)).data.data
    expect(handoff.status).toBe('needs_review')
    expect(handoff.errors[0].code).toBe('MISSING_FULFILLMENT_CONFIG')
    expect(handoff.created_entities.some((entry) => entry.type === 'asset')).toBe(true)
    await expect(request('post', `${H}/${handoff.id}/accept`, { version: handoff.version, cs_owner_id: 'agent-1' })).rejects.toMatchObject({
      response: { status: 409, data: { code: 'HANDOFF_HAS_ERRORS' } },
    })
    // Fix the catalog item, then reprocess only the failed line (idempotent: no duplicate asset).
    await request('patch', '/api/tenant/catalog/items/p-filter', { service_config: { fulfillment: { creates: 'order' } } })
    const reprocessed = (await request('post', `${H}/${handoff.id}/reprocess`, { version: handoff.version })).data.data
    expect(reprocessed.status).toBe('pending')
    expect(reprocessed.created_entities.filter((entry) => entry.type === 'asset')).toHaveLength(1)
    const accepted = (await request('post', `${H}/${handoff.id}/accept`, { version: reprocessed.version, cs_owner_id: 'agent-1' })).data.data
    expect(accepted.status).toBe('accepted')
  })

  it('locks signed contracts and applies amendments as a difference', async () => {
    const contract = await signedContract([{ item_id: 'p-ac-15', quantity: 1 }])
    await expect(request('patch', `${C}/${contract.id}`, { version: contract.version, items: [] })).rejects.toMatchObject({
      response: { status: 409, data: { code: 'CONTRACT_LOCKED' } },
    })
    const amended = (await request('post', `${C}/${contract.id}/amendments`, { version: contract.version, summary: 'Add unit', changes: { add_items: [{ item_id: 'p-ac-3', quantity: 1 }] } })).data.data
    const signed = (await request('post', `${C}/${contract.id}/amendments/${amended.amendments[0].id}/sign`)).data.data
    expect(signed.items).toHaveLength(2)
    const handoff = (await request('get', `${H}/${contract.handoff.id}`)).data.data
    expect(handoff.amendments_applied).toHaveLength(1)
    expect(handoff.created_entities.filter((entry) => entry.type === 'asset')).toHaveLength(2)
  })

  it('same code works for a record-backed template (tourism booking)', async () => {
    setActiveMockTemplate('tourism')
    const created = (await request('post', C, { customer_id: 'cust-2', type_id: 'ctt-booking', items: [{ item_id: 's-sharm5', quantity: 1 }] })).data.data
    let contract = (await request('post', `${C}/${created.id}/send`, { version: created.version })).data.data
    contract = (await request('post', `${C}/${contract.id}/sign`, { version: contract.version, signer_type: 'customer', signer_name: 'A' })).data.data
    contract = (await request('post', `${C}/${contract.id}/sign`, { version: contract.version, signer_type: 'company', signer_name: 'B' })).data.data
    const handoff = (await request('get', `${H}/${contract.handoff.id}`)).data.data
    expect(handoff.created_entities[0].type).toBe('booking')
  })

  it('lists handoffs with counts per status', async () => {
    const { data } = await request('get', H)
    expect(data.meta.counts.needs_review).toBeGreaterThan(0)
  })
})
