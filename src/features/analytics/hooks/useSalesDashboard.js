import { useQuery } from '@tanstack/react-query'
import { salesDashboardApi } from '../api/salesDashboardApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useSalesDashboard() {
  const myLeads = useQuery({
    queryKey: QUERY_KEYS.dashboard.myLeads,
    queryFn: () => salesDashboardApi.getMyLeads(),
    select: (data) => extractList(data, ['leads', 'my_leads']),
  })

  const myTeams = useQuery({
    queryKey: QUERY_KEYS.dashboard.myTeams,
    queryFn: () => salesDashboardApi.getMyTeams(),
    select: (data) => extractList(data, ['teams', 'my_teams']),
  })

  return {
    myLeads,
    myTeams,
    isLoading: myLeads.isLoading || myTeams.isLoading,
    error: myLeads.error || myTeams.error,
    refetch: () => {
      myLeads.refetch()
      myTeams.refetch()
    },
  }
}
