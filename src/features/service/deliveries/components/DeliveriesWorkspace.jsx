import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { DataTable } from '../../../../shared/components/data-table'
import { cn } from '../../../../shared/utils/cn'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useMoney } from '../../billing/utils/money'
import { useResourceList } from '../../settings/api/settingsApi'
import { schedulingResourcesResource } from '../../settings/resources/schedulingResources'
import { useDeliveries } from '../api/deliveriesApi'
import { CodRemittances } from './CodRemittances'
import { DeliveryDialog } from './DeliveryDialog'

const STATUSES = ['unassigned', 'assigned', 'out_for_delivery', 'delivered', 'failed']
const TONE = { unassigned: 'text-sla-at-risk', assigned: 'text-[var(--text)]', out_for_delivery: 'text-status-contacted', delivered: 'text-sla-on-track', failed: 'text-sla-breached' }

/** Courier dispatch + proof of delivery (spec §38.4) and COD remittances (§29.14). */
export function DeliveriesWorkspace() {
  const { t, i18n } = useTranslation()
  const money = useMoney('EGP', 0)
  const [view, setView] = useState('dispatch')
  const [status, setStatus] = useState('')
  const [courierId, setCourierId] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const debounced = useDebounce(search, 350)
  const query = useDeliveries({ status: status || undefined, courier_id: courierId || undefined, search: debounced || undefined })
  const resources = useResourceList(schedulingResourcesResource)
  const couriers = useMemo(() => (resources.data || []).filter((entry) => entry.type === 'courier' && entry.status !== 'inactive'), [resources.data])
  const summary = query.data?.summary
  const language = i18n.language
  const rows = useMemo(() => (query.data?.data || []).map((entry) => ({ ...entry, merchant_name: entry.merchant?.name || '', recipient_name: entry.recipient?.name || '', courier_name: localizeLabel(entry.courier?.name, language, '') })), [query.data, language])
  const selected = rows.find((entry) => entry.id === selectedId) || null

  const columns = useMemo(
    () => [
      { id: 'ref', header: t('service.deliveries.fields.reference'), accessor: 'reference_no', width: 140, render: (row) => <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{row.reference_no}</span> },
      { id: 'merchant', header: t('service.deliveries.fields.merchant'), accessor: 'merchant_name', filterType: 'select' },
      { id: 'recipient', header: t('service.deliveries.fields.recipient'), accessor: 'recipient_name', render: (row) => <span className="grid"><span className="text-[var(--text)]">{row.recipient_name}</span><span className="text-xs text-[var(--text-muted)]"><bdi>{row.recipient?.address}</bdi></span></span> },
      { id: 'status', header: t('service.deliveries.fields.status'), accessor: 'status', filterType: 'select', render: (row) => <span className={cn('text-xs font-medium', TONE[row.status])}>{t(`service.deliveries.statuses.${row.status}`)}{row.attempts ? ` · ${t('service.deliveries.attemptsCount', { count: row.attempts })}` : ''}</span> },
      { id: 'courier', header: t('service.deliveries.fields.courier'), accessor: 'courier_name', filterType: 'select', render: (row) => <span className="text-xs">{row.courier_name || '—'}</span> },
      { id: 'cod', header: t('service.deliveries.fields.cod'), accessor: 'cod_amount', sortable: true, render: (row) => (row.cod_amount ? <span className="text-xs"><span dir="ltr">{money(row.cod_amount)}</span>{row.cod_collected ? <span className="ms-1 text-sla-on-track">✓</span> : null}</span> : '—') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, language, money]
  )

  return (
    <div className="grid gap-4">
      <nav aria-label={t('service.hub.deliveries')} className="inline-flex w-fit gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
        {['dispatch', 'cod'].map((key) => (
          <button key={key} type="button" aria-pressed={view === key} onClick={() => setView(key)} className={cn('rounded-md px-3 py-1.5 text-sm', view === key ? 'bg-[var(--surface-2)] font-semibold text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]')}>
            {t(`service.deliveries.views.${key}`)}
          </button>
        ))}
      </nav>
      {view === 'cod' ? (
        <CodRemittances />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STATUSES.map((key) => (
              <button key={key} type="button" aria-pressed={status === key} onClick={() => setStatus((current) => (current === key ? '' : key))} className={cn('grid rounded-lg border bg-[var(--surface)] p-3 text-start', status === key ? 'border-brand-accent' : 'border-[var(--border)] hover:bg-[var(--surface-2)]')}>
                <span className="text-xs text-[var(--text-muted)]">{t(`service.deliveries.statuses.${key}`)}</span>
                <span className={cn('text-lg font-bold', TONE[key])}>{summary?.[key] ?? '—'}</span>
              </button>
            ))}
            <div className="grid rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
              <span className="text-xs text-[var(--text-muted)]">{t('service.deliveries.codToRemit')}</span>
              <span className="text-lg font-bold text-[var(--text)]" dir="ltr">{money(summary?.cod_to_remit)}</span>
            </div>
          </div>
          <div className="grid w-full gap-2 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_12rem]">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.deliveries.searchPlaceholder')} aria-label={t('service.deliveries.searchPlaceholder')} startIcon={<Search size={16} aria-hidden="true" />} />
            <Select aria-label={t('service.deliveries.fields.courier')} placeholder={t('service.deliveries.allCouriers')} value={courierId} onChange={setCourierId} options={couriers.map((courier) => ({ value: courier.id, label: localizeLabel(courier.name, language, courier.id) }))} />
          </div>
          <DataTable data={rows} columns={columns} tableId="service-deliveries" isLoading={query.isLoading} error={query.error} onRetry={query.refetch} emptyMessage={t('service.deliveries.empty')} onRowClick={(row) => setSelectedId(row.id)}
        onRowDoubleClick={(row) => setSelectedId(row.id)} enableSorting enableFiltering enableExport showToolbar showFooter />
          <DeliveryDialog delivery={selected} couriers={couriers} onClose={() => setSelectedId(null)} />
        </>
      )}
    </div>
  )
}
