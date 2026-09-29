import { useQuery } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('reports')

export const REPORT_PERIODS = ['7d', '30d', '90d']

/**
 * GET /service/reports/overview?period= → { period, kpis, csat, sla, trend[], by_type[], by_channel[], by_agent[] }.
 * All aggregation happens on the server; durations are minutes, percentages 0–100, missing = null.
 */
export function useReportOverview(period) {
  return useQuery({
    queryKey: serviceKeys.reportOverview(period),
    queryFn: async () => {
      const response = await api.get(serviceEndpoints.reportOverview, { params: { period } })
      return response.data?.data ?? response.data
    },
    placeholderData: (previous) => previous,
    staleTime: 60 * 1000,
  })
}
