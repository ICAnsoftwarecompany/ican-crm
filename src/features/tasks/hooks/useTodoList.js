import { useCallback, useMemo, useState } from 'react'
import { useTaskMutations, useTasks } from './useTasks'
import { useCurrentUserId } from './useCurrentUserId'
import { buildTaskPayload, TASK_FORM_DEFAULTS } from '../utils/taskPayload'
import { countOpenTodoItems, groupTodoItems, isTaskOnMyList, TODO_VIEWS, VIEW_PERIOD } from '../utils/todoPeriods'
import { isTaskCompleted } from '../utils/taskMeta'

// Same params as the calendar and My Work, so the three share one cached request.
const LIST_PARAMS = { per_page: 200 }

/**
 * The signed-in user's To-Do list for a view (today / week / month / overdue), built on the normal
 * task endpoints: list = `GET /tasks`, quick add = `POST /tasks` (type todo + period), done =
 * `PATCH /tasks/{id}/status`. "Mine" is filtered client-side until the backend supports
 * `assigned_to=me`.
 */
export function useTodoList(view = 'today') {
  const userId = useCurrentUserId()
  const query = useTasks(LIST_PARAMS)
  const mutations = useTaskMutations()
  const [pendingIds, setPendingIds] = useState(() => new Set())

  const mine = useMemo(() => {
    const list = Array.isArray(query.data) ? query.data : []
    return list.filter((task) => isTaskOnMyList(task, userId))
  }, [query.data, userId])

  const groups = useMemo(() => groupTodoItems(mine, view, new Date()), [mine, view])

  const counts = useMemo(() => {
    const now = new Date()
    return Object.fromEntries(TODO_VIEWS.map((id) => [id, countOpenTodoItems(groupTodoItems(mine, id, now))]))
  }, [mine])

  const { create, changeStatus } = mutations

  const quickAdd = useCallback((title, targetView = view) => {
    const payload = buildTaskPayload({
      ...TASK_FORM_DEFAULTS,
      title,
      type: 'todo',
      visibility: 'private',
      period_type: VIEW_PERIOD[targetView] || 'day',
    }, { currentUserId: userId })
    return create.mutateAsync(payload)
  }, [create, userId, view])

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
    groups,
    counts,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    quickAdd,
    isAdding: create.isPending,
    toggleDone,
    pendingIds,
  }
}
