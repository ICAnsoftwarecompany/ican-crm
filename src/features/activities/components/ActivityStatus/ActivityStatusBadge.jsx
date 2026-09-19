import { useTranslation } from 'react-i18next'
import { getActivityStatuses } from '../../constants/activityConstants'
import { getDerivedActivityState } from '../../utils/activityDateHelpers'

export function ActivityStatusBadge({ activity, status }) {
  const { t } = useTranslation()
  const statuses = getActivityStatuses(t)
  const lifecycle = statuses[status || activity?.status] || statuses.scheduled
  const derived = activity?.status === 'scheduled' ? getDerivedActivityState(activity, t) : null
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
