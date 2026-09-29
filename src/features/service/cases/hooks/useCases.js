import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { casesApi } from '../api/casesApi'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const PAGE_SIZE = 25

/** Tenant case configuration: types + pipelines, queues, agents, resolution codes. */
export function useCaseSetup() {
  return useQuery({ queryKey: serviceKeys.caseSetup(), queryFn: casesApi.setup, staleTime: 5 * 60 * 1000 })
}

/** Counts per built-in view. */
export function useCaseSummary() {
  return useQuery({ queryKey: serviceKeys.caseSummary(), queryFn: casesApi.summary, staleTime: 30 * 1000 })
}

/**
 * Paged case list (server-side view + search). Pages are appended as the
 * table scrolls — pass `hasNextPage` / `fetchNextPage` to DataTable.
 */
export function useCaseList(params) {
  const query = useInfiniteQuery({
    queryKey: serviceKeys.caseList(params),
    queryFn: ({ pageParam }) => casesApi.list({ ...params, page: pageParam, per_page: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta
      return meta && meta.current_page < meta.last_page ? meta.current_page + 1 : undefined
    },
  })
  const cases = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) ?? [], [query.data])
  const total = query.data?.pages?.[0]?.meta?.total ?? 0
  return { ...query, cases, total }
}

export function useCase(caseId) {
  return useQuery({
    queryKey: serviceKeys.caseDetail(caseId),
    queryFn: () => casesApi.get(caseId),
    enabled: Boolean(caseId),
  })
}

export function useCaseActivities(caseId) {
  return useQuery({
    queryKey: serviceKeys.caseActivities(caseId),
    queryFn: () => casesApi.activities(caseId),
    enabled: Boolean(caseId),
  })
}

/**
 * All case writes. Every mutation refreshes the case, its activities and the
 * lists/summary; errors surface as translated toasts (409/422 included).
 */
export function useCaseMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const refresh = (caseItem) => {
    if (caseItem?.id) {
      queryClient.setQueryData(serviceKeys.caseDetail(caseItem.id), caseItem)
      queryClient.invalidateQueries({ queryKey: serviceKeys.caseActivities(caseItem.id) })
    }
    queryClient.invalidateQueries({ queryKey: [...serviceKeys.cases(), 'list'] })
    queryClient.invalidateQueries({ queryKey: serviceKeys.caseSummary() })
    queryClient.invalidateQueries({ queryKey: serviceKeys.myWork() })
  }

  const onError = (error) => {
    toast.error(getServiceErrorMessage(error, t))
    const caseId = /** @type {any} */ (error)?.config?.url?.match(/cases\/([^/]+)/)?.[1]
    if (error?.response?.status === 409 && caseId) {
      queryClient.invalidateQueries({ queryKey: serviceKeys.caseDetail(caseId) })
    }
  }

  const create = useMutation({
    mutationFn: (payload) => (payload.conversation_id ? casesApi.createFromConversation(payload) : casesApi.create(payload)),
    onSuccess: refresh,
  })
  const update = useMutation({ mutationFn: ({ caseId, ...payload }) => casesApi.update(caseId, payload), onSuccess: refresh, onError })
  const transition = useMutation({ mutationFn: ({ caseId, ...payload }) => casesApi.transition(caseId, payload), onSuccess: refresh })
  const assign = useMutation({ mutationFn: ({ caseId, ...payload }) => casesApi.assign(caseId, payload), onSuccess: refresh, onError })

  const activityRefresh = (_, { caseId }) => {
    queryClient.invalidateQueries({ queryKey: serviceKeys.caseActivities(caseId) })
    queryClient.invalidateQueries({ queryKey: serviceKeys.caseDetail(caseId) })
  }
  const reply = useMutation({ mutationFn: ({ caseId, body }) => casesApi.reply(caseId, { body }), onSuccess: activityRefresh, onError })
  const addNote = useMutation({ mutationFn: ({ caseId, body }) => casesApi.addNote(caseId, { body }), onSuccess: activityRefresh, onError })

  return { create, update, transition, assign, reply, addNote }
}

export function useCustomerLookup(search) {
  return useQuery({
    queryKey: serviceKeys.customerLookup(search),
    queryFn: () => casesApi.lookupCustomers(search),
    staleTime: 60 * 1000,
  })
}
