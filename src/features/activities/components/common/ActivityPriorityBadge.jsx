import { useTranslation } from 'react-i18next'
import { getActivityPriorities } from '../../constants/activityConstants'

export function ActivityPriorityBadge({ priority }) {
  const { t } = useTranslation()
  const priorities = getActivityPriorities(t)
  const meta = priorities[priority] || priorities.medium

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${meta.badgeClassName}`}>
      {meta.label}
    </span>
  )
}
