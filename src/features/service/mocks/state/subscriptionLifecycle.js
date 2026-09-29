/**
 * Mock of the server subscription lifecycle job (spec §30): trial → active → past_due → suspended →
 * cancelled / expired. Pure over a stored subscription; `today` injected for tests. The server runs this
 * as a scheduled job; the mock runs it on read. Returns the entitlement status the subscription implies.
 */
import { addPeriod } from './paymentPlanEngine'

export const SUBSCRIPTION_STATUSES = ['trial', 'active', 'past_due', 'suspended', 'cancelled', 'expired']
export const RENEWAL_WINDOW_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS)

/** A new subscription record (seed + handoff processor share it). */
export function createSubscriptionRecord({ id, number, customer, item, recurrence, price, contract, renewalType }) {
  return {
    id,
    subscription_number: number,
    customer_id: customer.id,
    customer: { id: customer.id, name: customer.name, phone: customer.phone },
    item_id: item.id,
    item_name: item.name,
    contract_id: contract?.id || null,
    contract_number: contract?.contract_number || null,
    plan: { every: recurrence.every, unit: recurrence.unit, price, currency: 'EGP', grace_days: recurrence.grace_days, suspend_entitlements: true },
    status: 'active',
    started_at: null,
    trial_ends_at: null,
    current_period_start: null,
    current_period_end: null,
    renewal_type: renewalType || (recurrence.auto_renew ? 'auto' : 'manual'),
    cancel_at_period_end: false,
    cancel_reason: null,
    grace_until: null,
    suspended_at: null,
    suspend_reason: null,
    cancelled_at: null,
    pending_change: null,
    periods: [],
    events: [],
    version: 1,
  }
}

export const periodEndOf = (start, plan) => addPeriod(start, Number(plan.every) || 1, plan.unit || 'month')

/** Adds a billing period (Billing Lite "due line per period" in `crm` payments mode). */
export function addBillingPeriod(subscription, start) {
  const end = periodEndOf(start, subscription.plan)
  const seq = subscription.periods.length
  subscription.periods.push({ id: `${subscription.id}-p${seq}`, seq, start, end, due_date: start, amount: subscription.plan.price, paid_at: null, method: null })
  Object.assign(subscription, { current_period_start: start, current_period_end: end })
  return subscription.periods[seq]
}

function event(subscription, type, from, to, occurredAt, reason = null) {
  subscription.events.unshift({ type, from, to, occurred_at: `${occurredAt}T00:00:00.000Z`, reason })
}

function move(subscription, to, date, type, reason) {
  const from = subscription.status
  subscription.status = to
  event(subscription, type, from, to, date, reason)
}

export const overduePeriods = (subscription, today) => subscription.periods.filter((period) => !period.paid_at && period.due_date < today)

/**
 * Advances the subscription to `today`. Idempotent: running it twice changes nothing.
 * Order per step: trial end → period end (renew / cancel / expire) → dues (past_due → suspended, or back to active).
 */
export function tickSubscription(subscription, today) {
  for (let guard = 0; guard < 400; guard += 1) {
    const { status, plan } = subscription
    if (status === 'trial' && subscription.trial_ends_at && subscription.trial_ends_at <= today) {
      move(subscription, 'active', subscription.trial_ends_at, 'trial_ended')
      addBillingPeriod(subscription, subscription.trial_ends_at)
      continue
    }
    if (['active', 'past_due'].includes(status) && subscription.current_period_end && subscription.current_period_end <= today) {
      const end = subscription.current_period_end
      if (subscription.cancel_at_period_end) {
        subscription.cancelled_at = `${end}T00:00:00.000Z`
        move(subscription, 'cancelled', end, 'cancelled', subscription.cancel_reason)
      } else if (subscription.renewal_type === 'auto') {
        if (subscription.pending_change) {
          subscription.plan.price = subscription.pending_change.price
          if (subscription.pending_change.item_id) Object.assign(subscription, { item_id: subscription.pending_change.item_id, item_name: subscription.pending_change.item_name })
          event(subscription, 'change_applied', status, status, end)
          subscription.pending_change = null
        }
        addBillingPeriod(subscription, end)
        event(subscription, 'renewed', status, status, end)
      } else {
        move(subscription, 'expired', end, 'expired')
      }
      continue
    }
    const overdue = overduePeriods(subscription, today)
    if (status === 'active' && overdue.length) {
      subscription.grace_until = addPeriod(overdue[0].due_date, Number(plan.grace_days) || 0, 'day')
      move(subscription, 'past_due', addPeriod(overdue[0].due_date, 1, 'day'), 'past_due')
      continue
    }
    if (status === 'past_due' && overdue.length && subscription.grace_until < today) {
      const on = addPeriod(subscription.grace_until, 1, 'day')
      Object.assign(subscription, { suspended_at: `${on}T00:00:00.000Z`, suspend_reason: 'non_payment' })
      move(subscription, 'suspended', on, 'suspended', 'non_payment')
      continue
    }
    if ((status === 'past_due' || (status === 'suspended' && subscription.suspend_reason === 'non_payment')) && !overdue.length) {
      Object.assign(subscription, { grace_until: null, suspended_at: null, suspend_reason: null })
      move(subscription, 'active', today, 'payment_received')
      continue
    }
    break
  }
  return entitlementStatusFor(subscription)
}

/** What linked entitlements should be (spec §30: suspension suspends them, expiry/cancel ends them). */
export function entitlementStatusFor(subscription) {
  if (subscription.status === 'suspended' && subscription.plan.suspend_entitlements !== false) return { status: 'suspended' }
  if (['cancelled', 'expired'].includes(subscription.status)) return { status: 'active', ends_at: subscription.cancelled_at || `${subscription.current_period_end}T00:00:00.000Z` }
  return { status: 'active', ends_at: subscription.current_period_end ? `${subscription.current_period_end}T00:00:00.000Z` : null }
}

/** Read model: period statuses, amounts due, renewal window. */
export function serializeSubscription(subscription, today) {
  const periods = subscription.periods.map((period) => ({
    ...period,
    status: period.paid_at ? 'paid' : period.due_date < today ? 'overdue' : period.due_date === today ? 'due' : 'upcoming',
  }))
  const daysToEnd = subscription.current_period_end ? daysBetween(today, subscription.current_period_end) : null
  const live = ['trial', 'active', 'past_due'].includes(subscription.status)
  return {
    ...subscription,
    periods: [...periods].reverse(),
    amount_due: periods.filter((period) => period.status === 'overdue' || period.status === 'due').reduce((sum, period) => sum + period.amount, 0),
    days_to_period_end: daysToEnd,
    renewal_due: live && subscription.renewal_type !== 'auto' && !subscription.cancel_at_period_end && daysToEnd != null && daysToEnd <= RENEWAL_WINDOW_DAYS,
  }
}
