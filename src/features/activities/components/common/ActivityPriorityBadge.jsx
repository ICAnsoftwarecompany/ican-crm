import { ACTIVITY_PRIORITIES } from '../../constants/activityConstants'

export function ActivityPriorityBadge({ priority }) {
  const meta = ACTIVITY_PRIORITIES[priority] || ACTIVITY_PRIORITIES.medium

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${meta.badgeClassName}`}>
      {meta.label}
    </span>
  )
}
