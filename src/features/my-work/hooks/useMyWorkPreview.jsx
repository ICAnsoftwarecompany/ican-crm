import { useState } from 'react'
import { ActivityPreviewDrawer } from '../../calendar'
import { TaskDrawer } from '../../tasks'

/**
 * Opens a call/meeting or a task in place, without leaving My Work. Reuses the calendar's
 * activity preview drawer and the tasks drawer — no new drawer is built here.
 */
export function useMyWorkPreview({ onChanged } = {}) {
  const [activity, setActivity] = useState(null)
  const [taskId, setTaskId] = useState(null)

  const drawers = (
    <>
      <ActivityPreviewDrawer
        activity={activity}
        open={Boolean(activity)}
        onClose={() => setActivity(null)}
        onSaved={onChanged}
      />
      <TaskDrawer
        open={Boolean(taskId)}
        taskId={taskId}
        onClose={() => setTaskId(null)}
        onUpdated={onChanged}
        onDeleted={() => {
          setTaskId(null)
          onChanged?.()
        }}
      />
    </>
  )

  return { openActivity: setActivity, openTask: setTaskId, drawers }
}
