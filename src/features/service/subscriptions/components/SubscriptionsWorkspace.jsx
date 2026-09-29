import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { DataTable } from '../../../../shared/components/data-table'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { useMoney } from '../../billing/utils/money'
import { useSubscriptionList } from '../api/subscriptionsApi'
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge'
import { cadenceLabel } from '../utils/cadence'

const FILTERS = ['renewal_due', 'trial', 'active', 'past_due', 'suspended', 'cancelled', 'expired']

/** Subscriptions list (spec §30): status + "renewal due" filter, search, DataTable. */
export function SubscriptionsWorkspace({ detailPath }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const money = useMoney('EGP', 0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const debounced = useDebounce(search, 350)
  const query = useSubscriptionList({ search: debounced || undefined, status: status || undefined })
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')

  const rows = useMemo(
    () => query.subscriptions.map((entry) => ({ ...entry, customer_name: entry.customer?.name || '', item_label: localizeLabel(entry.item_name, language, entry.item_id), price: entry.plan?.price || 0, period_end: entry.current_period_end || entry.trial_ends_at || '' })),
    [query.subscriptions, language]
  )
  const columns = useMemo(
    () => [
      { id: 'number', header: t('service.subscriptions.fields.number'), accessor: 'subscription_number', width: 130, render: (row) => <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{row.subscription_number}</span> },
      { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text', render: (row) => <span className="font-medium text-[var(--text)]">{row.customer_name}</span> },
      { id: 'item', header: t('service.subscriptions.fields.item'), accessor: 'item_label', filterType: 'select' },
      { id: 'status', header: t('service.subscriptions.fields.status'), accessor: 'status', filterType: 'select', render: (row) => (
        <span className="flex flex-wrap items-center gap-1">
          <SubscriptionStatusBadge status={row.status} />
          {row.cancel_at_period_end && <span className="text-xs text-status-lost">{t('service.subscriptions.endsAtPeriodEnd')}</span>}
          {row.renewal_due && <span className="text-xs text-sla-at-risk">{t('service.subscriptions.renewalDue')}</span>}
        </span>
      ) },
      { id: 'price', header: t('service.subscriptions.fields.price'), accessor: 'price', sortable: true, render: (row) => <span className="text-xs"><span dir="ltr">{money(row.price)}</span> / {cadenceLabel(row.plan, t)}</span> },
      { id: 'renewal', header: t('service.subscriptions.fields.renewal'), accessor: 'renewal_type', filterType: 'select', render: (row) => <span className="text-xs">{t(`service.subscriptions.renewals.${row.renewal_type}`)}</span> },
      { id: 'end', header: t('service.subscriptions.fields.periodEnd'), accessor: 'period_end', sortable: true, render: (row) => <span className="text-xs">{date(row.period_end)}</span> },
      { id: 'due', header: t('service.subscriptions.fields.amountDue'), accessor: 'amount_due', sortable: true, render: (row) => (row.amount_due ? <span dir="ltr" className="text-xs font-semibold text-sla-breached">{money(row.amount_due)}</span> : <span className="text-xs text-[var(--text-muted)]">—</span>) },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, language, money]
  )

  return (
    <div className="grid gap-4">
      <div className="grid w-full gap-2 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_12rem]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.subscriptions.searchPlaceholder')} aria-label={t('service.subscriptions.searchPlaceholder')} startIcon={<Search size={16} aria-hidden="true" />} />
        <Select aria-label={t('service.subscriptions.fields.status')} placeholder={t('service.subscriptions.allStatuses')} value={status} onChange={setStatus} options={FILTERS.map((value) => ({ value, label: value === 'renewal_due' ? t('service.subscriptions.renewalDue') : t(`service.subscriptions.statuses.${value}`) }))} />
      </div>
      <DataTable
        data={rows}
        columns={columns}
        tableId="service-subscriptions"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        emptyMessage={t('service.subscriptions.empty')}
        onRowClick={(row) => navigate(detailPath(row))}
        onRowDoubleClick={(row) => navigate(detailPath(row))}
        hasNextPage={Boolean(query.hasNextPage)}
        isFetchingNextPage={query.isFetchingNextPage}
        onLoadMore={() => query.fetchNextPage()}
        enableSorting
        enableFiltering
        enableColumnVisibility
        enableExport
        showToolbar
        showFooter
      />
    </div>
  )
}
