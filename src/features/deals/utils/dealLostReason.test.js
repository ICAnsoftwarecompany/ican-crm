import { describe, expect, it } from 'vitest'
import { buildDealLostPayload, lostEnumFor, lostReasonLabelKey } from './dealLostReason'

const reasons = [
  { id: 1, name: 'high cost', code: 'ADFCDD3' },
  { id: 2, name: 'Went to a competitor', code: 'COMPETITOR' },
  { id: 3, name: 'لا توجد ميزانية', code: 'no-budget' },
]

describe('deal lost reason', () => {
  it('sends a defined reason as lost_reason_id with a valid fixed key', () => {
    expect(buildDealLostPayload({ reasonId: '1', reasons })).toEqual({ reason: 'other', lost_reason_id: 1 })
    expect(buildDealLostPayload({ reasonId: '2', reasons })).toEqual({ reason: 'competitor', lost_reason_id: 2 })
    expect(buildDealLostPayload({ reasonId: '3', reasons })).toEqual({ reason: 'no_budget', lost_reason_id: 3 })
  })

  it('falls back to the fixed list without defined reasons', () => {
    expect(buildDealLostPayload({ reasonKey: 'price' })).toEqual({ reason: 'price' })
    expect(buildDealLostPayload({ reasonKey: 'weird' })).toEqual({ reason: 'other' })
    expect(lostEnumFor(null)).toBe('other')
  })

  it('labels a lost lead by its defined reason when known', () => {
    expect(lostReasonLabelKey({ lostReasonName: 'high cost', lostReason: 'other' })).toBe('high cost')
    expect(lostReasonLabelKey({ lostReasonId: 2, lostReason: 'competitor' }, new Map([['2', 'Went to a competitor']]))).toBe('Went to a competitor')
    expect(lostReasonLabelKey({ lostReason: 'price' })).toBe('price')
  })
})
