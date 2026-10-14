import { useMemo } from 'react'
import { getTaskDateTime, isTaskOverdue, isTodoTask, useTasks } from '../../tasks'
import { getDueTasks, isMyTask } from '../utils/myWorkItems'
import { useCurrentUserId } from './useCurrentUserId'

// Same params as the calendar's task source, so the cache is shared.
const LIST_PARAMS = { per_page: 200 }

/** My tasks (To-Dos excluded): all, due by end of today (overdue first), and overdue. */
export function useMyTasks() {
  const userId = useCurrentUserId()
  const query = useTasks(LIST_PARAMS)

  return useMemo(() => {
    const list = Array.isArray(query.data) ? query.data : []
    // To-Dos have their own section (TodoSection); this hook is the user's other tasks.
    const mine = list.filter((task) => !isTodoTask(task) && isMyTask(task, userId))
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
