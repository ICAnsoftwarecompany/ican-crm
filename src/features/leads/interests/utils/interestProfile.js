/**
 * What a lead interest asks for, read from the product's kind and its item type's capabilities (2026-10-15).
 * Pure, tested. Same rule as the catalog: the code reads capabilities, never the type's name or service model.
 *
 * Input: a normalized catalog product (`features/products` `normalizeCatalogProduct`) and its normalized item type.
 * The product's `capabilityValues` (`{ code: config }`) override the type's config.
 */

export const INTEREST_KINDS = ['product', 'service', 'plan', 'bundle']

const codesOf = (itemType) => (itemType?.capabilities || []).map((capability) => capability.code)
const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/** The product's item type with its capabilities: the nested one when it has them, else the one from the types list. */
export function resolveItemType(product, itemTypes = []) {
  if (!product) return null
  const nested = product.itemType || null
  if (nested?.capabilities?.length) return nested
  const listed = itemTypes.find((itemType) => String(itemType.id) === String(product.itemTypeId)) || null
  return listed || nested
}

/** Capability config: the item type's, overridden by the product's `capability_values`. */
export function capabilityConfig(product, itemType, code) {
  const fromType = (itemType?.capabilities || []).find((capability) => capability.code === code)?.config || {}
  const fromProduct = product?.capabilityValues?.[code]
  return { ...fromType, ...(fromProduct && typeof fromProduct === 'object' ? fromProduct : {}) }
}

/**
 * `{ kind, codes, unique, serial, units, quantity, candidates, schedule, participants, recurrence, warranty,
 *    installments, holdDays, creates }`
 * - `unique`      one-of-a-kind pieces (`unique_unit`): the lead picks the units they want, quantity is 1.
 * - `units`       products sold by unit of measure (base + alternative units); not for services, plans, bundles.
 * - `quantity`    a quantity field (not for plans or unique pieces).
 * - `schedule`    a preferred date (`scheduling` / `onsite`).
 * - `participants` `{ min, max }` when the type counts people (`participants` / `capacity`).
 * - `perPerson`   a service that counts people is priced per person: people replace the quantity field.
 * - `recurrence`  `{ every, unit, autoRenew }` for plans and recurring services.
 */
export function getInterestProfile(product, itemType) {
  if (!product) return null
  const kind = INTEREST_KINDS.includes(product.kind) ? product.kind : 'product'
  const codes = codesOf(itemType)
  const has = (code) => codes.includes(code)
  const unique = kind === 'product' && has('unique_unit')

  let participants = null
  if (has('participants') || has('capacity')) {
    const people = capabilityConfig(product, itemType, has('participants') ? 'participants' : 'capacity')
    participants = { min: toNumber(people.min), max: toNumber(people.max) }
  }

  let recurrence = null
  if (has('recurrence')) {
    const config = capabilityConfig(product, itemType, 'recurrence')
    recurrence = { every: toNumber(config.every) || 1, unit: config.unit || 'month', autoRenew: Boolean(config.auto_renew) }
  }

  const warranty = has('warranty') ? { months: toNumber(capabilityConfig(product, itemType, 'warranty').months) } : null

  const perPerson = kind === 'service' && Boolean(participants)

  return {
    kind,
    codes,
    unique,
    serial: kind === 'product' && has('serial_tracking'),
    units: kind === 'product' && !unique,
    quantity: kind !== 'plan' && !unique && !perPerson,
    perPerson,
    candidates: unique,
    schedule: has('scheduling') || has('onsite'),
    participants,
    recurrence,
    warranty,
    installments: has('installments'),
    holdDays: has('availability') ? toNumber(capabilityConfig(product, itemType, 'availability').hold_days) : null,
    creates: product.fulfillmentConfig?.creates || itemType?.fulfillmentConfig?.creates || '',
  }
}

/** Search + kind + item type filter for the product picker. `item_type` `'none'` = products without a type. */
export function filterInterestProducts(products = [], { kind = 'all', itemTypeId = '', search = '' } = {}) {
  const query = search.trim().toLowerCase()
  return products.filter((product) => {
    if (kind !== 'all' && product.kind !== kind) return false
    if (itemTypeId === 'none' && product.itemTypeId) return false
    if (itemTypeId && itemTypeId !== 'none' && String(product.itemTypeId) !== String(itemTypeId)) return false
    if (!query) return true
    return [product.name, product.description, product.category?.name, product.raw?.code]
      .some((value) => String(value || '').toLowerCase().includes(query))
  })
}

/** `{ all, product, service, plan, bundle }` counts for the kind tabs. */
export function countByKind(products = []) {
  const counts = { all: products.length, product: 0, service: 0, plan: 0, bundle: 0 }
  products.forEach((product) => {
    if (product.kind in counts) counts[product.kind] += 1
  })
  return counts
}

/** Item types used by `products` (for the filter chips), with their product count; `none` first when some have no type. */
export function itemTypeFilters(products = [], itemTypes = []) {
  const counts = new Map()
  let untyped = 0
  products.forEach((product) => {
    if (!product.itemTypeId) {
      untyped += 1
      return
    }
    const key = String(product.itemTypeId)
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  const typed = [...counts.entries()].map(([id, count]) => {
    const itemType = itemTypes.find((item) => String(item.id) === id)
    return { id, name: itemType?.name || '', count }
  }).sort((a, b) => b.count - a.count)
  return untyped ? [{ id: 'none', name: '', count: untyped }, ...typed] : typed
}
