import { useQuery } from '@tanstack/react-query'
import { extractList } from '../../../../shared/utils/apiResponse'
import { facebookCampaignApi } from '../api/facebookCampaignApi'

export const facebookAdSetKeys = {
  list: (tenantId, accountId, campaignId) => ['campaign-center', tenantId, 'meta', accountId || 'all', 'campaign', campaignId, 'adsets'],
  insights: (tenantId, accountId, adSetId) => ['campaign-center', tenantId, 'meta', accountId || 'all', 'adset', adSetId, 'insights'],
}

export function useFacebookAdSets({ tenantId, accountId, campaignId, enabled = true }) {
  return useQuery({
    queryKey: facebookAdSetKeys.list(tenantId, accountId, campaignId),
    queryFn: () => facebookCampaignApi.getCampaignAdSets(campaignId),
    select: (response) => extractList(response, ['data']),
    enabled: Boolean(tenantId) && Boolean(campaignId) && enabled,
  })
}

export function useFacebookAdSetInsights({ tenantId, accountId, adSetId, enabled = true }) {
  return useQuery({
    queryKey: facebookAdSetKeys.insights(tenantId, accountId, adSetId),
    queryFn: () => facebookCampaignApi.getAdInsights(adSetId),
    select: (response) => extractList(response, ['data'])[0] || null,
    enabled: Boolean(tenantId) && Boolean(adSetId) && enabled,
  })
}
