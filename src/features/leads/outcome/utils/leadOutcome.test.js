import { describe, expect, it } from 'vitest'
import { buildLostPayload, leadIdOf, linesFromInterests } from './leadOutcome'

describe('lead outcome helpers', () => {
  it('lost payload', () => {
    expect(buildLostPayload({ reasonId: '3', note: ' late ' })).toEqual({ lost_reason_id: 3, note: 'late' })
    expect(buildLostPayload({})).toEqual({ note: '' })
  })

  it('lead id', () => {
    expect(leadIdOf({ id: 1, lead: { id: 5 } })).toBe(5)
    expect(leadIdOf({ id: 1, lead_id: 7 })).toBe(7)
    expect(leadIdOf({ id: 1 })).toBe(null)
  })

  it('won lines from interests, catalog price first, lost interests skipped, one line per product', () => {
    const row = { lead: { interesteds: [
      { id: 1, product_id: 41, quantity: 2, product: { price: '10' } },
      { id: 2, product_id: 41 },
      { id: 3, product_id: 42, product: { price: '15.00' } },
      { id: 4, product_id: 43, is_lost: 1 },
    ] } }
    expect(linesFromInterests(row, [{ id: 41, price: 9000 }])).toEqual([
      { product_id: '41', quantity: 2, unit_price: 9000, discount: 0 },
      { product_id: '42', quantity: 1, unit_price: '15.00', discount: 0 },
    ])
  })
})
