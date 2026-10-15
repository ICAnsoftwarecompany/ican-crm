import { useEffect, useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { dealAnalyticsApi } from '../api'
import { isDealApiLive } from '../constants/dealApiStatus'
import { dealKeys } from '../constants/dealQueryKeys'
import { normalizeDealOverview, normalizeDealOwners } from '../utils/dealAnalytics'

/**
 * Backend analytics of a deal (`analytics/overview` + `analytics/owners`), normalized (utils/dealAnalytics).
 *
 * Kept in the browser (2026-10-16): every successful answer is saved in localStorage (`deals:analytics:<kind>:<id>`)
 * and used as the starting data next time, so an opened deal shows its last numbers at once (with their time) and
 * refreshes in the background when older than STALE_MS. Same React Query keys everywhere (overview page, drawer,
 * workspace), so a deal is fetched once per session.
 */
const STALE_MS = 5 * 60 * 1000
const storageKey = (kind, dealId) => `deals:analytics:${kind}:${dealId}`

function readSnapshot(kind, dealId) {
  try {
    const raw = window.localStorage.getItem(storageKey(kind, dealId))
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && parsed.at ? parsed : null
  } catch {
    return null
  }
}

function writeSnapshot(kind, dealId, data, at) {
  try {
    window.localStorage.setItem(storageKey(kind, dealId), JSON.stringify({ at, data }))
  } catch {
    // Storage full or blocked: the in-memory cache still works.
  }
}

const KINDS = {
  overview: { capability: 'analyticsOverview', fetch: dealAnalyticsApi.getOverview },
  owners: { capability: 'analyticsOwners', fetch: dealAnalyticsApi.getOwners },
}

function analyticsQuery(kind, dealId, enabled = true) {
  const snapshot = dealId ? readSnapshot(kind, dealId) : null
  return {
    queryKey: dealKeys.analytics(String(dealId), kind),
    queryFn: () => KINDS[kind].fetch(dealId),
    enabled: Boolean(dealId) && enabled && isDealApiLive(KINDS[kind].capability),
    staleTime: STALE_MS,
    gcTime: 30 * 60 * 1000,
    ...(snapshot ? { initialData: snapshot.data, initialDataUpdatedAt: snapshot.at } : {}),
  }
}

function usePersist(kind, dealId, query) {
  useEffect(() => {
    if (dealId && query.data && query.dataUpdatedAt && query.isFetched) writeSnapshot(kind, dealId, query.data, query.dataUpdatedAt)
  }, [dealId, kind, query.data, query.dataUpdatedAt, query.isFetched])
}

export function useDealAnalytics(dealId, { enabled = true, owners: withOwners = true } = {}) {
  const overview = useQuery(analyticsQuery('overview', dealId, enabled))
  const owners = useQuery(analyticsQuery('owners', dealId, enabled && withOwners))
  usePersist('overview', dealId, overview)
  usePersist('owners', dealId, owners)

  return useMemo(() => ({
    overview: normalizeDealOverview(overview.data),
    owners: normalizeDealOwners(owners.data),
    raw: { overview: overview.data, owners: owners.data },
    updatedAt: overview.dataUpdatedAt || null,
    isLoading: overview.isLoading,
    isFetching: overview.isFetching || owners.isFetching,
    ownersLoading: owners.isLoading,
    error: overview.error,
    ownersError: owners.error,
    refetch: () => Promise.all([overview.refetch(), withOwners ? owners.refetch() : null]),
  }), [overview, owners, withOwners])
}

/** Overview of several deals at once (compare view): `[{ dealId, overview, isLoading, error }]`. */
export function useDealsAnalyticsOverview(dealIds = []) {
  const queries = useQueries({ queries: dealIds.map((dealId) => analyticsQuery('overview', dealId)) })
  const key = queries.map((query) => `${query.dataUpdatedAt}:${query.status}`).join('|')
  return useMemo(
    () => dealIds.map((dealId, index) => ({ dealId: String(dealId), overview: normalizeDealOverview(queries[index]?.data), isLoading: Boolean(queries[index]?.isLoading), error: queries[index]?.error || null })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dealIds.join(','), key],
  )
}
