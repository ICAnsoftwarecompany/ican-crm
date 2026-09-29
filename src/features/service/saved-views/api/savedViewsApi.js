import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('savedViews')
const unwrap = (response) => response.data?.data ?? response.data

/**
 * Saved views (core `CRUD /saved-views`, filtered by `entity`).
 * View: { id, entity, name, filters: {...}, visibility: 'private' | 'shared', owner_id }.
 * The server returns only views the user may see and enforces who may edit/delete.
 */
export function useSavedViews(entity) {
  return useQuery({
    queryKey: serviceKeys.savedViews(entity),
    queryFn: async () => unwrap(await api.get(serviceEndpoints.savedViews, { params: { entity } })) || [],
    staleTime: 5 * 60 * 1000,
  })
}

export function useSavedViewMutations(entity) {
  const queryClient = useQueryClient()
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: serviceKeys.savedViews(entity) })
  return {
    create: useMutation({ mutationFn: async (payload) => unwrap(await api.post(serviceEndpoints.savedViews, { entity, ...payload })), onSuccess }),
    remove: useMutation({
      mutationFn: async (viewId) => {
        await api.delete(`${serviceEndpoints.savedViews}/${viewId}`)
        return viewId
      },
      onSuccess,
    }),
  }
}
