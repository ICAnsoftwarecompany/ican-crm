import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('portfolios')
const unwrap = (response) => response.data?.data ?? response.data
const P = serviceEndpoints.portfolios

/**
 * Customer portfolios (spec §12.5). Portfolio: { id, name{ar,en}, team_id, criteria{ city?, tier?, min_value? },
 * owner_ids[], owners[{ id, name, members_count }], members_count, status }. Member: { portfolio_id, customer_id,
 * customer, owner_user_id, owner, assigned_at }. A customer belongs to one portfolio; cases and follow-ups can route
 * to its owner ("portfolio_owner" assignment).
 */
export const portfoliosApi = {
  list: async () => unwrap(await api.get(P)) || [],
  create: async (payload) => unwrap(await api.post(P, payload)),
  update: async ({ id, ...payload }) => unwrap(await api.patch(`${P}/${id}`, payload)),
  remove: async (id) => api.delete(`${P}/${id}`),
  members: async (id, params) => unwrap(await api.get(`${P}/${id}/members`, { params })) || [],
  addMembers: async ({ id, ...payload }) => unwrap(await api.post(`${P}/${id}/members`, payload)),
  setOwner: async ({ id, customerId, ownerId }) => unwrap(await api.patch(`${P}/${id}/members/${customerId}`, { owner_user_id: ownerId })),
  removeMember: async ({ id, customerId }) => api.delete(`${P}/${id}/members/${customerId}`),
  distribute: async (id) => unwrap(await api.post(`${P}/${id}/distribute`)),
}

export const usePortfolios = () => useQuery({ queryKey: serviceKeys.portfolios(), queryFn: portfoliosApi.list })
export const usePortfolioMembers = (id, params) => useQuery({ queryKey: [...serviceKeys.portfolioMembers(id), params ?? {}], queryFn: () => portfoliosApi.members(id, params), enabled: Boolean(id), placeholderData: (previous) => previous })

export function usePortfolioMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: serviceKeys.portfolios() })
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  const options = { onSuccess, onError }
  return {
    create: useMutation({ mutationFn: portfoliosApi.create, ...options }),
    update: useMutation({ mutationFn: portfoliosApi.update, ...options }),
    remove: useMutation({ mutationFn: portfoliosApi.remove, ...options }),
    addMembers: useMutation({ mutationFn: portfoliosApi.addMembers, ...options }),
    setOwner: useMutation({ mutationFn: portfoliosApi.setOwner, ...options }),
    removeMember: useMutation({ mutationFn: portfoliosApi.removeMember, ...options }),
    distribute: useMutation({ mutationFn: portfoliosApi.distribute, ...options }),
  }
}
