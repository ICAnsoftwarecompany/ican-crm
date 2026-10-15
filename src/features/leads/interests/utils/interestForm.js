/**
 * Lead interest form ⇄ request (2026-10-15). Pure, tested.
 *
 * Request: the existing `POST /api/tenant/interesteds/save` (and `/edite`), same shape as before —
 * `{ lead_id, interesteds: [{ product_id, note, interest_level }] }`. The structured fields of the new catalog are
 * added to the same item and only when they apply: `quantity`, `product_unit_id`, `item_instance_ids`,
 * `preferred_date`, `participants`, `optional_product_ids`, `item_type_id`, `estimated_value`.
 * Until the backend stores them (docs/backend/BACKEND-REQUESTS.md §E1) only product, level and note are kept.
 */

export const INTEREST_LEVELS = ['high', 'medium', 'low']

export const EMPTY_INTEREST_FORM = {
  productId: '',
  level: 'high',
  note: '',
  quantity: '1',
  productUnitId: '',
  instanceIds: [],
  preferredDate: '',
  participants: '',
  optionalIds: [],
}

const blank = (value) => value === undefined || value === null || value === ''
const toNumber = (value) => {
  if (blank(value)) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/** An id list from an array, a JSON string or a comma list. */
export function toIdList(value) {
  if (Array.isArray(value)) return value.filter((item) => !blank(item)).map(String)
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.filter((item) => !blank(item)).map(String)
  } catch {
    // not JSON: comma list
  }
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

/** Form from a saved interest (edit). Reads the old fields and, when the backend returns them, the new ones. */
export function interestToForm(interest) {
  if (!interest) return { ...EMPTY_INTEREST_FORM }
  const level = String(interest.interest_level || '').toLowerCase()
  return {
    ...EMPTY_INTEREST_FORM,
    productId: String(interest.product_id ?? interest.product?.id ?? interest.products?.id ?? ''),
    level: level === 'hight' ? 'high' : INTEREST_LEVELS.includes(level) ? level : 'high',
    note: interest.note ?? interest.notes ?? '',
    quantity: blank(interest.quantity) ? '1' : String(interest.quantity),
    productUnitId: blank(interest.product_unit_id) ? '' : String(interest.product_unit_id),
    instanceIds: toIdList(interest.item_instance_ids),
    preferredDate: interest.preferred_date ? String(interest.preferred_date).slice(0, 10) : '',
    participants: blank(interest.participants) ? '' : String(interest.participants),
    optionalIds: toIdList(interest.optional_product_ids),
  }
}

/** Unit price: the product unit's own price, else the product price × the unit factor; base unit = product price. */
export function unitPrice(product, unit) {
  const price = toNumber(product?.price)
  if (!unit) return price
  const own = toNumber(unit.price)
  if (own !== null) return own
  const factor = toNumber(unit.factor)
  return price === null ? null : price * (factor || 1)
}

/** Price of an attached item: its override, else the child's price; `null` when unknown. */
export function relationPrice(relation) {
  const override = toNumber(relation?.priceOverride)
  return override !== null ? override : toNumber(relation?.childPrice)
}

/**
 * `{ base, extras, total }` — what this interest is worth. `base` = unit price × quantity (× people for services
 * priced per person, 1 for plans and unique pieces); `extras` = chosen optional attached items. `null` values when the price is unknown.
 */
export function estimateInterest({ product, profile, form, units = [], relations = [] }) {
  if (!product || !profile) return { base: null, extras: 0, total: null }
  const unit = profile.units && form.productUnitId ? units.find((item) => String(item.id) === String(form.productUnitId)) : null
  const price = unitPrice(product, unit)
  const quantity = profile.quantity
    ? Math.max(toNumber(form.quantity) || 0, 0)
    : profile.perPerson ? Math.max(toNumber(form.participants) || 1, 1) : 1
  const base = price === null ? null : price * quantity
  const extras = relations
    .filter((relation) => relation.inclusion === 'optional' && form.optionalIds.includes(String(relation.childProductId)))
    .reduce((sum, relation) => sum + (relationPrice(relation) || 0) * (toNumber(relation.quantity) || 1), 0)
  return { base, extras, total: base === null ? null : base + extras }
}

/** Errors as `{ field: messageKey }` (keys under `leads.interestDialog.errors`). */
export function validateInterestForm(form, profile) {
  const errors = {}
  if (!form.productId) errors.productId = 'chooseProduct'
  if (!profile) return errors
  if (profile.quantity) {
    const quantity = toNumber(form.quantity)
    if (quantity === null || quantity <= 0) errors.quantity = 'quantity'
  }
  if (profile.participants && !blank(form.participants)) {
    const count = toNumber(form.participants)
    const { min, max } = profile.participants
    if (count === null || count < 1) errors.participants = 'participants'
    else if (min !== null && count < min) errors.participants = 'participantsMin'
    else if (max !== null && count > max) errors.participants = 'participantsMax'
  }
  return errors
}

/** The save / edit request body. */
export function buildInterestPayload({ leadId, form, product, profile, interestId = null, estimate = null }) {
  const item = {
    product_id: Number(form.productId),
    note: String(form.note || '').trim(),
    interest_level: form.level || 'high',
  }
  if (product?.itemTypeId) item.item_type_id = Number(product.itemTypeId) || product.itemTypeId
  if (profile?.quantity) item.quantity = toNumber(form.quantity) || 1
  if (profile?.units && form.productUnitId) item.product_unit_id = Number(form.productUnitId) || form.productUnitId
  if (profile?.candidates && form.instanceIds.length) item.item_instance_ids = form.instanceIds.map((id) => Number(id) || id)
  if (profile?.schedule && form.preferredDate) item.preferred_date = form.preferredDate
  if (profile?.participants && !blank(form.participants)) item.participants = toNumber(form.participants)
  if (form.optionalIds.length) item.optional_product_ids = form.optionalIds.map((id) => Number(id) || id)
  if (estimate?.total !== null && estimate?.total !== undefined) item.estimated_value = estimate.total

  const payload = { lead_id: Number(leadId), interesteds: [interestId ? { ...item, id: interestId } : item] }
  return interestId ? { ...payload, id: interestId } : payload
}
