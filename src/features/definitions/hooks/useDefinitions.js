import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { definitionsApi } from '../api/definitionsApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useStatuses(params) {
  return useQuery({
    queryKey: [...QUERY_KEYS.statuses.list, params],
    queryFn: () => definitionsApi.getStatuses(params),
    select: (data) => extractList(data, ['statuses', 'status']),
  })
}

export function useTags(params) {
  return useQuery({
    queryKey: [...QUERY_KEYS.tags.list, params],
    queryFn: () => definitionsApi.getTags(params),
    select: (data) => extractList(data, ['tags']),
  })
}

export function useDefinitionMutations() {
  const queryClient = useQueryClient()

  return {
    createStatus: useMutation({
      mutationFn: definitionsApi.createStatus,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statuses.all }),
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, payload }) => definitionsApi.updateStatus(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statuses.all }),
    }),
    createTag: useMutation({
      mutationFn: definitionsApi.createTag,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags.all }),
    }),
    updateTag: useMutation({
      mutationFn: ({ id, payload }) => definitionsApi.updateTag(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tags.all }),
    }),
  }
}
