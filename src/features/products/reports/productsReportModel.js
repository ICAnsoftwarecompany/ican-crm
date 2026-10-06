/**
 * Pure model of the Products & Services report (added 2026-10-01). The products endpoint returns a
 * catalog tree (categories with `products` and `children`/`children_recursive`); this flattens it
 * into one row per product or service, mirroring the rules the products page uses.
 */
import { countBy, filterByRange } from '../../../shared/components/reports'

const childrenOf = (node) => (Array.isArray(node?.children_recursive) ? node.children_recursive : Array.isArray(node?.children) ? node.children : [])
const isActive = (item) => Number(item?.status ?? item?.active ?? 1) === 1
// `kind` replaced `type` in the catalog API (2026-10-06); the old field stays as a fallback.
const typeOf = (item, inherited = '') => String(item?.kind ?? item?.type ?? '').trim().toLowerCase() || inherited
const categoryLabel = (category) => category?.name || category?.title || ''

/** @returns {{ id, name, type: string, active: boolean, category: string, createdAt: string|null }[]} */
export function flattenCatalog(items = []) {
  const rows = []

  const visit = (node, parent = null, inheritedType = '') => {
    const nodeType = typeOf(node, inheritedType)
    const nested = Array.isArray(node?.products) ? node.products : []
    const children = childrenOf(node)

    nested.forEach((product) => {
      rows.push({
        id: product.id,
        name: product.name || product.title || '',
        type: typeOf(product, nodeType),
        active: isActive(product) && isActive(node),
        category: categoryLabel(product.category || product.categroy || node),
        createdAt: product.created_at || null,
      })
    })

    if (!nested.length && !children.length && parent !== undefined && (node?.price !== undefined || node?.category_id !== undefined || node?.kind !== undefined)) {
      rows.push({
        id: node.id,
        name: node.name || node.title || '',
        type: nodeType,
        active: isActive(node),
        category: categoryLabel(node.category || node.categroy || parent),
        createdAt: node.created_at || null,
      })
    }

    children.forEach((child) => visit(child, node, nodeType))
  }

  items.forEach((item) => visit(item, null))
  return rows
}

export function buildProductsReport(rows = [], range) {
  const added = filterByRange(rows, (row) => row.createdAt, range)
  return {
    total: rows.length,
    active: rows.filter((row) => row.active).length,
    inactive: rows.filter((row) => !row.active).length,
    added: added.length,
    categories: new Set(rows.map((row) => row.category).filter(Boolean)).size,
    byCategory: countBy(rows, (row) => row.category),
    byType: countBy(rows, (row) => row.type),
    byStatus: countBy(rows, (row) => (row.active ? 'active' : 'inactive')),
    addedRows: added,
  }
}
