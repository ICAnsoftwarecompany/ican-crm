import { useMemo, useState } from 'react'
import { ResourceState } from '../data/ResourceState'
import { CalendarSidebar } from './CalendarSidebar'
import { CalendarToolbar } from './CalendarToolbar'
import { DayView } from './views/DayView'
import { MonthView } from './views/MonthView'
import { WeekView } from './views/WeekView'
import { YearView } from './views/YearView'
import { useCalendar } from './hooks/useCalendar'
import { addMonths } from '../../utils/dateTime'

/**
 * Public composite — the domain-agnostic Calendar engine. Mirrors
 * VisualFlow's contract: it never imports or references Tasks/Meetings/
 * Calls. Which sources exist and what an event click/drop/slot-click
 * should DO all arrive as props from the consuming feature
 * (features/calendar).
 */
export function Calendar({
  events = [],
  sources = [],
  visibleSourceIds,
  onToggleSource,
  onEventClick,
  onSlotClick,
  onEventDrop,
  canDragEvent,
  isLoading,
  error,
  onRetry,
  headerActions,
  createSlot,
  className,
}) {
  const { currentDate, view, setView, goToday, goNext, goPrev, goToDate } = useCalendar()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sourceMap = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources])
  const getSource = (id) => sourceMap.get(id) || null

  const visibleEvents = useMemo(() => {
    if (!visibleSourceIds) return events
    return events.filter((event) => visibleSourceIds.has(event.sourceId))
  }, [events, visibleSourceIds])

  const eventDaySet = useMemo(
    () => new Set(visibleEvents.map((event) => new Date(event.start).toDateString())),
    [visibleEvents]
  )

  const goToDayView = (date) => {
    goToDate(date)
    setView('day')
  }

  return (
    <div className={`flex h-full min-h-[600px] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] ${className || ''}`}>
      <CalendarToolbar
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        headerActions={headerActions}
      />

      <div className="flex min-h-0 flex-1">
        <div className={sidebarOpen ? 'block' : 'hidden lg:block'}>
          <CalendarSidebar
            monthDate={currentDate}
            selectedDate={currentDate}
            onSelectDate={goToDayView}
            onMonthChange={(delta) => goToDate(addMonths(currentDate, delta))}
            eventDaySet={eventDaySet}
            sources={sources}
            visibleSourceIds={visibleSourceIds}
            onToggleSource={onToggleSource}
            createSlot={createSlot}
          />
        </div>

        <div className="min-w-0 flex-1">
          <ResourceState isLoading={isLoading} error={error} onRetry={onRetry}>
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                events={visibleEvents}
                getSource={getSource}
                onEventClick={onEventClick}
                onSlotClick={onSlotClick}
                onEventDrop={onEventDrop}
                canDragEvent={canDragEvent}
              />
            )}
            {view === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={visibleEvents}
                getSource={getSource}
                onEventClick={onEventClick}
                onSlotClick={onSlotClick}
              />
            )}
            {view === 'day' && (
              <DayView
                currentDate={currentDate}
                events={visibleEvents}
                getSource={getSource}
                onEventClick={onEventClick}
                onSlotClick={onSlotClick}
              />
            )}
            {view === 'year' && (
              <YearView currentDate={currentDate} eventDaySet={eventDaySet} onSelectDate={goToDayView} />
            )}
          </ResourceState>
        </div>
      </div>
    </div>
  )
}
