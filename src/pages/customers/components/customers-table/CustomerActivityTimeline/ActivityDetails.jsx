import { getActivitySourceLabel } from './config/activitySources'
import { formatActivityFullDate } from './utils/formatActivityDate'
import { formatActivityDuration } from './utils/formatActivityDuration'

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
  const actorName = activity?.userName || activity?.user?.name || '-'
  const fullDate = formatActivityFullDate(activity?.date)
  const source = getActivitySourceLabel(activity?.source)
  const responseTime = formatActivityDuration(activity?.responseTimeSeconds)

  return (
    <div className="mt-1.5 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
      <DetailRow label="الوصف" value={activity?.description || '-'} />
      <DetailRow label="الموظف" value={actorName} />
      <DetailRow label="وقت العملية" value={fullDate} />
      <DetailRow label="زمن الاستجابة" value={responseTime} />
      <DetailRow label="المصدر" value={source} />
    </div>
  )
}
