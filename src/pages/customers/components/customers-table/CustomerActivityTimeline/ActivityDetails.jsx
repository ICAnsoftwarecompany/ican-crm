import { getActivitySourceLabel } from './config/activitySources'
import { formatActivityFullDate } from './utils/formatActivityDate'
import { formatActivityDuration } from './utils/formatActivityDuration'
import { useTranslation } from 'react-i18next'

function DetailRow({ label, value }) {
  if (!value || value === '-') return null

  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <span className="min-w-0 text-xs font-bold text-slate-700">{value}</span>
    </div>
  )
}

export function ActivityDetails({ activity }) {
  const { t } = useTranslation()
  const actorName = activity?.userName || activity?.user?.name || '-'
  const fullDate = formatActivityFullDate(activity?.date)
  const source = getActivitySourceLabel(activity?.source)
  const responseTime = formatActivityDuration(activity?.responseTimeSeconds)

  return (
    <div className="mt-1.5 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
      <DetailRow label={t('customers.activityTimeline.details.description')} value={activity?.description || '-'} />
      <DetailRow label={t('customers.activityTimeline.details.employee')} value={actorName} />
      <DetailRow label={t('customers.activityTimeline.details.time')} value={fullDate} />
      <DetailRow label={t('customers.activityTimeline.details.responseTime')} value={responseTime} />
      <DetailRow label={t('customers.activityTimeline.details.source')} value={source} />
    </div>
  )
}
