import { useMemo } from 'react'
import { useFacebookIntegrations } from '../../meta-integrations/hooks/useFacebookIntegrations'
import { getSocialPlatform } from '../config/socialPlatformsRegistry'

/**
 * Connected profiles/pages for one platform (or all available platforms
 * when `platform` is omitted). Reuses `useFacebookIntegrations` exactly as
 * Campaign Center already does — no second Meta-integration fetch, no
 * duplicated connection state. See docs "Social Profile Contract".
 *
 * Platforms with `available: false` in the registry always resolve to an
 * empty, non-loading, non-error result — there is no API to call for them
 * yet, and this hook never fabricates one.
 */
export function useSocialProfiles({ tenantId, platform } = {}) {
  const facebookPlatform = getSocialPlatform('facebook')
  const wantsFacebook = !platform || platform === 'facebook'

  const facebookQuery = useFacebookIntegrations(tenantId, { enabled: wantsFacebook && Boolean(tenantId) })

  const profiles = useMemo(() => {
    if (!wantsFacebook || !facebookPlatform?.available) return []
    const pages = facebookQuery.data?.facebook_pages || facebookQuery.data?.data?.facebook_pages || []
    return pages.map((page) => facebookPlatform.adapter.normalizeProfile(page))
  }, [wantsFacebook, facebookPlatform, facebookQuery.data])

  return {
    data: profiles,
    isLoading: wantsFacebook ? facebookQuery.isLoading : false,
    error: wantsFacebook ? facebookQuery.error : null,
    refetch: facebookQuery.refetch,
  }
}
