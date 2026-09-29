import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('subscriptions')
const unwrap = (response) => response.data?.data ?? response.data
const S = serviceEndpoints.subscriptions

/**
 * Subscriptions (spec §30). Detail: { id, subscription_number, customer, item_id, item_name, contract_id,
 * contract_number, plan{ every, unit, price, currency, grace_days }, status (trial|active|past_due|suspended|
 * cancelled|expired), trial_ends_at, current_period_start/end, renewal_type (auto|manual|none),
 * cancel_at_period_end, grace_until, suspended_at, suspend_reason, cancelled_at, pending_change,
 * periods[{ id, seq, start, end, due_date, amount, status, paid_at }], events[{ type, from, to, occurred_at, reason }],
 * amount_due, days_to_period_end, renewal_due, version }. The lifecycle job runs on the server.
 */
export const subscriptionsApi = {
  list: async (params) => (await api.get(S, { params })).data,
  get: async (id) => unwrap(await api.get(`${S}/${id}`)),
  update: async (id, payload) => unwrap(await api.patch(`${S}/${id}`, payload)),
  /** action: cancel | suspend | resume | renew */
  action: async (id, action, payload) => unwrap(await api.post(`${S}/${id}/${action}`, payload)),
  payPeriod: async (id, periodId, payload) => unwrap(await api.post(`${S}/${id}/periods/${periodId}/pay`, payload)),
}

export function useSubscriptionList(params) {
  const query = useInfiniteQuery({
    queryKey: serviceKeys.subscriptionList(params),
    queryFn: ({ pageParam }) => subscriptionsApi.list({ ...params, page: pageParam, per_page: 25 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.meta && last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  })
  const subscriptions = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) ?? [], [query.data])
  return { ...query, subscriptions }
}

export const useSubscription = (id) => useQuery({ queryKey: serviceKeys.subscriptionDetail(id), queryFn: () => subscriptionsApi.get(id), enabled: Boolean(id) })

export function useSubscriptionMutations(subscriptionId) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const refresh = (subscription) => {
    if (subscription?.id) queryClient.setQueryData(serviceKeys.subscriptionDetail(subscription.id), subscription)
    queryClient.invalidateQueries({ queryKey: serviceKeys.subscriptions() })
    // Suspension / expiry changes the linked entitlements.
    queryClient.invalidateQueries({ queryKey: serviceKeys.entitlements() })
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
    if (error?.response?.status === 409 && subscriptionId) queryClient.invalidateQueries({ queryKey: serviceKeys.subscriptionDetail(subscriptionId) })
  }
  return {
    update: useMutation({ mutationFn: ({ id, ...payload }) => subscriptionsApi.update(id, payload), onSuccess: refresh, onError }),
    action: useMutation({ mutationFn: ({ id, action, ...payload }) => subscriptionsApi.action(id, action, payload), onSuccess: refresh, onError }),
    payPeriod: useMutation({ mutationFn: ({ id, periodId, ...payload }) => subscriptionsApi.payPeriod(id, periodId, payload), onSuccess: refresh, onError }),
  }
}
