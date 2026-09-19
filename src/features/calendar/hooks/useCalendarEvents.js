import { useMemo } from 'react'
import { useTasks } from '../../tasks/hooks/useTasks'
import { useActivities } from '../../activities/hooks/useActivities'
import { tasksToCalendarEvents } from '../adapters/taskEventAdapter'
import { activitiesToCalendarEvents } from '../adapters/activityEventAdapter'

// No server-side date-range filter is confirmed to exist on either list
// endpoint, so v1 fetches a generous page (matching TasksPage's own
// { per_page: 100 } convention) and filters by visible range client-side
// inside the engine's views. Follow-up: narrow this once/if the backend
// exposes date-range params.
const LIST_PARAMS = { per_page: 200 }

export function useCalendarEvents() {
  const tasksQuery = useTasks(LIST_PARAMS)
  const activitiesQuery = useActivities(LIST_PARAMS)

  const tasks = Array.isArray(tasksQuery.data) ? tasksQuery.data : []
  const activities = Array.isArray(activitiesQuery.data?.data) ? activitiesQuery.data.data : []

  const events = useMemo(
    () => [...tasksToCalendarEvents(tasks), ...activitiesToCalendarEvents(activities)],
    [tasks, activities]
  )

  return {
    events,
    isLoading: tasksQuery.isLoading || activitiesQuery.isLoading,
    error: tasksQuery.error || activitiesQuery.error,
    refetch: () => {
      tasksQuery.refetch()
      activitiesQuery.refetch()
    },
  }
}
