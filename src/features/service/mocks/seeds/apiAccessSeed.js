import { buildCustomers } from './casesSeed'
import { hoursAgo } from './seedUtils'

/**
 * Public API clients and outbound webhooks (spec §16.4–16.5). Keys and secrets are never stored in clear: only a
 * prefix + last 4 characters are kept for display (the server keeps a hash).
 */
export const API_SCOPES = ['records.read', 'records.write', 'cases.read', 'cases.write', 'tracking.read', 'customers.read', 'billing.read', 'webhooks.manage']
/** Scopes a key bound to one customer may hold (it only ever sees that customer's data). */
export const BOUND_SCOPES = ['records.read', 'records.write', 'cases.read', 'cases.write', 'tracking.read']
export const WEBHOOK_EVENTS = [
  'service.case.created', 'service.case.status_changed', 'service.case.resolved',
  'service.record.created', 'service.record.status_changed', 'service.record.completed',
  'contract.signed', 'billing.payment.recorded', 'billing.line.overdue',
  'subscription.renewed', 'subscription.suspended',
  'delivery.delivered', 'delivery.failed',
  'portal.request.created', 'follow_up.outcome_recorded',
]

export function buildApiClients(manifest) {
  const merchant = buildCustomers(manifest)[1]
  return [
    { id: 'ac-erp', name: 'ERP sync', key_prefix: 'ick_live_7Hq2', key_last4: 'Xm9P', scopes: ['records.read', 'cases.read', 'customers.read', 'billing.read'], bound_customer_id: null, bound_customer: null, rate_limit: 600, ip_allowlist: ['41.33.12.0/24'], status: 'active', last_used_at: hoursAgo(0.3), created_at: hoursAgo(24 * 60), requests_24h: 1840 },
    { id: 'ac-merchant', name: `${merchant.name} integration`, key_prefix: 'ick_live_b41K', key_last4: 'q2Rs', scopes: ['records.read', 'records.write', 'tracking.read'], bound_customer_id: merchant.id, bound_customer: { id: merchant.id, name: merchant.name }, rate_limit: 120, ip_allowlist: [], status: 'active', last_used_at: hoursAgo(5), created_at: hoursAgo(24 * 20), requests_24h: 212 },
    { id: 'ac-old', name: 'Old website form', key_prefix: 'ick_live_Zp0a', key_last4: 'aa71', scopes: ['cases.write'], bound_customer_id: null, bound_customer: null, rate_limit: 60, ip_allowlist: [], status: 'disabled', last_used_at: hoursAgo(24 * 45), created_at: hoursAgo(24 * 300), requests_24h: 0 },
  ]
}

export function buildWebhookSubscriptions() {
  return [
    { id: 'wh-erp', name: 'ERP', url: 'https://erp.example.com/hooks/ican', events: ['contract.signed', 'billing.payment.recorded', 'subscription.renewed'], api_client_id: 'ac-erp', secret_last4: 'k8Df', status: 'active', consecutive_failures: 0, created_at: hoursAgo(24 * 60) },
    { id: 'wh-bi', name: 'BI warehouse', url: 'https://bi.example.org/ingest/ican-events', events: ['service.case.created', 'service.case.resolved', 'service.record.completed', 'follow_up.outcome_recorded'], api_client_id: null, secret_last4: 'P0wq', status: 'active', consecutive_failures: 3, created_at: hoursAgo(24 * 14) },
  ]
}

const sample = (event, n) => ({ event_id: `evt_${String(9100 + n)}`, event_name: event, event_version: 1, aggregate_type: event.split('.').at(-2), aggregate_id: `id-${n}`, tenant_id: 'demo', actor: { type: 'user', id: 'agent-1' }, payload: { id: `id-${n}` }, occurred_at: hoursAgo(n * 1.5), correlation_id: `cor_${n}` })

export function buildWebhookDeliveries() {
  const rows = []
  const add = (subscription, event, n, status, code, attempts, extra = {}) =>
    rows.push({ id: `wd-${subscription}-${n}`, subscription_id: subscription, event_id: `evt_${String(9100 + n)}`, event_name: event, status, response_code: code, attempts, duration_ms: code ? 120 + ((n * 37) % 400) : null, error: null, next_retry_at: null, created_at: hoursAgo(n * 1.5), last_attempt_at: hoursAgo(n * 1.5 - 0.01), request: sample(event, n), ...extra })
  ;['contract.signed', 'billing.payment.recorded', 'billing.payment.recorded', 'subscription.renewed', 'billing.payment.recorded', 'contract.signed'].forEach((event, index) => add('wh-erp', event, index + 1, 'delivered', 200, 1))
  add('wh-erp', 'billing.payment.recorded', 7, 'delivered', 200, 2)
  add('wh-bi', 'service.case.created', 1, 'retrying', 503, 3, { error: 'Service Unavailable', next_retry_at: hoursAgo(-0.5) })
  add('wh-bi', 'service.case.resolved', 2, 'failed', null, 6, { error: 'timeout', duration_ms: 10000 })
  add('wh-bi', 'follow_up.outcome_recorded', 3, 'failed', 500, 6, { error: 'Internal Server Error' })
  add('wh-bi', 'service.record.completed', 9, 'delivered', 204, 1)
  add('wh-bi', 'service.case.created', 12, 'delivered', 200, 1)
  return rows
}
