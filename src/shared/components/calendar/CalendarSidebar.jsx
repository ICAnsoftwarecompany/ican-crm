import { useTranslation } from 'react-i18next'
import { MiniCalendar } from './MiniCalendar'

export function CalendarSidebar({
  monthDate,
  selectedDate,
  onSelectDate,
  onMonthChange,
  eventDaySet,
  sources = [],
  visibleSourceIds,
  onToggleSource,
  createSlot,
}) {
  const { t } = useTranslation()

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto border-e border-[var(--border)] bg-[var(--surface)] p-3">
      {createSlot}

      <MiniCalendar
        monthDate={monthDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onMonthChange={onMonthChange}
        eventDaySet={eventDaySet}
      />

      {sources.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-black text-[var(--text-muted)]">{t('calendar.sourcesTitle')}</h3>
          <div className="space-y-1.5">
            {sources.map((source) => {
              const checked = !visibleSourceIds || visibleSourceIds.has(source.id)
              return (
                <label key={source.id} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleSource?.(source.id)}
                    className="h-4 w-4 rounded accent-[var(--brand-accent)]"
                    style={{ accentColor: `var(${source.colorVar})` }}
                  />
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: `var(${source.colorVar})` }} />
                  {t(source.labelKey)}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}
