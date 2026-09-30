import { useMemo } from 'react'
import { isOverdueActivity, useActivities } from '../../activities'
import { getTodayActivities, isMyActivity } from '../utils/myWorkItems'
import { useCurrentUserId } from './useCurrentUserId'

// Same params as the calendar (features/calendar/hooks/useCalendarEvents) so both share one cache.
// Filtering to "mine" is client-side: the list endpoint's user filter does not cover participants.
const LIST_PARAMS = { per_page: 200 }

/** My calls and meetings: all, today's, and overdue. */
export function useMyActivities() {
  const userId = useCurrentUserId()
  const query = useActivities(LIST_PARAMS)

  return useMemo(() => {
    const list = Array.isArray(query.data?.data) ? query.data.data : []
    const mine = list.filter((activity) => isMyActivity(activity, userId))
    return {
      mine,
      today: getTodayActivities(mine),
      overdue: mine.filter(isOverdueActivity),
      isLoading: query.isLoading,
      error: query.error,
      refetch: query.refetch,
    }
  }, [query.data, query.error, query.isLoading, query.refetch, userId])
}
