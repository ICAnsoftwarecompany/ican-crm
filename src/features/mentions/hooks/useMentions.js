import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { mentionsApi } from '../api/mentionsApi'
import { prioritizeQuery, queryPolicyOptions } from '../../../shared/query/queryPolicy'

const keys = QUERY_KEYS.mentions

export function useMentionTypes(options = {}) {
  const { priority = 'supporting', ...queryOptions } = options
  return useQuery({
    ...queryPolicyOptions(priority, queryOptions),
    queryKey: keys.types,
    queryFn: prioritizeQuery(mentionsApi.getTypes, priority),
    staleTime: 300_000,
  })
}

export function useMyMentions(params = {}, options = {}) {
  const { priority = 'page', ...queryOptions } = options
  return useQuery({
    ...queryPolicyOptions(priority, queryOptions),
    queryKey: keys.mine(params),
    queryFn: prioritizeQuery(() => mentionsApi.getMine(params), priority),
  })
}

export function useSentMentions(params = {}, options = {}) {
  const { priority = 'page', ...queryOptions } = options
  return useQuery({
    ...queryPolicyOptions(priority, queryOptions),
    queryKey: keys.sent(params),
    queryFn: prioritizeQuery(() => mentionsApi.getSent(params), priority),
  })
}

export function useUnseenMentionCount(options = {}) {
  const { priority = 'background', ...queryOptions } = options
  return useQuery({
    ...queryPolicyOptions(priority, queryOptions),
    queryKey: keys.unseenCount,
    queryFn: prioritizeQuery(mentionsApi.getUnseenCount, priority),
  })
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
