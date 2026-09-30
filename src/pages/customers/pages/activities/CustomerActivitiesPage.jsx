import { ActivitiesPage } from '../../../../features/activities'
import { ActivitiesCalendarView } from '../../../../features/calendar'

/**
 * /LeadsCenter/activities — calls and meetings of the Leads Center. Since 2026-10-01 the calendar
 * (shared engine) is the main view, with a calendar/table switch at the top; the page keeps its own
 * remembered view so it does not affect /calls and /meetings.
 */
export function CustomerActivitiesPage() {
  return (
    <ActivitiesPage
      embedded
      defaultView="calendar"
      viewSwitchPlacement="top"
      viewStorageKey="leads-center-activities-view"
      renderCalendar={(activities, { onActivityClick, onCreate }) => (
        <ActivitiesCalendarView activities={activities} onActivityClick={onActivityClick} onCreate={onCreate} />
      )}
    />
  )
}
