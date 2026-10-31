import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { useCustomerDeals } from './useCustomerDeals'
import { customerDealsPath } from './customerDealsModel'

export function CustomerDealsCount({ customerId }) {
  const { t, i18n } = useTranslation()
  const query = useCustomerDeals(customerId)
  if (customerId == null) return null
  const label = t('customers.deals360.openCustomerDeals')
  return <div className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
    <span>{t('customers.deals360.deals_count')}:</span>
    {query.isError ? <button type="button" title={t('customers.deals360.error')} aria-label={t('customers.deals360.retry')} onClick={() => query.refetch()}><RefreshCw size={14} /></button> : <span className="font-bold tabular-nums">{query.isPending ? '...' : new Intl.NumberFormat(i18n.language).format(query.data.summary.deals_count ?? query.data.deals.length)}</span>}
    <Link to={customerDealsPath(customerId)} title={label} aria-label={label} onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)]"><ExternalLink size={14} /></Link>
  </div>
}
