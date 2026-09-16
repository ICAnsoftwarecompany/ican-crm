import { useQuery } from '@tanstack/react-query'

import { activitiesApi } from '../api/activitiesApi'
import { activityKeys } from './useActivityKeys'

export function useActivities(params, options = {}) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => activitiesApi.getActivities(params),
    ...options,
  })
}
