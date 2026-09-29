import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('billing')
const unwrap = (response) => response.data?.data ?? response.data
const B = serviceEndpoints.billing

/**
 * Payment schedules (spec §29.10–29.13). Detail: { id, schedule_number, contract_id, contract_number, customer,
 * currency, plan_snapshot, status (active|completed|rescheduled|transferred|cancelled), replaces_schedule_id,
 * replaced_by_schedule_id, pending_reschedule, lines[{ id, seq, line_type, due_date, amount, in_price, paid_amount,
 * remaining, late_fee_amount, fee_outstanding, days_overdue, status }], payments[{ id, number, amount, method,
 * paid_at, status, reversal_of_id, allocations[] }], promises[{ id, amount, promised_date, status }],
 * totals{ in_price, outside_price, paid, late_fees, outstanding, overdue }, next_due, version }.
 * Every amount, status and late fee is computed by the server.
 */
export const schedulesApi = {
  list: async (params) => (await api.get(B.schedules, { params })).data,
  get: async (id) => unwrap(await api.get(`${B.schedules}/${id}`)),
  /** action: payments | reschedule | reschedule/approve | reschedule/reject | cancel | promises */
  action: async (id, action, payload) => unwrap(await api.post(`${B.schedules}/${id}/${action}`, payload)),
  payoffQuote: async (id) => unwrap(await api.post(`${B.schedules}/${id}/payoff-quote`)),
  reversePayment: async (paymentId, payload) => unwrap(await api.post(`${B.payments}/${paymentId}/reverse`, payload)),
  waiveFee: async (lineId, payload) => unwrap(await api.post(`${B.lines}/${lineId}/waive-fee`, payload)),
  collections: async (params) => (await api.get(B.collections, { params })).data,
}

export function useScheduleList(params) {
  const query = useInfiniteQuery({
    queryKey: serviceKeys.scheduleList(params),
    queryFn: ({ pageParam }) => schedulesApi.list({ ...params, page: pageParam, per_page: 25 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.meta && last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  })
  const schedules = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) ?? [], [query.data])
  return { ...query, schedules }
}

export const useSchedule = (id) => useQuery({ queryKey: serviceKeys.scheduleDetail(id), queryFn: () => schedulesApi.get(id), enabled: Boolean(id) })
export const useCollections = (params) => useQuery({ queryKey: serviceKeys.collections(params), queryFn: () => schedulesApi.collections(params), placeholderData: (previous) => previous })
export const usePayoffQuote = () => useMutation({ mutationFn: schedulesApi.payoffQuote })

export function useScheduleMutations(scheduleId) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const refresh = (schedule) => {
    if (schedule?.id) queryClient.setQueryData(serviceKeys.scheduleDetail(schedule.id), schedule)
    queryClient.invalidateQueries({ queryKey: serviceKeys.billing() })
    queryClient.invalidateQueries({ queryKey: serviceKeys.contracts() })
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
    if (error?.response?.status === 409 && scheduleId) queryClient.invalidateQueries({ queryKey: serviceKeys.scheduleDetail(scheduleId) })
  }
  return {
    action: useMutation({ mutationFn: ({ id, action, ...payload }) => schedulesApi.action(id, action, payload), onSuccess: refresh, onError }),
    reversePayment: useMutation({ mutationFn: ({ paymentId, ...payload }) => schedulesApi.reversePayment(paymentId, payload), onSuccess: refresh, onError }),
    waiveFee: useMutation({ mutationFn: ({ lineId, ...payload }) => schedulesApi.waiveFee(lineId, payload), onSuccess: refresh, onError }),
  }
}
