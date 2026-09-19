import { addDays, isSameDay, isSameMonth, startOfMonth, startOfWeek } from '../../../utils/dateTime'

const MONTH_GRID_WEEKS = 6

/**
 * Always returns 6 full weeks (42 days), matching Google Calendar's month
 * grid so the layout height never jumps between months.
 */
export function buildMonthGrid(monthDate, weekStartsOn = 0, today = new Date()) {
  const monthStart = startOfMonth(monthDate)
  let cursor = startOfWeek(monthStart, weekStartsOn)

  const weeks = []
  for (let week = 0; week < MONTH_GRID_WEEKS; week += 1) {
    const days = []
    for (let day = 0; day < 7; day += 1) {
      days.push({
        date: cursor,
        isCurrentMonth: isSameMonth(cursor, monthStart),
        isToday: isSameDay(cursor, today),
      })
      cursor = addDays(cursor, 1)
    }
    weeks.push(days)
  }
  return weeks
}

export function buildWeekDays(anchorDate, weekStartsOn = 0, today = new Date()) {
  const start = startOfWeek(anchorDate, weekStartsOn)
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index)
    return { date, isToday: isSameDay(date, today) }
  })
}

export function buildYearMonths(yearDate) {
  const year = new Date(yearDate).getFullYear()
  return Array.from({ length: 12 }, (_, month) => new Date(year, month, 1))
}

export function buildHourSlots(startHour = 0, endHour = 24) {
  return Array.from({ length: Math.max(0, endHour - startHour) }, (_, index) => startHour + index)
}
