import { useCallback, useMemo, useState } from 'react'
import { addDays, addMonths, startOfDay } from '../../../utils/dateTime'

export const CALENDAR_VIEWS = ['month', 'week', 'day', 'year']

/**
 * Orchestrator hook for the Calendar engine's own date/view state — the
 * "useDataTable" of this component, kept intentionally small since a
 * calendar only needs one focus date and one view mode.
 */
export function useCalendar({ initialDate = new Date(), initialView = 'month' } = {}) {
  const [currentDate, setCurrentDate] = useState(() => startOfDay(initialDate))
  const [view, setView] = useState(initialView)

  const goToday = useCallback(() => setCurrentDate(startOfDay(new Date())), [])

  const goToDate = useCallback((date) => setCurrentDate(startOfDay(date)), [])

  const goNext = useCallback(() => {
    setCurrentDate((current) => {
      if (view === 'day') return addDays(current, 1)
      if (view === 'week') return addDays(current, 7)
      if (view === 'year') return addMonths(current, 12)
      return addMonths(current, 1)
    })
  }, [view])

  const goPrev = useCallback(() => {
    setCurrentDate((current) => {
      if (view === 'day') return addDays(current, -1)
      if (view === 'week') return addDays(current, -7)
      if (view === 'year') return addMonths(current, -12)
      return addMonths(current, -1)
    })
  }, [view])

  return useMemo(() => ({
    currentDate,
    view,
    setView,
    goToday,
    goNext,
    goPrev,
    goToDate,
  }), [currentDate, view, goToday, goNext, goPrev, goToDate])
}
