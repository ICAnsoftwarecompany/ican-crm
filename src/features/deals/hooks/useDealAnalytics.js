import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dealAnalyticsApi } from '../api'
import { isDealApiLive } from '../constants/dealApiStatus'
import { dealKeys } from '../constants/dealQueryKeys'
import { unwrapEntity, unwrapList } from './dealResponse'

/** Backend analytics of one deal. Only the live endpoints are called; planned ones return empty data. */
export function useDealAnalytics(dealId) {
  const overview = useQuery({
    queryKey: dealKeys.analytics(dealId, 'overview'),
    queryFn: () => dealAnalyticsApi.getOverview(dealId),
    enabled: Boolean(dealId) && isDealApiLive('analyticsOverview'),
  })
  const owners = useQuery({
    queryKey: dealKeys.analytics(dealId, 'owners'),
    queryFn: () => dealAnalyticsApi.getOwners(dealId),
    enabled: Boolean(dealId) && isDealApiLive('analyticsOwners'),
  })
  return useMemo(() => ({
    overview: unwrapEntity(overview.data, 'overview'),
    owners: unwrapList(owners.data, ['owners']),
    isLoading: overview.isLoading || owners.isLoading,
    error: overview.error || owners.error,
  }), [overview.data, overview.error, overview.isLoading, owners.data, owners.error, owners.isLoading])
}
