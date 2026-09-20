import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { facebookCampaignApi } from '../api/facebookCampaignApi'
import { flattenFacebookCampaigns } from '../utils/flattenFacebookCampaigns'

export const facebookCampaignKeys = {
  all: (tenantId) => ['campaign-center', tenantId, 'meta'],
  campaigns: (tenantId, accountId, filters) => ['campaign-center', tenantId, 'meta', accountId || 'all', 'campaigns', filters || {}],
  adSets: (tenantId, accountId, filters) => ['campaign-center', tenantId, 'meta', accountId || 'all', 'adsets', filters || {}],
}

export function useFacebookCampaigns({ tenantId, accountId, filters = {}, enabled = true }) {
  return useQuery({
    queryKey: facebookCampaignKeys.campaigns(tenantId, accountId, filters),
    queryFn: () => facebookCampaignApi.getCampaigns({ ...filters, ...(accountId ? { ad_account_id: accountId } : {}) }),
    select: (response) => flattenFacebookCampaigns(response),
    enabled: Boolean(tenantId) && enabled,
  })
}

export function useFacebookCampaignMutations({ tenantId, accountId }) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: facebookCampaignKeys.all(tenantId) })
  return {
    create: useMutation({ mutationFn: facebookCampaignApi.createCampaign, onSuccess: invalidate }),
    sync: useMutation({
      mutationFn: () => facebookCampaignApi.syncCampaigns(accountId ? { ad_account_id: accountId } : undefined),
      onSuccess: invalidate,
    }),
  }
}
