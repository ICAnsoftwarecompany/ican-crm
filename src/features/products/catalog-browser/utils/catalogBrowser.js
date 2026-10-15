/**
 * Catalog browser filters (2026-10-15). Pure, tested. Input: normalized catalog products (`useCatalogProducts`).
 * Filters: kind (all / product / service / plan / bundle), item type (`'none'` = without a type), category name,
 * search (name, description, code, category, type), and inactive items hidden unless asked.
 */
export const BROWSER_KINDS = ['all', 'product', 'service', 'plan', 'bundle']

const norm = (value) => String(value ?? '').trim().toLowerCase()

export function itemTypeNameOf(product, itemTypes = []) {
  return product.itemType?.name || itemTypes.find((itemType) => String(itemType.id) === String(product.itemTypeId))?.name || ''
}

export function filterCatalog(products = [], { kind = 'all', itemTypeId = '', category = '', search = '', showInactive = false } = {}, itemTypes = []) {
  const query = norm(search)
  return products.filter((product) => {
    if (!showInactive && !product.status) return false
    if (kind !== 'all' && product.kind !== kind) return false
    if (itemTypeId === 'none' && product.itemTypeId) return false
    if (itemTypeId && itemTypeId !== 'none' && String(product.itemTypeId) !== String(itemTypeId)) return false
    if (category && norm(product.category?.name) !== norm(category)) return false
    if (!query) return true
    return [product.name, product.description, product.raw?.code, product.category?.name, itemTypeNameOf(product, itemTypes)]
      .some((value) => norm(value).includes(query))
  })
}

export function countKinds(products = []) {
  const counts = { all: products.length, product: 0, service: 0, plan: 0, bundle: 0 }
  products.forEach((product) => {
    if (product.kind in counts) counts[product.kind] += 1
  })
  return counts
}

/** Item types used by `products` (`[{ id, name }]`), `none` first when some have no type. */
export function itemTypeOptions(products = [], itemTypes = []) {
  const seen = new Map()
  let untyped = false
  products.forEach((product) => {
    if (!product.itemTypeId) {
      untyped = true
      return
    }
    const id = String(product.itemTypeId)
    if (!seen.has(id)) seen.set(id, itemTypeNameOf(product, itemTypes) || `#${id}`)
  })
  const typed = [...seen.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  return untyped ? [{ id: 'none', name: '' }, ...typed] : typed
}

export function categoryOptions(products = []) {
  const names = new Map()
  products.forEach((product) => {
    const name = product.category?.name
    if (name && !names.has(norm(name))) names.set(norm(name), name)
  })
  return [...names.values()].sort((a, b) => a.localeCompare(b))
}
