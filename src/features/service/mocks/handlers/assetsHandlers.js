import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildAssetsState } from '../seeds/assetsSeed'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { findStatus } from '../state/caseConfig'
import { matchesSearch, nowIso, paginate } from '../utils'
import { findOrAdoptCustomer } from './casesHandlers'
import './catalogHandlers'

const seeded = (key) => (manifest) => buildAssetsState(manifest)[key]
registerSeed('assets', seeded('assets'))
registerSeed('warranties', seeded('warranties'))
registerSeed('entitlements', seeded('entitlements'))
registerSeed('entitlementTransactions', seeded('transactions'))

const A = serviceEndpoints.assets
const E = serviceEndpoints.entitlements
const ASSET_STATUSES = ['active', 'in_repair', 'replaced', 'retired', 'transferred']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const byId = (collection, id, label) => {
  const found = getCollection(collection).find((entry) => entry.id === id)
  if (!found) throw notFound(label)
  return found
}

/** Ledger balance: quota − consume + restore ± adjust (quota null = unlimited). */
export function entitlementBalance(entitlement) {
  const ledger = getCollection('entitlementTransactions').filter((entry) => entry.entitlement_id === entitlement.id)
  const used = ledger.reduce((sum, entry) => {
    if (entry.type === 'consume') return sum + entry.quantity
    if (entry.type === 'restore') return sum - entry.quantity
    if (entry.type === 'adjust') return sum - entry.quantity
    return sum
  }, 0)
  return { quota: entitlement.quota, used, remaining: entitlement.quota == null ? null : Math.max(entitlement.quota - used, 0) }
}

export function entitlementState(entitlement, now = Date.now()) {
  if (entitlement.status === 'suspended') return 'suspended'
  if (entitlement.ends_at && new Date(entitlement.ends_at).getTime() < now) return 'expired'
  const balance = entitlementBalance(entitlement)
  if (balance.remaining === 0) return 'exhausted'
  return 'active'
}

function serializeEntitlement(entitlement) {
  const asset = getCollection('assets').find((entry) => entry.id === entitlement.asset_id)
  const customer = getCollection('customers').find((entry) => entry.id === entitlement.customer_id)
  return {
    ...entitlement,
    status: entitlementState(entitlement),
    balance: entitlementBalance(entitlement),
    asset: asset ? { id: asset.id, name: asset.name, serial_number: asset.serial_number } : null,
    customer: customer ? { id: customer.id, name: customer.name } : null,
  }
}

function serializeAsset(asset, { detail = false } = {}) {
  const warranties = getCollection('warranties').filter((entry) => entry.asset_id === asset.id)
  const active = warranties.find((entry) => entry.status === 'active' && new Date(entry.ends_at).getTime() > Date.now())
  const base = { ...asset, warranty: active ? { id: active.id, type: active.type, ends_at: active.ends_at } : null, warranty_status: active ? 'active' : warranties.length ? 'expired' : 'none' }
  if (!detail) return base
  const cases = getCollection('cases').filter((entry) => asset.linked_case_ids?.includes(entry.id))
  return {
    ...base,
    warranties,
    entitlements: getCollection('entitlements').filter((entry) => entry.asset_id === asset.id).map(serializeEntitlement),
    service_history: cases.map((entry) => {
      const status = findStatus(entry.status_id)
      return { source_type: 'case', id: entry.id, reference: entry.case_number, title: entry.subject, status: status ? { key: status.key, label: status.label, category: status.category } : null, occurred_at: entry.opened_at }
    }),
  }
}

/** POST /service/entitlements/check — covered | not_covered | expired | exhausted | suspended. */
function checkEntitlement({ customer_id: customerId, asset_id: assetId, case_type_id: caseTypeId }) {
  const candidates = getCollection('entitlements')
    .filter((entry) => String(entry.customer_id) === String(customerId))
    .filter((entry) => !assetId || !entry.asset_id || entry.asset_id === assetId)
    .filter((entry) => !caseTypeId || !entry.case_type_ids?.length || entry.case_type_ids.includes(caseTypeId))
  if (!candidates.length) return { result: 'not_covered', entitlement_id: null, remaining: null, sla_policy_id: null, reason: 'no_entitlement' }
  const states = candidates.map((entry) => ({ entry, state: entitlementState(entry) }))
  const usable = states.find(({ state }) => state === 'active')
  if (usable) {
    const balance = entitlementBalance(usable.entry)
    return { result: 'covered', entitlement_id: usable.entry.id, type: usable.entry.type, remaining: balance.remaining, sla_policy_id: usable.entry.sla_policy_id, reason: null }
  }
  const [first] = states
  return { result: first.state, entitlement_id: first.entry.id, type: first.entry.type, remaining: 0, sla_policy_id: null, reason: first.state }
}

