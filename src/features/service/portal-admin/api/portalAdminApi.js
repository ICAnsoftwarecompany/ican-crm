import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('portal')
const unwrap = (response) => response.data?.data ?? response.data
const A = serviceEndpoints.portalAccounts

/**
 * Staff-side portal administration (spec §43). Account: { id, name, phone, email, status (invited|active|disabled),
 * last_login_at, active_sessions, memberships[{ id, customer, membership_type, role_id, policy{ id, name }, status }] }.
 * Portal sessions are separate from staff sessions; revoking here signs the customer out everywhere.
 */
export const portalAdminApi = {
  accounts: async (params) => unwrap(await api.get(A, { params: { per_page: 100, ...params } })) || [],
  invite: async (payload) => unwrap(await api.post(A, payload)),
  setStatus: async (id, status) => unwrap(await api.patch(`${A}/${id}`, { status })),
  addMembership: async (id, payload) => unwrap(await api.post(`${A}/${id}/memberships`, payload)),
  revokeMembership: async (id, membershipId) => unwrap(await api.delete(`${A}/${id}/memberships/${membershipId}`)),
  revokeSessions: async (id) => unwrap(await api.post(`${A}/${id}/revoke-sessions`)),
  resendInvite: async (id) => unwrap(await api.post(`${A}/${id}/resend-invite`)),
  settings: async () => unwrap(await api.get(serviceEndpoints.portalSettings)),
  saveSettings: async (payload) => unwrap(await api.put(serviceEndpoints.portalSettings, payload)),
}

export const usePortalAccounts = (params) => useQuery({ queryKey: serviceKeys.portalAccounts(params), queryFn: () => portalAdminApi.accounts(params), placeholderData: (previous) => previous })
export const usePortalSettings = () => useQuery({ queryKey: serviceKeys.portalSettings(), queryFn: portalAdminApi.settings })

export function usePortalAdminMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: serviceKeys.portalAdmin() })
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  return {
    invite: useMutation({ mutationFn: portalAdminApi.invite, onSuccess, onError }),
    setStatus: useMutation({ mutationFn: ({ id, status }) => portalAdminApi.setStatus(id, status), onSuccess, onError }),
    addMembership: useMutation({ mutationFn: ({ id, ...payload }) => portalAdminApi.addMembership(id, payload), onSuccess, onError }),
    revokeMembership: useMutation({ mutationFn: ({ id, membershipId }) => portalAdminApi.revokeMembership(id, membershipId), onSuccess, onError }),
    revokeSessions: useMutation({ mutationFn: portalAdminApi.revokeSessions, onSuccess, onError }),
    resendInvite: useMutation({ mutationFn: portalAdminApi.resendInvite, onSuccess, onError }),
    saveSettings: useMutation({ mutationFn: portalAdminApi.saveSettings, onSuccess: (data) => { queryClient.setQueryData(serviceKeys.portalSettings(), data); onSuccess() }, onError }),
  }
}
