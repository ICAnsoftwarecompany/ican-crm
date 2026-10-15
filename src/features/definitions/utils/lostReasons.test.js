import { describe, expect, it } from 'vitest'
import { buildLostReasonPayload, nextSortOrder, normalizeLostReason, sortLostReasons, suggestReasonCode } from './lostReasons'

describe('lost reasons', () => {
  it('normalizes and sorts', () => {
    const rows = [{ id: 2, name: 'B', is_active: 0, sort_order: 2 }, { id: 1, name: 'A', code: 'A1', is_active: true, sort_order: 1 }].map(normalizeLostReason)
    expect(sortLostReasons(rows).map((row) => row.id)).toEqual([1, 2])
    expect(rows[0].active).toBe(false)
    expect(normalizeLostReason({ id: 3, name: 'C' }).active).toBe(true)
    expect(nextSortOrder(rows)).toBe(3)
  })

  it('builds the request body with a code', () => {
    expect(buildLostReasonPayload({ name: ' High cost ' }, { nextOrder: 4 })).toEqual({ name: 'High cost', code: 'HIGH_COST', description: 'High cost', is_active: true, sort_order: 4 })
    expect(buildLostReasonPayload({ name: 'غالي', code: 'X1', description: 'd', active: false, sortOrder: 2 })).toEqual({ name: 'غالي', code: 'X1', description: 'd', is_active: false, sort_order: 2 })
    expect(suggestReasonCode('السعر', 36 ** 5)).toMatch(/^R[0-9A-Z]+$/)
  })
})
