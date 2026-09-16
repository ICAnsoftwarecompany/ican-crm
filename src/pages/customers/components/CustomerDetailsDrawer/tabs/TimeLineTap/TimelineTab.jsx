import { useMemo } from 'react'
import { useLeadLog } from '../../../../../../features/leads/hooks/useLeads'
import { CustomerActivityTimeline, normalizeCustomerActivities } from '../../../customers-table/CustomerActivityTimeline'

function getLeadId(customer) {
  return customer?.lead_id || customer?.lead?.id
}

export function TimelineTab({
  customer,
  statuses = [],
  currentStatus,
  onActionChanged,
  layoutMode = 'compact',
}) {
  const leadId = getLeadId(customer)
  const leadLogQuery = useLeadLog(leadId, undefined, {
    enabled: Boolean(leadId),
  })

  const timelineActivities = useMemo(() => {
    const logs = Array.isArray(leadLogQuery.data) ? leadLogQuery.data : []
    return normalizeCustomerActivities(logs)
  }, [leadLogQuery.data])

  return (
    <div className="min-w-0 py-4">
      <div className={`rounded-xl border border-[#E5F7F8] bg-white/80 shadow-sm ${layoutMode === 'wide' ? 'p-4' : 'p-2'}`}>
        {leadLogQuery.isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-600">
            جاري تحميل سجل النشاط...
          </div>
        ) : leadLogQuery.isError ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-center text-sm font-black text-rose-700">
            تعذر تحميل سجل النشاط الحالي.
          </div>
        ) : (
          <div className="min-h-[260px]">
            <CustomerActivityTimeline activities={timelineActivities} />
          </div>
        )}
      </div>
    </div>
  )
}
