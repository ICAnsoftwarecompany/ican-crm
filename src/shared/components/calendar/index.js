// Public API — consumers should never import from internal paths inside
// calendar/* directly; everything needed is re-exported here (same
// convention as shared/components/visual-flow).

export { Calendar } from './Calendar'
export { CalendarToolbar } from './CalendarToolbar'
export { CalendarSidebar } from './CalendarSidebar'
export { MiniCalendar } from './MiniCalendar'
export { EventPill } from './EventPill'

export { MonthView } from './views/MonthView'
export { WeekView } from './views/WeekView'
export { DayView } from './views/DayView'
export { YearView } from './views/YearView'
export { CalendarTimeGrid } from './views/CalendarTimeGrid'

export { useCalendar, CALENDAR_VIEWS } from './hooks/useCalendar'
export { createEventSourceRegistry } from './registry/createEventSourceRegistry'
export { buildHourSlots, buildMonthGrid, buildWeekDays, buildYearMonths } from './utils/calendarMath'
