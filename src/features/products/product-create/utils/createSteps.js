/**
 * Which steps the "new product / service" wizard shows (2026-10-15). Pure, tested.
 *
 * - No item type → every step (the user fills everything by hand: units, details, attached items; the instances
 *   step explains that pieces need a type).
 * - With an item type → only what applies: no "stock & units" for one-of-a-kind items (`unique_unit`, their stock
 *   is the units themselves), and "pieces" only when the type holds instances (serials, units, batches).
 */
import { CREATE_STEPS, instanceModesForItemType } from '../../utils/productCreateWizard'

const codesOf = (itemType) => (itemType?.capabilities || []).map((capability) => capability.code)

export function getCreateSteps(itemType) {
  if (!itemType) return [...CREATE_STEPS]
  const codes = codesOf(itemType)
  const hasInstances = instanceModesForItemType(itemType).length > 0
  return CREATE_STEPS.filter((step) => {
    if (step === 'stock') return !codes.includes('unique_unit')
    if (step === 'instances') return hasInstances
    return true
  })
}

/** "manual" (no item type) or "type" — used for the guide copy of each step. */
export function createMode(itemType) {
  return itemType ? 'type' : 'manual'
}
