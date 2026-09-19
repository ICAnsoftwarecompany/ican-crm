import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { useDirection } from '../../hooks/useDirection'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { CALENDAR_VIEWS } from './hooks/useCalendar'
import { formatDate, formatMonthYear } from '../../utils/dateTime'

const VIEW_LABEL_KEYS = {
  month: 'calendar.views.month',
  week: 'calendar.views.week',
  day: 'calendar.views.day',
  year: 'calendar.views.year',
}

function rangeTitle(currentDate, view, language) {
  if (view === 'day') return formatDate(currentDate, language, { dateStyle: 'full' })
  if (view === 'year') return String(new Date(currentDate).getFullYear())
  return formatMonthYear(currentDate, language)
}

export function CalendarToolbar({
  currentDate,
  view,
  onViewChange,
  onToday,
  onPrev,
  onNext,
  onToggleSidebar,
  headerActions,
}) {
  const { t, i18n } = useTranslation()
  const isRtl = useDirection() === 'rtl'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="flex items-center gap-1.5">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] lg:hidden"
            aria-label={t('calendar.toggleSidebar')}
          >
            <Menu size={18} />
          </button>
        )}

        <Button variant="outline" size="sm" onClick={onToday}>
          {t('calendar.today')}
        </Button>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onPrev}
            aria-label={t('calendar.previous')}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          >
            {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={t('calendar.next')}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          >
            {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <h2 className="ms-1 truncate text-sm font-black text-[var(--text)] sm:text-base">
          {rangeTitle(currentDate, view, i18n.language)}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-[var(--border)] p-0.5">
          {CALENDAR_VIEWS.map((viewId) => (
            <button
              key={viewId}
              type="button"
              onClick={() => onViewChange(viewId)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-black transition-colors',
                view === viewId
                  ? 'bg-[var(--brand-accent-soft)] text-[var(--ai-text)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
              )}
            >
              {t(VIEW_LABEL_KEYS[viewId])}
            </button>
          ))}
        </div>

        {headerActions}
      </div>
    </div>
  )
}
