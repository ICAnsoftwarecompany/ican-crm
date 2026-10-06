import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../api/productsApi'
import { extractList } from '../../../shared/utils/apiResponse'
import { extractEntity, flattenCatalogResponse, getProductKind, normalizeCatalogProduct } from '../utils/catalogNormalize'
import { catalogKeys } from './catalogQueryKeys'

function toCatalogRows(response) {
  const list = extractList(response, ['products'])
  return flattenCatalogResponse(list).map(({ raw, category }) => normalizeCatalogProduct(raw, category))
}

/**
 * Normalized catalog rows (2026-10-06). `params` go to `/product/data` (kind, item_type_id, category_id, status,
 * search); `kind` is also applied on the client because the old endpoint ignores it.
 */
export function useCatalogProducts(params = {}) {
  return useQuery({
    queryKey: catalogKeys.catalog(params),
    queryFn: () => productsApi.getProducts(params),
    select: (response) => {
      const rows = toCatalogRows(response)
      return params.kind ? rows.filter((row) => getProductKind(row.raw) === params.kind) : rows
    },
  })
}

export function useProductInfo(productId) {
  return useQuery({
    queryKey: catalogKeys.info(productId),
    queryFn: () => productsApi.getProductInfo(productId),
    enabled: Boolean(productId),
    select: (response) => {
      const raw = extractEntity(response)
      return raw && raw.id !== undefined ? normalizeCatalogProduct(raw) : null
    },
  })
}

export function useCatalogProductMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: catalogKeys.root })

  return {
    create: useMutation({ mutationFn: (payload) => productsApi.createProducts(payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => productsApi.updateProduct(id, payload), onSuccess: invalidate }),
  }
}
