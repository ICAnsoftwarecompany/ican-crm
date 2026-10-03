import { describe, expect, it } from 'vitest'
import { buildDealLinkIndex, getActivityDealLink, getTaskDealLink } from './dealLinks'

const index = buildDealLinkIndex({
  dealId: 4,
  leadIndex: { leadIds: new Set(['100']), customerIds: new Set(['900']) },
  contracts: [{ id: 15 }],
})

describe('deal links', () => {
  it('classifies tasks by their taskable', () => {
    expect(getTaskDealLink({ taskable_type: 'App\\Models\\Deal', taskable_id: 4 }, index)).toBe('deal')
    expect(getTaskDealLink({ taskable_type: 'App\\\\Models\\\\Contract', taskable_id: '15' }, index)).toBe('contract')
    expect(getTaskDealLink({ taskable_type: 'App\\Models\\Lead', taskable_id: 100 }, index)).toBe('lead')
    expect(getTaskDealLink({ taskable_type: 'App\\Models\\Lead', taskable_id: 101 }, index)).toBeNull()
    expect(getTaskDealLink({ taskable_type: 'App\\Models\\Deal', taskable_id: 5 }, index)).toBeNull()
  })

  it('classifies activities as internal (deal) or customer (lead/customer of the deal)', () => {
    expect(getActivityDealLink({ raw: { taskable_type: 'App\\Models\\Deal', taskable_id: 4 } }, index)).toBe('internal')
    expect(getActivityDealLink({ raw: {}, relatedEntity: { type: 'lead', id: 100 } }, index)).toBe('customer')
    expect(getActivityDealLink({ raw: {}, relatedEntity: { type: 'customer', id: 900 } }, index)).toBe('customer')
    expect(getActivityDealLink({ raw: { lead_id: 7 }, relatedEntity: { type: 'lead', id: 7 } }, index)).toBeNull()
  })
})
