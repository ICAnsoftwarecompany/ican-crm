/**
 * Item type wizard (`/products/item-types/new`, `/products/item-types/:id`) — 2026-10-14. Pure, tested.
 *
 * Steps: kind (product / service / plan / bundle + templates) → basics → capabilities → units (when the type is
 * sold in units) → attached items → review. Saving is one `POST /item-types` (or `PUT` on edit).
 */
import { capabilityConflicts, getCapabilityDefinition } from '../../constants/capabilityRegistry'
import { EMPTY_ITEM_TYPE_FORM, newTypeUnitRow, validateItemTypeForm } from './itemTypeForm'

export const TYPE_STEPS = ['kind', 'basics', 'capabilities', 'units', 'relations', 'review']

const codesOf = (form) => form.capabilities.map((capability) => capability.code)

/**
 * A type is sold in units (box, carton, hour…) unless each piece is unique (real estate, a specific car) or it is a
 * bundle / plan (priced as one thing). Services can have units too (hour, visit).
 */
export function supportsUnits(form) {
  if (!['product', 'service'].includes(form.kind)) return false
  return !codesOf(form).includes('unique_unit')
}

/** Steps shown for this form (the units step is skipped when the type is not sold in units). */
export function getTypeSteps(form, { mode = 'create' } = {}) {
  return TYPE_STEPS.filter((step) => {
    if (step === 'units') return supportsUnits(form)
    if (step === 'kind') return mode === 'create'
    return true
  })
}

/** Lowercase latin code from a name, or '' when the name has no latin letters (Arabic names). */
export function suggestCode(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

/**
 * Form filled from a template. `units` = the tenant's units of measure (normalized); suggested units are matched by
 * `code`, and the ones the tenant does not have yet come back in `missingUnits` so the user can create them.
 */
export function applyTemplate(template, { name = '', description = '', units = [] } = {}) {
  const byCode = new Map(units.map((unit) => [String(unit.code).toLowerCase(), unit]))
  const unitRows = []
  const missingUnits = []
  ;(template.units || []).forEach((suggestion) => {
    const unit = byCode.get(suggestion.code)
    if (unit) unitRows.push(newTypeUnitRow({ unit_id: String(unit.id), factor: String(suggestion.factor) }))
    else missingUnits.push(suggestion)
  })
  const form = {
    ...EMPTY_ITEM_TYPE_FORM,
    template_id: template.id,
    kind: template.kind,
    code: template.code,
    name,
    description,
    service_model: template.serviceModel || '',
    fulfillment_creates: template.creates && template.creates !== 'none' ? template.creates : '',
    capabilities: template.capabilities.map((capability) => ({
      code: capability.code,
      version: 1,
      config: { ...capability.config },
      configJson: getCapabilityDefinition(capability.code) ? '' : JSON.stringify(capability.config || {}),
    })),
    units: unitRows,
    relations: [],
  }
  return { form, missingUnits }
}

/** Starting form for a kind chosen without a template. */
export function blankFormForKind(kind) {
  return { ...EMPTY_ITEM_TYPE_FORM, kind, capabilities: [], units: [], relations: [], fulfillment_extra: {} }
}

/**
 * Adds or removes a capability; keeps the config of capabilities already on. Turning on a unique unit clears the
 * default units (each piece is one of a kind, it cannot be sold in boxes).
 */
export function toggleCapability(form, code, on) {
  const has = codesOf(form).includes(code)
  if (on && !has) {
    const next = { ...form, capabilities: [...form.capabilities, { code, version: 1, config: {}, configJson: getCapabilityDefinition(code) ? '' : '{}' }] }
    return supportsUnits(next) ? next : { ...next, units: [] }
  }
  if (!on && has) return { ...form, capabilities: form.capabilities.filter((capability) => capability.code !== code) }
  return form
}

/** Errors of one step (keys match the fields; values are `catalog.validation.*` keys). */
export function validateTypeStep(step, form, { mode = 'create' } = {}) {
  const errors = {}
  if (step === 'kind' && !form.kind) errors.kind = 'kindRequired'
  if (step === 'basics') {
    const all = validateItemTypeForm(form, { mode })
    if (all.name) errors.name = all.name
    if (all.code) errors.code = all.code
  }
  if (step === 'capabilities') {
    Object.entries(validateItemTypeForm(form, { mode })).forEach(([key, value]) => {
      if (key.startsWith('capabilities.')) errors[key] = value
    })
    const conflicts = capabilityConflicts(codesOf(form))
    if (conflicts.length) errors.conflicts = conflicts
  }
  if (step === 'units' && supportsUnits(form)) {
    const seen = new Set()
    form.units.forEach((row) => {
      if (!row.unit_id) return
      if (seen.has(row.unit_id)) errors[`units.${row.key}`] = 'duplicateUnit'
      seen.add(row.unit_id)
      if (!(Number(row.factor) > 0)) errors[`units.${row.key}`] = 'factorRequired'
    })
  }
  if (step === 'relations') {
    const seen = new Set()
    form.relations.forEach((row) => {
      if (!row.child_product_id) return
      if (seen.has(row.child_product_id)) errors[`relations.${row.key}`] = 'duplicateItem'
      seen.add(row.child_product_id)
      if (!(Number(row.quantity) > 0)) errors[`relations.${row.key}`] = 'quantityRequired'
    })
  }
  return errors
}

/** First step (before `target`) that has errors, or null. */
export function firstInvalidTypeStep(form, { mode = 'create', target = 'review' } = {}) {
  const steps = getTypeSteps(form, { mode })
  for (const step of steps.slice(0, steps.indexOf(target))) {
    if (Object.keys(validateTypeStep(step, form, { mode })).length) return step
  }
  return null
}
