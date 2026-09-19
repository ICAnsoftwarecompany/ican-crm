import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../utils/cn'
import { formatTime, formatWeekday, isSameDay } from '../../../utils/dateTime'
import { buildHourSlots } from '../utils/calendarMath'
import { EventPill } from '../EventPill'

const HOUR_HEIGHT = 48

function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes()
}

function EventBlock({ event, source, onEventClick }) {
  const start = new Date(event.start)
  const end = event.end ? new Date(event.end) : new Date(start.getTime() + 30 * 60000)
  const top = (minutesSinceMidnight(start) / 60) * HOUR_HEIGHT
  const durationMinutes = Math.max(20, (end.getTime() - start.getTime()) / 60000)
  const height = (durationMinutes / 60) * HOUR_HEIGHT

  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation()
        onEventClick?.(event)
      }}
      className="absolute inset-x-0.5 overflow-hidden rounded-md px-1.5 py-0.5 text-start text-[10px] font-bold text-white"
      style={{ top: `${top}px`, height: `${height}px`, backgroundColor: `var(${source?.colorVar || '--brand-accent'})` }}
      title={event.title}
    >
      <div className="truncate">{event.title}</div>
    </button>
  )
}

function CurrentTimeIndicator() {
  const top = (minutesSinceMidnight(new Date()) / 60) * HOUR_HEIGHT
  return (
    <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: `${top}px` }}>
      <span className="-ms-1 h-2 w-2 rounded-full bg-red-500" />
      <span className="h-px flex-1 bg-red-500" />
    </div>
  )
}

/**
 * Shared hourly grid consumed by both Week (7 columns) and Day (1 column)
 * views, so the current-time indicator / all-day row / hour math only
 * exists once.
 */
export function CalendarTimeGrid({ days, events, getSource, onEventClick, onSlotClick }) {
  const { t, i18n } = useTranslation()
  const scrollRef = useRef(null)
  const hours = useMemo(() => buildHourSlots(0, 24), [])
  const timedEvents = useMemo(() => events.filter((event) => !event.allDay), [events])
  const allDayEvents = useMemo(() => events.filter((event) => event.allDay), [events])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_HEIGHT
  }, [])

  const gridTemplateColumns = `56px repeat(${days.length}, minmax(0,1fr))`

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="grid border-b border-[var(--border)]" style={{ gridTemplateColumns }}>
        <div />
        {days.map((day) => (
          <div key={day.date.toISOString()} className="border-s border-[var(--border)] py-1.5 text-center">
            <div className="text-[10px] font-bold text-[var(--text-muted)]">{formatWeekday(day.date, i18n.language, 'short')}</div>
            <div
              className={cn(
                'mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-sm font-black',
                day.isToday ? 'bg-[var(--brand-accent)] text-white' : 'text-[var(--text)]'
              )}
            >
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {allDayEvents.length > 0 && (
        <div className="grid border-b border-[var(--border)]" style={{ gridTemplateColumns }}>
          <div className="p-1 text-[9px] font-bold text-[var(--text-muted)]">{t('calendar.allDay')}</div>
          {days.map((day) => (
            <div key={day.date.toISOString()} className="space-y-0.5 border-s border-[var(--border)] p-0.5">
              {allDayEvents
                .filter((event) => isSameDay(event.start, day.date))
                .map((event) => (
                  <EventPill key={event.id} event={event} source={getSource(event.sourceId)} onClick={onEventClick} dense />
                ))}
            </div>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns }}>
          <div>
            {hours.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="border-b border-[var(--border)] pe-1.5 text-end text-[10px] font-bold text-[var(--text-muted)]"
              >
                {hour === 0 ? '' : formatTime(new Date(2000, 0, 1, hour), i18n.language)}
              </div>
            ))}
          </div>

          {days.map((day) => (
            <div key={day.date.toISOString()} className="relative border-s border-[var(--border)]">
              {day.isToday && <CurrentTimeIndicator />}
              {hours.map((hour) => (
                <div
                  key={hour}
                  onClick={() => onSlotClick?.(new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), hour))}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--surface-2)]"
                />
              ))}
              {timedEvents
                .filter((event) => isSameDay(event.start, day.date))
                .map((event) => (
                  <EventBlock key={event.id} event={event} source={getSource(event.sourceId)} onEventClick={onEventClick} />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
