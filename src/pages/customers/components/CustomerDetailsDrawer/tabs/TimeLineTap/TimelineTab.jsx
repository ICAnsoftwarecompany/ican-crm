import { useMemo } from 'react'
import { useLeadLog } from '../../../../../../features/leads/hooks/useLeads'
import { CustomerActivityTimeline, normalizeCustomerActivities } from '../../../customers-table/CustomerActivityTimeline'
import { useTranslation } from 'react-i18next'

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
  const { t, i18n } = useTranslation()
  const leadId = getLeadId(customer)
  const leadLogQuery = useLeadLog(leadId, undefined, {
    enabled: Boolean(leadId),
  })

  const timelineActivities = useMemo(() => {
    const logs = Array.isArray(leadLogQuery.data) ? leadLogQuery.data : []
    return normalizeCustomerActivities(logs)
  }, [leadLogQuery.data, i18n.language])

  return (
    <div className="min-w-0 py-4">
      <div className={`rounded-xl border border-[#E5F7F8] bg-white/80 shadow-sm ${layoutMode === 'wide' ? 'p-4' : 'p-2'}`}>
        {leadLogQuery.isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-600">
            {t('customers.table.activityTimeline.loading')}
          </div>
        ) : leadLogQuery.isError ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-center text-sm font-black text-rose-700">
            {t('customers.table.activityTimeline.loadError')}
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
