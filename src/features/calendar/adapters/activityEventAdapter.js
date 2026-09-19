/**
 * Activity (Meeting/Call, already normalized by
 * features/activities/utils/activityHelpers.normalizeActivity) ->
 * CalendarEvent. Activities are split into two calendar sources (meetings
 * vs calls) so they can be toggled independently in the sidebar, even
 * though they share one backend table.
 */
export function activityToCalendarEvent(activity) {
  if (!activity?.id || !activity?.startAt) return null

  const start = new Date(activity.startAt)
  if (Number.isNaN(start.getTime())) return null

  const end = activity.endAt ? new Date(activity.endAt) : null
  const validEnd = end && !Number.isNaN(end.getTime()) ? end : start

  return {
    id: `${activity.type === 'call' ? 'call' : 'meeting'}-${activity.id}`,
    sourceId: activity.type === 'call' ? 'calls' : 'meetings',
    title: activity.title,
    start,
    end: validEnd,
    allDay: false,
    status: activity.status,
    rawId: activity.id,
    raw: activity,
  }
}

export function activitiesToCalendarEvents(activities = []) {
  return activities.map(activityToCalendarEvent).filter(Boolean)
}
