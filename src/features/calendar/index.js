// Public surface of the calendar feature (domain sources + drawers). The engine itself is
// shared/components/calendar. Added 2026-10-01; older consumers still import internal paths.
export { calendarSourceRegistry, CALENDAR_SOURCE_IDS } from './constants/calendarSources'
export { useCalendarEvents } from './hooks/useCalendarEvents'
export { useVisibleSources } from './hooks/useVisibleSources'
export { ActivityPreviewDrawer } from './components/ActivityPreviewDrawer'
export { CreateEventMenu } from './components/CreateEventMenu'
export { ActivitiesCalendarView } from './components/ActivitiesCalendarView'
