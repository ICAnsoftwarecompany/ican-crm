import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { mentionsApi } from '../api/mentionsApi'

const keys = QUERY_KEYS.mentions

export function useMentionTypes(options = {}) {
  return useQuery({ queryKey: keys.types, queryFn: mentionsApi.getTypes, staleTime: 300_000, ...options })
}

export function useMyMentions(params = {}, options = {}) {
  return useQuery({ queryKey: keys.mine(params), queryFn: () => mentionsApi.getMine(params), ...options })
}

export function useSentMentions(params = {}, options = {}) {
  return useQuery({ queryKey: keys.sent(params), queryFn: () => mentionsApi.getSent(params), ...options })
}

export function useUnseenMentionCount(options = {}) {
  return useQuery({ queryKey: keys.unseenCount, queryFn: mentionsApi.getUnseenCount, ...options })
}

export function useEntityMentions(entityType, entityId, options = {}) {
  return useQuery({
    queryKey: keys.entity(entityType, entityId),
    queryFn: () => mentionsApi.getEntity(entityType, entityId),
    enabled: Boolean(entityType && entityId != null && entityId !== '') && (options.enabled ?? true),
    ...options,
  })
}

function useMentionMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  })
}

export function useCreateMention() {
  return useMentionMutation(mentionsApi.create)
}

export function useMarkMentionSeen() {
  return useMentionMutation(mentionsApi.markSeen)
}

export function useMarkManyMentionsSeen() {
  return useMentionMutation(mentionsApi.markManySeen)
}

export function useRemoveMention() {
  return useMentionMutation(mentionsApi.remove)
}
