import { describe, expect, it } from 'vitest'
import { normalizeNotification, normalizeNotificationList } from './normalizeNotification'

describe('normalizeNotification', () => {
  it('normalizes a known deal notification and resolves an existing route', () => {
    const result = normalizeNotification({
      id: 2,
      type: 'deal_lead_added',
      data: { deal_id: 7, lead_id: 12, message: 'Lead added' },
      read_at: null,
      created_at: '2026-09-29T12:00:00Z',
    })
    expect(result).toMatchObject({ id: '2', category: 'sales', message: 'Lead added', target: '/deals/7', isRead: false })
  })

  it('uses the general fallback for unknown types', () => {
    const result = normalizeNotification({ id: 3, type: 'future_event', data: { message: 'Future event' } })
    expect(result.category).toBe('system')
    expect(result.titleKey).toBe('notifications.types.general')
  })

  it('maps backend icon, severity and alertable type into UI metadata', () => {
    const result = normalizeNotification({
      id: 4,
      type: 'alert.classification_sla_breached',
      alertable_type: 'App\\Models\\Lead',
      severity: 'critical',
      data: { icon: 'alert-triangle', message: 'SLA breached' },
    })
    expect(result).toMatchObject({
      iconName: 'alert-triangle',
      iconTone: 'critical',
      severity: 'critical',
      hasSeverity: true,
      area: 'leads',
      areaKey: 'notifications.areas.leads',
    })
  })

  it('deduplicates and sorts API response items', () => {
    const result = normalizeNotificationList({ data: [
      { id: 1, type: 'general', created_at: '2026-09-28T12:00:00Z' },
      { id: 1, type: 'general', created_at: '2026-09-29T12:00:00Z' },
      { id: 2, type: 'general', created_at: '2026-09-30T12:00:00Z' },
    ] })
    expect(result.map((item) => item.id)).toEqual(['2', '1'])
  })

  it('extracts items from a paginated data.data response', () => {
    const result = normalizeNotificationList({ data: { current_page: 1, data: [{ id: 9, type: 'task.shared' }] } })
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('task.shared')
  })
})
