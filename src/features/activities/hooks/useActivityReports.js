import { useQuery } from '@tanstack/react-query'

import { activitiesApi } from '../api/activitiesApi'
import { extractList } from '../../../shared/utils/apiResponse'
import { activityKeys } from './useActivityKeys'

export function useActivityReports(activityId, params, options = {}) {
  return useQuery({
    queryKey: activityKeys.reports(activityId, params),
    queryFn: () => activitiesApi.getActivityReports(activityId, params),
    select: (response) => extractList(response, ['data', 'reports', 'items']),
    enabled: Boolean(activityId) && (options.enabled ?? true),
    ...options,
  })
}
