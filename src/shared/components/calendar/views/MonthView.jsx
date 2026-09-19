import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { cn } from '../../../utils/cn'
import { formatWeekday, getWeekStartDay, isSameDay } from '../../../utils/dateTime'
import { buildMonthGrid } from '../utils/calendarMath'
import { EventPill } from '../EventPill'

const MAX_VISIBLE_EVENTS = 3

function DraggableEvent({ event, source, onEventClick, draggable }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `calendar-event-${event.id}`,
    data: { event },
    disabled: !draggable,
  })

  return (
    <div ref={setNodeRef} {...(draggable ? { ...listeners, ...attributes } : {})} className={cn(isDragging && 'opacity-40')}>
      <EventPill event={event} source={source} onClick={onEventClick} dense />
    </div>
  )
}

function DroppableDay({ cell, onSlotClick, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-day-${cell.date.toDateString()}`,
    data: { date: cell.date },
  })

  return (
    <div
      ref={setNodeRef}
      onClick={() => onSlotClick?.(cell.date)}
      className={cn(
        'flex min-h-[92px] cursor-pointer flex-col gap-0.5 border-b border-e border-[var(--border)] p-1 last:border-e-0',
        !cell.isCurrentMonth && 'bg-[var(--surface-2)]',
        isOver && 'bg-[var(--brand-accent-soft)]'
      )}
    >
      {children}
    </div>
  )
}

export function MonthView({ currentDate, events, getSource, onEventClick, onSlotClick, onEventDrop, canDragEvent }) {
  const { i18n } = useTranslation()
  const weekStartsOn = getWeekStartDay(i18n.language)
  const weeks = useMemo(() => buildMonthGrid(currentDate, weekStartsOn), [currentDate, weekStartsOn])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const eventsByDay = useMemo(() => {
    const map = new Map()
    events.forEach((event) => {
      const key = new Date(event.start).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(event)
    })
    return map
  }, [events])

  const handleDragEnd = ({ active, over }) => {
    if (!over) return
    const event = active.data.current?.event
    const date = over.data.current?.date
    if (event && date && !isSameDay(event.start, date)) onEventDrop?.(event, date)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-7 border-b border-[var(--border)] text-center text-[11px] font-black text-[var(--text-muted)]">
          {weeks[0].map((cell) => (
            <div key={cell.date.toISOString()} className="border-e border-[var(--border)] py-1.5 last:border-e-0">
              {formatWeekday(cell.date, i18n.language, 'short')}
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-7 grid-rows-6">
          {weeks.flat().map((cell) => {
            const dayEvents = eventsByDay.get(cell.date.toDateString()) || []
            const visible = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
            const overflow = dayEvents.length - visible.length

            return (
              <DroppableDay key={cell.date.toISOString()} cell={cell} onSlotClick={onSlotClick}>
                <span
                  className={cn(
                    'text-xs font-black',
                    cell.isToday
                      ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-accent)] text-white'
                      : 'text-[var(--text)]'
                  )}
                >
                  {cell.date.getDate()}
                </span>

                {visible.map((event) => (
                  <DraggableEvent
                    key={event.id}
                    event={event}
                    source={getSource(event.sourceId)}
                    onEventClick={onEventClick}
                    draggable={Boolean(onEventDrop) && (canDragEvent ? canDragEvent(event) : true)}
                  />
                ))}

                {overflow > 0 && (
                  <span className="px-1 text-[10px] font-bold text-[var(--text-muted)]">+{overflow}</span>
                )}
              </DroppableDay>
            )
          })}
        </div>
      </div>
    </DndContext>
  )
}
