import { useMemo } from 'react'

import { ActivityStatusBadge } from '../ActivityStatus/ActivityStatusBadge'
import { ActivityTypeBadge } from '../common/ActivityTypeBadge'
import { formatActivityDate, formatActivityTime } from '../../utils/activityDateHelpers'

function groupByDay(activities) {
  return activities.reduce((groups, activity) => {
    const key = activity.startAt ? new Date(activity.startAt).toDateString() : 'no-date'
    if (!groups[key]) groups[key] = []
    groups[key].push(activity)
    return groups
  }, {})
}

export function ActivityCalendar({ activities, onActivityClick }) {
  const groups = useMemo(() => groupByDay(activities || []), [activities])
  const entries = Object.entries(groups)

  if (!entries.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm font-semibold text-[var(--text-muted)]">
        لا توجد أنشطة في التقويم.
      </div>
    )
  }

  return (
    <section className="grid gap-3 xl:grid-cols-2">
      {entries.map(([day, dayActivities]) => (
        <article key={day} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <h3 className="mb-3 text-sm font-black text-[var(--text)]">
            {day === 'no-date' ? 'بدون تاريخ' : formatActivityDate(day)}
          </h3>
          <div className="space-y-2">
            {dayActivities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => onActivityClick?.(activity)}
                className="w-full rounded-lg border border-[var(--border)] p-3 text-start transition hover:border-[#A0ECF0] hover:bg-[#F8FEFF]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ActivityTypeBadge type={activity.type} />
                  <ActivityStatusBadge activity={activity} />
                  <span className="text-xs font-black text-[#007A80]">{formatActivityTime(activity.startAt)}</span>
                </div>
                <p className="mt-2 whitespace-normal break-words text-sm font-black text-[var(--text)]">{activity.title}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">{activity.relatedEntity?.name || '-'}</p>
              </button>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}
