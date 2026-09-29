import { describe, expect, it } from 'vitest'
import { normalizeAlert, normalizeAlertList } from './normalizeAlert'

describe('normalizeAlert', () => {
  it('normalizes a lead SLA alert and resolves an existing route', () => {
    expect(normalizeAlert({
      id: 170,
      type: 'classification_sla_breached',
      alertable_type: 'App\\Models\\Lead',
      alertable_id: 34,
      severity: 'critical',
      status: 'open',
      data: { lead_id: 34 },
    })).toMatchObject({ id: '170', entityType: 'lead', entityId: '34', severity: 'critical', status: 'open', target: '/lead/34' })
  })

  it('keeps unknown alert types renderable without inventing a route', () => {
    expect(normalizeAlert({ id: 1, type: 'future_alert', title: 'Future', status: 'open' })).toMatchObject({ title: 'Future', target: '', severity: 'info' })
  })

  it('keeps only open alerts, deduplicates and sorts by severity then date', () => {
    const result = normalizeAlertList({ data: [
      { id: 1, type: 'stale_lead', severity: 'warning', status: 'open', created_at: '2026-09-30T01:00:00Z' },
      { id: 2, type: 'classification_sla_breached', severity: 'critical', status: 'open', created_at: '2026-09-29T01:00:00Z' },
      { id: 3, type: 'stale_lead', status: 'acknowledged' },
      { id: 1, type: 'stale_lead', severity: 'warning', status: 'open', created_at: '2026-09-30T02:00:00Z' },
    ] })
    expect(result.map((alert) => alert.id)).toEqual(['2', '1'])
    expect(result[1].createdAt).toBe('2026-09-30T02:00:00Z')
  })
})
