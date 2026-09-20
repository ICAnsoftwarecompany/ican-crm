import { useQuery } from '@tanstack/react-query'
import { facebookSocialApi } from '../api/facebookSocialApi'
import { facebookAdapter } from '../adapters/facebook/facebookAdapter'
import { socialKeys } from './socialKeys'

/**
 * Lazy — only fetches when the Comments section of the Content Details
 * Drawer is actually opened (`enabled`), never for every post on grid/
 * list render. See docs "Lazy Loading Strategy" and "N+1 Request Pattern".
 */
export function useSocialComments({ tenantId, platform = 'facebook', contentId, externalId, enabled = false }) {
  const query = useQuery({
    queryKey: socialKeys.comments(tenantId, platform, contentId),
    queryFn: () => facebookSocialApi.getPostComments(externalId),
    enabled: enabled && Boolean(tenantId) && Boolean(externalId),
    select: (response) => facebookAdapter.normalizeComments(response),
  })

  return { data: query.data || [], isLoading: query.isLoading, error: query.error, refetch: query.refetch }
}
