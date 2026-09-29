import { buildCustomers } from './casesSeed'
import { buildCatalogItems, buildItemTypes } from './catalogSeed'
import { buildContractsState } from './contractsSeed'
import { addPeriod } from '../state/paymentPlanEngine'
import { addBillingPeriod, createSubscriptionRecord as base } from '../state/subscriptionLifecycle'
import { todayIso } from '../state/billingLedger'

/**
 * Subscriptions (spec §30): the ones the seeded handoffs created (same ids as `created_entities`) plus
 * standalone ones covering every lifecycle state. Stored "as of start"; the lifecycle job (run on read)
 * rolls them forward to today and writes the events.
 */
const SCENARIOS = ['active', 'past_due', 'suspended', 'cancel_at_period_end', 'renewal_due', 'expired', 'trial']

function recurrenceOf(item, itemTypes) {
  const type = itemTypes.find((entry) => entry.id === item.service_config.item_type_id)
  const config = type?.capabilities?.find((entry) => entry.code === 'recurrence')?.config || {}
  return { every: Number(config.every) || 1, unit: config.unit || 'month', auto_renew: config.auto_renew !== false, grace_days: config.grace_days ?? 7 }
}

/** Periods from `start` (paid) while they begin on/before `until`; the last one optionally unpaid. */
function fillPeriods(subscription, start, until, { lastUnpaid = false } = {}) {
  subscription.started_at = `${start}T00:00:00.000Z`
  subscription.events.push({ type: 'started', from: null, to: 'active', occurred_at: subscription.started_at, reason: null })
  let next = start
  do {
    const period = addBillingPeriod(subscription, next)
    if (period.seq > 0) subscription.events.unshift({ type: 'renewed', from: 'active', to: 'active', occurred_at: `${period.start}T00:00:00.000Z`, reason: null })
    period.paid_at = `${addPeriod(period.due_date, 1, 'day')}T10:00:00.000Z`
    period.method = 'card'
    next = period.end
  } while (next <= until && subscription.renewal_type === 'auto')
  if (lastUnpaid) Object.assign(subscription.periods[subscription.periods.length - 1], { paid_at: null, method: null })
}

export function buildSubscriptions(manifest) {
  const today = todayIso()
  const customers = buildCustomers(manifest)
  const items = buildCatalogItems(manifest)
  const itemTypes = buildItemTypes(manifest)
  const planItems = items.filter((item) => item.service_config.fulfillment?.creates === 'subscription')
  if (!planItems.length) return []
  const subscriptions = []
  const back = (recurrence, amount) => addPeriod(today, -amount * recurrence.every, recurrence.unit)

  // From the seeded contracts' handoffs (ids match handoff.created_entities).
  const { contracts, handoffs } = buildContractsState(manifest)
  handoffs.forEach((handoff) => {
    const contract = contracts.find((entry) => entry.id === handoff.contract_id)
    handoff.created_entities.filter((entity) => entity.type === 'subscription').forEach((entity) => {
      const line = contract.items.find((entry) => entry.id === entity.line_id)
      const item = items.find((entry) => entry.id === line.item_id)
      const recurrence = recurrenceOf(item, itemTypes)
      const subscription = base({ id: entity.id, number: `SUB-${contract.contract_number.slice(-3)}`, customer: contract.customer, item, recurrence, price: line.unit_price, contract })
      const start = contract.start_date.slice(0, 10)
      fillPeriods(subscription, start, today)
      if (contract.status === 'terminated') Object.assign(subscription, { cancel_at_period_end: true, cancel_reason: contract.terminated_reason?.ar || null })
      subscriptions.push(subscription)
    })
  })

  // Standalone, one per lifecycle state (sub-1..6 match the plan entitlements of the assets seed).
  SCENARIOS.forEach((scenario, index) => {
    const customer = customers[index]
    const item = planItems[index % planItems.length]
    const recurrence = recurrenceOf(item, itemTypes)
    const manual = scenario === 'renewal_due' || scenario === 'expired'
    const subscription = base({ id: `sub-${index + 1}`, number: `SUB-${String(1001 + index)}`, customer, item, recurrence, price: item.price, renewalType: manual ? 'manual' : 'auto' })
    const days = (value) => addPeriod(today, value, 'day')
    if (scenario === 'trial') {
      Object.assign(subscription, { status: 'trial', trial_ends_at: days(9), started_at: `${days(-5)}T00:00:00.000Z` })
      subscription.events.push({ type: 'trial_started', from: null, to: 'trial', occurred_at: subscription.started_at, reason: null })
    } else if (scenario === 'past_due') fillPeriods(subscription, addPeriod(days(-3), -3 * recurrence.every, recurrence.unit), today, { lastUnpaid: true })
    else if (scenario === 'suspended') fillPeriods(subscription, addPeriod(days(-20), -2 * recurrence.every, recurrence.unit), today, { lastUnpaid: true })
    else if (scenario === 'renewal_due') fillPeriods(subscription, addPeriod(days(12), -recurrence.every, recurrence.unit), today)
    else if (scenario === 'expired') fillPeriods(subscription, addPeriod(days(-10), -recurrence.every, recurrence.unit), today)
    else {
      fillPeriods(subscription, back(recurrence, 2), today)
      if (scenario === 'cancel_at_period_end') Object.assign(subscription, { cancel_at_period_end: true, cancel_reason: 'نقل النشاط لمدينة تانية' })
    }
    subscriptions.push(subscription)
  })
  return subscriptions
}
