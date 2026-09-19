import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <InfoItem label={t('activities.scheduleDialog.priorityLabel')}><ActivityPriorityBadge priority={activity.priority} /></InfoItem>
      <InfoItem label={t('activities.drawer.durationLabel')} value={activity.duration || formatDuration(activity.startAt, activity.endAt, t)} />
      <InfoItem label={t('activities.table.startAt')} value={formatActivityDateTime(activity.startAt)} />
      <InfoItem label={t('activities.drawer.endLabel')} value={formatActivityDateTime(activity.endAt)} />
      <InfoItem label={t('activities.table.assigned')} value={activity.assignedUser?.name} />
      <InfoItem label={t('activities.scheduleDialog.teamLabel')} value={activity.assignedTeam?.name} />
      <InfoItem label={t('customers.phone')} value={activity.phone} />
      <InfoItem label={t('activities.drawer.meetingOrCallModeLabel')} value={activity.mode || activity.callProvider} />
      <InfoItem label={t('activities.meetingDrawer.fields.link')} value={activity.meetingUrl} />
      <InfoItem label={t('activities.meetingDrawer.fields.location')} value={activity.location} />
      <div className="sm:col-span-2">
        <InfoItem label={t('activities.form.descriptionLabel')} value={activity.description} />
      </div>
    </div>
  )
}
