import { useMemo } from 'react'
import { buildYearMonths } from '../utils/calendarMath'
import { MiniCalendar } from '../MiniCalendar'

export function YearView({ currentDate, eventDaySet, onSelectDate }) {
  const months = useMemo(() => buildYearMonths(currentDate), [currentDate])

  return (
    <div className="grid h-full grid-cols-2 gap-4 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4">
      {months.map((month) => (
        <div key={month.toISOString()} className="rounded-xl border border-[var(--border)] p-2">
          <MiniCalendar
            monthDate={month}
            onSelectDate={onSelectDate}
            eventDaySet={eventDaySet}
            compact
            navigable={false}
          />
        </div>
      ))}
    </div>
  )
}
