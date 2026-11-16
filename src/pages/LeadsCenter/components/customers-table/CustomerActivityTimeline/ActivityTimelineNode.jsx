import { getActivityTypeConfig, toneClasses } from './config/activityTypes'

export function ActivityTimelineNode({ activity, isFirst, isLast }) {
  const typeConfig = getActivityTypeConfig(activity?.type)
  const tone = toneClasses[typeConfig.tone] || toneClasses.slate
  const Icon = typeConfig.icon

  return (
    <div className="relative flex w-8 shrink-0 justify-center">
      {!isFirst ? <span className={`absolute top-0 h-5 w-0.5 ${tone.line}`} /> : null}
      {!isLast ? <span className={`absolute top-5 bottom-0 w-0.5 ${tone.line}`} /> : null}
      <span className={`relative z-10 mt-2 inline-flex h-6 w-6 items-center justify-center rounded-full border ${tone.dot}`}>
        <Icon size={13} />
      </span>
    </div>
  )
}
