import { ArrowRightLeft } from 'lucide-react'

function StatusChip({ label, tone }) {
  if (!label) return null

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-bold ${tone}`}>
      {label}
    </span>
  )
}

export function StatusChangeActivity({ activity }) {
  const oldStatus = activity?.oldStatus
  const newStatus = activity?.newStatus

  if (!oldStatus && !newStatus) {
    return activity?.description
      ? <p className="text-sm font-semibold text-slate-700">{activity.description}</p>
      : null
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip label={oldStatus} tone="border-amber-200 bg-amber-50 text-amber-700" />
        {oldStatus && newStatus ? (
          <span className="inline-flex items-center text-slate-500" aria-hidden="true">
            <ArrowRightLeft size={14} />
          </span>
        ) : null}
        <StatusChip label={newStatus} tone="border-[#BEEFF2] bg-[#E8F9FA] text-[#007A80]" />
      </div>
      {activity?.description ? <p className="text-sm font-semibold text-slate-600">{activity.description}</p> : null}
    </div>
  )
}
