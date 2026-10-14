/**
 * Item type form model (2026-10-14): API item type ⇄ wizard form ⇄ request body, and validation. Pure, tested.
 * Moved here from utils/catalogForms.js on 2026-10-15 with the rest of the item type wizard.
 */
import { getCapabilityDefinition } from '../../constants/capabilityRegistry'
import { compactBody } from '../../utils/catalogPayloads'
import { cleanCapabilityConfig } from '../../utils/catalogForms'

const isBlank = (value) => value === undefined || value === null || String(value).trim() === ''

/* ---------------------------------- Item types ---------------------------------- */
// Rebuilt 2026-10-14 for the full-page item type wizard: besides kind, capabilities and fulfillment, a type keeps
// default alternative units (capability `units`) and default attached items (`fulfillment_config.default_relations`)
// that the product wizard copies into each new product. Other `fulfillment_config` keys are preserved.

let typeRowKey = 0
const nextTypeRowKey = (prefix) => `${prefix}-${(typeRowKey += 1)}`

export const newTypeUnitRow = (patch = {}) => ({ key: nextTypeRowKey('type-unit'), unit_id: '', factor: '', is_default: false, ...patch })
export const newTypeRelationRow = (inclusion = 'included', patch = {}) => ({
  key: nextTypeRowKey('type-relation'),
  child_product_id: '',
  inclusion,
  quantity: '1',
  price_override: inclusion === 'included' ? '0' : '',
  auto_add: inclusion === 'included',
  ...patch,
})

export const EMPTY_ITEM_TYPE_FORM = {
  template_id: '',
  code: '',
  name: '',
  description: '',
  kind: 'product',
  service_model: '',
  fulfillment_creates: '',
  fulfillment_extra: {},
  status: true,
  capabilities: [],
  units: [],
  relations: [],
}

const toCapabilityRow = (capability) => ({
  code: capability.code,
  version: capability.version || 1,
  config: { ...(capability.config || {}) },
  configJson: getCapabilityDefinition(capability.code) ? '' : JSON.stringify(capability.config || {}, null, 2),
})

export function itemTypeToForm(itemType) {
  if (!itemType) return { ...EMPTY_ITEM_TYPE_FORM, capabilities: [], units: [], relations: [], fulfillment_extra: {} }
  const unitsCapability = itemType.capabilities.find((capability) => capability.code === 'units')
  const { creates, default_relations: defaultRelations, ...extra } = itemType.fulfillmentConfig || {}
  return {
    template_id: '',
    code: itemType.code || '',
    name: itemType.name || '',
    description: itemType.description || '',
    kind: itemType.kind || 'product',
    service_model: itemType.serviceModel || '',
    fulfillment_creates: creates || '',
    fulfillment_extra: extra,
    status: itemType.status !== false,
    capabilities: itemType.capabilities.filter((capability) => capability.code !== 'units').map(toCapabilityRow),
    units: (unitsCapability?.config?.alternatives || []).map((unit) => newTypeUnitRow({
      unit_id: unit.unit_id != null ? String(unit.unit_id) : '',
      factor: unit.factor ?? '',
      is_default: Boolean(unit.is_default),
    })),
    relations: (Array.isArray(defaultRelations) ? defaultRelations : []).map((relation) => newTypeRelationRow(relation.inclusion || 'included', {
      child_product_id: relation.child_product_id != null ? String(relation.child_product_id) : '',
      quantity: String(relation.quantity ?? 1),
      price_override: relation.price_override ?? '',
      auto_add: Boolean(relation.auto_add),
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

/** `alternatives` of the `units` capability from the units step rows. */
export function buildTypeUnits(rows = []) {
  return rows
    .filter((row) => !isBlank(row.unit_id) && Number(row.factor) > 0)
    .map((row) => ({ unit_id: row.unit_id, factor: Number(row.factor), is_default: Boolean(row.is_default) }))
}

/** `default_relations` from the attached items step rows (same fields as POST /products/{id}/relations). */
export function buildTypeRelations(rows = []) {
  return rows
    .filter((row) => !isBlank(row.child_product_id))
    .map((row, index) => compactBody({
      child_product_id: row.child_product_id,
      inclusion: row.inclusion,
      quantity: Number(row.quantity) > 0 ? Number(row.quantity) : 1,
      price_override: isBlank(row.price_override) ? undefined : Number(row.price_override),
      auto_add: Boolean(row.auto_add),
      sort_order: index + 1,
    }))
}

export function buildItemTypePayload(form, { mode = 'create' } = {}) {
  const capabilities = form.capabilities
    .filter((capability) => capability.code !== 'units')
    .map((capability) => ({
      code: capability.code,
      version: Number(capability.version) || 1,
      config: getCapabilityDefinition(capability.code)
        ? cleanCapabilityConfig(capability.code, capability.config)
        : customConfig(capability),
    }))
  const alternatives = buildTypeUnits(form.units)
  if (alternatives.length) capabilities.push({ code: 'units', version: 1, config: { alternatives } })

  const relations = buildTypeRelations(form.relations)
  const fulfillment = { ...(form.fulfillment_extra || {}) }
  if (form.fulfillment_creates) fulfillment.creates = form.fulfillment_creates
  if (relations.length) fulfillment.default_relations = relations

  const body = compactBody({
    name: form.name.trim(),
    description: form.description?.trim(),
    kind: form.kind,
    service_model: form.service_model,
    status: Boolean(form.status),
  })
  // On update the object is always sent, so removing "creates" or the attached items really clears them.
  if (mode === 'update' || Object.keys(fulfillment).length) body.fulfillment_config = fulfillment
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
