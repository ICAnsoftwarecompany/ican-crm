import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { useTaskMutations } from './useTasks'
import { isTaskClosed } from '../utils/taskMeta'

/**
 * Tick to complete / untick to reopen any task (`PATCH /tasks/{id}/status`), with the ids in flight
 * (for spinners) and the toasts. Shared by the task list and the header Tasks panel.
 */
export function useTaskToggle({ onDone } = {}) {
  const { t } = useTranslation()
  const { changeStatus } = useTaskMutations()
  const [pendingIds, setPendingIds] = useState(() => new Set())

  const toggle = useCallback(async (task) => {
    if (!task?.id) return
    const reopen = isTaskClosed(task)
    setPendingIds((current) => new Set(current).add(task.id))
    try {
      await changeStatus.mutateAsync({ taskId: task.id, payload: { status: reopen ? 'pending' : 'completed' } })
      toast.success(t(reopen ? 'tasks.todo.reopenedToast' : 'tasks.todo.completedToast'))
      onDone?.()
    } catch (error) {
      toast.error(extractMessage(error, t('tasks.todo.statusFailed')))
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(task.id)
        return next
      })
    }
  }, [changeStatus, onDone, t])

  return { toggle, pendingIds }
}
