import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { metaAssetsSource } from '../data/metaAssetsSource'

const KEY = (tenantId, accountId, ...rest) => ['campaign-center', tenantId, 'meta', accountId || 'all', 'wizard', ...rest]
const STALE = 5 * 60 * 1000

export function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useGeoLocationSearch({ tenantId, accountId, query }) {
  const debounced = useDebouncedValue(query.trim())
  return useQuery({
    queryKey: KEY(tenantId, accountId, 'geo-search', debounced),
    queryFn: () => metaAssetsSource.searchGeoLocations({ query: debounced, accountId }),
    enabled: debounced.length >= 2,
    staleTime: STALE,
    placeholderData: keepPreviousData,
  })
}

export function useInterestSearch({ tenantId, accountId, query }) {
  const debounced = useDebouncedValue(query.trim())
  return useQuery({
    queryKey: KEY(tenantId, accountId, 'interest-search', debounced),
    queryFn: () => metaAssetsSource.searchInterests({ query: debounced, accountId }),
    staleTime: STALE,
    placeholderData: keepPreviousData,
  })
}

function useAsset(name, fetcher, { tenantId, accountId, extraKey = [], enabled = true }) {
  return useQuery({
    queryKey: KEY(tenantId, accountId, name, ...extraKey),
    queryFn: fetcher,
    enabled: Boolean(tenantId) && enabled,
    staleTime: STALE,
  })
}

export const useLanguages = ({ tenantId, accountId }) => useAsset('languages', () => metaAssetsSource.getLanguages({ accountId }), { tenantId, accountId })
export const useCustomAudiences = ({ tenantId, accountId }) => useAsset('audiences', () => metaAssetsSource.getCustomAudiences({ accountId }), { tenantId, accountId })
export const usePixels = ({ tenantId, accountId, enabled }) => useAsset('pixels', () => metaAssetsSource.getPixels({ accountId }), { tenantId, accountId, enabled })
export const useApps = ({ tenantId, accountId, enabled }) => useAsset('apps', () => metaAssetsSource.getApps({ accountId }), { tenantId, accountId, enabled })
export const useMediaLibrary = ({ tenantId, accountId, enabled }) => useAsset('media', () => metaAssetsSource.getMediaLibrary({ accountId }), { tenantId, accountId, enabled })
export const useLeadForms = ({ tenantId, accountId, pageId, enabled }) => useAsset('lead-forms', () => metaAssetsSource.getLeadForms({ pageId }), { tenantId, accountId, extraKey: [pageId || 'none'], enabled })
export const usePagePosts = ({ tenantId, accountId, pageId, enabled }) => useAsset('page-posts', () => metaAssetsSource.getPagePosts({ pageId }), { tenantId, accountId, extraKey: [pageId || 'none'], enabled })

export function useReachEstimate({ tenantId, accountId, adSet, specialAdCategories, targeting }) {
  const signature = useDebouncedValue(JSON.stringify({ geo: adSet?.audience, goal: adSet?.performanceGoal, specialAdCategories }), 500)
  return useQuery({
    queryKey: KEY(tenantId, accountId, 'reach', signature),
    queryFn: () => metaAssetsSource.getReachEstimate({ accountId, adSet, targeting, specialAdCategories }),
    enabled: Boolean(tenantId && adSet),
    staleTime: STALE,
    placeholderData: keepPreviousData,
  })
}
