import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildSubscriptions } from '../seeds/subscriptionsSeed'
import { getMockCurrentUser } from '../seeds/seedUtils'
import { matchesSearch, nowIso, paginate } from '../utils'
import { todayIso } from '../state/billingLedger'
import { addBillingPeriod, serializeSubscription, tickSubscription } from '../state/subscriptionLifecycle'
import './assetsHandlers'
import './catalogHandlers'

registerSeed('subscriptions', buildSubscriptions)

const S = serviceEndpoints.subscriptions
const METHODS = ['cash', 'bank_transfer', 'card', 'cheque', 'wallet']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const conflict = (code, message) => new MockHttpError(409, code, message)
const me = () => ({ id: getMockCurrentUser().id, name: getMockCurrentUser().name })

/** Runs the lifecycle job for one subscription and syncs its entitlements (source_type = subscription). */
export function syncSubscription(subscription, today = todayIso()) {
  const target = tickSubscription(subscription, today)
  getCollection('entitlements')
    .filter((entry) => entry.source_type === 'subscription' && entry.source_id === subscription.id)
    .forEach((entry) => Object.assign(entry, target))
  return subscription
}

function byId(id) {
  const subscription = getCollection('subscriptions').find((entry) => entry.id === id)
  if (!subscription) throw notFound('Subscription')
  return syncSubscription(subscription)
}
function guard(subscription, body, allowed, code = 'SUBSCRIPTION_INVALID_STATE') {
  if (body.version != null && Number(body.version) !== subscription.version) throw conflict('CONFLICT_VERSION', 'Changed')
  if (!allowed.includes(subscription.status)) throw conflict(code, 'Not allowed in this status')
}
function log(subscription, type, from, reason = null) {
  subscription.events.unshift({ type, from, to: subscription.status, occurred_at: nowIso(), reason, by: me() })
  subscription.version += 1
}
const detail = (subscription) => ({ data: serializeSubscription(syncSubscription(subscription), todayIso()) })
const listItem = (subscription) => {
  const { periods, events, ...rest } = serializeSubscription(subscription, todayIso())
  return rest
}

/** @type {import('../router').MockRoute[]} */
export const subscriptionsHandlers = [
  {
    method: 'GET',
    path: S,
    handler: ({ query }) => {
      const items = getCollection('subscriptions')
        .map((subscription) => syncSubscription(subscription))
        .filter((subscription) => !query.customer_id || subscription.customer_id === query.customer_id)
        .filter((subscription) => matchesSearch([subscription.subscription_number, subscription.customer?.name, subscription.customer?.phone, subscription.contract_number], query.search))
        .map(listItem)
        .filter((subscription) => !query.status || (query.status === 'renewal_due' ? subscription.renewal_due : subscription.status === query.status))
      return paginate(items, query)
    },
  },
  { method: 'GET', path: `${S}/:id`, handler: ({ params }) => detail(byId(params.id)) },
  {
    method: 'PATCH',
    path: `${S}/:id`,
    handler: ({ params, body = {} }) => {
      const subscription = byId(params.id)
      guard(subscription, body, ['trial', 'active', 'past_due'])
      if (body.renewal_type) {
        validation(['auto', 'manual', 'none'].includes(body.renewal_type) ? {} : { renewal_type: ['invalid'] })
        subscription.renewal_type = body.renewal_type
        log(subscription, 'renewal_changed', subscription.status, body.renewal_type)
      }
      if ('pending_change' in body) {
        const change = body.pending_change
        if (change) {
          const item = change.item_id ? getCollection('catalogItems').find((entry) => entry.id === change.item_id) : null
          validation(Number(change.price) > 0 ? {} : { price: ['required'] })
          // Upgrades / downgrades apply from the next period (spec §30); proration comes later.
          subscription.pending_change = { price: Number(change.price), item_id: item?.id || null, item_name: item?.name || null, effective_date: subscription.current_period_end || subscription.trial_ends_at }
        } else subscription.pending_change = null
        log(subscription, change ? 'change_scheduled' : 'change_withdrawn', subscription.status)
      }
      return detail(subscription)
    },
  },
  {
    method: 'POST',
    path: `${S}/:id/periods/:periodId/pay`,
    handler: ({ params, body = {} }) => {
      const subscription = byId(params.id)
      const period = subscription.periods.find((entry) => entry.id === params.periodId)
      if (!period) throw notFound('Period')
      if (period.paid_at) throw conflict('PERIOD_ALREADY_PAID', 'Already paid')
      validation(METHODS.includes(body.method) ? {} : { method: ['required'] })
      Object.assign(period, { paid_at: nowIso(), method: body.method, reference: body.reference || null, recorded_by: me() })
      subscription.version += 1
      return detail(subscription)
    },
  },
  {
    method: 'POST',
    path: `${S}/:id/:action`,
    handler: ({ params, body = {} }) => {
      const subscription = byId(params.id)
      const from = subscription.status
      switch (params.action) {
        case 'cancel': {
          guard(subscription, body, ['trial', 'active', 'past_due', 'suspended'])
          validation(String(body.reason || '').trim() ? {} : { reason: ['required'] })
          if (body.mode === 'period_end' && ['active', 'past_due'].includes(from)) {
            Object.assign(subscription, { cancel_at_period_end: true, cancel_reason: body.reason })
            log(subscription, 'cancel_scheduled', from, body.reason)
          } else {
            Object.assign(subscription, { status: 'cancelled', cancelled_at: nowIso(), cancel_reason: body.reason, cancel_at_period_end: false })
            log(subscription, 'cancelled', from, body.reason)
          }
          break
        }
        case 'suspend':
          guard(subscription, body, ['active', 'past_due'])
          validation(String(body.reason || '').trim() ? {} : { reason: ['required'] })
          Object.assign(subscription, { status: 'suspended', suspended_at: nowIso(), suspend_reason: 'manual', suspend_note: body.reason })
          log(subscription, 'suspended', from, body.reason)
          break
        case 'resume':
          if (subscription.cancel_at_period_end && ['active', 'past_due'].includes(from)) {
            Object.assign(subscription, { cancel_at_period_end: false, cancel_reason: null })
            log(subscription, 'cancel_withdrawn', from)
            break
          }
          guard(subscription, body, ['suspended'])
          if (subscription.suspend_reason === 'non_payment') throw conflict('SUBSCRIPTION_HAS_DUES', 'Pay the overdue periods to resume')
          Object.assign(subscription, { status: 'active', suspended_at: null, suspend_reason: null, suspend_note: null })
          log(subscription, 'resumed', from)
          break
        case 'renew': {
          // Manual renewal: a new period (+ due line). An expired subscription restarts from today.
          guard(subscription, body, ['active', 'past_due', 'expired'])
          if (subscription.renewal_type === 'auto' && from !== 'expired') throw conflict('SUBSCRIPTION_AUTO_RENEWS', 'Renews automatically')
          const start = from === 'expired' ? todayIso() : subscription.current_period_end
          const keepStart = from === 'expired' ? null : subscription.current_period_start
          if (from === 'expired') subscription.status = 'active'
          if (subscription.pending_change) {
            subscription.plan.price = subscription.pending_change.price
            subscription.pending_change = null
          }
          addBillingPeriod(subscription, start)
          // Paid-through moves forward; the running period keeps its start.
          if (keepStart) subscription.current_period_start = keepStart
          log(subscription, 'renewed', from)
          break
        }
        default:
          throw notFound('Action')
      }
      return detail(subscription)
    },
  },
]
