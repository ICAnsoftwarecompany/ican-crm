import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDirection } from '../../hooks/useDirection'
import { cn } from '../../utils/cn'
import { formatMonthYear, formatWeekday, getWeekStartDay, isSameDay } from '../../utils/dateTime'
import { buildMonthGrid } from './utils/calendarMath'

export function MiniCalendar({
  monthDate,
  selectedDate,
  onSelectDate,
  onMonthChange,
  eventDaySet,
  compact = false,
  showHeader = true,
  navigable = true,
}) {
  const { t, i18n } = useTranslation()
  const isRtl = useDirection() === 'rtl'
  const weekStartsOn = getWeekStartDay(i18n.language)
  const weeks = useMemo(() => buildMonthGrid(monthDate, weekStartsOn), [monthDate, weekStartsOn])
  const weekdayLabels = weeks[0].map((cell) => formatWeekday(cell.date, i18n.language, 'narrow'))

  return (
    <div className="select-none">
      {showHeader && (
        <div className={cn('mb-1 flex items-center', navigable ? 'justify-between' : 'justify-center')}>
          <span className="text-xs font-black text-[var(--text)]">{formatMonthYear(monthDate, i18n.language)}</span>
          {navigable && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onMonthChange?.(-1)}
                aria-label={t('calendar.previous')}
                className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              >
                {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
              <button
                type="button"
                onClick={() => onMonthChange?.(1)}
                aria-label={t('calendar.next')}
                className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
              >
                {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-[var(--text-muted)]">
        {weekdayLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      <div className="mt-0.5 grid grid-cols-7 gap-0.5">
        {weeks.flat().map((cell) => {
          const hasEvents = eventDaySet?.has(cell.date.toDateString())
          const selected = selectedDate ? isSameDay(cell.date, selectedDate) : false

          return (
            <button
              key={cell.date.toISOString()}
              type="button"
              onClick={() => onSelectDate?.(cell.date)}
              className={cn(
                'relative flex items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                compact ? 'h-6 w-6' : 'h-7 w-7',
                !cell.isCurrentMonth && 'text-[var(--text-light)] opacity-40',
                cell.isCurrentMonth && !selected && 'text-[var(--text)] hover:bg-[var(--surface-2)]',
                cell.isToday && !selected && 'text-[var(--brand-accent)]',
                selected && 'bg-[var(--brand-accent)] text-white'
              )}
            >
              {cell.date.getDate()}
              {hasEvents && !selected && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[var(--brand-accent)]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
