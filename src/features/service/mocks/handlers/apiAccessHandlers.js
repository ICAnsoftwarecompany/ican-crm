import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { API_SCOPES, BOUND_SCOPES, WEBHOOK_EVENTS, buildApiClients, buildWebhookDeliveries, buildWebhookSubscriptions } from '../seeds/apiAccessSeed'
import { mockId } from '../seeds/seedUtils'
import { nowIso, paginate } from '../utils'
import { findOrAdoptCustomer } from './casesHandlers'

registerSeed('apiClients', buildApiClients)
registerSeed('webhookSubscriptions', buildWebhookSubscriptions)
registerSeed('webhookDeliveries', buildWebhookDeliveries)

const C = serviceEndpoints.apiClients
const W = serviceEndpoints.webhookSubscriptions
const D = serviceEndpoints.webhookDeliveries
const MAX_ATTEMPTS = 6
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
const randomToken = (length) => Array.from(globalThis.crypto.getRandomValues(new Uint32Array(length)), (n) => ALPHABET[n % ALPHABET.length]).join('')
const IP = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}(\/(3[0-2]|[12]?\d))?$/
const find = (collection, id, label) => {
  const item = getCollection(collection).find((entry) => entry.id === id)
  if (!item) throw notFound(label)
  return item
}

/** Issues a key: the clear value is returned once; only prefix + last 4 are stored (server: a hash). */
function issueKey(client) {
  const key = `ick_live_${randomToken(32)}`
  Object.assign(client, { key_prefix: key.slice(0, 13), key_last4: key.slice(-4), key_rotated_at: nowIso() })
  return key
}

function validateClient(body, existing) {
  const merged = { ...existing, ...body }
  const scopes = merged.scopes || []
  const bound = merged.bound_customer_id ? findOrAdoptCustomer(merged.bound_customer_id) : null
  const rate = Number(merged.rate_limit)
  validation({
    ...(!String(merged.name || '').trim() && { name: ['required'] }),
    ...((!scopes.length || scopes.some((scope) => !API_SCOPES.includes(scope))) && { scopes: ['required'] }),
    ...(bound && scopes.some((scope) => !BOUND_SCOPES.includes(scope)) && { scopes: ['not_allowed_for_bound'] }),
    ...(merged.bound_customer_id && !bound && { bound_customer_id: ['required'] }),
    ...(!(rate >= 10 && rate <= 10000) && { rate_limit: ['invalid'] }),
    ...((merged.ip_allowlist || []).some((entry) => !IP.test(entry)) && { ip_allowlist: ['invalid'] }),
  })
  return bound ? { id: bound.id, name: bound.name } : null
}
const pickClient = (body) => Object.fromEntries(['name', 'scopes', 'bound_customer_id', 'rate_limit', 'ip_allowlist', 'status'].filter((key) => key in body).map((key) => [key, body[key]]))

function validateSubscription(body) {
  let url = null
  try {
    url = new URL(body.url)
  } catch {
    url = null
  }
  validation({
    ...(!String(body.name || '').trim() && { name: ['required'] }),
    ...(!(url && url.protocol === 'https:') && { url: ['https_required'] }),
    ...((!(body.events || []).length || body.events.some((event) => !WEBHOOK_EVENTS.includes(event))) && { events: ['required'] }),
    ...(body.api_client_id && !getCollection('apiClients').some((client) => client.id === body.api_client_id) && { api_client_id: ['invalid'] }),
  })
}
const pickSubscription = (body) => Object.fromEntries(['name', 'url', 'events', 'api_client_id', 'status'].filter((key) => key in body).map((key) => [key, body[key]]))

function serializeSubscription(subscription) {
  const deliveries = getCollection('webhookDeliveries').filter((entry) => entry.subscription_id === subscription.id)
  const recent = deliveries.filter((entry) => Date.parse(entry.created_at) > Date.now() - 24 * 3600 * 1000)
  const client = getCollection('apiClients').find((entry) => entry.id === subscription.api_client_id)
  return { ...subscription, api_client: client ? { id: client.id, name: client.name } : null, deliveries_24h: recent.length, failed_24h: recent.filter((entry) => entry.status !== 'delivered').length, last_delivery_at: deliveries.map((entry) => entry.last_attempt_at).sort().at(-1) || null }
}

/** Mock delivery: example.org endpoints keep failing (to show retries); anything else answers 200. */
function deliver(subscription, request, previous = null) {
  const failing = subscription.url.includes('example.org') && !previous
  const delivery = previous || { id: mockId('wd'), subscription_id: subscription.id, event_id: request.event_id, event_name: request.event_name, attempts: 0, created_at: nowIso(), request }
  Object.assign(delivery, { attempts: delivery.attempts + 1, last_attempt_at: nowIso(), status: failing ? 'retrying' : 'delivered', response_code: failing ? 503 : 200, duration_ms: failing ? 2400 : 140, error: failing ? 'Service Unavailable' : null, next_retry_at: failing ? new Date(Date.now() + 60 * 1000 * 2 ** delivery.attempts).toISOString() : null })
  subscription.consecutive_failures = failing ? (subscription.consecutive_failures || 0) + 1 : 0
  if (!previous) getCollection('webhookDeliveries').unshift(delivery)
  return delivery
}

