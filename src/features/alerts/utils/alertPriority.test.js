import { describe, expect, it } from 'vitest'
import { getAlertPriority, sortAlerts } from './alertPriority'

describe('alertPriority', () => {
  it('uses semantic priority and a safe unknown fallback', () => {
    expect(getAlertPriority('critical')).toBeGreaterThan(getAlertPriority('warning'))
    expect(getAlertPriority('future')).toBeGreaterThan(0)
  })

  it('sorts equal severities newest first', () => {
    const sorted = sortAlerts([
      { id: 'old', severity: 'warning', createdAt: '2026-09-29T00:00:00Z' },
      { id: 'new', severity: 'warning', createdAt: '2026-09-30T00:00:00Z' },
    ])
    expect(sorted.map((alert) => alert.id)).toEqual(['new', 'old'])
  })
})
