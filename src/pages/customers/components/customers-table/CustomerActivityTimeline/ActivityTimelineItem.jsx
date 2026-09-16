import { ChevronDown } from 'lucide-react'
import { ActivityTimelineNode } from './ActivityTimelineNode'
import { ActivityDetails } from './ActivityDetails'
import { getActivityTypeConfig, toneClasses } from './config/activityTypes'
import { formatActivityTime } from './utils/formatActivityDate'
import { getActivityRenderer } from './utils/getActivityRenderer'

export function ActivityTimelineItem({ activity, isFirst, isLast, expanded, onToggle }) {
  const typeConfig = getActivityTypeConfig(activity?.type)
  const tone = toneClasses[typeConfig.tone] || toneClasses.slate
  const RenderActivity = getActivityRenderer(activity)
  const userName = activity?.userName || activity?.user?.name || 'غير معروف'

  return (
    <div className="grid grid-cols-[1.6rem_minmax(0,1fr)] gap-1.5">
      <ActivityTimelineNode activity={activity} isFirst={isFirst} isLast={isLast} />
      <div className="min-w-0 pb-2">
        {activity?.importance === 'milestone' ? (
          <div className={`mb-1.5 rounded-lg border px-2.5 py-1.5 ${tone.badge}`}>
            <div className="text-xs font-black">{activity?.title || typeConfig.label}</div>
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
          <div className="flex flex-wrap items-start justify-between gap-1.5">
            <div className="min-w-0">
              <div className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-black ${tone.badge}`}>
                {typeConfig.label}
              </div>
              <h4 className="mt-1 truncate text-xs font-black text-slate-900">{activity?.title || typeConfig.label}</h4>
            </div>

            <div className="text-[11px] font-semibold text-slate-500">
              {userName} • {formatActivityTime(activity?.date)}
            </div>
          </div>

          <div className="mt-1.5">
            <RenderActivity activity={activity} />
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-black text-[#007A80] hover:text-[#005f64]"
          >
            <ChevronDown size={12} className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'} />
            {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </button>

          {expanded ? <ActivityDetails activity={activity} /> : null}
        </div>
      </div>
    </div>
  )
}
