import { ActivityTimelineItem } from './ActivityTimelineItem'

export function ActivityDateGroup({ group, expandedId, onToggleExpanded }) {
  return (
    <section className="space-y-1.5">
      <h3 className="sticky top-0 z-10 inline-flex rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2.5 py-0.5 text-[11px] font-black text-[#007A80]">
        {group.label}
      </h3>

      <div className="space-y-1">
        {group.items.map((activity, index) => (
          <ActivityTimelineItem
            key={activity.id || `${group.key}-${index}`}
            activity={activity}
            isFirst={index === 0}
            isLast={index === group.items.length - 1}
            expanded={expandedId === activity.id}
            onToggle={() => onToggleExpanded(expandedId === activity.id ? null : activity.id)}
          />
        ))}
      </div>
    </section>
  )
}
