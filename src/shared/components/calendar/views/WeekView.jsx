import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getWeekStartDay } from '../../../utils/dateTime'
import { buildWeekDays } from '../utils/calendarMath'
import { CalendarTimeGrid } from './CalendarTimeGrid'

export function WeekView({ currentDate, events, getSource, onEventClick, onSlotClick }) {
  const { i18n } = useTranslation()
  const weekStartsOn = getWeekStartDay(i18n.language)
  const days = useMemo(() => buildWeekDays(currentDate, weekStartsOn), [currentDate, weekStartsOn])

  return (
    <CalendarTimeGrid
      days={days}
      events={events}
      getSource={getSource}
      onEventClick={onEventClick}
      onSlotClick={onSlotClick}
    />
  )
}
