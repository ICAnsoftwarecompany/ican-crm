import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('entitlements')
const unwrap = (response) => response.data?.data ?? response.data
const E = serviceEndpoints.entitlements

/**
 * Entitlements (spec §35): { id, customer, asset|null, type: support|visits|warranty_service|usage|priority_support|custom,
 * quota (null = unlimited), period, starts_at, ends_at, case_type_ids[], sla_policy_id, source_type, source_id,
 * status: active|suspended|expired|exhausted, balance { quota, used, remaining } }. The balance is computed by the
 * server from the ledger (consume / restore / adjust / reset) — never stored as "used = 3".
 * Check: POST /entitlements/check { customer_id, asset_id?, case_type_id? } → { result, entitlement_id, remaining, sla_policy_id, reason }.
 */
export const entitlementsApi = {
  list: async (params) => (await api.get(E, { params })).data,
  get: async (id) => unwrap(await api.get(`${E}/${id}`)),
  addTransaction: async (id, payload) => unwrap(await api.post(`${E}/${id}/transactions`, payload)),
  check: async (payload) => unwrap(await api.post(`${E}/check`, payload)),
}

export const useEntitlements = (params, options = {}) =>
  useQuery({ queryKey: serviceKeys.entitlementList(params), queryFn: () => entitlementsApi.list({ per_page: 100, ...params }), ...options })

export const useEntitlement = (id) => useQuery({ queryKey: serviceKeys.entitlementDetail(id), queryFn: () => entitlementsApi.get(id), enabled: Boolean(id) })

/** Coverage for a case (customer + type [+ asset]). Read-only: consumption happens on the server at a defined event. */
export const useEntitlementCheck = (params) =>
  useQuery({ queryKey: serviceKeys.entitlementCheck(params), queryFn: () => entitlementsApi.check(params), enabled: Boolean(params?.customer_id), staleTime: 60 * 1000 })

export function useEntitlementTransaction(id) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload) => entitlementsApi.addTransaction(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.entitlements() }),
    onError: (error) => error?.response?.status !== 422 && toast.error(getServiceErrorMessage(error, t)),
  })
}
