import { useCallback, useMemo, useState } from 'react'
import { useTaskMutations, useTasks } from './useTasks'
import { isTaskLinkedTo, toBackendTaskableType } from '../constants/taskableTypes'
import { getTaskDeadline, isTaskClosed, isTaskCompleted } from '../utils/taskMeta'

function byDeadline(left, right) {
  return (getTaskDeadline(left)?.getTime() ?? Infinity) - (getTaskDeadline(right)?.getTime() ?? Infinity)
}

/** Open tasks of a record by deadline (undated last), then closed ones (newest deadline first). */
export function splitEntityTasks(tasks = [], type, id) {
  const linked = (Array.isArray(tasks) ? tasks : []).filter((task) => isTaskLinkedTo(task, type, id))
  return {
    open: linked.filter((task) => !isTaskClosed(task)).sort(byDeadline),
    closed: linked.filter((task) => isTaskClosed(task)).sort((left, right) => byDeadline(right, left)),
  }
}

/**
 * Tasks linked to one CRM record (lead, customer, …). Asks the backend with the same params the
 * customer drawer always sent (`taskable_type` + `taskable_id`, same cache key) and keeps only
 * tasks really linked to the record, in case the backend ignores the filter.
 */
export function useEntityTasks(type, id) {
  const params = useMemo(() => ({ taskable_type: toBackendTaskableType(type), taskable_id: id }), [type, id])
  const enabled = Boolean(params.taskable_type && id)
  const query = useTasks(params, { enabled })
  const { changeStatus } = useTaskMutations()
  const [pendingIds, setPendingIds] = useState(() => new Set())

  const { open, closed } = useMemo(() => splitEntityTasks(query.data, type, id), [query.data, type, id])

  const toggleDone = useCallback(async (task) => {
    if (!task?.id) return null
    const done = isTaskCompleted(task)
    setPendingIds((current) => new Set(current).add(task.id))
    try {
      await changeStatus.mutateAsync({ taskId: task.id, payload: { status: done ? 'pending' : 'completed' } })
      return done ? 'reopened' : 'completed'
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(task.id)
        return next
      })
    }
  }, [changeStatus])

  return {
    enabled,
    open,
    closed,
    isLoading: enabled && query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    toggleDone,
    pendingIds,
  }
}
