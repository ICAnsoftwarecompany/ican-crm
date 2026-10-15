/**
 * One display model for a lead interest, wherever it shows (drawer tab, timeline, table cell, products dialog)
 * — 2026-10-15. Pure, tested.
 *
 * Interests reach the UI in several shapes: the raw `lead.interesteds[]` row (with or without a nested `product`),
 * the Leads Center "linked product" (`customerMarketingUtils`: `productId`, `linkRaw`, `raw`, `sourceKind`…), or a
 * timeline log item (`productId`, `interestLevel`, `note`, maybe no name). `toInterestView` reads all of them and
 * completes the product from the catalog index (kind, item type, category, price, capabilities), so a log that only
 * carries `product_id` still shows "Villa 12 · Real estate" instead of "Product #1".
 */
import { getInterestProfile, resolveItemType } from './interestProfile'
import { toIdList } from './interestForm'

const blank = (value) => value === undefined || value === null || value === ''
const toNumber = (value) => {
  if (blank(value)) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
const first = (...values) => values.find((value) => !blank(value))

export const INTEREST_LEVEL_KEYS = ['high', 'medium', 'low']

/** `'high' | 'medium' | 'low' | ''` (the API also sends the typo `hight`). */
export function normalizeLevel(value) {
  const key = String(value || '').trim().toLowerCase()
  if (key === 'hight') return 'high'
  return INTEREST_LEVEL_KEYS.includes(key) ? key : ''
}

/** `Map<productId, { product, itemType, profile }>` from normalized catalog products and item types. */
export function buildCatalogIndex(products = [], itemTypes = []) {
  const index = new Map()
  products.forEach((product) => {
    if (blank(product?.id)) return
    const itemType = resolveItemType(product, itemTypes)
    index.set(String(product.id), { product, itemType, profile: getInterestProfile(product, itemType) })
  })
  return index
}

/** The structured interest details as `[{ key, params }]` (labels: `leads.interestDialog.chips.<key>`). */
export function interestFacts(raw = {}) {
  const facts = []
  const quantity = toNumber(raw.quantity)
  if (quantity !== null && quantity !== 1) facts.push({ key: 'quantity', params: { value: quantity } })
  const units = toIdList(raw.item_instance_ids).length
  if (units) facts.push({ key: 'units', params: { count: units } })
  if (raw.preferred_date) facts.push({ key: 'date', params: { value: String(raw.preferred_date).slice(0, 10) } })
  const participants = toNumber(raw.participants)
  if (participants !== null) facts.push({ key: 'participants', params: { count: participants } })
  const addOns = toIdList(raw.optional_product_ids).length
  if (addOns) facts.push({ key: 'addOns', params: { count: addOns } })
  return facts
}

/**
 * `source`: an interest in any of the shapes above, or a catalog product (`{ product }` only, for the "not
 * interested" list). `index`: from `buildCatalogIndex` (may be empty while the catalog loads).
 */
export function toInterestView(source = {}, index = new Map()) {
  const link = source.linkRaw && Object.keys(source.linkRaw).length ? source.linkRaw : source
  const nested = source.raw && source.raw !== source ? source.raw : (link.product || link.products || {})
  const productId = first(source.productId, link.product_id, nested.id, source.product?.id)
  const entry = blank(productId) ? null : index.get(String(productId)) || null
  const catalog = entry?.product || null
  const itemType = entry?.itemType || null
  const profile = entry?.profile || null

  const kind = catalog?.kind || String(first(nested.kind, nested.type, '') || '').toLowerCase()
  const price = catalog ? catalog.price : toNumber(first(source.price, nested.price))

  return {
    key: String(first(source.id, link.id, productId, '') ?? ''),
    productId: blank(productId) ? '' : String(productId),
    inCatalog: Boolean(catalog),
    name: first(catalog?.name, source.name, nested.name, link.name) || '',
    kind: ['product', 'service', 'plan', 'bundle'].includes(kind) ? kind : '',
    itemTypeName: itemType?.name || '',
    categoryName: first(catalog?.category?.name, source.categoryName, nested.category?.name, nested.categroy?.name) || '',
    image: first(catalog?.image, source.image, nested.image) || '',
    description: first(catalog?.description, source.description, nested.description, nested.desc) || '',
    price,
    cycleUnit: profile?.recurrence?.unit || '',
    perPerson: Boolean(profile?.perPerson),
    capabilities: itemType?.capabilities || [],
    level: normalizeLevel(first(source.interestLevel, link.interest_level)),
    note: String(first(source.note, link.note, link.notes) || '').trim(),
    createdAt: first(link.created_at, source.created_at) || '',
    isDeal: Number(link.is_deal) === 1 || link.is_deal === true,
    isLost: Number(link.is_lost) === 1 || link.is_lost === true,
    isMain: Boolean(source.isMain),
    sourceKind: source.sourceKind && source.sourceKind !== 'catalog' && source.sourceKind !== 'interested' ? source.sourceKind : '',
    facts: interestFacts(link),
    estimatedValue: toNumber(link.estimated_value),
  }
}
