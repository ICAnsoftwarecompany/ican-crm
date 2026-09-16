import { useQuery } from '@tanstack/react-query'

import { activitiesApi } from '../api/activitiesApi'
import { activityKeys } from './useActivityKeys'

export function useActivity(activityId, params, options = {}) {
  return useQuery({
    queryKey: [...activityKeys.detail(activityId), params],
    queryFn: () => activitiesApi.getActivityInfo(activityId, params),
    enabled: Boolean(activityId) && (options.enabled ?? true),
    ...options,
  })
}
