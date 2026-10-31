import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ExternalLink, RefreshCw, Search } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { CustomerDealsOverview } from './CustomerDealsOverview'
import { CustomerDealDetails } from './CustomerDealDetails'
import { useCustomerDeals } from './useCustomerDeals'

export function CustomerDealsWorkspace({ customerId, selectedDealId }) {
  const { t } = useTranslation()
  const tr = (key) => t(`customers.deals360.${key}`)
  const query = useCustomerDeals(customerId)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  if (query.isPending) return <div role="status" className="p-6 text-[var(--text-muted)]">{tr('loading')}</div>
  if (query.isError) return <div role="alert" className="space-y-3 p-6"><p>{tr('error')}</p><Button variant="outline" onClick={() => query.refetch()}><RefreshCw size={16} />{tr('retry')}</Button></div>
  const { customer, summary, deals } = query.data
  const visible = deals.filter((entry) => (filter === 'all' || entry.status === filter) && `${entry.deal?.name || ''} ${(entry.contracts || []).map((contract) => contract.contract_number).join(' ')}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
  return (
    <main className="min-w-0 space-y-5 p-4 text-[var(--text)] md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-bold">{tr('title')}</h1><Button size="icon" variant="outline" title={tr('refresh')} aria-label={tr('refresh')} loading={query.isFetching} onClick={() => query.refetch()}><RefreshCw size={17} /></Button></header>
      <CustomerDealsOverview customer={customer} summary={summary} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1" role="group" aria-label={tr('filter')}>{['all', 'open', 'won', 'lost'].map((value) => <Button key={value} size="sm" variant={filter === value ? 'primary' : 'outline'} aria-pressed={filter === value} onClick={() => setFilter(value)}>{tr(value)}</Button>)}</div>
        <label className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 sm:w-72"><Search size={16} className="shrink-0 text-[var(--text-muted)]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tr('search')} aria-label={tr('search')} className="h-9 w-full min-w-0 bg-transparent text-sm outline-none" /></label>
      </div>
      {!visible.length && <p className="py-10 text-center text-[var(--text-muted)]">{deals.length ? tr('noMatches') : tr('empty')}</p>}
      <div className="space-y-3">{visible.map((entry) => {
        const dealId = entry.deal_id ?? entry.deal?.id
        const selected = selectedDealId != null && String(dealId) === String(selectedDealId)
        return <details key={`${dealId}-${entry.id}`} open={selected || undefined} className={`group rounded-lg border bg-[var(--surface)] ${selected ? 'border-[var(--text-muted)]' : 'border-[var(--border)]'}`}>
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden"><span className="flex min-w-0 flex-1 items-center gap-2"><ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" /><span className="break-words font-semibold">{entry.deal?.name || tr('deal')}</span></span><span className="text-sm text-[var(--text-muted)]">{t(`customers.deals360.states.${entry.status}`, { defaultValue: String(entry.status || tr('unavailable')) })}</span></summary>
          {dealId != null && <Link to={`/deals/${dealId}`} className="mx-4 mb-3 inline-flex items-center gap-2 text-sm underline"><ExternalLink size={14} />{tr('openDeal')}</Link>}
          <CustomerDealDetails entry={entry} />
        </details>
      })}</div>
    </main>
  )
}