/** @type {import('../router').MockRoute[]} */
export const assetsHandlers = [
  {
    method: 'GET',
    path: A,
    handler: ({ query }) => {
      const items = getCollection('assets')
        .filter((asset) => !query.status || asset.status === query.status)
        .filter((asset) => !query.customer_id || String(asset.customer_id) === String(query.customer_id))
        .filter((asset) => matchesSearch([asset.serial_number, asset.customer?.name, asset.name?.ar, asset.name?.en, asset.model_number], query.search))
      const page = paginate(items, query)
      return { data: page.data.map((asset) => serializeAsset(asset)), meta: page.meta }
    },
  },
  {
    method: 'POST',
    path: A,
    handler: ({ body = {} }) => {
      const customer = findOrAdoptCustomer(body.customer_id)
      const item = getCollection('catalogItems').find((entry) => entry.id === body.item_id)
      const duplicate = body.serial_number && getCollection('assets').some((entry) => entry.serial_number === body.serial_number)
      validation({
        ...(!customer && { customer_id: ['required'] }),
        ...(!item && { item_id: ['required'] }),
        ...(duplicate && { serial_number: ['taken'] }),
      })
      const asset = {
        id: mockId('asset'),
        customer_id: customer.id,
        customer: { id: customer.id, name: customer.name, phone: customer.phone },
        item_id: item.id,
        item_name: item.name,
        asset_type: item.service_config.item_type_id || 'asset',
        name: item.name,
        serial_number: body.serial_number || null,
        model_number: body.model_number || null,
        purchase_date: body.purchase_date || nowIso(),
        installation_date: body.installation_date || null,
        status: 'active',
        location: body.location || {},
        linked_case_ids: [],
        transfers: [],
        version: 1,
      }
      getCollection('assets').push(asset)
      return { status: 201, body: { data: serializeAsset(asset, { detail: true }) } }
    },
  },
  { method: 'GET', path: `${A}/:id`, handler: ({ params }) => ({ data: serializeAsset(byId('assets', params.id, 'Asset'), { detail: true }) }) },
  {
    method: 'PATCH',
    path: `${A}/:id`,
    handler: ({ params, body = {} }) => {
      const asset = byId('assets', params.id, 'Asset')
      if (body.version != null && Number(body.version) !== asset.version) throw new MockHttpError(409, 'CONFLICT_VERSION', 'Changed')
      validation({ ...(body.status && !ASSET_STATUSES.includes(body.status) && { status: ['invalid'] }) })
      ;['status', 'installation_date', 'location', 'model_number'].forEach((field) => {
        if (body[field] !== undefined) asset[field] = body[field]
      })
      asset.version += 1
      return { data: serializeAsset(asset, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: `${A}/:id/transfer`,
    handler: ({ params, body = {} }) => {
      const asset = byId('assets', params.id, 'Asset')
      const to = findOrAdoptCustomer(body.to_customer_id)
      validation({ ...(!to && { to_customer_id: ['required'] }), ...(to && String(to.id) === String(asset.customer_id) && { to_customer_id: ['invalid'] }) })
      asset.transfers.push({ from: asset.customer, to: { id: to.id, name: to.name }, reason: body.reason || null, at: nowIso(), by: getMockCurrentUser().name })
      Object.assign(asset, { customer_id: to.id, customer: { id: to.id, name: to.name, phone: to.phone } })
      // Entitlements follow the asset (warranty) — the server decides per type; the mock moves asset-bound ones.
      getCollection('entitlements').filter((entry) => entry.asset_id === asset.id).forEach((entry) => (entry.customer_id = to.id))
      asset.version += 1
      return { data: serializeAsset(asset, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: `${serviceEndpoints.warranties}/:id/void`,
    handler: ({ params, body = {} }) => {
      const warranty = byId('warranties', params.id, 'Warranty')
      validation({ ...(!String(body.reason || '').trim() && { reason: ['required'] }) })
      Object.assign(warranty, { status: 'void', void_reason: body.reason })
      getCollection('entitlements').filter((entry) => entry.warranty_id === warranty.id).forEach((entry) => (entry.status = 'suspended'))
      return { data: warranty }
    },
  },

  // Entitlements
  { method: 'POST', path: `${E}/check`, handler: ({ body = {} }) => ({ data: checkEntitlement(body) }) },
  {
    method: 'GET',
    path: E,
    handler: ({ query }) => {
      const items = getCollection('entitlements')
        .filter((entry) => !query.customer_id || String(entry.customer_id) === String(query.customer_id))
        .filter((entry) => !query.asset_id || entry.asset_id === query.asset_id)
        .map(serializeEntitlement)
        .filter((entry) => !query.status || entry.status === query.status)
        .filter((entry) => matchesSearch([entry.customer?.name, entry.asset?.serial_number], query.search))
      const page = paginate(items, query)
      return { data: page.data, meta: page.meta }
    },
  },
  {
    method: 'GET',
    path: `${E}/:id`,
    handler: ({ params }) => {
      const entitlement = byId('entitlements', params.id, 'Entitlement')
      const ledger = getCollection('entitlementTransactions')
        .filter((entry) => entry.entitlement_id === entitlement.id)
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      return { data: { ...serializeEntitlement(entitlement), transactions: ledger } }
    },
  },
  {
    method: 'POST',
    path: `${E}/:id/transactions`,
    handler: ({ params, body = {} }) => {
      const entitlement = byId('entitlements', params.id, 'Entitlement')
      const quantity = Number(body.quantity)
      validation({
        ...(!['consume', 'restore', 'adjust'].includes(body.type) && { type: ['required'] }),
        ...(!(quantity > 0) && body.type !== 'adjust' && { quantity: ['required'] }),
        ...(body.type === 'adjust' && !quantity && { quantity: ['required'] }),
        ...(!String(body.reason || '').trim() && { reason: ['required'] }),
      })
      const state = entitlementState(entitlement)
      if (body.type === 'consume' && state !== 'active') throw new MockHttpError(409, 'ENTITLEMENT_NOT_AVAILABLE', `Entitlement is ${state}`)
      const me = getMockCurrentUser()
      const entry = { id: mockId('tx'), entitlement_id: entitlement.id, type: body.type, quantity, source_type: 'manual', source_id: null, reason: body.reason, created_by: { id: me.id, name: me.name }, created_at: nowIso() }
      getCollection('entitlementTransactions').push(entry)
      return { status: 201, body: { data: { ...serializeEntitlement(entitlement), transactions: [entry] } } }
    },
  },
]
