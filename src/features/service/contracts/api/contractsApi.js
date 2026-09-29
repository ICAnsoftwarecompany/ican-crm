import { useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('contracts')
const unwrap = (response) => response.data?.data ?? response.data
const C = serviceEndpoints.contracts

/**
 * Contracts — shared module (spec §27). Detail: { id, contract_number, type {id,key,label,requires_signature},
 * customer, status, start_date, end_date, currency, total_value, renewal_type, signed_at, activated_at,
 * effective_version, parent_contract_id, parties[], items[{ id, item_id, name, quantity, unit_price, discount,
 * total, fulfillment_status }], versions[], signatures[], amendments[], handoff {id,status}|null, version }.
 * Signed versions are immutable: changes go through amendments (409 CONTRACT_LOCKED otherwise).
 */
export const contractsApi = {
  list: async (params) => (await api.get(C, { params })).data,
  get: async (id) => unwrap(await api.get(`${C}/${id}`)),
  create: async (payload) => unwrap(await api.post(C, payload)),
  update: async (id, payload) => unwrap(await api.patch(`${C}/${id}`, payload)),
  /** action: send | sign | activate | terminate | cancel | renew | amendments */
  action: async (id, action, payload) => unwrap(await api.post(`${C}/${id}/${action}`, payload)),
  signAmendment: async (id, amendmentId) => unwrap(await api.post(`${C}/${id}/amendments/${amendmentId}/sign`)),
}

export function useContractList(params) {
  const query = useInfiniteQuery({
    queryKey: serviceKeys.contractList(params),
    queryFn: ({ pageParam }) => contractsApi.list({ ...params, page: pageParam, per_page: 25 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.meta && last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  })
  const contracts = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) ?? [], [query.data])
  return { ...query, contracts }
}

export const useContract = (id) => useQuery({ queryKey: serviceKeys.contractDetail(id), queryFn: () => contractsApi.get(id), enabled: Boolean(id) })

export function useContractMutations(contractId) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const refresh = (contract) => {
    if (contract?.id === contractId) queryClient.setQueryData(serviceKeys.contractDetail(contract.id), contract)
    queryClient.invalidateQueries({ queryKey: serviceKeys.contracts() })
    // Signing may run the handoff processor → assets, records, entitlements change.
    ;[serviceKeys.handoffs(), serviceKeys.assets(), serviceKeys.entitlements(), serviceKeys.records()].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
    if (error?.response?.status === 409 && contractId) queryClient.invalidateQueries({ queryKey: serviceKeys.contractDetail(contractId) })
  }
  return {
    create: useMutation({ mutationFn: contractsApi.create, onSuccess: refresh, onError }),
    update: useMutation({ mutationFn: ({ id, ...payload }) => contractsApi.update(id, payload), onSuccess: refresh, onError }),
    action: useMutation({ mutationFn: ({ id, action, ...payload }) => contractsApi.action(id, action, payload), onSuccess: refresh, onError }),
    signAmendment: useMutation({ mutationFn: ({ id, amendmentId }) => contractsApi.signAmendment(id, amendmentId), onSuccess: refresh, onError }),
  }
}
