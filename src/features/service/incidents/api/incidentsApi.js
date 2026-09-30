import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('incidents')
const unwrap = (response) => response.data?.data ?? response.data
const I = serviceEndpoints.incidents

/**
 * Major incidents (spec Phase 6, proposed): { id, number, title, severity minor|major|critical, status
 * investigating|identified|monitoring|resolved, linked_case_ids[], linked_count, open_linked, updates[{ status, message,
 * public, at, by }], cases[] (detail), owner, started_at, resolved_at }. A public update can be posted to every linked
 * request (`notify_linked`) and shows as a banner in the portal.
 */
export const incidentsApi = {
  list: async (params) => unwrap(await api.get(I, { params })) || [],
  get: async (id) => unwrap(await api.get(`${I}/${id}`)),
  create: async (payload) => unwrap(await api.post(I, payload)),
  update: async ({ id, ...payload }) => unwrap(await api.post(`${I}/${id}/updates`, payload)),
  link: async ({ id, case_numbers: numbers }) => unwrap(await api.post(`${I}/${id}/link`, { case_numbers: numbers })),
}

export const useIncidents = (params) => useQuery({ queryKey: serviceKeys.incidents(params), queryFn: () => incidentsApi.list(params), staleTime: 30 * 1000 })
export const useIncident = (id) => useQuery({ queryKey: serviceKeys.incident(id), queryFn: () => incidentsApi.get(id), enabled: Boolean(id) })

export function useIncidentMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = (incident) => {
    if (incident?.id) queryClient.setQueryData(serviceKeys.incident(incident.id), incident)
    queryClient.invalidateQueries({ queryKey: [...serviceKeys.all, 'incidents'] })
    queryClient.invalidateQueries({ queryKey: serviceKeys.cases() })
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  return {
    create: useMutation({ mutationFn: incidentsApi.create, onSuccess, onError }),
    update: useMutation({ mutationFn: incidentsApi.update, onSuccess, onError }),
    link: useMutation({ mutationFn: incidentsApi.link, onSuccess, onError }),
  }
}
