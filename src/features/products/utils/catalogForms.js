/**
 * Form state ⇄ request bodies for the catalog forms (2026-10-06). Pure, tested in catalogForms.test.js.
 */
import { getCapabilityDefinition } from '../constants/capabilityRegistry'
import { compactBody } from './catalogPayloads'

const isBlank = (value) => value === undefined || value === null || String(value).trim() === ''
const toNumber = (value) => (isBlank(value) ? undefined : Number(value))

/** Casts a capability config to the field types of the registry; drops blank values. Unknown keys stay as they are. */
export function cleanCapabilityConfig(code, config = {}) {
  const fields = new Map((getCapabilityDefinition(code)?.fields || []).map((field) => [field.key, field]))
  return Object.entries(config || {}).reduce((result, [key, value]) => {
    const type = fields.get(key)?.type
    if (type === 'boolean') {
      result[key] = value === true || value === 'true' || value === 1 || value === '1'
      return result
    }
    if (isBlank(value)) return result
    if (type === 'number') {
      const number = Number(value)
      if (Number.isFinite(number)) result[key] = number
      return result
    }
    result[key] = value
    return result
  }, {})
}

/** `{ code: config }` with empty configs removed — the shape of `capability_values`. */
export function cleanCapabilityValues(values = {}) {
  return Object.entries(values || {}).reduce((result, [code, config]) => {
    const cleaned = cleanCapabilityConfig(code, config)
    if (Object.keys(cleaned).length) result[code] = cleaned
    return result
  }, {})
}

export const EMPTY_PRODUCT_FORM = {
  name: '',
  kind: 'product',
  item_type_id: '',
  category_id: '',
  price: '',
  description: '',
  image: null,
  status: true,
  is_stock_tracked: false,
  stock_quantity: '',
  fulfillment_creates: '',
  capability_values: {},
  units: [],
}

export function productToForm(product, kind = 'product') {
  if (!product) return { ...EMPTY_PRODUCT_FORM, kind }
  return {
    ...EMPTY_PRODUCT_FORM,
    name: product.name || '',
    kind: product.kind || kind,
    item_type_id: product.itemTypeId != null ? String(product.itemTypeId) : '',
    category_id: product.categoryId != null ? String(product.categoryId) : '',
    price: product.price ?? '',
    description: product.description || '',
    status: product.status !== false,
    is_stock_tracked: Boolean(product.isStockTracked),
    stock_quantity: product.stockQuantity ?? '',
    fulfillment_creates: product.fulfillmentConfig?.creates || '',
    capability_values: product.capabilityValues || {},
  }
}

/**
 * Request body for create (`mode: 'create'`, includes kind and alternative units) or update.
 * `data` is the serialized "additional data" rows (sent only when not empty).
 */
export function buildProductPayload(form, { mode = 'create', data } = {}) {
  const capabilityValues = cleanCapabilityValues(form.capability_values)
  const body = {
    name: form.name.trim(),
    price: toNumber(form.price),
    item_type_id: form.item_type_id || undefined,
    category_id: form.category_id || undefined,
    description: form.description?.trim() || undefined,
    status: Boolean(form.status),
    is_stock_tracked: Boolean(form.is_stock_tracked),
    stock_quantity: form.is_stock_tracked ? toNumber(form.stock_quantity) : undefined,
    capability_values: Object.keys(capabilityValues).length ? capabilityValues : undefined,
    fulfillment_config: form.fulfillment_creates ? { creates: form.fulfillment_creates } : undefined,
    data: data && data !== '[]' && data !== '{}' ? data : undefined,
    image: form.image || undefined,
  }

  if (mode === 'create') {
    body.kind = form.kind || 'product'
    body.units = (form.units || [])
      .filter((unit) => !isBlank(unit.unit_id) && !isBlank(unit.factor))
      .map((unit) => compactBody({
        unit_id: unit.unit_id,
        factor: Number(unit.factor),
        price: toNumber(unit.price),
        barcode: unit.barcode?.trim(),
        is_default: Boolean(unit.is_default),
      }))
  }

  return compactBody(body)
}

export function validateProductForm(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'nameRequired'
  if (!isBlank(form.price) && !(Number(form.price) >= 0)) errors.price = 'invalidNumber'
  if (form.is_stock_tracked && !isBlank(form.stock_quantity) && !(Number(form.stock_quantity) >= 0)) errors.stock_quantity = 'invalidNumber'
  ;(form.units || []).forEach((unit, index) => {
    if (!isBlank(unit.unit_id) && !(Number(unit.factor) > 0)) errors[`units.${index}.factor`] = 'factorRequired'
  })
  return errors
}

