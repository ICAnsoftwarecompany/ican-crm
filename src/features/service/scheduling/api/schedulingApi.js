import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('scheduling')
const unwrap = (response) => response.data?.data ?? response.data
const E = serviceEndpoints

/**
 * Scheduling engine (spec §19). Reservation: { id, resource_id, resource{ id, name, type }, subject_type, subject_id,
 * subject?, starts_at, ends_at, quantity, status (hold|confirmed|released|expired), hold_expires_at, note }.
 * Slots: GET /scheduling/availability?date&resource_type&resource_id&skill&zone&duration → [{ resource_id,
 * resource_name, starts_at, ends_at, time_zone }]. Capacity / double booking is enforced by the server (409).
 */
export const schedulingApi = {
  reservations: async (params) => unwrap(await api.get(E.reservations, { params })) || [],
  availability: async (params) => unwrap(await api.get(E.schedulingAvailability, { params })) || [],
  reserve: async (payload) => unwrap(await api.post(E.reservations, payload)),
  confirm: async (id) => unwrap(await api.post(`${E.reservations}/${id}/confirm`)),
  release: async (id) => unwrap(await api.delete(`${E.reservations}/${id}`)),
}

export const useReservations = (params) => useQuery({ queryKey: serviceKeys.reservations(params), queryFn: () => schedulingApi.reservations(params), placeholderData: (previous) => previous })

export const useAvailability = (params, { enabled = true } = {}) =>
  useQuery({ queryKey: serviceKeys.availability(params), queryFn: () => schedulingApi.availability(params), enabled: enabled && Boolean(params?.date), placeholderData: (previous) => previous })

export function useReservationMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: serviceKeys.scheduling() })
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
    if (error?.response?.status === 409) onSuccess()
  }
  return {
    reserve: useMutation({ mutationFn: schedulingApi.reserve, onSuccess, onError }),
    confirm: useMutation({ mutationFn: schedulingApi.confirm, onSuccess, onError }),
    release: useMutation({ mutationFn: schedulingApi.release, onSuccess, onError }),
  }
}
