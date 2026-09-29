import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('deliveries')
const unwrap = (response) => response.data?.data ?? response.data
const D = serviceEndpoints.deliveries
const RM = serviceEndpoints.codRemittances

/**
 * Courier dispatch (spec §38.4). Row: { id, record_id, reference_no, merchant, recipient{ name, phone, address }, city,
 * courier{ id, name, zones }, status (unassigned|assigned|out_for_delivery|delivered|failed), attempts, cod_amount,
 * cod_collected, pod{ method, receiver_name, at }, remittance_id }. List meta adds `summary` counters.
 * COD remittances (§29.14): { id, number, customer, lines[], total_collected, fees_deducted, net_amount, status (draft|paid) }.
 */
export const deliveriesApi = {
  list: async (params) => (await api.get(D, { params: { per_page: 100, ...params } })).data,
  assign: async (recordId, courierId) => unwrap(await api.post(`${D}/${recordId}/assign`, { courier_id: courierId })),
  outForDelivery: async (recordId) => unwrap(await api.post(`${D}/${recordId}/out-for-delivery`)),
  attempt: async (recordId, payload) => unwrap(await api.post(`${D}/${recordId}/attempts`, payload)),
  pendingRemittances: async () => unwrap(await api.get(`${RM}/pending`)) || [],
  remittances: async () => unwrap(await api.get(RM, { params: { per_page: 50 } })) || [],
  createRemittance: async (customerId) => unwrap(await api.post(RM, { customer_id: customerId })),
  payRemittance: async (id, externalRef) => unwrap(await api.post(`${RM}/${id}/pay`, { external_ref: externalRef })),
  deleteRemittance: async (id) => api.delete(`${RM}/${id}`),
}

export const useDeliveries = (params) => useQuery({ queryKey: serviceKeys.deliveryList(params), queryFn: () => deliveriesApi.list(params), placeholderData: (previous) => previous })
export const usePendingRemittances = () => useQuery({ queryKey: serviceKeys.remittances({ pending: true }), queryFn: deliveriesApi.pendingRemittances })
export const useRemittances = () => useQuery({ queryKey: serviceKeys.remittances(), queryFn: deliveriesApi.remittances })

export function useDeliveryMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: serviceKeys.deliveries() })
    queryClient.invalidateQueries({ queryKey: serviceKeys.records() })
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  return {
    assign: useMutation({ mutationFn: ({ recordId, courierId }) => deliveriesApi.assign(recordId, courierId), onSuccess, onError }),
    outForDelivery: useMutation({ mutationFn: deliveriesApi.outForDelivery, onSuccess, onError }),
    attempt: useMutation({ mutationFn: ({ recordId, ...payload }) => deliveriesApi.attempt(recordId, payload), onSuccess, onError }),
    createRemittance: useMutation({ mutationFn: deliveriesApi.createRemittance, onSuccess, onError }),
    payRemittance: useMutation({ mutationFn: ({ id, externalRef }) => deliveriesApi.payRemittance(id, externalRef), onSuccess, onError }),
    deleteRemittance: useMutation({ mutationFn: deliveriesApi.deleteRemittance, onSuccess, onError }),
  }
}
