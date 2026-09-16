import { useState } from 'react'
import { Activity, ChevronLeft } from 'lucide-react'
import { getCustomerLeadActivities, renderSafeValue } from './customerMarketingUtils'
import { LeadActivitiesDialog, OpenDetailsButton } from './CustomerTableDetailsDialogs/CustomerTableDetailsDialogs'
import {
  CustomerStatusChangeHoverDetails,
  CustomerTableHoverCard,
  getCustomerActivityTooltipTitle,
  getCustomerActivityUserName,
} from './CustomerTableHovers'

function formatActivityDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
}

export function CustomerLeadActivitiesCell({ row, userById }) {
  const [isOpen, setIsOpen] = useState(false)
  const activities = getCustomerLeadActivities(row)
    .filter((activity) => String(activity?.type || '').trim().toLowerCase() === 'status_change')

  if (!activities.length) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const visibleActivities = activities.slice(0, 2)
  const hiddenActivities = activities.slice(2)

  return (
    <>
      <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-1.5">
        {visibleActivities.map((activity, index) => (
          <div key={activity.id || index} className="flex min-w-0 items-center gap-1">
            <CustomerTableHoverCard
              content={<CustomerStatusChangeHoverDetails activities={[activity]} userById={userById} />}
              width={380}
              estimatedHeight={260}
              wrapperClassName="relative inline-flex min-w-0"
              cardClassName="font-bold leading-6 text-[#334155]"
            >
              <span
                className="inline-flex min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1 text-[10px] font-black text-[#0F766E]"
                title={getCustomerActivityTooltipTitle(activity, userById)}
              >
                <Activity size={12} className="shrink-0" />
                <span className="min-w-0 break-words">{getCustomerActivityUserName(activity, userById)}</span>
                <span className="shrink-0 text-[#64748B]">{formatActivityDate(activity.activity_at || activity.created_at)}</span>
              </span>
            </CustomerTableHoverCard>
            {index < visibleActivities.length - 1 ? (
              <ChevronLeft size={13} className="shrink-0 text-[#94A3B8]" />
            ) : null}
          </div>
        ))}
        {hiddenActivities.length ? (
          <CustomerTableHoverCard
            content={<CustomerStatusChangeHoverDetails activities={hiddenActivities} userById={userById} />}
            width={440}
            estimatedHeight={260}
            wrapperClassName="relative inline-flex min-w-0"
            cardClassName="font-bold leading-6 text-[#334155]"
          >
            <button
              type="button"
              className="inline-flex h-7 items-center rounded-full border border-[#CBD5E1] bg-white px-2 text-[10px] font-black text-[#475569] transition hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
              title={`عرض ${hiddenActivities.length} تغييرات حالة إضافية`}
              data-no-cell-copy="true"
            >
              +{hiddenActivities.length}
            </button>
          </CustomerTableHoverCard>
        ) : null}
        <OpenDetailsButton onClick={() => setIsOpen(true)} label="الكل" />
      </div>
      <div className="mt-1 line-clamp-2 text-[10px] font-semibold text-[var(--text-muted)]">
        {renderSafeValue(visibleActivities[0]?.title || visibleActivities[0]?.description)}
      </div>
      <LeadActivitiesDialog row={row} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
