import { useMemo } from 'react'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useDealProducts } from '../../hooks/useDealResources'
import { getLineRules, resolveDealProductMode } from '../../utils/dealProductMode'

/**
 * Products offered in the deal's line editors + how the deal sells them:
 * `{ options, products, mode, rules, isLoading }`. With products on the deal only those are offered and the
 * mode follows them (one piece / one product in units / several); with none, the whole catalog (`open`).
 */
export function useProductOptions(dealId) {
  const dealProducts = useDealProducts(dealId)
  const catalog = useCatalogProducts()
  return useMemo(() => {
    const products = dealProducts.products.map((product) => ({ ...product, id: String(product.id) }))
    const mode = resolveDealProductMode(products)
    return {
      options: products.length ? products : catalog.products,
      products,
      mode,
      rules: getLineRules(mode, products),
      isLoading: dealProducts.isLoading || catalog.isLoading,
    }
  }, [catalog.isLoading, catalog.products, dealProducts.isLoading, dealProducts.products])
}
