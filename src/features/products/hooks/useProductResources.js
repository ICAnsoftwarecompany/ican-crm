import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productInstancesApi, productRelationsApi, productUnitsApi } from '../api/catalogApi'
import { extractList } from '../../../shared/utils/apiResponse'
import { normalizeInstance, normalizeProductUnit, normalizeRelation } from '../utils/catalogNormalize'
import { catalogKeys } from './catalogQueryKeys'

/** Units, relations and instances of products (added 2026-10-06). */

export function useProductUnits(productId) {
  return useQuery({
    queryKey: catalogKeys.productUnits(productId),
    queryFn: () => productUnitsApi.list(productId),
    enabled: Boolean(productId),
    select: (response) => extractList(response, ['units', 'product_units']).map(normalizeProductUnit),
  })
}

export function useProductUnitMutations(productId) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: catalogKeys.root })

  return {
    add: useMutation({ mutationFn: (payload) => productUnitsApi.add(productId, payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => productUnitsApi.update(id, payload), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id) => productUnitsApi.remove(id), onSuccess: invalidate }),
  }
}

export function useProductRelations(productId) {
  return useQuery({
    queryKey: catalogKeys.relations(productId),
    queryFn: () => productRelationsApi.list(productId),
    enabled: Boolean(productId),
    select: (response) => extractList(response, ['relations']).map(normalizeRelation).sort((a, b) => a.sortOrder - b.sortOrder),
  })
}

export function useProductRelationMutations(productId) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: catalogKeys.root })

  return {
    add: useMutation({ mutationFn: (payload) => productRelationsApi.add(productId, payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => productRelationsApi.update(id, payload), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id) => productRelationsApi.remove(id), onSuccess: invalidate }),
  }
}

/** Instances list; pass `product_id` for one product. Empty filter values are not sent. */
export function useProductInstances(params = {}, { enabled = true } = {}) {
  const cleanParams = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
  return useQuery({
    queryKey: catalogKeys.instances(cleanParams),
    queryFn: () => productInstancesApi.list(cleanParams),
    enabled,
    select: (response) => extractList(response, ['instances']).map(normalizeInstance),
  })
}

export function useProductInstanceMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: catalogKeys.root })

  return {
    create: useMutation({ mutationFn: ({ productId, instances }) => productInstancesApi.create(productId, instances), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => productInstancesApi.update(id, payload), onSuccess: invalidate }),
    void: useMutation({ mutationFn: (id) => productInstancesApi.void(id), onSuccess: invalidate }),
    restore: useMutation({ mutationFn: (id) => productInstancesApi.restore(id), onSuccess: invalidate }),
  }
}
