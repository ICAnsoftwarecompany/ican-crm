import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus } from 'lucide-react'
import { formatRelativeTime } from '../../../shared/utils/dateTime'
import { useSalesDashboard } from '../../analytics'
import { MyWorkSectionCard } from '../components/MyWorkSectionCard'
import { MyWorkItemList, MyWorkItemRow } from '../components/MyWorkItemRow'
import { sortNewestFirst } from '../utils/myWorkItems'

const MAX_ROWS = 6

/** `/leads/:customerId` needs the customer id; fall back to the Leads Center when it is missing. */
function leadLink(lead) {
  const customerId = lead?.customer_id ?? lead?.customer?.id
  return customerId ? `/leads/${customerId}` : '/LeadsCenter'
}

/** Newest leads assigned to me (`GET /sales/dashboard/my-leads`). */
export function MyLeadsSection() {
  const { t, i18n } = useTranslation()
  const { myLeads } = useSalesDashboard()
  const leads = useMemo(() => sortNewestFirst(myLeads.data || []), [myLeads.data])

  return (
    <MyWorkSectionCard
      id="leads"
      icon={UserPlus}
      title={t('myWork.sections.leads.title')}
      count={leads.length}
      viewAllTo="/LeadsCenter"
      isLoading={myLeads.isLoading}
      error={myLeads.error}
      onRetry={myLeads.refetch}
      empty={!leads.length}
      emptyText={t('myWork.sections.leads.empty')}
    >
      <MyWorkItemList>
        {leads.slice(0, MAX_ROWS).map((lead, index) => (
          <MyWorkItemRow
            key={lead.id ?? index}
            to={leadLink(lead)}
            icon={UserPlus}
            title={lead.name || lead.full_name || t('myWork.sections.leads.unnamed')}
            meta={lead.status_name || lead.status?.status || lead.status?.name || (typeof lead.status === 'string' ? lead.status : '') || lead.source || ''}
            time={formatRelativeTime(lead.created_at || lead.createdAt, i18n.language)}
          />
        ))}
      </MyWorkItemList>
    </MyWorkSectionCard>
  )
}
