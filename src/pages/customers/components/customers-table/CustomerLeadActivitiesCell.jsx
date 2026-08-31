import { useState } from 'react'
import { Activity, ChevronLeft } from 'lucide-react'
import { getCustomerLeadActivities, renderSafeValue } from './customerMarketingUtils'
import { LeadActivitiesDialog, OpenDetailsButton } from './CustomerTableDetailsDialogs'

function getActivityTypeLabel(type = '') {
  const value = String(type || '').trim()
  if (!value) return 'Activity'
  if (value === 'interested_products') return 'Products'
  if (value === 'note') return 'Note'
  if (value === 'create_activity') return 'Action'
  if (value === 'status_change') return 'Status'
  return value.replace(/_/g, ' ')
}

function formatActivityDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })
}

export function CustomerLeadActivitiesCell({ row }) {
  const [isOpen, setIsOpen] = useState(false)
  const activities = getCustomerLeadActivities(row)

  if (!activities.length) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const visibleActivities = activities

  return (
    <>
      <div className="flex max-h-[72px] min-w-[360px] max-w-full flex-wrap items-center gap-1.5 overflow-hidden">
        {visibleActivities.map((activity, index) => (
          <div key={activity.id || index} className="flex min-w-0 items-center gap-1">
            <span
              className="inline-flex min-w-[96px] max-w-[170px] items-center gap-1.5 rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1 text-[10px] font-black text-[#0F766E]"
              title={[activity.title, activity.description, activity.activity_at || activity.created_at].filter(Boolean).join(' | ')}
            >
              <Activity size={12} className="shrink-0" />
              <span className="min-w-0 truncate">{getActivityTypeLabel(activity.type)}</span>
              <span className="shrink-0 text-[#64748B]">{formatActivityDate(activity.activity_at || activity.created_at)}</span>
            </span>
            {index < visibleActivities.length - 1 ? (
              <ChevronLeft size={13} className="shrink-0 text-[#94A3B8]" />
            ) : null}
          </div>
        ))}
        <OpenDetailsButton onClick={() => setIsOpen(true)} label="الكل" />
      </div>
      <div className="mt-1 line-clamp-2 text-[10px] font-semibold text-[var(--text-muted)]">
        {renderSafeValue(visibleActivities[0]?.description || visibleActivities[0]?.title)}
      </div>
      <LeadActivitiesDialog row={row} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
