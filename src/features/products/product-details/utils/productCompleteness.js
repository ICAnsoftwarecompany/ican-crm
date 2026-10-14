/**
 * How complete a product / service is (2026-10-15). Pure, tested.
 *
 * Six checks, equal weight, the same for products and services: name, price, category, item type, description,
 * image. `score` = % done; `level` = complete (100) · good (≥ 67) · low. `missing` lists the keys the
 * "complete data" guide walks through (in its order).
 */
export const COMPLETENESS_CHECKS = ['name', 'price', 'itemType', 'category', 'description', 'image']

const filled = (value) => value !== undefined && value !== null && String(value).trim() !== ''

const RULES = {
  name: (product) => filled(product.name),
  price: (product) => product.price !== null && product.price !== undefined && !Number.isNaN(Number(product.price)),
  itemType: (product) => filled(product.itemTypeId),
  category: (product) => filled(product.categoryId),
  description: (product) => filled(product.description),
  image: (product) => filled(product.image),
}

export function productCompleteness(product = {}) {
  const missing = COMPLETENESS_CHECKS.filter((key) => !RULES[key](product))
  const done = COMPLETENESS_CHECKS.length - missing.length
  const score = Math.round((done / COMPLETENESS_CHECKS.length) * 100)
  return { score, done, total: COMPLETENESS_CHECKS.length, missing, level: score === 100 ? 'complete' : score >= 67 ? 'good' : 'low' }
}
