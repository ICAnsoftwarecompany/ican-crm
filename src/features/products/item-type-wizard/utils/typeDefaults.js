/**
 * Item type defaults → new product (2026-10-14): the type's default units and attached items, and the rule that
 * fills them into the product wizard without overwriting what the user edited. Pure, tested.
 */

/* ------------------------------ Product defaults from the type ------------------------------ */

/** Alternative units a new product of this type starts with (rows of the product form). */
export function productUnitsFromType(itemType) {
  const alternatives = itemType?.capabilities?.find((capability) => capability.code === 'units')?.config?.alternatives
  if (!Array.isArray(alternatives)) return []
  return alternatives.map((unit, index) => ({
    key: `type-default-unit-${index}-${unit.unit_id}`,
    unit_id: String(unit.unit_id),
    factor: unit.factor != null ? String(unit.factor) : '',
    price: '',
    barcode: '',
    is_default: Boolean(unit.is_default),
  }))
}

/** Attached items a new product of this type starts with (rows of the product wizard). */
export function productRelationsFromType(itemType) {
  const relations = itemType?.fulfillmentConfig?.default_relations
  if (!Array.isArray(relations)) return []
  return relations.map((relation, index) => ({
    key: `type-default-relation-${index}-${relation.child_product_id}`,
    child_product_id: String(relation.child_product_id),
    inclusion: relation.inclusion || 'included',
    quantity: String(relation.quantity ?? 1),
    price_override: relation.price_override != null ? String(relation.price_override) : '',
    auto_add: Boolean(relation.auto_add),
  }))
}

const hasUnit = (row) => Boolean(row.unit_id)
const hasChild = (row) => Boolean(row.child_product_id)

/** Rows to use, or null to keep the current ones. */
function pickRows(current = [], previous, defaults, filled) {
  if (previous && current === previous) return defaults // untouched rows from the previous fill
  if (!current.some(filled) && defaults.length) return defaults
  return null
}

/**
 * Fills a new product with its item type's default units and attached items (2026-10-14). `memo` is what the last
 * fill wrote (`{ typeId, signature, units, relations }`); rows the user edited are never replaced, rows still as
 * filled are replaced when the type changes, and the same defaults are not applied twice (so deleting them sticks).
 * Returns `{ units?, relations?, memo, applied: { units, relations } }`. `withUnits: false` (services, 2026-10-15)
 * copies the attached items only.
 */
export function applyTypeDefaults({ units = [], relations = [] }, itemType, memo = {}, { withUnits = true } = {}) {
  const none = { memo, applied: { units: 0, relations: 0 } }
  if (!itemType) return none
  const typeUnits = withUnits ? productUnitsFromType(itemType) : []
  const typeRelations = productRelationsFromType(itemType)
  const signature = JSON.stringify([String(itemType.id), typeUnits.map((row) => [row.unit_id, row.factor]), typeRelations.map((row) => row.child_product_id)])
  if (memo.signature === signature) return none

  const nextUnits = pickRows(units, memo.units, typeUnits, hasUnit)
  const nextRelations = pickRows(relations, memo.relations, typeRelations, hasChild)
  const result = { memo: { typeId: String(itemType.id), signature, units: memo.units, relations: memo.relations }, applied: { units: 0, relations: 0 } }
  if (nextUnits) {
    result.units = nextUnits
    result.memo.units = nextUnits
    result.applied.units = nextUnits.length
  }
  if (nextRelations) {
    result.relations = nextRelations
    result.memo.relations = nextRelations
    result.applied.relations = nextRelations.length
  }
  return result
}
