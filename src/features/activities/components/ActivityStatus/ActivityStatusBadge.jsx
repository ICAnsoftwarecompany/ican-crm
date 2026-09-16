import { ACTIVITY_STATUSES } from '../../constants/activityConstants'
import { getDerivedActivityState } from '../../utils/activityDateHelpers'

export function ActivityStatusBadge({ activity, status }) {
  const lifecycle = ACTIVITY_STATUSES[status || activity?.status] || ACTIVITY_STATUSES.scheduled
  const derived = activity?.status === 'scheduled' ? getDerivedActivityState(activity) : null
  const Icon = lifecycle.icon

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black ${lifecycle.badgeClassName}`}>
        <Icon size={13} />
        {lifecycle.label}
      </span>
      {derived ? (
        <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${derived.badgeClassName}`}>
          {derived.label}
        </span>
      ) : null}
    </span>
  )
}
