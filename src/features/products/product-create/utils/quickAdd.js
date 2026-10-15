/**
 * Quick add (2026-10-15): name + category + price, Enter saves, the next one starts. Pure, tested.
 * The body is the normal create request (`POST /product/create`); a chosen item type adds its default units.
 */
import { EMPTY_PRODUCT_FORM, buildProductPayload } from '../../utils/catalogForms'
import { productUnitsFromType } from '../../item-type-wizard/utils/typeDefaults'

export const EMPTY_QUICK_ROW = { name: '', price: '', category_id: '', item_type_id: '' }

export function validateQuickRow(row) {
  const errors = {}
  if (!String(row.name || '').trim()) errors.name = 'nameRequired'
  if (row.price === '' || !(Number(row.price) >= 0)) errors.price = 'invalidNumber'
  return errors
}

export function buildQuickProduct(row, { kind = 'product', itemType = null } = {}) {
  const form = {
    ...EMPTY_PRODUCT_FORM,
    kind,
    name: row.name,
    price: row.price,
    category_id: row.category_id,
    item_type_id: row.item_type_id,
    status: true,
    // Services have no units (2026-10-15); products get the type's default units.
    units: kind !== 'service' && itemType && String(itemType.id) === String(row.item_type_id) ? productUnitsFromType(itemType) : [],
  }
  return buildProductPayload(form, { mode: 'create' })
}

/** Row kept for the next item: category and item type stay, name and price clear. */
export function nextQuickRow(row) {
  return { ...EMPTY_QUICK_ROW, category_id: row.category_id, item_type_id: row.item_type_id }
}
