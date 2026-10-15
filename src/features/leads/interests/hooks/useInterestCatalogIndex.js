import { useMemo } from 'react'
import { useCatalogProducts, useItemTypes } from '../../../products'
import { buildCatalogIndex } from '../utils/interestView'

/**
 * Catalog index for showing interests (2026-10-15): `Map<productId, { product, itemType, profile }>`. Both
 * queries are shared React Query caches, so every table cell / timeline item reuses the same request.
 */
export function useInterestCatalogIndex() {
  const productsQuery = useCatalogProducts()
  const itemTypesQuery = useItemTypes()
  const index = useMemo(
    () => buildCatalogIndex(productsQuery.data || [], itemTypesQuery.data || []),
    [itemTypesQuery.data, productsQuery.data]
  )
  return { index, products: productsQuery.data || [], isLoading: productsQuery.isLoading, error: productsQuery.error, refetch: productsQuery.refetch }
}
