import { useQueries } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { customerDealsQueryOptions } from './useCustomerDeals'
import { customerDealsPath } from './customerDealsModel'

function DealCell({ query, index, customerId }) {
  const { t } = useTranslation()
  const tr = (key) => t(`customers.deals360.${key}`)
  if (query?.isPending) return <span role="status" className="text-xs text-[var(--text-muted)]">{tr('loading')}</span>
  if (query?.isError) return <button type="button" onClick={() => query.refetch()} title={tr('error')} className="inline-flex items-center gap-1 text-xs"><RefreshCw size={14} />{tr('retry')}</button>
  const entry = query?.data?.deals[index]
  if (!entry) return <span className="text-[var(--text-muted)]">{tr('unavailable')}</span>
  const dealId = entry.deal_id ?? entry.deal?.id
  return <div className="flex min-w-0 items-center justify-between gap-2">
    <div className="min-w-0"><p className="break-words text-sm font-semibold">{entry.deal?.name || tr('deal')}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{t(`customers.deals360.states.${entry.status}`, { defaultValue: String(entry.status || tr('unavailable')) })}</p></div>
    {dealId != null && <Link to={customerDealsPath(customerId, dealId)} title={tr('openDeal')} aria-label={`${tr('openDeal')}: ${entry.deal?.name || tr('deal')}`} onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)]"><ExternalLink size={15} /></Link>}
  </div>
}

export function useCustomerDealColumns(customers, enabled) {
  const { t } = useTranslation()
  const uniqueCustomers = [...new Map(customers.filter((customer) => customer.id != null).map((customer) => [String(customer.id), customer])).values()]
  const queries = useQueries({ queries: enabled ? uniqueCustomers.map((customer) => customerDealsQueryOptions(customer.id)) : [] })
  const queryByCustomer = new Map(uniqueCustomers.map((customer, index) => [String(customer.id), queries[index]]))
  const columnCount = enabled ? Math.max(1, ...queries.map((query) => query.data?.deals.length || 0)) : 0
  const rows = enabled ? customers.map((customer) => ({
    ...customer,
    ...Object.fromEntries(Array.from({ length: columnCount }, (_, index) => [`customer_deal_${index + 1}`, queryByCustomer.get(String(customer.id))?.data?.deals[index]?.deal?.name || ''])),
  })) : customers
  const columns = Array.from({ length: columnCount }, (_, index) => ({
    id: `customer_deal_${index + 1}`,
    accessor: `customer_deal_${index + 1}`,
    header: t('customers.deals360.dealColumn', { number: index + 1 }),
    visible: true,
    sortable: true,
    searchable: true,
    filterable: true,
    filterType: 'text',
    render: (customer) => <DealCell query={queryByCustomer.get(String(customer.id))} index={index} customerId={customer.id} />,
  }))
  return { rows, columns }
}
