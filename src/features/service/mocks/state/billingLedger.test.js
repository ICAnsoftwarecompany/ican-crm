import { describe, expect, it } from 'vitest'
import { allocatePayment, applyAllocations, bucketOf, collectionsView, payoffQuote, rescheduleLines, serializeSchedule } from './billingLedger'

const TODAY = '2026-06-15'
const plan = { grace_days: 5, late_fee: { type: 'percent', value: 1, cap_percent: 10 }, early_payoff: { allowed: true, discount_percent: 0 }, rounding: { to: 10 } }
const make = (lines, extra = {}) => ({
  id: 'ps-t',
  schedule_number: 'PS-T',
  status: 'active',
  currency: 'EGP',
  customer: { id: 'c1', name: 'A' },
  plan_snapshot: plan,
  payments: [],
  promises: [],
  lines: lines.map((line, seq) => ({ id: `l${seq}`, seq, line_type: 'installment', in_price: true, paid_amount: 0, fee_paid: 0, interest_share: 0, ...line })),
  ...extra,
})

describe('billing ledger', () => {
  it('derives line statuses, late fees after grace (capped) and totals', () => {
    const view = serializeSchedule(make([
      { due_date: '2026-04-01', amount: 1000, paid_amount: 1000 },
      { due_date: '2026-05-01', amount: 1000 }, // 45 days → 2 started months after grace → 20
      { due_date: '2026-06-12', amount: 1000 }, // 3 days, inside grace → no fee
      { due_date: TODAY, amount: 1000, paid_amount: 200 },
      { due_date: '2026-07-15', amount: 1000 },
    ]), TODAY)
    expect(view.lines.map((line) => line.status)).toEqual(['paid', 'overdue', 'overdue', 'partially_paid', 'upcoming'])
    expect(view.lines[1].late_fee_amount).toBe(20)
    expect(view.lines[2].late_fee_amount).toBe(0)
    expect(view.totals.outstanding).toBe(3820)
    expect(view.totals.overdue).toBe(2020)
    expect(view.next_due).toEqual({ date: TODAY, amount: 800 })
  })

  it('caps the late fee at cap_percent of the line', () => {
    const view = serializeSchedule(make([{ due_date: '2024-01-01', amount: 1000 }]), TODAY)
    expect(view.lines[0].late_fee_amount).toBe(100)
  })

  it('allocates oldest first, fee before principal, and refuses more than outstanding', () => {
    const schedule = make([{ due_date: '2026-05-01', amount: 1000 }, { due_date: '2026-07-01', amount: 1000 }])
    const { allocations } = allocatePayment(schedule, 1500, { today: TODAY })
    expect(allocations).toEqual([{ line_id: 'l0', seq: 0, fee: 20, principal: 1000 }, { line_id: 'l1', seq: 1, fee: 0, principal: 480 }])
    applyAllocations(schedule, allocations)
    const view = serializeSchedule(schedule, TODAY)
    expect(view.lines[0].status).toBe('paid')
    expect(view.lines[0].late_fee_amount).toBe(20)
    expect(view.totals.outstanding).toBe(520)
    expect(allocatePayment(schedule, 600, { today: TODAY }).error).toBe('exceeds')
    applyAllocations(schedule, allocations, -1)
    expect(serializeSchedule(schedule, TODAY).totals.outstanding).toBe(2020)
  })

  it('marks a schedule completed when nothing is left', () => {
    const view = serializeSchedule(make([{ due_date: '2026-05-01', amount: 1000, paid_amount: 1000 }]), TODAY)
    expect(view.status).toBe('completed')
  })

  it('quotes an early payoff with the unearned interest removed', () => {
    const schedule = make([
      { due_date: '2026-05-01', amount: 1100, interest_share: 100, paid_amount: 1100 },
      { due_date: '2026-07-01', amount: 1100, interest_share: 100 },
      { due_date: '2026-08-01', amount: 1100, interest_share: 100 },
    ])
    const quote = payoffQuote(schedule, TODAY)
    expect(quote).toMatchObject({ allowed: true, principal_remaining: 2200, interest_rebate: 200, late_fees: 0, total: 2000 })
  })

  it('reschedules the open in-price amount into new equal lines', () => {
    const schedule = make([
      { due_date: '2026-04-01', amount: 1000, paid_amount: 1000 },
      { due_date: '2026-05-01', amount: 1000 },
      { due_date: '2026-07-01', amount: 1000 },
      { due_date: '2027-01-01', amount: 500, in_price: false, line_type: 'maintenance' },
    ])
    const result = rescheduleLines(schedule, { count: 3, every: '1 month', first_due: '2026-07-01' }, TODAY)
    expect(result.carried_amount).toBe(2020)
    const installments = result.lines.filter((line) => line.in_price)
    expect(installments.map((line) => line.amount)).toEqual([670, 670, 680])
    expect(installments.map((line) => line.due_date)).toEqual(['2026-07-01', '2026-08-01', '2026-09-01'])
    expect(result.lines.find((line) => !line.in_price)).toMatchObject({ amount: 500, due_date: '2027-01-01' })
  })

  it('lets one payment keep only one promise, and only when paid by the promised date', () => {
    const view = serializeSchedule(make([{ due_date: '2026-05-01', amount: 2000 }], {
      promises: [
        { id: 'p1', amount: 1000, promised_date: '2026-06-01', created_at: '2026-05-20T00:00:00Z' },
        { id: 'p2', amount: 1000, promised_date: '2026-06-20', created_at: '2026-06-10T00:00:00Z' },
        { id: 'p3', amount: 1000, promised_date: '2026-06-30', created_at: '2026-06-11T00:00:00Z' },
      ],
      payments: [{ id: 'x', amount: 1000, status: 'confirmed', paid_at: '2026-06-12T10:00:00Z' }],
    }), TODAY)
    expect(view.promises.map((promise) => promise.status)).toEqual(['broken', 'kept', 'open'])
  })

  it('builds collections views with aging buckets and promise states', () => {
    const late = make([{ due_date: '2026-03-01', amount: 1000 }, { due_date: TODAY, amount: 500 }], {
      id: 'a',
      promises: [{ id: 'p1', amount: 1000, promised_date: '2026-06-10', created_at: '2026-06-01T00:00:00Z' }],
    })
    const onTime = make([{ due_date: '2026-06-18', amount: 300 }], { id: 'b' })
    const result = collectionsView([late, onTime], { view: 'overdue', today: TODAY })
    expect(result.summary.overdue.count).toBe(1)
    expect(result.summary.due_today).toEqual({ count: 1, amount: 500 })
    expect(result.summary.upcoming).toEqual({ count: 1, amount: 300 })
    expect(result.summary.promises.broken).toBe(1)
    expect(result.aging['90_plus']).toEqual({ count: 1, amount: 1040 })
    expect(result.data).toHaveLength(1)
    expect(result.data[0]).toMatchObject({ schedule_id: 'a', bucket: '90_plus', days_overdue: 106 })
    expect(bucketOf(30)).toBe('1_30')
  })
})
