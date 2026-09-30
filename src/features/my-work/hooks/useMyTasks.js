import { useMemo } from 'react'
import { getTaskDateTime, isTaskOverdue, useTasks } from '../../tasks'
import { getDueTasks, isMyTask } from '../utils/myWorkItems'
import { useCurrentUserId } from './useCurrentUserId'

// Same params as the calendar's task source, so the cache is shared.
const LIST_PARAMS = { per_page: 200 }

/** My tasks: all, due by end of today (overdue first), and overdue. */
export function useMyTasks() {
  const userId = useCurrentUserId()
  const query = useTasks(LIST_PARAMS)

  return useMemo(() => {
    const list = Array.isArray(query.data) ? query.data : []
    const mine = list.filter((task) => isMyTask(task, userId))
    return {
      mine,
      due: getDueTasks(mine, getTaskDateTime),
      overdue: mine.filter((task) => isTaskOverdue(task)),
      isLoading: query.isLoading,
      error: query.error,
      refetch: query.refetch,
    }
  }, [query.data, query.error, query.isLoading, query.refetch, userId])
}
