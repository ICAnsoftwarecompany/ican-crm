import { useMemo } from 'react'
import { useProducts } from '../../products'
import { flattenCatalogProducts, isCatalogProductActive } from '../utils/catalog'

/** Active catalog products with their full data (for pickers and the product mode). */
export function useCatalogProducts() {
  const query = useProducts()
  const products = useMemo(
    () => flattenCatalogProducts(Array.isArray(query.data) ? query.data : []).filter(isCatalogProductActive),
    [query.data]
  )
  return { products, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
}
