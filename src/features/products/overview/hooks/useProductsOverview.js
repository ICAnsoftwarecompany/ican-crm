import { useMemo } from 'react'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useItemTypes } from '../../hooks/useCatalogSetup'
import { useProductCategories } from '../../hooks/useProducts'
import { flattenCategoryTree } from '../../utils/categoryTree'
import { buildProductsOverview } from '../utils/overviewModel'

/** Data of `/products/overview` (2026-10-15): the catalog, item types and categories → buildProductsOverview. */
export function useProductsOverview() {
  const productsQuery = useCatalogProducts()
  const itemTypesQuery = useItemTypes()
  const categoriesQuery = useProductCategories()
  const data = useMemo(() => buildProductsOverview({
    products: productsQuery.data || [],
    itemTypes: itemTypesQuery.data || [],
    categories: flattenCategoryTree(categoriesQuery.data || []),
  }), [categoriesQuery.data, itemTypesQuery.data, productsQuery.data])
  return {
    data,
    isLoading: productsQuery.isLoading || itemTypesQuery.isLoading,
    error: productsQuery.error || itemTypesQuery.error,
    isFetching: productsQuery.isFetching || itemTypesQuery.isFetching || categoriesQuery.isFetching,
    refetch: () => Promise.all([productsQuery.refetch(), itemTypesQuery.refetch(), categoriesQuery.refetch()]),
  }
}