const clientHandlers = [
  { method: 'GET', path: `${C}/catalog`, handler: () => ({ data: { scopes: API_SCOPES, bound_scopes: BOUND_SCOPES, events: WEBHOOK_EVENTS, max_attempts: MAX_ATTEMPTS, signature_header: 'X-ICAN-Signature' } }) },
  { method: 'GET', path: C, handler: () => ({ data: getCollection('apiClients') }) },
  {
    method: 'POST',
    path: C,
    handler: ({ body = {} }) => {
      const payload = { rate_limit: 120, ip_allowlist: [], status: 'active', ...pickClient(body) }
      const bound = validateClient(payload, {})
      const client = { ...payload, id: mockId('ac'), bound_customer_id: bound?.id || null, bound_customer: bound, last_used_at: null, requests_24h: 0, created_at: nowIso() }
      const key = issueKey(client)
      getCollection('apiClients').unshift(client)
      return { status: 201, body: { data: client, key } }
    },
  },
  {
    method: 'PATCH',
    path: `${C}/:id`,
    handler: ({ params, body = {} }) => {
      const client = find('apiClients', params.id, 'API client')
      const patch = pickClient(body)
      const bound = validateClient(patch, client)
      Object.assign(client, patch, { bound_customer_id: bound?.id || null, bound_customer: bound, updated_at: nowIso() })
      return { data: client }
    },
  },
  {
    method: 'POST',
    path: `${C}/:id/rotate`,
    handler: ({ params }) => {
      const client = find('apiClients', params.id, 'API client')
      if (client.status !== 'active') throw new MockHttpError(409, 'API_CLIENT_DISABLED', 'Enable the client first')
      return { data: client, key: issueKey(client) }
    },
  },
  {
    method: 'DELETE',
    path: `${C}/:id`,
    handler: ({ params }) => {
      const list = getCollection('apiClients')
      const index = list.findIndex((entry) => entry.id === params.id)
      if (index < 0) throw notFound('API client')
      if (getCollection('webhookSubscriptions').some((entry) => entry.api_client_id === params.id)) throw new MockHttpError(409, 'API_CLIENT_IN_USE', 'A webhook uses this client')
      list.splice(index, 1)
      return { status: 204, body: null }
    },
  },
]

const webhookHandlers = [
  { method: 'GET', path: W, handler: () => ({ data: getCollection('webhookSubscriptions').map(serializeSubscription) }) },
  {
    method: 'POST',
    path: W,
    handler: ({ body = {} }) => {
      const payload = { status: 'active', api_client_id: null, ...pickSubscription(body) }
      validateSubscription(payload)
      const secret = `whsec_${randomToken(32)}`
      const subscription = { ...payload, id: mockId('wh'), secret_last4: secret.slice(-4), consecutive_failures: 0, created_at: nowIso() }
      getCollection('webhookSubscriptions').unshift(subscription)
      return { status: 201, body: { data: serializeSubscription(subscription), secret } }
    },
  },
  {
    method: 'PATCH',
    path: `${W}/:id`,
    handler: ({ params, body = {} }) => {
      const subscription = find('webhookSubscriptions', params.id, 'Webhook')
      const patch = pickSubscription(body)
      validateSubscription({ ...subscription, ...patch })
      Object.assign(subscription, patch, { updated_at: nowIso() }, patch.status === 'active' && { consecutive_failures: 0 })
      return { data: serializeSubscription(subscription) }
    },
  },
  {
    method: 'DELETE',
    path: `${W}/:id`,
    handler: ({ params }) => {
      const list = getCollection('webhookSubscriptions')
      const index = list.findIndex((entry) => entry.id === params.id)
      if (index < 0) throw notFound('Webhook')
      list.splice(index, 1)
      return { status: 204, body: null }
    },
  },
  {
    method: 'POST',
    path: `${W}/:id/rotate-secret`,
    handler: ({ params }) => {
      const subscription = find('webhookSubscriptions', params.id, 'Webhook')
      const secret = `whsec_${randomToken(32)}`
      subscription.secret_last4 = secret.slice(-4)
      return { data: serializeSubscription(subscription), secret }
    },
  },
  {
    method: 'POST',
    path: `${W}/:id/test`,
    handler: ({ params }) => {
      const subscription = find('webhookSubscriptions', params.id, 'Webhook')
      const id = mockId('evt')
      const delivery = deliver(subscription, { event_id: id, event_name: 'service.ping', event_version: 1, aggregate_type: 'tenant', aggregate_id: 'demo', tenant_id: 'demo', actor: { type: 'user', id: 'me' }, payload: { message: 'ping' }, occurred_at: nowIso(), correlation_id: id })
      return { data: delivery }
    },
  },
  {
    method: 'GET',
    path: `${W}/:id/deliveries`,
    handler: ({ params, query }) => {
      find('webhookSubscriptions', params.id, 'Webhook')
      const items = getCollection('webhookDeliveries')
        .filter((entry) => entry.subscription_id === params.id)
        .filter((entry) => !query.status || (query.status === 'failed' ? entry.status !== 'delivered' : entry.status === query.status))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
      return paginate(items, { per_page: 50, ...query })
    },
  },
  {
    method: 'POST',
    path: `${D}/:id/redeliver`,
    handler: ({ params }) => {
      const delivery = find('webhookDeliveries', params.id, 'Delivery')
      const subscription = find('webhookSubscriptions', delivery.subscription_id, 'Webhook')
      if (delivery.status === 'delivered') throw new MockHttpError(409, 'DELIVERY_ALREADY_DELIVERED', 'Already delivered')
      // A manual redelivery is one more attempt with the same event id (receivers dedupe on it).
      return { data: deliver(subscription, delivery.request, delivery) }
    },
  },
]

/** @type {import('../router').MockRoute[]} */
export const apiAccessHandlers = [...clientHandlers, ...webhookHandlers]
