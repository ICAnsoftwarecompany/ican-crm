import { History, Radar, TrendingUp, UserPlus, RefreshCcw, StickyNote, CircleDot } from 'lucide-react'
import { formatRelativeTime, getTimelineEventLabel } from '../../../../features/opportunities/utils/opportunityFormatters'

const EVENT_ICONS = {
  detected: Radar,
  signal_added: Radar,
  score_changed: TrendingUp,
  assigned: UserPlus,
  status_changed: RefreshCcw,
  note_added: StickyNote,
}

function describeTimelineMeta(event) {
  if (!event.meta) return null

  if (event.type === 'status_changed' && event.meta.to) {
    return `الحالة الجديدة: ${event.meta.to}`
  }
  if (event.type === 'score_changed' && event.meta.to !== undefined) {
    return `من ${event.meta.from ?? '-'} إلى ${event.meta.to}`
  }
  if (event.type === 'assigned' && event.meta.to) {
    return `تم الإسناد إلى ${event.meta.to}`
  }
  if (event.type === 'note_added' && event.meta.note) {
    return event.meta.note
  }
  if (event.type === 'signal_added' && event.meta.signal) {
    return event.meta.signal
  }

  return null
}

export function OpportunityActivityTimeline({ opportunity }) {
  const timeline = Array.isArray(opportunity.timeline) ? [...opportunity.timeline] : []
  timeline.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <History size={16} className="text-[var(--text-muted)]" />
        <h4 className="font-bold text-[var(--text)]">سجل النشاط</h4>
      </div>

      {timeline.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">لا يوجد نشاط مسجل بعد.</p>
      ) : (
        <ol className="relative border-s border-[var(--border)] ps-4 grid gap-4">
          {timeline.map((event) => {
            const Icon = EVENT_ICONS[event.type] || CircleDot
            const description = describeTimelineMeta(event)

            return (
              <li key={event.id} className="relative">
                <span className="absolute -start-[21px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00C2CB] text-white">
                  <Icon size={10} />
                </span>
                <p className="text-sm font-bold text-[var(--text)]">{event.label || getTimelineEventLabel(event.type)}</p>
                {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
                <p className="text-[11px] text-[var(--text-light)] mt-1">
                  {event.actor?.name ? `${event.actor.name} · ` : ''}{formatRelativeTime(event.at)}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
