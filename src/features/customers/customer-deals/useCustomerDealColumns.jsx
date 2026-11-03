import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { customerDealsPath } from './customerDealsModel'

// The customers list response already includes the associated deal at lead.deal.
// Do not issue one /customers/:id/deals request for every table row.
function getEmbeddedDeal(customer) {
  const deal = customer?.lead?.deal
  return deal && typeof deal === 'object' && !Array.isArray(deal) ? deal : null
}

function DealCell({ customer }) {
  const { t } = useTranslation()
  const tr = (key) => t(`customers.deals360.${key}`)
  const deal = getEmbeddedDeal(customer)
  if (!deal) return <span className="text-[var(--text-muted)]">—</span>

  const dealId = deal.id ?? deal.deal_id
  const amount = deal.won_value ?? deal.estimated_value
  const state = deal.status
    ? t(`customers.deals360.states.${deal.status}`, { defaultValue: deal.status })
    : null

  return <div className="flex min-w-0 items-center justify-between gap-2">
    <div className="min-w-0">
      <p className="break-words text-sm font-semibold">
        {deal.name || (deal.deal_id != null ? `#${deal.deal_id}` : dealId != null ? `#${dealId}` : tr('deal'))}
      </p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        {[state, amount != null ? String(amount) : null].filter(Boolean).join(' · ')}
      </p>
    </div>
    {dealId != null && <Link
      to={customerDealsPath(customer.id, dealId)}
      title={tr('openDeal')}
      aria-label={`${tr('openDeal')}: ${deal.name || dealId}`}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)]"
    ><ExternalLink size={15} /></Link>}
  </div>
}

export function useCustomerDealColumns(customers, enabled) {
  const { t } = useTranslation()
  const rows = enabled ? customers.map((customer) => ({
    ...customer,
    customer_deal_1: (() => {
      const deal = getEmbeddedDeal(customer)
      return deal ? [deal.name, deal.deal_id, deal.id, deal.status, deal.won_value, deal.estimated_value].filter((value) => value != null).join(' ') : ''
    })(),
  })) : customers

  const columns = enabled ? [{
    id: 'customer_deal_1',
    accessor: 'customer_deal_1',
    header: t('customers.deals360.dealColumn', { number: 1 }),
    visible: true,
    sortable: true,
    searchable: true,
    filterable: true,
    filterType: 'text',
    render: (customer) => <DealCell customer={customer} />,
  }] : []

  return { rows, columns }
}
