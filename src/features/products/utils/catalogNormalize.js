/**
 * Normalizers for catalog responses (2026-10-06). The collection ships no response examples, so every reader
 * accepts the shapes seen so far (old product tree, flat list, `data` / `data.data` wrappers) and keeps `raw`.
 */
import { extractList } from '../../../shared/utils/apiResponse'

const isBlank = (value) => value === undefined || value === null || value === ''

export function toNumberOrNull(value) {
  if (isBlank(value)) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/** Parses a JSON string; returns objects/arrays as they are and `fallback` for anything else. */
export function parseJsonValue(value, fallback = null) {
  if (value && typeof value === 'object') return value
  if (typeof value !== 'string' || !value.trim()) return fallback
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

/** `status` / `active` as a boolean; missing means active. */
export function isActiveStatus(value) {
  if (isBlank(value)) return true
  if (typeof value === 'boolean') return value
  if (typeof value === 'string' && ['active', 'true'].includes(value.toLowerCase())) return true
  return Number(value) === 1
}

const asBool = (value) => value === true || value === 1 || value === '1' || value === 'true'

/** `kind` (new API) with the old `type` as fallback; empty means `product`. */
export function getProductKind(product) {
  return String(product?.kind ?? product?.type ?? '').trim().toLowerCase() || 'product'
}

/** One entity from `{ data: {...} }` or the object itself. */
export function extractEntity(response) {
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)
      ? response.data.data
      : response.data
  }
  return response && typeof response === 'object' ? response : null
}

export function extractRows(response, keys = []) {
  return extractList(response, keys)
}

const childrenOf = (node) => [node?.children_recursive, node?.children].find(Array.isArray) || []

function looksLikeProduct(node) {
  return !Array.isArray(node?.products) && childrenOf(node).length === 0
    && ['price', 'kind', 'item_type_id', 'category_id'].some((key) => key in (node || {}))
}

/**
 * Product rows from `/product/data`: the old response is a category tree (`products`, `children_recursive`),
 * the new one a flat list. Each row keeps its category; duplicates are dropped.
 */
