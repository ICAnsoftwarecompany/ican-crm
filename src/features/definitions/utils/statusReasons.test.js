import { describe, expect, it } from 'vitest'
import { addReason, buildReasonsPayload, hasDuplicateReason, readStatusReasons, toReasonKey } from './statusReasons'

describe('status reasons', () => {
  it('builds stable unique keys', () => {
    expect(toReasonKey('High price')).toBe('high_price')
    expect(toReasonKey('High price', new Set(['high_price']))).toBe('high_price_2')
    expect(toReasonKey('السعر')).toBe('reason_2')
    expect(toReasonKey('السعر', new Set(['reason_2']))).toBe('reason_3')
  })

  it('reads, adds and serializes in order', () => {
    const rows = readStatusReasons({ reasons: [{ id: 2, key: 'b', label: 'B', order: 2, active: 0 }, { id: 1, key: 'a', label: 'A', order: 1 }] })
    expect(rows.map((row) => row.key)).toEqual(['a', 'b'])
    const next = addReason(rows, 'Competitor')
    expect(buildReasonsPayload(next)).toEqual([
      { id: 1, key: 'a', label: 'A', active: 1, order: 1 },
      { id: 2, key: 'b', label: 'B', active: 0, order: 2 },
      { key: 'competitor', label: 'Competitor', active: 1, order: 3 },
    ])
    expect(addReason(rows, '  ')).toBe(rows)
  })

  it('detects duplicate labels', () => {
    expect(hasDuplicateReason([{ label: 'Price' }, { label: ' price ' }])).toBe(true)
    expect(hasDuplicateReason([{ label: 'Price' }, { label: '' }, { label: 'Time' }])).toBe(false)
  })
})
