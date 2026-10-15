/**
 * Lead won / lost helpers (2026-10-15). Pure, tested.
 */
const present = (value) => value !== undefined && value !== null && value !== ''

/** Payment types offered by the direct won (the deal's `custom_staged` is not part of this endpoint). */
export const DIRECT_WON_PAYMENT_TYPES = ['cash', 'installment', 'installment_no_interest']

export function leadIdOf(row) {
  const id = row?.lead?.id ?? row?.lead_id
  return present(id) ? id : null
}

export function leadNameOf(row) {
  return row?.lead?.name || row?.name || row?.lead?.phone || row?.phone || ''
}

/** `{ lost_reason_id, note }` — the reason is optional when the tenant has none defined. */
export function buildLostPayload({ reasonId, note } = {}) {
  const payload = { note: String(note || '').trim() }
  if (present(reasonId)) payload.lost_reason_id = Number(reasonId) || reasonId
  return payload
}

/**
 * Won lines prefilled from the lead's interests (one per product): quantity from the interest when the backend
 * returns it, unit price from the catalog product (else the interest's nested product).
 */
export function linesFromInterests(row, products = []) {
  const interests = [
    ...(Array.isArray(row?.interesteds) ? row.interesteds : []),
    ...(Array.isArray(row?.lead?.interesteds) ? row.lead.interesteds : []),
  ]
  const seen = new Set()
  return interests
    .filter((interest) => !(Number(interest?.is_lost) === 1))
    .map((interest) => {
      const productId = String(interest?.product_id ?? interest?.product?.id ?? '')
      if (!productId || seen.has(productId)) return null
      seen.add(productId)
      const product = products.find((item) => String(item.id) === productId)
      const price = product?.price ?? interest?.product?.price ?? ''
      return { product_id: productId, quantity: Number(interest?.quantity) || 1, unit_price: price === null ? '' : price, discount: 0 }
    })
    .filter(Boolean)
}
