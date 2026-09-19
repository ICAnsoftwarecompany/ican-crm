import { useMemo } from 'react'
import { isSameDay } from '../../../utils/dateTime'
import { CalendarTimeGrid } from './CalendarTimeGrid'

export function DayView({ currentDate, events, getSource, onEventClick, onSlotClick }) {
  const days = useMemo(() => [{ date: currentDate, isToday: isSameDay(currentDate, new Date()) }], [currentDate])

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