export function flattenCatalogResponse(nodes = []) {
  const rows = []
  const visit = (node, parentCategory) => {
    if (!node || typeof node !== 'object') return
    if (looksLikeProduct(node)) {
      rows.push({ raw: node, category: node.category || node.categroy || parentCategory || null })
      return
    }
    const nested = Array.isArray(node.products) ? node.products : []
    nested.forEach((product) => rows.push({ raw: product, category: product.category || product.categroy || node }))
    childrenOf(node).forEach((child) => visit(child, node))
  }
  nodes.forEach((node) => visit(node, null))
  const seen = new Set()
  return rows.filter(({ raw }) => {
    const key = String(raw.id ?? '')
    if (!key) return true
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function normalizeCapabilities(value) {
  const list = parseJsonValue(value, [])
  if (Array.isArray(list)) {
    return list
      .map((item) => (typeof item === 'string' ? { code: item, version: 1, config: {} } : item))
      .filter((item) => item && item.code)
      .map((item) => ({ code: String(item.code), version: Number(item.version) || 1, config: parseJsonValue(item.config, {}) || {} }))
  }
  // `{ warranty: { months: 24 } }` style
  return Object.entries(list || {}).map(([code, config]) => ({ code, version: 1, config: parseJsonValue(config, {}) || {} }))
}

export function normalizeItemType(raw = {}) {
  return {
    id: raw.id,
    code: raw.code || '',
    name: raw.name || raw.title || raw.code || '',
    description: raw.description || '',
    kind: String(raw.kind || 'product').toLowerCase(),
    serviceModel: raw.service_model || '',
    capabilities: normalizeCapabilities(raw.capabilities),
    fulfillmentConfig: parseJsonValue(raw.fulfillment_config, {}) || {},
    status: isActiveStatus(raw.status),
    productsCount: toNumberOrNull(raw.products_count),
    raw,
  }
}

export function normalizeCatalogProduct(raw = {}, category = null) {
  const itemType = raw.item_type || raw.itemType || null
  const resolvedCategory = category || raw.category || raw.categroy || null
  return {
    id: raw.id,
    name: raw.name || raw.title || '',
    kind: getProductKind(raw),
    price: toNumberOrNull(raw.price),
    description: raw.description || raw.desc || '',
    image: raw.image || '',
    status: isActiveStatus(raw.status ?? raw.active),
    categoryId: raw.category_id ?? resolvedCategory?.id ?? null,
    category: resolvedCategory,
    itemTypeId: raw.item_type_id ?? itemType?.id ?? null,
    itemType: itemType ? normalizeItemType(itemType) : null,
    isStockTracked: asBool(raw.is_stock_tracked),
    stockQuantity: toNumberOrNull(raw.stock_quantity),
    capabilityValues: parseJsonValue(raw.capability_values, {}) || {},
    fulfillmentConfig: parseJsonValue(raw.fulfillment_config, {}) || {},
    data: raw.data ?? null,
    baseUnit: raw.base_unit || raw.baseUnit || null,
    createdAt: raw.created_at || null,
    updatedAt: raw.updated_at || null,
    raw,
  }
}

export function normalizeUnit(raw = {}) {
  return {
    id: raw.id,
    code: raw.code || '',
    name: raw.name || raw.code || '',
    type: raw.type || '',
    decimals: toNumberOrNull(raw.decimals) ?? 0,
    status: isActiveStatus(raw.status),
    raw,
  }
}

export function normalizeProductUnit(raw = {}) {
  const unit = raw.unit || {}
  return {
    id: raw.id,
    unitId: raw.unit_id ?? unit.id ?? null,
    unitName: unit.name || raw.unit_name || raw.name || unit.code || '',
    unitCode: unit.code || raw.unit_code || '',
    factor: toNumberOrNull(raw.factor),
    price: toNumberOrNull(raw.price),
    barcode: raw.barcode || '',
    isDefault: asBool(raw.is_default),
    isBase: asBool(raw.is_base) || toNumberOrNull(raw.factor) === 1,
    status: isActiveStatus(raw.status),
    raw,
  }
}

export function normalizeRelation(raw = {}) {
  const child = raw.child_product || raw.childProduct || raw.child || {}
  return {
    id: raw.id,
    childProductId: raw.child_product_id ?? child.id ?? null,
    childName: child.name || raw.child_name || '',
    childKind: getProductKind(child),
    childPrice: toNumberOrNull(child.price),
    inclusion: raw.inclusion || 'optional',
    quantity: toNumberOrNull(raw.quantity) ?? 1,
    priceOverride: toNumberOrNull(raw.price_override),
    autoAdd: asBool(raw.auto_add),
    sortOrder: toNumberOrNull(raw.sort_order) ?? 0,
    raw,
  }
}

export function normalizeInstance(raw = {}) {
  const product = raw.product || {}
  const voided = Boolean(raw.voided_at) || raw.availability_status === 'void' || !isActiveStatus(raw.status)
  return {
    id: raw.id,
    productId: raw.product_id ?? product.id ?? null,
    productName: product.name || raw.product_name || '',
    serialNumber: raw.serial_number || '',
    batchNo: raw.batch_no || '',
    expiryDate: raw.expiry_date ? String(raw.expiry_date).slice(0, 10) : '',
    unitAttributes: parseJsonValue(raw.unit_attributes, {}) || {},
    availability: raw.availability_status || '',
    voided,
    raw,
  }
}

/** Display name of an instance: serial, else unit attributes ("B2 · 3 · A-305"), else batch. */
export function instanceLabel(instance) {
  if (instance.serialNumber) return instance.serialNumber
  const attributes = Object.values(instance.unitAttributes || {}).filter((value) => !isBlank(value))
  if (attributes.length) return attributes.join(' · ')
  return instance.batchNo || (instance.id !== undefined ? `#${instance.id}` : '')
}

/** Whole days from `now` to a `YYYY-MM-DD` date (negative = past), or null. */
export function daysUntil(date, now = new Date()) {
  if (!date) return null
  const target = new Date(`${String(date).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}
