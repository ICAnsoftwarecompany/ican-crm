import { expect, it } from 'vitest'
import { interestedDealLeads } from './productInterests'
it('matches explicit product IDs, not interest-row IDs, and deduplicates customers', () => {
  const leads = [
    { id: 1, lead: { interesteds: [{ id: 80, product_id: 4 }] } },
    { id: 2, interests: [{ id: 4, product_id: 5 }] },
    { id: 3 },
  ]
  expect(interestedDealLeads(leads, 4, [{ id: 1, items: [{ product_id: 4 }] }, { id: 3, items: [{ product: { id: 4 } }] }]).map((lead) => lead.id)).toEqual([1, 3])
})
it('does not treat every deal participant as interested', () => {
  expect(interestedDealLeads([{ id: 1 }, { id: 2 }], 4, [{ id: 1, items: [{ id: 4 }] }])).toEqual([])
})
