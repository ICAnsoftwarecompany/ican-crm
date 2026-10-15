/**
 * Items of the products dialog (2026-10-15): `{ product, view }` — `product` is the legacy normalized product
 * (still what ProductInfoDialog reads), `view` the catalog-aware display model from `features/leads`.
 */
export const DIALOG_KINDS = ['product', 'service', 'plan', 'bundle']

export function countKinds(items = []) {
  const counts = { product: 0, service: 0, plan: 0, bundle: 0 }
  items.forEach(({ view }) => {
    if (view.kind in counts) counts[view.kind] += 1
  })
  return counts
}

const normalize = (value) => String(value ?? '').trim().toLowerCase()

function searchText({ product, view }) {
  const dataItems = Array.isArray(product?.dataItems) ? product.dataItems : []
  return [
    view.name, view.description, view.note, view.categoryName, view.itemTypeName, view.price, view.productId, product?.code,
    ...dataItems.flatMap((item) => Object.entries(item || {}).flat()),
  ].map(normalize).filter(Boolean).join(' ')
}

export function filterDialogItems(items = [], { kind = 'all', category = '', search = '' } = {}) {
  const query = normalize(search)
  const categoryKey = normalize(category)
  return items.filter((item) => {
    if (kind !== 'all' && item.view.kind !== kind) return false
    if (categoryKey && normalize(item.view.categoryName) !== categoryKey) return false
    return !query || searchText(item).includes(query)
  })
}

export function categoryOptions(items = []) {
  const names = new Map()
  items.forEach(({ view }) => {
    if (view.categoryName && !names.has(normalize(view.categoryName))) names.set(normalize(view.categoryName), view.categoryName)
  })
  return [...names.values()].sort((a, b) => a.localeCompare(b))
}
