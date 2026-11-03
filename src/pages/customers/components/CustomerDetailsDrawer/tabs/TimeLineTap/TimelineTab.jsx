import { useMemo } from 'react'
import { useEntityMentions } from '../../../../../../features/mentions'
import { extractMentions } from '../../../../../../features/mentions/utils/normalizeMentions'
import { useLeadLog } from '../../../../../../features/leads/hooks/useLeads'
import { CustomerActivityTimeline, normalizeCustomerActivities } from '../../../customers-table/CustomerActivityTimeline'
import { useTranslation } from 'react-i18next'
import { useCustomerDeals, customerDealTimeline, leadActivityContext } from '../../../../../../features/customers'
import { leadTasksTimeline, useLeadTasksIndex } from '../../../../../../features/lead-tasks'

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
  const mentionsQuery = useEntityMentions('customer', customer?.id, { enabled: customer?.id != null })
  const tasks = useLeadTasksIndex({ enabled: Boolean(leadId) })
  const dealsQuery = useCustomerDeals(customer?.id)
  const leadLogQuery = useLeadLog(leadId, undefined, {
    enabled: Boolean(leadId),
    select: leadActivityContext,
  })

  const timelineActivities = useMemo(() => {
    const logs = leadLogQuery.data?.logs || []
    const mentionActivities = extractMentions(mentionsQuery.data).map((mention) => ({
      id: `mention-${mention.id}`,
      type: 'mention',
      category: 'communication',
      title: `منشن إلى ${mention.user?.name ?? 'مستخدم'}`,
      description: `${mention.message ?? ''}${mention.type ? ` · ${mention.type}` : ''}${mention.seen ? ' · تمت القراءة' : ''}`,
      date: mention.created_at,
      user: mention.by ?? null,
      userName: mention.by?.name ?? '-',
    }))
    return [...normalizeCustomerActivities(logs), ...customerDealTimeline(dealsQuery.data?.deals, customer?.id), ...leadTasksTimeline(tasks.index.get(String(leadId)) || []), ...mentionActivities]
  }, [leadLogQuery.data, dealsQuery.data, customer?.id, i18n.language, tasks.index, leadId, mentionsQuery.data])

  return (
    <div className="min-w-0 py-4">
      {tasks.error && <p role="alert" className="mb-2 text-sm text-[var(--text-muted)]">{t('tasks.entity.loadFailed')} <button type="button" className="underline" onClick={tasks.refetch}>{t('common.retry')}</button></p>}
      {mentionsQuery.isError && <p role="alert" className="mb-2 text-sm text-[var(--text-muted)]">تعذر تحميل المنشنات <button type="button" className="underline" onClick={() => mentionsQuery.refetch()}>إعادة المحاولة</button></p>}
      {dealsQuery.isError && <div role="alert" className="mb-2 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">{t('customers.deals360.error')}<button type="button" className="underline" onClick={() => dealsQuery.refetch()}>{t('customers.deals360.retry')}</button></div>}
      {dealsQuery.isLoading && <p role="status" className="mb-2 text-sm text-[var(--text-muted)]">{t('customers.deals360.loading')}</p>}
      <div className={`rounded-xl border border-[#E5F7F8] bg-white/80 shadow-sm ${layoutMode === 'wide' ? 'p-4' : 'p-2'}`}>
        {leadLogQuery.isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-600">
            {t('customers.table.activityTimeline.loading')}
          </div>
        ) : (
          <div className="min-h-[260px]">
            {leadLogQuery.isError && <p role="alert" className="mb-2 text-sm text-[var(--text-muted)]">{t('customers.table.activityTimeline.loadError')}</p>}
            <CustomerActivityTimeline activities={timelineActivities} />
          </div>
        )}
      </div>
    </div>
  )
}
