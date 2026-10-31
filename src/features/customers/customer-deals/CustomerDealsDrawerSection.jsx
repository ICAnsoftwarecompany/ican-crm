import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { useCustomerDeals } from './useCustomerDeals'
import { customerDealsPath } from './customerDealsModel'

export function CustomerDealsDrawerSection({ customerId }) {
  const { t, i18n } = useTranslation()
  const query = useCustomerDeals(customerId)
  const tr = (key) => t(`customers.deals360.${key}`)
  const number = (value) => value == null ? tr('unavailable') : new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(Number(value) || 0)
  const deals = query.data?.deals || []
  return (
    <section className="mb-4 min-w-0 border-b border-[var(--border)] pb-4 text-[var(--text)]">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold">{tr('title')}</h3>
        <Link to={customerDealsPath(customerId)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:bg-[var(--surface-2)]"><ExternalLink size={14} />{tr('openCustomerDeals')}</Link>
      </header>
      {query.isPending && <p role="status" className="mt-3 text-sm text-[var(--text-muted)]">{tr('loading')}</p>}
      {query.isError && <div role="alert" className="mt-3 space-y-2 text-sm"><p>{tr('error')}</p><Button size="sm" variant="outline" onClick={() => query.refetch()}><RefreshCw size={14} />{tr('retry')}</Button></div>}
      {query.isSuccess && !deals.length && <p className="mt-3 text-sm text-[var(--text-muted)]">{tr('empty')}</p>}
      {query.isSuccess && deals.length > 0 && <>
        <p className="mt-3 text-sm text-[var(--text-muted)]">{tr('deals_count')}: {number(query.data.summary.deals_count ?? deals.length)} · {tr('total_won_value')}: {number(query.data.summary.total_won_value)}</p>
        <ul className="mt-2 divide-y divide-[var(--border)]">{deals.map((entry) => {
          const dealId = entry.deal_id ?? entry.deal?.id
          const products = Array.isArray(entry.products) ? entry.products : []
          return <li key={entry.id ?? dealId} className="space-y-2 py-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 break-words font-semibold">{entry.deal?.name || tr('deal')}</span>
              {dealId != null && <Link to={customerDealsPath(customerId, dealId)} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)]" title={tr('openDeal')} aria-label={`${tr('openDeal')}: ${entry.deal?.name || tr('deal')}`}><ExternalLink size={14} /></Link>}
              <span className="shrink-0 text-xs text-[var(--text-muted)]">{t(`customers.deals360.states.${entry.status}`, { defaultValue: String(entry.status || tr('unavailable')) })}</span>
            </div>
            <dl className="flex flex-wrap gap-x-4 gap-y-2 text-xs">{[[tr('value'), number(entry.won_value ?? entry.estimated_value)], [tr('owner'), entry.owner?.name || tr('unavailable')], [tr('contracts'), number(Array.isArray(entry.contracts) ? entry.contracts.length : 0)]].map(([label, value]) => <div key={label} className="flex gap-1"><dt className="text-[var(--text-muted)]">{label}:</dt><dd>{value}</dd></div>)}</dl>
            {products.length > 0 && <p className="break-words text-xs text-[var(--text-muted)]">{tr('products')}: {products.map((line) => `${line.product?.name || tr('product')} × ${number(line.quantity)}`).join('، ')}</p>}
          </li>
        })}</ul>
      </>}
    </section>
  )
}
