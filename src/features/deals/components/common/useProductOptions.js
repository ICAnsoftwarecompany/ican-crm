import { useMemo } from 'react'
import { flattenCatalog, useProducts } from '../../../products'
import { useDealProducts } from '../../hooks/useDealResources'

/** id → price for every product in the catalog tree (flattenCatalog keeps names, not prices). */
function collectPrices(nodes, map = new Map()) {
  nodes.forEach((node) => {
    if (node?.price !== undefined && node?.price !== null) map.set(String(node.id), node.price)
    ;[node?.products, node?.children, node?.children_recursive].forEach((list) => Array.isArray(list) && collectPrices(list, map))
  })
  return map
}

/**
 * Products offered in the deal's pickers: the deal's own products first; when the deal has none, the whole
 * catalog (so a sale is never blocked). `{ options: [{ id, name, price }], fromDeal, isLoading }`.
 */
export function useProductOptions(dealId) {
  const dealProducts = useDealProducts(dealId)
  const catalog = useProducts()
  return useMemo(() => {
    if (dealProducts.products.length) {
      return { options: dealProducts.products.map((product) => ({ id: String(product.id), name: product.name, price: product.price })), fromDeal: true, isLoading: dealProducts.isLoading }
    }
    const tree = Array.isArray(catalog.data) ? catalog.data : []
    const rows = flattenCatalog(tree)
    const byId = collectPrices(tree)
    return {
      options: rows.filter((row) => row.active).map((row) => ({ id: String(row.id), name: row.name, price: byId.get(String(row.id)) ?? null })),
      fromDeal: false,
      isLoading: dealProducts.isLoading || catalog.isLoading,
    }
  }, [catalog.data, catalog.isLoading, dealProducts.isLoading, dealProducts.products])
}
