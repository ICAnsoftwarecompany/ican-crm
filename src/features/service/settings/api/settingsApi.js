import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('settings')
const unwrap = (response) => response.data?.data ?? response.data

/** Plain CRUD over one configuration resource endpoint. */
export function createResourceApi(endpoint) {
  return {
    list: async () => unwrap(await api.get(endpoint)) || [],
    create: async (payload) => unwrap(await api.post(endpoint, payload)),
    update: async (id, payload) => unwrap(await api.patch(`${endpoint}/${id}`, payload)),
    remove: async (id) => {
      await api.delete(`${endpoint}/${id}`)
      return id
    },
  }
}

/** @param {{ key: string, endpoint: string }} resource */
export function useResourceList(resource, options = {}) {
  return useQuery({
    queryKey: serviceKeys.settings(resource.key),
    queryFn: () => createResourceApi(resource.endpoint).list(),
    staleTime: 60 * 1000,
    ...options,
  })
}

/**
 * Create / update / delete for a resource. Also invalidates whatever the
 * resource feeds (e.g. case types and queues feed the case setup).
 */
export function useResourceMutations(resource) {
  const queryClient = useQueryClient()
  const resourceApi = createResourceApi(resource.endpoint)
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: serviceKeys.settings(resource.key) })
    ;(resource.invalidates || []).forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
  }
  return {
    create: useMutation({ mutationFn: resourceApi.create, onSuccess }),
    update: useMutation({ mutationFn: ({ id, ...payload }) => resourceApi.update(id, payload), onSuccess }),
    remove: useMutation({ mutationFn: resourceApi.remove, onSuccess }),
  }
}
