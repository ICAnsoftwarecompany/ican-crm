import { describe, expect, it } from 'vitest'
import { addBillingPeriod, serializeSubscription, tickSubscription } from './subscriptionLifecycle'

const make = (extra = {}) => ({
  id: 'sub-t',
  status: 'active',
  plan: { every: 1, unit: 'month', price: 100, grace_days: 7 },
  renewal_type: 'auto',
  cancel_at_period_end: false,
  periods: [],
  events: [],
  ...extra,
})
const started = (start, extra) => {
  const subscription = make(extra)
  addBillingPeriod(subscription, start)
  subscription.periods[0].paid_at = `${start}T10:00:00Z`
  return subscription
}

describe('subscription lifecycle', () => {
  it('auto-renews into new due periods, then past_due, then suspended after grace', () => {
    const subscription = started('2026-01-10')
    tickSubscription(subscription, '2026-02-12')
    expect(subscription.status).toBe('past_due')
    expect(subscription.grace_until).toBe('2026-02-17')
    expect(subscription.current_period_end).toBe('2026-03-10')
    const ent = tickSubscription(subscription, '2026-02-20')
    expect(subscription.status).toBe('suspended')
    expect(ent.status).toBe('suspended')
    // paying the dues reactivates a non-payment suspension
    subscription.periods.forEach((period) => (period.paid_at = '2026-02-21T00:00:00Z'))
    tickSubscription(subscription, '2026-02-21')
    expect(subscription.status).toBe('active')
    expect(subscription.events.map((entry) => entry.type)).toEqual(['payment_received', 'suspended', 'past_due', 'renewed'])
  })

  it('is idempotent', () => {
    const subscription = started('2026-01-10')
    tickSubscription(subscription, '2026-05-01')
    const snapshot = JSON.stringify(subscription)
    tickSubscription(subscription, '2026-05-01')
    expect(JSON.stringify(subscription)).toBe(snapshot)
  })

  it('cancels at period end, expires manual renewals and ends trials', () => {
    const cancelling = started('2026-01-10', { cancel_at_period_end: true, cancel_reason: 'moving' })
    tickSubscription(cancelling, '2026-02-10')
    expect(cancelling.status).toBe('cancelled')
    expect(cancelling.periods).toHaveLength(1)

    const manual = started('2026-01-10', { renewal_type: 'manual' })
    expect(serializeSubscription(manual, '2026-01-20').renewal_due).toBe(true)
    tickSubscription(manual, '2026-02-11')
    expect(manual.status).toBe('expired')

    const trial = make({ status: 'trial', trial_ends_at: '2026-03-01' })
    tickSubscription(trial, '2026-02-01')
    expect(trial.status).toBe('trial')
    tickSubscription(trial, '2026-03-01')
    expect(trial.status).toBe('active')
    expect(serializeSubscription(trial, '2026-03-01')).toMatchObject({ amount_due: 100 })
  })

  it('applies a pending plan change from the next period', () => {
    const subscription = started('2026-01-10', { pending_change: { price: 150 } })
    subscription.periods[0].paid_at = '2026-01-10T00:00:00Z'
    tickSubscription(subscription, '2026-02-10')
    expect(subscription.periods.map((period) => period.amount)).toEqual([100, 150])
    expect(subscription.pending_change).toBeNull()
  })
})
