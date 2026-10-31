import { describe, expect, it } from 'vitest'
import { leadActivityContext } from './leadActivityContext'
import { normalizeCustomerActivities } from '../../../pages/customers/components/customers-table/CustomerActivityTimeline/utils/normalizeCustomerActivities'

describe('lead activity context', () => {
  it('uses explicit buckets without duplicating data or inferring scope from dates', () => {
    const log = { id: 43, created_at: '2026-10-20', activities: [{ id: 43, type: 'note', title: 'Outside' }] }
    const result = leadActivityContext({
      data: [log], lead_activities: [log], linked_to_deal: true,
      deal: { deal_id: 14, deal_name: 'Tower', linked_at: '2026-10-19' },
      deal_activities: {
        lead_actions: [{ id: 43, action: 'note', title: 'Inside' }],
        deal_actions: [{ id: 283, action: 'deal-leads/change-stage', description: 'Stage changed', created_at: '2026-10-19', actor: { id: 1, name: 'admin' }, properties: { new_stage_id: 43 } }],
      },
    })
    const activities = normalizeCustomerActivities(result.logs)
    expect(result.linked).toBe(true)
    expect(activities).toHaveLength(3)
    expect(activities.find((item) => item.title === 'Outside').activityScope).toBe('lead')
    const audit = activities.find((item) => item.title === 'Stage changed')
    expect(audit).toMatchObject({ activityScope: 'deal', contextDeal: { deal_id: 14 }, userName: 'admin', data: { new_stage_id: 43 } })
    expect(new Set(activities.map((item) => item.id)).size).toBe(3)
  })

  it('preserves legacy logs without inventing linkage or scope', () => {
    const result = leadActivityContext({ data: [{ id: 1, title: 'Legacy' }] })
    expect(result.linked).toBe(null)
    expect(result.logs).toHaveLength(1)
    expect(result.logs[0].activityScope).toBe(null)
  })

  it('honors explicit unlinked and empty canonical logs', () => {
    const result = leadActivityContext({ linked_to_deal: false, data: [{ id: 1 }], lead_activities: [] })
    expect(result.linked).toBe(false)
    expect(result.logs).toEqual([])
  })
})
