import { ExternalLink } from 'lucide-react'

import { ActivityStatusBadge } from '../ActivityStatus/ActivityStatusBadge'
import { ActivityTypeBadge } from '../common/ActivityTypeBadge'
import { formatActivityDateTime } from '../../utils/activityDateHelpers'

export function ActivityDrawerHeader({ activity, onOpenRelated }) {
  if (!activity) return null

  return (
    <div className="space-y-3 rounded-lg border border-[#BEEFF2] bg-[#F8FEFF] p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ActivityTypeBadge type={activity.type} />
            <ActivityStatusBadge activity={activity} />
          </div>
          <h3 className="whitespace-normal break-words text-lg font-black text-[var(--text)]">{activity.title}</h3>
          <p className="mt-1 text-xs font-bold text-[var(--text-muted)]">{formatActivityDateTime(activity.startAt)}</p>
        </div>
        {activity.relatedEntity?.id ? (
          <button
            type="button"
            onClick={() => onOpenRelated?.(activity)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#A0ECF0] bg-white px-3 py-2 text-xs font-black text-[#007A80] hover:bg-[#E8F9FA]"
          >
            <ExternalLink size={14} />
            فتح العميل
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-bold text-[var(--text-muted)]">
        <span>العميل: {activity.relatedEntity?.name || '-'}</span>
        <span>المسؤول: {activity.assignedUser?.name || '-'}</span>
        <span>الفريق: {activity.assignedTeam?.name || '-'}</span>
      </div>
    </div>
  )
}
