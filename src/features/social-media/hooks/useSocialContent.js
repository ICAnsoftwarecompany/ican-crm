import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { facebookSocialApi } from '../api/facebookSocialApi'
import { facebookAdapter } from '../adapters/facebook/facebookAdapter'
import { socialKeys } from './socialKeys'
import { createCursorStack, currentCursor, canGoPrevious, pushNextCursor, goToPreviousCursor } from '../utils/paginationUtils'

/**
 * Published content for one Facebook page, cursor-paginated — see docs
 * "Facebook Cursor Pagination". Cursor state lives here, in the data
 * layer, not scattered across UI components (spec requirement). Fetches
 * once per page load; does NOT fetch engagement/comments per item (that
 * is `useSocialEngagement`/`useSocialComments`, both lazy — see docs
 * "Lazy Loading Strategy"). The posts endpoint already returns a
 * likes/comments/shares summary per post, which is what Grid/List use.
 */
export function useSocialContent({ tenantId, platform = 'facebook', profileId, enabled = true }) {
  const [stack, setStack] = useState(createCursorStack())
  const cursor = currentCursor(stack)

  const query = useQuery({
    queryKey: socialKeys.content(tenantId, platform, profileId, cursor),
    queryFn: () => facebookSocialApi.getPagePosts(profileId, cursor ? { after: cursor } : undefined),
    enabled: enabled && Boolean(tenantId) && Boolean(profileId),
    select: (response) => facebookAdapter.normalizeContentList(response),
  })

  const goNext = useCallback(() => {
    const nextCursor = query.data?.pagination?.nextCursor
    if (!nextCursor) return
    setStack((current) => pushNextCursor(current, nextCursor))
  }, [query.data])

  const goPrevious = useCallback(() => {
    setStack((current) => goToPreviousCursor(current))
  }, [])

  const resetPagination = useCallback(() => setStack(createCursorStack()), [])

  return useMemo(
    () => ({
      items: query.data?.items || [],
      pagination: query.data?.pagination || { hasNext: false, hasPrevious: false, nextCursor: null, previousCursor: null },
      isLoading: query.isLoading,
      error: query.error,
      refetch: query.refetch,
      goNext,
      goPrevious,
      canGoPrevious: canGoPrevious(stack),
      resetPagination,
    }),
    [query.data, query.isLoading, query.error, query.refetch, goNext, goPrevious, stack, resetPagination]
  )
}
