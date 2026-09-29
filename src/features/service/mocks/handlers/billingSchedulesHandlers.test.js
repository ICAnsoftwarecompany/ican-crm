// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })
const S = '/api/tenant/billing/schedules'
const get = async (id) => (await request('get', `${S}/${id}`)).data.data

describe('billing schedule mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('seeds schedules for signed contracts with overdue and cancelled scenarios', async () => {
    const list = (await request('get', S, null, { per_page: 50 })).data.data
    expect(list.length).toBeGreaterThanOrEqual(5)
    expect(list.find((entry) => entry.id === 'ps-6').overdue_lines).toBe(2)
    expect(list.find((entry) => entry.id === 'ps-9').status).toBe('cancelled')
    const overdue = (await request('get', S, null, { status: 'overdue' })).data.data
    expect(overdue.every((entry) => entry.overdue_lines > 0)).toBe(true)
  })

  it('records a payment oldest-first, rejects overpayment and reverses without deleting', async () => {
    const before = await get('ps-6')
    const oldest = before.lines.find((line) => line.status === 'overdue')
    const paid = (await request('post', `${S}/ps-6/payments`, { amount: oldest.remaining + oldest.fee_outstanding, method: 'cash', version: before.version })).data.data
    expect(paid.lines.find((line) => line.id === oldest.id).status).toBe('paid')
    expect(paid.overdue_lines).toBe(1)
    await expect(request('post', `${S}/ps-6/payments`, { amount: paid.totals.outstanding + 1, method: 'cash' })).rejects.toMatchObject({ response: { status: 422 } })
    await expect(request('post', `${S}/ps-6/payments`, { amount: 10, method: 'cash', version: 1 })).rejects.toMatchObject({ response: { status: 409 } })

    const payment = paid.payments[0]
    await expect(request('post', `/api/tenant/billing/payments/${payment.id}/reverse`, {})).rejects.toMatchObject({ response: { status: 422 } })
    const reversed = (await request('post', `/api/tenant/billing/payments/${payment.id}/reverse`, { reason: 'bounced' })).data.data
    expect(reversed.payments[0]).toMatchObject({ amount: -payment.amount, reversal_of_id: payment.id })
    expect(reversed.payments.find((entry) => entry.id === payment.id).status).toBe('reversed')
    expect(reversed.overdue_lines).toBe(2)
  })

  it('waives a late fee with a reason', async () => {
    const schedule = await get('ps-6')
    const line = schedule.lines.find((entry) => entry.fee_outstanding > 0)
    const after = (await request('post', `/api/tenant/billing/lines/${line.id}/waive-fee`, { reason: 'goodwill' })).data.data
    expect(after.lines.find((entry) => entry.id === line.id).fee_outstanding).toBe(0)
    await expect(request('post', `/api/tenant/billing/lines/${line.id}/waive-fee`, { reason: 'again' })).rejects.toMatchObject({ response: { status: 409 } })
  })

  it('reschedules only after approval and keeps the old schedule', async () => {
    const schedule = await get('ps-6')
    const pending = (await request('post', `${S}/ps-6/reschedule`, { count: 4, first_due: '2030-01-01', reason: 'hardship' })).data.data
    expect(pending.pending_reschedule).toMatchObject({ status: 'pending_approval', carried_amount: schedule.totals.outstanding - pending.lines.filter((line) => !line.in_price).reduce((sum, line) => sum + line.remaining, 0) })
    await expect(request('post', `${S}/ps-6/reschedule`, { count: 2, first_due: '2030-01-01', reason: 'x' })).rejects.toMatchObject({ response: { status: 409 } })
    const next = (await request('post', `${S}/ps-6/reschedule/approve`, {})).data.data
    expect(next.replaces_schedule_id).toBe('ps-6')
    expect(next.totals.outstanding).toBeCloseTo(schedule.totals.outstanding, 2)
    expect((await get('ps-6')).status).toBe('rescheduled')
  })

  it('quotes a payoff, cancels with a reason and records promises', async () => {
    const quote = (await request('post', `${S}/ps-5/payoff-quote`)).data.data
    expect(quote.total).toBeGreaterThan(0)
    const promised = (await request('post', `${S}/ps-5/promises`, { amount: 500, promised_date: '2099-01-01' })).data.data
    expect(promised.promises[0]).toMatchObject({ amount: 500, status: 'open' })
    await expect(request('post', `${S}/ps-5/cancel`, {})).rejects.toMatchObject({ response: { status: 422 } })
    expect((await request('post', `${S}/ps-5/cancel`, { reason: 'refund' })).data.data.status).toBe('cancelled')
  })

  it('settles an early payoff for exactly the quote and completes the schedule', async () => {
    const quote = (await request('post', `${S}/ps-7/payoff-quote`)).data.data
    await expect(request('post', `${S}/ps-7/payments`, { amount: quote.total - 5, method: 'cash', payoff: true })).rejects.toMatchObject({ response: { status: 422 } })
    const settled = (await request('post', `${S}/ps-7/payments`, { amount: quote.total, method: 'bank_transfer', payoff: true })).data.data
    expect(settled.lines.filter((line) => line.in_price).every((line) => line.status === 'paid')).toBe(true)
    expect(settled.payments[0].amount).toBe(quote.total)
  })

  it('serves the collections workspace', async () => {
    const result = (await request('get', '/api/tenant/billing/collections', null, { view: 'overdue' })).data
    expect(result.summary.overdue.count).toBeGreaterThanOrEqual(2)
    expect(result.data[0].days_overdue).toBeGreaterThan(0)
    expect(Object.keys(result.aging)).toEqual(['1_30', '31_60', '61_90', '90_plus'])
  })

  it('creates a schedule when a contract with a plan is fully signed', async () => {
    const C = '/api/tenant/contracts'
    const contract = (await request('post', C, { customer_id: 'cust-1', type_id: 'ctt-sales', payment_plan_id: 'pp-12m', items: [{ item_id: 'p-ac-15', quantity: 1 }] })).data.data
    await request('post', `${C}/${contract.id}/send`)
    await request('post', `${C}/${contract.id}/sign`, { signer_type: 'customer', signer_name: 'A' })
    const signed = (await request('post', `${C}/${contract.id}/sign`, { signer_type: 'company', signer_name: 'B' })).data.data
    expect(signed.payment_schedule).toMatchObject({ status: 'active' })
    expect((await get(signed.payment_schedule.id)).lines).toHaveLength(13)
  })
})
