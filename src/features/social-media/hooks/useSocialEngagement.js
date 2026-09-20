import { useQuery } from '@tanstack/react-query'
import { facebookSocialApi } from '../api/facebookSocialApi'
import { facebookAdapter } from '../adapters/facebook/facebookAdapter'
import { socialKeys } from './socialKeys'

/**
 * Lazy — only fetches when `enabled` (the caller passes this true once the
 * Content Details Drawer actually opens, not on grid/list render). See
 * docs "Lazy Loading Strategy": the posts list already carries a
 * likes/comments/shares summary good enough for cards; this is for when a
 * caller explicitly wants a fresh read.
 */
export function useSocialEngagement({ tenantId, platform = 'facebook', contentId, externalId, enabled = false }) {
  const query = useQuery({
    queryKey: socialKeys.engagement(tenantId, platform, contentId),
    queryFn: () => facebookSocialApi.getPostEngagement(externalId),
    enabled: enabled && Boolean(tenantId) && Boolean(externalId),
    select: (response) => facebookAdapter.normalizeEngagement(response),
  })

  return { data: query.data || null, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
}
