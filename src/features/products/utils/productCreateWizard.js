/**
 * "New product" wizard (`/products/new`, 2026-10-07) — the create flow of the Products & Catalog collection:
 *   1. basics      name, kind, item type, category, price, description, image, status
 *   2. stock       stock tracking + alternative units (sent with the create request)
 *   3. capabilities  product overrides of the item type's capability config + fulfillment
 *   4. relations   included / optional attached items       → POST /products/{id}/relations (one per item)
 *   5. instances   serials / real-estate units / batches     → POST /products/{id}/instances
 *   6. review      runs the plan in order, resumable after a failure
 * Pure helpers, tested in productCreateWizard.test.js.
 */
import { instanceModesFor } from '../constants/capabilityRegistry'
import { buildInstancesPayload, buildProductPayload } from './catalogForms'
import { compactBody } from './catalogPayloads'

export const CREATE_STEPS = ['basics', 'stock', 'capabilities', 'relations', 'instances', 'review']

/** Error keys of `validateProductForm` checked on each step. */
export const STEP_ERROR_KEYS = {
  basics: ['name', 'price'],
  stock: ['stock_quantity', 'units.'],
}

let rowKey = 0
const nextKey = (prefix) => `${prefix}-${(rowKey += 1)}`

export const newRelationRow = (inclusion = 'included') => ({
  key: nextKey('relation'),
  child_product_id: '',
  inclusion,
  quantity: '1',
  price_override: inclusion === 'included' ? '0' : '',
  auto_add: inclusion === 'included',
})
export const newUnitInstanceRow = () => ({ key: nextKey('unit'), building: '', floor: '', unit: '' })
export const newBatchRow = () => ({ key: nextKey('batch'), batch_no: '', expiry_date: '' })

export function createInstancesState(mode = '') {
  return { mode, serials: '', unitRows: [newUnitInstanceRow()], batchRows: [newBatchRow()] }
}

const codesOf = (itemType) => (itemType?.capabilities || []).map((capability) => capability.code)

/** Instance modes the item type allows (`serial`, `unit`, `batch`); empty = the product holds no instances. */
export function instanceModesForItemType(itemType) {
  return instanceModesFor(codesOf(itemType))
}

/** Serial tracking with `required: true` on the item type (the review warns when no serial is entered). */
export function requiresSerials(itemType) {
  const capability = (itemType?.capabilities || []).find((item) => item.code === 'serial_tracking')
  return Boolean(capability && capability.config?.required)
}

/** Stock of products whose pieces are instances (serials, units) is counted from the instances. */
export function stockComesFromInstances(itemType) {
  const modes = instanceModesForItemType(itemType)
  return modes.includes('serial') || modes.includes('unit')
}

/** Relation rows → request bodies (rows without an item are skipped). */
export function buildRelationBodies(rows = []) {
  return rows
    .filter((row) => row.child_product_id)
    .map((row, index) => ({
      key: row.key,
      body: compactBody({
        child_product_id: row.child_product_id,
        inclusion: row.inclusion,
        quantity: Number(row.quantity) > 0 ? Number(row.quantity) : 1,
        price_override: row.price_override === '' || row.price_override === null ? undefined : Number(row.price_override),
        auto_add: Boolean(row.auto_add),
        sort_order: index + 1,
      }),
    }))
}

function instancesInput(instances) {
  if (instances.mode === 'serial') return instances.serials
  if (instances.mode === 'unit') return instances.unitRows
  return instances.batchRows
}

/** `{ instances, invalid, mode }` for the instances step; empty when the item type holds no instances. */
export function buildInstancesPlan(instances, itemType) {
  const modes = instanceModesForItemType(itemType)
  if (!instances?.mode || !modes.includes(instances.mode)) return { mode: instances?.mode || '', instances: [], invalid: [] }
  const pattern = (itemType?.capabilities || []).find((item) => item.code === 'serial_tracking')?.config?.pattern
  return { mode: instances.mode, ...buildInstancesPayload(instances.mode, instancesInput(instances), { pattern }) }
}

/** Everything the review step sends, in order. `data` = serialized additional-data rows. */
export function buildCreatePlan(state, itemType, { data } = {}) {
  const product = buildProductPayload(state.form, { mode: 'create', data })
  // Services hold no stock; serial / unit products count stock from their instances (backend D3).
  if (state.form.kind === 'service' || stockComesFromInstances(itemType)) {
    delete product.is_stock_tracked
    delete product.stock_quantity
  }
  return {
    product,
    relations: buildRelationBodies(state.relations),
    instances: buildInstancesPlan(state.instances, itemType),
  }
}

/**
 * Errors of a step that block going on. Product field errors come from `validateProductForm` (see
 * STEP_ERROR_KEYS); this adds the wizard's own rules.
 */
export function validateWizardStep(step, state, itemType) {
  const errors = {}
  if (step === 'relations') {
    const seen = new Set()
    state.relations.forEach((row) => {
      if (!row.child_product_id) return
      if (seen.has(row.child_product_id)) errors[`relations.${row.key}`] = 'duplicateItem'
      seen.add(row.child_product_id)
      if (!(Number(row.quantity) > 0)) errors[`relations.${row.key}`] = 'quantityRequired'
    })
  }
  if (step === 'instances') {
    const plan = buildInstancesPlan(state.instances, itemType)
    if (plan.invalid.length) errors.instances = 'patternMismatch'
  }
  return errors
}

/** What is left to send after a partial failure. `done = { productId, relations: [keys], instances: bool }`. */
export function remainingRequests(plan, done) {
  return {
    product: !done.productId,
    relations: plan.relations.filter((relation) => !done.relations.includes(relation.key)),
    instances: !done.instances && plan.instances.instances.length > 0,
  }
}
