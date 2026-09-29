import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CalendarCheck, CalendarClock, HandCoins } from 'lucide-react'
import { DataTable } from '../../../../shared/components/data-table'
import { formatDate } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { useCollections } from '../api/schedulesApi'
import { COLLECTION_VIEWS, useMoney } from '../utils/money'

const ICONS = { overdue: AlertTriangle, due_today: CalendarCheck, upcoming: CalendarClock, promises: HandCoins }
const BUCKETS = ['1_30', '31_60', '61_90', '90_plus']
const PROMISE_TONE = { open: 'text-sla-at-risk', kept: 'text-sla-on-track', broken: 'text-sla-breached' }

/** Collections (spec §29.13): due today, overdue by aging bucket, upcoming week, promises to pay. */
export function CollectionsWorkspace({ detailPath }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const money = useMoney('EGP', 0)
  const [view, setView] = useState('overdue')
  const query = useCollections({ view })
  const summary = query.data?.summary
  const aging = query.data?.aging
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')

  const rows = useMemo(() => (query.data?.data || []).map((row) => ({ ...row, id: row.schedule_id, customer_name: row.customer?.name || '', promise_status: row.promise?.status || '' })), [query.data])
  const columns = useMemo(
    () => [
      { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text', render: (row) => <span className="grid"><span className="font-medium text-[var(--text)]">{row.customer_name}</span><span dir="ltr" className="text-start text-xs text-[var(--text-muted)]">{row.customer?.phone}</span></span> },
      { id: 'schedule', header: t('service.billing.columns.number'), accessor: 'schedule_number', render: (row) => <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{row.schedule_number}</span> },
      { id: 'amount', header: t('service.billing.columns.amountInView'), accessor: 'amount', sortable: true, render: (row) => <span dir="ltr" className="text-xs font-semibold">{money(row.amount)}</span> },
      { id: 'oldest', header: t('service.billing.columns.oldestDue'), accessor: 'oldest_due_date', sortable: true, render: (row) => <span className="text-xs">{date(row.oldest_due_date)}</span> },
      { id: 'days', header: t('service.billing.columns.daysOverdue'), accessor: 'days_overdue', sortable: true, render: (row) => (row.days_overdue ? <span className="text-xs text-sla-breached">{t('service.billing.daysOverdue', { count: row.days_overdue })}</span> : <span className="text-xs text-[var(--text-muted)]">—</span>) },
      { id: 'bucket', header: t('service.billing.columns.bucket'), accessor: 'bucket', filterType: 'select', render: (row) => (row.bucket ? <span className="text-xs">{t(`service.billing.buckets.${row.bucket}`)}</span> : '—') },
      { id: 'promise', header: t('service.billing.promises'), accessor: 'promise_status', filterType: 'select', render: (row) => (row.promise ? <span className={cn('text-xs', PROMISE_TONE[row.promise.status])}>{t(`service.billing.promiseStatuses.${row.promise.status}`)} · {date(row.promise.promised_date)}</span> : <span className="text-xs text-[var(--text-muted)]">—</span>) },
      { id: 'outstanding', header: t('service.billing.totals.outstanding'), accessor: 'outstanding', sortable: true, render: (row) => <span dir="ltr" className="text-xs">{money(row.outstanding)}</span> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, language, money]
  )
  const agingTotal = BUCKETS.reduce((sum, bucket) => sum + (aging?.[bucket]?.amount || 0), 0)

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="tablist" aria-label={t('service.billing.views.collections')}>
        {COLLECTION_VIEWS.map((key) => {
          const Icon = ICONS[key]
          const item = summary?.[key]
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={cn('grid gap-1 rounded-lg border bg-[var(--surface)] p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent', view === key ? 'border-brand-accent' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}
            >
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"><Icon size={14} aria-hidden="true" />{t(`service.billing.collectionViews.${key}`)}</span>
              <span className="text-lg font-bold text-[var(--text)]">{item?.count ?? '—'}</span>
              <span className="text-xs text-[var(--text-muted)]">
                {key === 'promises' ? t('service.billing.brokenPromises', { count: item?.broken || 0 }) : <span dir="ltr">{money(item?.amount)}</span>}
              </span>
            </button>
          )
        })}
      </div>

      {agingTotal > 0 && (
        <section className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.billing.aging')}>
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.billing.aging')}</h2>
          <div className="flex h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            {BUCKETS.map((bucket, index) => (
              <span key={bucket} className={['bg-sla-at-risk', 'bg-status-contacted', 'bg-sla-breached', 'bg-status-lost'][index]} style={{ width: `${((aging[bucket].amount || 0) / agingTotal) * 100}%` }} />
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {BUCKETS.map((bucket) => (
              <div key={bucket} className="grid">
                <dt className="text-[var(--text-muted)]">{t(`service.billing.buckets.${bucket}`)}</dt>
                <dd className="font-semibold text-[var(--text)]"><span dir="ltr">{money(aging[bucket].amount)}</span> · {t('service.billing.linesCount', { count: aging[bucket].count })}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <DataTable
        data={rows}
        columns={columns}
        tableId={`service-collections-${view}`}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        emptyMessage={t(`service.billing.collectionsEmpty.${view}`)}
        onRowClick={(row) => navigate(detailPath({ id: row.schedule_id }))}
        onRowDoubleClick={(row) => navigate(detailPath({ id: row.schedule_id }))}
        enableSorting
        enableFiltering
        enableExport
        showToolbar
      />
    </div>
  )
}
