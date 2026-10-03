/**
 * Flattens the products endpoint tree (categories with `products`, `children`, `children_recursive`) into
 * product rows that KEEP the full product object (unit mode, stock, price, data), unlike
 * products/reports flattenCatalog which keeps display fields only.
 */
export function flattenCatalogProducts(nodes = [], category = '') {
  const rows = []
  const visit = (node, parentName) => {
    if (!node || typeof node !== 'object') return
    const nested = Array.isArray(node.products) ? node.products : []
    const children = [node.children_recursive, node.children].find(Array.isArray) || []
    const isCategory = nested.length > 0 || children.length > 0 || (node.price === undefined && node.category_id === undefined)
    if (!isCategory) {
      rows.push({ ...node, id: String(node.id), name: node.name || node.title || '', categoryName: parentName })
      return
    }
    const name = node.name || node.title || parentName
    nested.forEach((product) => rows.push({ ...product, id: String(product.id), name: product.name || product.title || '', categoryName: name }))
    children.forEach((child) => visit(child, name))
  }
  nodes.forEach((node) => visit(node, category))
  const seen = new Set()
  return rows.filter((row) => (seen.has(row.id) ? false : seen.add(row.id)))
}

export function isCatalogProductActive(product) {
  return Number(product?.status ?? product?.active ?? 1) === 1
}
