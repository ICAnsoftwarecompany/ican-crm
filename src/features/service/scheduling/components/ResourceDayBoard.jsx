import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { minutesInZone, useZonedFormat } from '../utils/zonedTime'

const START = 7 * 60
const END = 20 * 60
const SPAN = END - START
const HOURS = Array.from({ length: (END - START) / 60 }, (_, index) => START / 60 + index)
const TONE = { confirmed: 'border-brand-accent bg-[var(--surface-2)]', hold: 'border-dashed border-sla-at-risk bg-[var(--surface)]', expired: 'border-dashed border-[var(--border)] opacity-60', released: 'border-dashed border-[var(--border)] opacity-60' }

/** Day board: one row per resource, reservations placed on a 07:00–20:00 axis in the calendar time zone. */
export function ResourceDayBoard({ resources, reservations, timeZone, onSelect }) {
  const { t, i18n } = useTranslation()
  const format = useZonedFormat(timeZone)
  const position = (reservation) => {
    const from = Math.max(minutesInZone(reservation.starts_at, timeZone), START)
    const to = Math.min(minutesInZone(reservation.ends_at, timeZone) || END, END)
    return { insetInlineStart: `${((from - START) / SPAN) * 100}%`, width: `${Math.max(((to - from) / SPAN) * 100, 2)}%` }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
          <div className="px-3 py-2">{t('service.scheduling.resource')}</div>
          <div className="relative flex">
            {HOURS.map((hour) => (
              <span key={hour} className="flex-1 border-s border-[var(--border)] px-1 py-2" dir="ltr">{String(hour).padStart(2, '0')}:00</span>
            ))}
          </div>
        </div>
        {resources.map((resource) => {
          const rows = reservations.filter((entry) => entry.resource_id === resource.id && entry.status !== 'released')
          return (
            <div key={resource.id} className="grid grid-cols-[180px_minmax(0,1fr)] border-b border-[var(--border)] last:border-b-0">
              <div className="grid content-center gap-0.5 px-3 py-2">
                <span className="truncate text-sm font-medium text-[var(--text)]">{localizeLabel(resource.name, i18n.language, resource.id)}</span>
                <span className="truncate text-[11px] text-[var(--text-muted)]" dir="ltr">{[...(resource.zones || [])].join(' · ')}</span>
              </div>
              <div className="relative h-16">
                <div className="absolute inset-0 flex" aria-hidden="true">
                  {HOURS.map((hour) => <span key={hour} className="flex-1 border-s border-[var(--border)]" />)}
                </div>
                {rows.map((reservation) => (
                  <button
                    key={reservation.id}
                    type="button"
                    onClick={() => onSelect?.(reservation)}
                    style={position(reservation)}
                    className={cn('absolute inset-y-1.5 overflow-hidden rounded-md border-2 px-1.5 text-start text-[11px] leading-tight text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent', TONE[reservation.status])}
                    title={`${format.time(reservation.starts_at)} – ${format.time(reservation.ends_at)}`}
                  >
                    <span className="block truncate font-semibold">{reservation.subject?.number || t(`service.scheduling.statuses.${reservation.status}`)}</span>
                    <span className="block truncate text-[var(--text-muted)]">{reservation.subject?.customer?.name || reservation.note || format.time(reservation.starts_at)}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
