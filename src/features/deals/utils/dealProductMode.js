/**
 * How a deal sells its products — decides how the workspace shows lines, quantities and stock.
 *
 * Per product (`getProductUnitMode`), read from the product data the backend returns:
 * - `unique`  one physical piece (a villa, a specific car): quantity is always 1 and it can be won once.
 * - `units`   several identical units (5 cars of the same spec): quantity 1..available units.
 * - `service` no stock (subscription, consultation): any quantity.
 * Fields read (first found): `unit_mode` | `data.unit_mode`, and `available_units` | `stock` | `quantity` |
 * `data.available_units` (proposed backend contract, docs/deals §9.10). Without them a product counts as `units`
 * with an unknown stock, so nothing is blocked.
 *
 * Per deal (`resolveDealProductMode`), from the deal's products:
 * - `open`           no products on the deal yet → any catalog product.
 * - `single_unit`    one `unique` product → one fixed line, quantity 1, one win.
 * - `single_product` one product with units / service → one fixed line, quantity editable.
 * - `multi_product`  several products → free lines limited to the deal's products.
 */

export const PRODUCT_UNIT_MODES = ['unique', 'units', 'service']
export const DEAL_PRODUCT_MODES = ['open', 'single_unit', 'single_product', 'multi_product']

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function productData(product) {
  const data = product?.data
  if (data && typeof data === 'object') return data
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

/** Available units of a product, or null when the backend does not say. */
export function getProductUnits(product) {
  const data = productData(product)
  return [product?.available_units, product?.stock, product?.quantity, data.available_units, data.stock]
    .map(toNumberOrNull)
    .find((value) => value !== null) ?? null
}

export function getProductUnitMode(product) {
  const data = productData(product)
  const explicit = String(product?.unit_mode ?? data.unit_mode ?? '').trim().toLowerCase()
  if (PRODUCT_UNIT_MODES.includes(explicit)) return explicit
  if (String(product?.type ?? '').toLowerCase() === 'service') return 'service'
  return getProductUnits(product) === 1 ? 'unique' : 'units'
}

export function resolveDealProductMode(products = []) {
  if (!products.length) return 'open'
  if (products.length > 1) return 'multi_product'
  return getProductUnitMode(products[0]) === 'unique' ? 'single_unit' : 'single_product'
}

/**
 * Line rules for the won dialog / lead products editor in this mode.
 * `{ lockedProduct, allowAddLines, fixedQuantity, maxQuantity }`
 */
export function getLineRules(mode, products = []) {
  if (mode === 'single_unit') return { lockedProduct: products[0] || null, allowAddLines: false, fixedQuantity: 1, maxQuantity: 1 }
  if (mode === 'single_product') {
    const units = getProductUnits(products[0])
    return { lockedProduct: products[0] || null, allowAddLines: false, fixedQuantity: null, maxQuantity: getProductUnitMode(products[0]) === 'service' ? null : units }
  }
  return { lockedProduct: null, allowAddLines: true, fixedQuantity: null, maxQuantity: null }
}

/** A `single_unit` deal can be won once: true when a lead of the deal is already won. */
export function isUniqueUnitTaken(mode, leads = []) {
  return mode === 'single_unit' && leads.some((lead) => lead.status === 'won')
}