/* ---------------------------------- Item types ---------------------------------- */

export const EMPTY_ITEM_TYPE_FORM = {
  code: '',
  name: '',
  description: '',
  kind: 'product',
  service_model: '',
  fulfillment_creates: '',
  status: true,
  capabilities: [],
}

export function itemTypeToForm(itemType) {
  if (!itemType) return { ...EMPTY_ITEM_TYPE_FORM, capabilities: [] }
  return {
    code: itemType.code || '',
    name: itemType.name || '',
    description: itemType.description || '',
    kind: itemType.kind || 'product',
    service_model: itemType.serviceModel || '',
    fulfillment_creates: itemType.fulfillmentConfig?.creates || '',
    status: itemType.status !== false,
    capabilities: itemType.capabilities.map((capability) => ({
      code: capability.code,
      version: capability.version || 1,
      config: { ...capability.config },
      configJson: getCapabilityDefinition(capability.code) ? '' : JSON.stringify(capability.config || {}, null, 2),
    })),
  }
}

/** Parses the JSON config of a capability that is not in the registry. Throws on invalid JSON. */
function customConfig(capability) {
  if (!capability.configJson?.trim()) return {}
  const parsed = JSON.parse(capability.configJson)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalidJson')
  return parsed
}

export function buildItemTypePayload(form, { mode = 'create' } = {}) {
  const capabilities = form.capabilities.map((capability) => ({
    code: capability.code,
    version: Number(capability.version) || 1,
    config: getCapabilityDefinition(capability.code)
      ? cleanCapabilityConfig(capability.code, capability.config)
      : customConfig(capability),
  }))
  const body = compactBody({
    name: form.name.trim(),
    description: form.description?.trim(),
    kind: form.kind,
    service_model: form.service_model,
    fulfillment_config: form.fulfillment_creates ? { creates: form.fulfillment_creates } : undefined,
    status: Boolean(form.status),
  })
  body.capabilities = capabilities
  if (mode === 'create') body.code = form.code.trim()
  return body
}

export function validateItemTypeForm(form, { mode = 'create' } = {}) {
  const errors = {}
  if (mode === 'create' && !/^[a-z0-9_]+$/.test(form.code.trim())) errors.code = 'codeFormat'
  if (!form.name.trim()) errors.name = 'nameRequired'
  form.capabilities.forEach((capability, index) => {
    if (getCapabilityDefinition(capability.code)) return
    try {
      customConfig(capability)
    } catch {
      errors[`capabilities.${index}`] = 'invalidJson'
    }
  })
  return errors
}

/* ------------------------------------ Instances ------------------------------------ */

export function matchesSerialPattern(serial, pattern) {
  if (!pattern) return true
  try {
    return new RegExp(pattern).test(serial)
  } catch {
    return true
  }
}

/** Serials typed one per line (or comma separated): trimmed, de-duplicated. */
export function parseSerials(text = '') {
  return [...new Set(String(text).split(/[\n,]+/).map((value) => value.trim()).filter(Boolean))]
}

/**
 * Body items for `POST /products/{id}/instances` by form mode.
 * Returns `{ instances, invalid }` — `invalid` lists serials that miss the item type's pattern.
 */
export function buildInstancesPayload(mode, input, { pattern } = {}) {
  if (mode === 'serial') {
    const serials = parseSerials(input)
    return {
      instances: serials.map((serial_number) => ({ serial_number })),
      invalid: serials.filter((serial) => !matchesSerialPattern(serial, pattern)),
    }
  }
  if (mode === 'unit') {
    const instances = (input || [])
      .filter((row) => !isBlank(row.building) || !isBlank(row.floor) || !isBlank(row.unit))
      .map((row) => ({
        unit_attributes: compactBody({
          building: row.building?.trim(),
          floor: isBlank(row.floor) ? undefined : (Number.isFinite(Number(row.floor)) ? Number(row.floor) : row.floor),
          unit: row.unit?.trim(),
        }),
      }))
    return { instances, invalid: [] }
  }
  const instances = (input || [])
    .filter((row) => !isBlank(row.batch_no) || !isBlank(row.expiry_date))
    .map((row) => compactBody({ batch_no: row.batch_no?.trim(), expiry_date: row.expiry_date }))
  return { instances, invalid: [] }
}
