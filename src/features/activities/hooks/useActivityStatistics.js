import { useMemo } from 'react'

import { isOverdueActivity, isToday } from '../utils/activityDateHelpers'

export function useActivityStatistics(activities = []) {
  return useMemo(() => {
    const list = Array.isArray(activities) ? activities : []

    return {
      total: list.length,
      today: list.filter((activity) => isToday(activity.startAt)).length,
      scheduled: list.filter((activity) => activity.status === 'scheduled').length,
      inProgress: list.filter((activity) => activity.status === 'in_progress').length,
      completed: list.filter((activity) => activity.status === 'completed').length,
      overdue: list.filter(isOverdueActivity).length,
      cancelled: list.filter((activity) => activity.status === 'cancelled').length,
    }
  }, [activities])
}
