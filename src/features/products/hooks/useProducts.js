import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api/categoriesApi'
import { productsApi } from '../api/productsApi'
import { linkProductsApi } from '../api/linkProductsApi'
import { extractList } from '../../../shared/utils/apiResponse'

function findEntityArray(value, acceptedKeys, depth = 0) {
  if (depth > 5 || value === null || value === undefined) return []
  if (Array.isArray(value)) {
    return value.some((item) => item && typeof item === 'object' && acceptedKeys.some((key) => key in item))
      ? value
      : []
  }
  if (typeof value !== 'object') return []

  for (const item of Object.values(value)) {
    const result = findEntityArray(item, acceptedKeys, depth + 1)
    if (result.length) return result
  }

  return []
}

function extractProductsList(response) {
  const directList = extractList(response, ['products'])
  if (directList.length) return directList
  return findEntityArray(response?.data ?? response, ['id', 'name', 'price', 'category_id'])
}

function extractCategoriesList(response) {
  const directList = extractList(response, ['categories'])
  if (directList.length) return directList
  return findEntityArray(response?.data ?? response, ['id', 'name'])
}

export function useProductCategories() {
  return useQuery({
    queryKey: ['product-categories', 'list'],
    queryFn: () => categoriesApi.getCategories(),
    select: extractCategoriesList,
  })
}

export function useProducts() {
  return useQuery({
    queryKey: ['products', 'list'],
    queryFn: () => productsApi.getProducts(),
    select: extractProductsList,
  })
}

export function useProductMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['product-categories'] })
  }

  return {
    createCategory: useMutation({ mutationFn: categoriesApi.createCategory, onSuccess: invalidate }),
    updateCategory: useMutation({
      mutationFn: ({ id, payload }) => categoriesApi.updateCategory(id, payload),
      onSuccess: invalidate,
    }),
    createProduct: useMutation({ mutationFn: productsApi.createProduct, onSuccess: invalidate }),
    updateProduct: useMutation({
      mutationFn: ({ id, payload }) => productsApi.updateProduct(id, payload),
      onSuccess: invalidate,
    }),
    linkProduct: useMutation({ mutationFn: linkProductsApi.save, onSuccess: invalidate }),
    updateLinkStatus: useMutation({ mutationFn: linkProductsApi.updateStatus, onSuccess: invalidate }),
  }
}
