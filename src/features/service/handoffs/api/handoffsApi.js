import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('handoffs')
const unwrap = (response) => response.data?.data ?? response.data
const H = serviceEndpoints.handoffs

/**
 * Sales → Service handoff (spec §32): { id, contract {id,contract_number,total_value,currency,status}, customer,
 * contract_version, status: pending|needs_review|accepted|onboarding|active|rejected, sales_owner, cs_owner,
 * notes, promises[{id,text,due_at,done}], checklist[{key,label,done}], created_entities[{line_id,type,id,label}],
 * errors[{line_id,code,item}], amendments_applied[], version }. Created by the server when a contract is signed.
 */
export const handoffsApi = {
  list: async (params) => (await api.get(H, { params })).data,
  get: async (id) => unwrap(await api.get(`${H}/${id}`)),
  update: async (id, payload) => unwrap(await api.patch(`${H}/${id}`, payload)),
  /** action: accept | reject | reprocess */
  action: async (id, action, payload) => unwrap(await api.post(`${H}/${id}/${action}`, payload)),
}

export const useHandoffs = (params) => useQuery({ queryKey: serviceKeys.handoffList(params), queryFn: () => handoffsApi.list({ per_page: 50, ...params }), placeholderData: (previous) => previous })
export const useHandoff = (id) => useQuery({ queryKey: serviceKeys.handoffDetail(id), queryFn: () => handoffsApi.get(id), enabled: Boolean(id) })

export function useHandoffMutations(id) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = (handoff) => {
    queryClient.setQueryData(serviceKeys.handoffDetail(id), handoff)
    ;[serviceKeys.handoffs(), serviceKeys.contracts(), serviceKeys.assets(), serviceKeys.records(), serviceKeys.entitlements()].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
    if (error?.response?.status === 409) queryClient.invalidateQueries({ queryKey: serviceKeys.handoffDetail(id) })
  }
  return {
    update: useMutation({ mutationFn: (payload) => handoffsApi.update(id, payload), onSuccess, onError }),
    action: useMutation({ mutationFn: ({ action, ...payload }) => handoffsApi.action(id, action, payload), onSuccess, onError }),
  }
}
