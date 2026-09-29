import { describe, expect, it } from 'vitest'
import { addPeriod, previewPlan, resolveDue } from './paymentPlanEngine'

/** Spec §29.4 plan without price adjustment (as in the §29.6 example). */
const EIGHT_YEARS = {
  components: [
    { type: 'down_payment', basis: 'percent', value: 10, due: 'on_contract' },
    { type: 'installments', basis: 'remaining', count: 32, every: '3 month', first_due: '+3 month' },
    { type: 'delivery', basis: 'percent', value: 5, due: 'on_delivery' },
    { type: 'maintenance', basis: 'percent', value: 8, due: '-12 month from delivery', outside_price: true },
  ],
  price_adjustment: { type: 'none' },
  interest: { type: 'none', value: 0 },
  rounding: { to: 100, remainder_on: 'last' },
  limits: { min_down_percent: 5, max_count: 40, max_discount_percent: 5 },
  reservation_fee: { amount: 50000, deducted_from: 'down_payment', refundable: false },
}

describe('payment plan preview engine (spec §29.6)', () => {
  const result = previewPlan(EIGHT_YEARS, { price: 3000000, contract_date: '2026-10-01', delivery_date: '2029-10-01' })
  const installments = result.lines.filter((line) => line.line_type === 'installment')

  it('reproduces the real-estate example amounts', () => {
    expect(result.final_price).toBe(3000000)
    const down = result.lines.find((line) => line.line_type === 'down')
    expect(down).toMatchObject({ amount: 300000, due_date: '2026-10-01', includes_reservation: 50000 })
    expect(result.lines.find((line) => line.line_type === 'delivery')).toMatchObject({ amount: 150000, due_date: '2029-10-01' })
    expect(result.lines.find((line) => line.line_type === 'maintenance')).toMatchObject({ amount: 240000, due_date: '2028-10-01', in_price: false })
    expect(installments).toHaveLength(32)
    expect(installments.slice(0, 31).every((line) => line.amount === 79700)).toBe(true)
    expect(installments[31].amount).toBe(79300)
    expect(result.totals).toMatchObject({ in_price: 3000000, outside_price: 240000, grand_total: 3240000 })
    expect(result.warnings).toEqual([])
  })

  it('dates installments every 3 months from +3 months and sorts by date', () => {
    expect(installments[0].due_date).toBe('2027-01-01')
    expect(installments[1].due_date).toBe('2027-04-01')
    // 32 quarterly installments from 2027-01-01 end 93 months later. (The spec table says 2034-07-01 — that
    // is 31 installments; see the F4 phase log.)
    expect(installments[31].due_date).toBe('2034-10-01')
    const dates = result.lines.map((line) => line.due_date)
    expect([...dates].sort()).toEqual(dates)
  })

  it('always balances lines inside the price with the final price (property check)', () => {
    for (let run = 0; run < 200; run += 1) {
      const price = 10000 + Math.floor(Math.random() * 9000000)
      const count = 1 + Math.floor(Math.random() * 60)
      const step = [1, 10, 100, 1000][run % 4]
      const plan = { ...EIGHT_YEARS, components: [{ type: 'down_payment', basis: 'percent', value: run % 20, due: 'on_contract' }, { type: 'installments', basis: 'remaining', count, every: '1 month' }], rounding: { to: step }, limits: {} }
      const preview = previewPlan(plan, { price, contract_date: '2026-01-31' })
      expect(Math.abs(preview.totals.in_price - preview.final_price)).toBeLessThan(0.02)
      expect(preview.warnings).not.toContain('total_mismatch')
    }
  })

  it('flags overrides outside the limits for approval', () => {
    const preview = previewPlan(EIGHT_YEARS, { price: 1000000, contract_date: '2026-10-01', delivery_date: '2029-10-01', overrides: { down_percent: 3, discount_percent: 7 } })
    expect(preview.requires_approval).toBe(true)
    expect(preview.warnings).toEqual(expect.arrayContaining(['down_below_minimum', 'discount_above_limit']))
    expect(preview.final_price).toBe(930000)
  })

  it('applies price adjustment and flat interest', () => {
    const plan = { components: [{ type: 'installments', basis: 'remaining', count: 10, every: '1 month' }], price_adjustment: { type: 'percent', value: 15 }, interest: { type: 'flat', value: 10 } }
    const preview = previewPlan(plan, { price: 100000, contract_date: '2026-10-01' })
    expect(preview.final_price).toBe(115000)
    expect(preview.totals.interest).toBeCloseTo(11500, 1)
    expect(preview.totals.in_price).toBeCloseTo(126500, 1)
  })

  it('clamps month ends and warns when the delivery date is missing', () => {
    expect(addPeriod('2027-01-31', 1, 'month')).toBe('2027-02-28')
    expect(addPeriod('2028-01-31', 1, 'month')).toBe('2028-02-29')
    expect(resolveDue('on_delivery', { contractDate: '2026-10-01' })).toEqual({ date: null, warning: 'delivery_date_required' })
  })
})
