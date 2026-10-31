import { describe, expect, it } from 'vitest'
import { customerDealTimeline } from './customerDealTimeline'

describe('customer deal timeline', () => {
  it('uses the transaction date, not the deal container creation or latest update', () => {
    const [event] = customerDealTimeline([{ id: 84, deal_id: 5, status: 'won', won_at: '2026-10-17T13:00:00Z', updated_at: '2026-10-19T00:00:00Z', deal: { name: 'Sale', created_at: '2026-01-01' } }], 11)
    expect(event).toMatchObject({ id: 'customer-deal-84', customerId: 11, date: '2026-10-17T13:00:00Z', type: 'deal_won', title: 'Sale' })
    expect(event.customerDeal.deal_id).toBe(5)
  })
  it('uses loss dates and falls back to added or created dates without inventing a date', () => {
    const events = customerDealTimeline([{ id: 1, status: 'lost', lost_at: '2026-10-15' }, { id: 2, added_at: '2026-10-14' }, { id: 3, created_at: '2026-10-13' }, { id: 4 }], 11)
    expect(events.map((event) => event.date)).toEqual(['2026-10-15', '2026-10-14', '2026-10-13', null])
    expect(events[0].type).toBe('deal_lost')
  })
  it('has no events when the customer has no deals', () => {
    expect(customerDealTimeline()).toEqual([])
  })
})
