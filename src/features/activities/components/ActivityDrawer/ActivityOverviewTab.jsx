import { ActivityPriorityBadge } from '../common/ActivityPriorityBadge'
import { formatActivityDateTime, formatDuration } from '../../utils/activityDateHelpers'

function InfoItem({ label, value, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-[11px] font-black text-[var(--text-muted)]">{label}</p>
      <div className="mt-1 whitespace-normal break-words text-sm font-bold text-[var(--text)]">{children || value || '-'}</div>
    </div>
  )
}

export function ActivityOverviewTab({ activity }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <InfoItem label="الأولوية"><ActivityPriorityBadge priority={activity.priority} /></InfoItem>
      <InfoItem label="المدة" value={activity.duration || formatDuration(activity.startAt, activity.endAt)} />
      <InfoItem label="البداية" value={formatActivityDateTime(activity.startAt)} />
      <InfoItem label="النهاية" value={formatActivityDateTime(activity.endAt)} />
      <InfoItem label="المسؤول" value={activity.assignedUser?.name} />
      <InfoItem label="الفريق" value={activity.assignedTeam?.name} />
      <InfoItem label="الهاتف" value={activity.phone} />
      <InfoItem label="طريقة الاجتماع / المكالمة" value={activity.mode || activity.callProvider} />
      <InfoItem label="الرابط" value={activity.meetingUrl} />
      <InfoItem label="المكان" value={activity.location} />
      <div className="sm:col-span-2">
        <InfoItem label="الوصف" value={activity.description} />
      </div>
    </div>
  )
}
