import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { itemTypesApi, unitsApi } from '../api/catalogApi'
import { extractList } from '../../../shared/utils/apiResponse'
import { normalizeItemType, normalizeUnit } from '../utils/catalogNormalize'
import { catalogKeys } from './catalogQueryKeys'

/** Item types (kind, status, search filters). Added 2026-10-06. */
export function useItemTypes(params = {}) {
  return useQuery({
    queryKey: catalogKeys.itemTypes(params),
    queryFn: () => itemTypesApi.list(params),
    select: (response) => extractList(response, ['item_types', 'itemTypes']).map(normalizeItemType),
  })
}

export function useItemTypeMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: catalogKeys.root })

  return {
    create: useMutation({ mutationFn: (payload) => itemTypesApi.create(payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => itemTypesApi.update(id, payload), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id) => itemTypesApi.remove(id), onSuccess: invalidate }),
  }
}

/** Units of measure (type, status, search filters). Added 2026-10-06. */
export function useUnits(params = {}) {
  return useQuery({
    queryKey: catalogKeys.units(params),
    queryFn: () => unitsApi.list(params),
    select: (response) => extractList(response, ['units']).map(normalizeUnit),
  })
}

export function useUnitMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: catalogKeys.root })

  return {
    create: useMutation({ mutationFn: (payload) => unitsApi.create(payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => unitsApi.update(id, payload), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id) => unitsApi.remove(id), onSuccess: invalidate }),
  }
}
