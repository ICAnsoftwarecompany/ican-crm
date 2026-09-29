// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const R = '/api/tenant/reservations'
const W = '/api/tenant/service/work-orders'
const nextMonday = () => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + ((8 - date.getUTCDay()) % 7 || 7) + 7)
  return date.toISOString().slice(0, 10)
}

describe('scheduling + work order mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('expires holds on read and never double-books a resource', async () => {
    const list = (await request('get', R)).data.data
    expect(list.find((entry) => entry.id === 'rsv-hold-2').status).toBe('expired')
    expect(list.find((entry) => entry.id === 'rsv-hold-1').status).toBe('hold')
    const day = nextMonday()
    const slots = (await request('get', '/api/tenant/scheduling/availability', null, { date: day, resource_type: 'technician', skill: 'installation', duration: 60 })).data.data
    expect(new Set(slots.map((slot) => slot.resource_id))).toEqual(new Set(['res-t1', 'res-t3']))
    const slot = slots[0]
    const booked = (await request('post', R, { resource_id: slot.resource_id, starts_at: slot.starts_at, ends_at: slot.ends_at, status: 'hold', hold_minutes: 30 })).data.data
    expect(booked.status).toBe('hold')
    await expect(request('post', R, { resource_id: slot.resource_id, starts_at: slot.starts_at, ends_at: slot.ends_at })).rejects.toMatchObject({ response: { status: 409, data: { code: 'RESERVATION_CONFLICT' } } })
    expect((await request('post', `${R}/${booked.id}/confirm`)).data.data.status).toBe('confirmed')
    const after = (await request('get', '/api/tenant/scheduling/availability', null, { date: day, resource_id: slot.resource_id, duration: 60 })).data.data
    expect(after.some((entry) => entry.starts_at === slot.starts_at)).toBe(false)
    expect((await request('delete', `${R}/${booked.id}`)).data.data.status).toBe('released')
  })

  it('runs a visit end to end and consumes the entitlement into the ledger', async () => {
    const created = (await request('post', W, { type: 'maintenance', asset_id: 'asset-4', entitlement_id: 'ent-v-4' })).data.data
    const slot = (await request('get', '/api/tenant/scheduling/availability', null, { date: nextMonday(), resource_id: 'res-t2', duration: 60 })).data.data[0]
    const scheduled = (await request('patch', `${W}/${created.id}`, { resource_id: 'res-t2', scheduled_start: slot.starts_at })).data.data
    expect(scheduled).toMatchObject({ status: 'scheduled', assigned_resource_id: 'res-t2' })
    const other = (await request('post', W, { type: 'repair', asset_id: 'asset-5' })).data.data
    await expect(request('patch', `${W}/${other.id}`, { resource_id: 'res-t2', scheduled_start: slot.starts_at })).rejects.toMatchObject({ response: { status: 409 } })

    await request('post', `${W}/${created.id}/on-the-way`)
    await request('post', `${W}/${created.id}/check-in`)
    await expect(request('post', `${W}/${created.id}/complete`, { completion_status: 'failed' })).rejects.toMatchObject({ response: { status: 422 } })
    const ledgerBefore = (await request('get', '/api/tenant/service/entitlements/ent-v-4')).data.data.transactions.length
    const done = (await request('post', `${W}/${created.id}/complete`, { completion_status: 'completed', work_notes: 'ok', signature_name: 'A' })).data.data
    expect(done.status).toBe('completed')
    expect(done.entitlement_transaction_id).toBeTruthy()
    const ledger = (await request('get', '/api/tenant/service/entitlements/ent-v-4')).data.data.transactions
    expect(ledger).toHaveLength(ledgerBefore + 1)
    expect(ledger[0]).toMatchObject({ type: 'consume', source_type: 'work_order', source_id: created.id })
  })

  it('reschedule-at-visit releases the slot and cancel needs a reason', async () => {
    const result = (await request('post', `${W}/wo-2/complete`, { completion_status: 'rescheduled', failure_reason: 'customer_absent' })).data.data
    expect(result).toMatchObject({ status: 'new', reservation_id: null })
    await expect(request('post', `${W}/wo-1/cancel`, {})).rejects.toMatchObject({ response: { status: 422 } })
    expect((await request('post', `${W}/wo-1/cancel`, { reason: 'duplicate' })).data.data.status).toBe('cancelled')
    expect((await request('get', R)).data.data.find((entry) => entry.id === 'rsv-1').status).toBe('released')
  })
})
