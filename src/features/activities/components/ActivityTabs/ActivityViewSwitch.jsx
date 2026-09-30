import { CalendarDays, Table2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ACTIVITY_VIEW_MODES } from '../../constants/activityConstants'

const VIEW_ICONS = { [ACTIVITY_VIEW_MODES.calendar]: CalendarDays, [ACTIVITY_VIEW_MODES.list]: Table2 }
const VIEW_LABEL_KEYS = {
  [ACTIVITY_VIEW_MODES.calendar]: 'activities.viewModeTabs.calendar',
  [ACTIVITY_VIEW_MODES.list]: 'activities.viewModeTabs.table',
}

/**
 * Prominent calendar/table switch shown at the top of an activities page (added 2026-10-01 for the
 * Leads Center, where the calendar is the main view). `order` decides which button comes first.
 */
export function ActivityViewSwitch({ view, onChange, order = [ACTIVITY_VIEW_MODES.calendar, ACTIVITY_VIEW_MODES.list] }) {
  const { t } = useTranslation()

  return (
    <div role="radiogroup" aria-label={t('activities.viewSwitch.label')} className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
      {order.map((mode) => {
        const Icon = VIEW_ICONS[mode]
        const active = view === mode
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(mode)}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] ${
              active ? 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
            }`}
          >
            <Icon size={16} />
            {t(VIEW_LABEL_KEYS[mode])}
          </button>
        )
      })}
    </div>
  )
}
