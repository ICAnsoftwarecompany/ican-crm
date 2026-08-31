import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import {
  getTaskDateTime,
  getTaskPriorityMeta,
  getTaskTitle,
  getTaskTypeMeta,
} from '../utils/taskMeta'

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatHeaderDate(date, mode) {
  if (mode === 'day') {
    return date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (mode === 'week') {
    const start = startOfDay(date)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

  return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
}

function inRange(date, from, to) {
  return date.getTime() >= from.getTime() && date.getTime() <= to.getTime()
}

export function TaskCalendarView({ tasks = [], onOpenTask, onCreateAt }) {
  const [mode, setMode] = useState('month')
  const [focusDate, setFocusDate] = useState(new Date())

  const range = useMemo(() => {
    const current = new Date(focusDate)

    if (mode === 'day') {
      return {
        from: startOfDay(current),
        to: endOfDay(current),
      }
    }

    if (mode === 'week') {
      const from = startOfDay(current)
      from.setDate(from.getDate() - from.getDay())
      const to = endOfDay(new Date(from))
      to.setDate(from.getDate() + 6)
      return { from, to }
    }

    const from = startOfDay(new Date(current.getFullYear(), current.getMonth(), 1))
    const to = endOfDay(new Date(current.getFullYear(), current.getMonth() + 1, 0))
    return { from, to }
  }, [focusDate, mode])

  const visibleTasks = useMemo(() => {
    return tasks
      .map((task) => ({ task, date: getTaskDateTime(task) }))
      .filter((item) => item.date && inRange(item.date, range.from, range.to))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [range.from, range.to, tasks])

  const groupedByDay = useMemo(() => {
    const groups = []

    visibleTasks.forEach((item) => {
      const existing = groups.find((group) => isSameDay(group.date, item.date))
      if (existing) existing.items.push(item)
      else groups.push({ date: startOfDay(item.date), items: [item] })
    })

    return groups
  }, [visibleTasks])

  const moveRange = (delta) => {
    setFocusDate((current) => {
      const next = new Date(current)
      if (mode === 'day') next.setDate(next.getDate() + delta)
      else if (mode === 'week') next.setDate(next.getDate() + 7 * delta)
      else next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  return (
    <div className="rounded-2xl border border-[#D7EEF0] bg-white p-3">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]"><CalendarDays size={16} /></span>
          <div>
            <h3 className="text-sm font-black text-[#0F172A]">تقويم المهام</h3>
            <p className="text-xs font-semibold text-[#64748B]">{formatHeaderDate(focusDate, mode)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setFocusDate(new Date())} className="h-8 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-black text-[#007A80]">Today</button>
          <button type="button" onClick={() => moveRange(-1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7EEF0] bg-white text-[#007A80]"><ChevronRight size={14} /></button>
          <button type="button" onClick={() => moveRange(1)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D7EEF0] bg-white text-[#007A80]"><ChevronLeft size={14} /></button>
        </div>
      </header>

      <div className="mb-3 flex gap-1">
        {['month', 'week', 'day'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={[
              'h-8 rounded-lg border px-2 text-xs font-black',
              mode === item ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]' : 'border-[#D7EEF0] bg-white text-[#64748B]',
            ].join(' ')}
          >
            {item === 'month' ? 'Month' : item === 'week' ? 'Week' : 'Day'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {groupedByDay.length ? groupedByDay.map((group) => (
          <section key={group.date.toISOString()} className="rounded-xl border border-[#E5EEF0] bg-[#F8FEFF] p-2">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-black text-[#0F172A]">
                {group.date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
              <button
                type="button"
                onClick={() => onCreateAt?.(group.date)}
                className="rounded-lg border border-[#D7EEF0] bg-white px-2 py-1 text-[10px] font-black text-[#007A80]"
              >
                إضافة مهمة هنا
              </button>
            </div>

            <div className="space-y-1.5">
              {group.items.map(({ task, date }) => {
                const typeMeta = getTaskTypeMeta(task?.type)
                const priorityMeta = getTaskPriorityMeta(task?.priority)
                const TypeIcon = typeMeta.icon
                const time = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })

                return (
                  <button
                    key={task.id || `${task.title}-${date.toISOString()}`}
                    type="button"
                    onClick={() => onOpenTask?.(task.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#D7EEF0] bg-white px-2 py-1.5 text-start"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <TypeIcon size={13} className="text-[#007A80]" />
                      <span className="truncate text-xs font-black text-[#0F172A]">{getTaskTitle(task)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-[#64748B]">{time}</span>
                      <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-black ${priorityMeta.className}`}>{priorityMeta.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )) : (
          <div className="rounded-xl border border-dashed border-[#D7EEF0] bg-[#F8FEFF] p-3 text-center text-xs font-semibold text-[#64748B]">
            لا توجد مهام في النطاق الزمني الحالي.
          </div>
        )}
      </div>
    </div>
  )
}
