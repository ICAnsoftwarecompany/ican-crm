import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('workOrders')
const unwrap = (response) => response.data?.data ?? response.data
const W = serviceEndpoints.workOrders

/**
 * Work orders (spec §38). Detail: { id, number, type, case_id, asset{ id, name, serial_number }, customer,
 * resource{ id, name }, reservation_id, scheduled_start/end, duration_minutes, location{ address, zone },
 * status (new|scheduled|on_the_way|in_progress|completed|cancelled), check_in_at, check_out_at, work_notes, parts[],
 * labor_minutes, completion_status, failure_reason, signature_name, entitlement{ id, type, state },
 * entitlement_transaction_id, billable, events[], version }.
 * PATCH { resource_id, scheduled_start } assigns + books the slot (409 RESERVATION_CONFLICT when taken).
 */
export const workOrdersApi = {
  list: async (params) => (await api.get(W, { params })).data,
  get: async (id) => unwrap(await api.get(`${W}/${id}`)),
  create: async (payload) => unwrap(await api.post(W, payload)),
  schedule: async (id, payload) => unwrap(await api.patch(`${W}/${id}`, payload)),
  /** action: on-the-way | check-in | check-out | complete | cancel */
  action: async (id, action, payload) => unwrap(await api.post(`${W}/${id}/${action}`, payload)),
}

export function useWorkOrderList(params) {
  const query = useInfiniteQuery({
    queryKey: serviceKeys.workOrderList(params),
    queryFn: ({ pageParam }) => workOrdersApi.list({ ...params, page: pageParam, per_page: 25 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.meta && last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  })
  const workOrders = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) ?? [], [query.data])
  return { ...query, workOrders }
}

export const useWorkOrder = (id) => useQuery({ queryKey: serviceKeys.workOrderDetail(id), queryFn: () => workOrdersApi.get(id), enabled: Boolean(id) })

export function useWorkOrderMutations(workOrderId) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const refresh = (workOrder) => {
    if (workOrder?.id) queryClient.setQueryData(serviceKeys.workOrderDetail(workOrder.id), workOrder)
    ;[serviceKeys.workOrders(), serviceKeys.scheduling(), serviceKeys.entitlements()].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
    if (error?.response?.status === 409) {
      queryClient.invalidateQueries({ queryKey: serviceKeys.scheduling() })
      if (workOrderId) queryClient.invalidateQueries({ queryKey: serviceKeys.workOrderDetail(workOrderId) })
    }
  }
  return {
    create: useMutation({ mutationFn: workOrdersApi.create, onSuccess: refresh, onError }),
    schedule: useMutation({ mutationFn: ({ id, ...payload }) => workOrdersApi.schedule(id, payload), onSuccess: refresh, onError }),
    action: useMutation({ mutationFn: ({ id, action, ...payload }) => workOrdersApi.action(id, action, payload), onSuccess: refresh, onError }),
  }
}
