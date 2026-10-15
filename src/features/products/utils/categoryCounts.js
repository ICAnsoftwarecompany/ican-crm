/**
 * Active categories per category type (2026-10-15): `{ product, service }`. Plans and bundles use product categories
 * (see categoryTypeForKind). `categories` = the flattened tree (flattenCategoryTree). Pure, tested.
 */
export function countCategoriesByType(categories = []) {
  return categories.reduce((counts, category) => {
    const active = Number(category.status ?? category.active ?? 1) === 1
    if (!active) return counts
    const type = category.type === 'service' ? 'service' : 'product'
    return { ...counts, [type]: counts[type] + 1 }
  }, { product: 0, service: 0 })
}
