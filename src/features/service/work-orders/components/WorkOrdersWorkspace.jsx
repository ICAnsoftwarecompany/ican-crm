import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { DataTable } from '../../../../shared/components/data-table'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { useZonedFormat } from '../../scheduling/utils/zonedTime'
import { useWorkOrderList } from '../api/workOrdersApi'
import { WorkOrderCreateDialog } from './WorkOrderCreateDialog'
import { WORK_ORDER_STATUSES, WorkOrderStatusBadge } from './WorkOrderStatusBadge'

/** Work orders (spec §38): open / by status, search; create from here or from a case / asset. */
export function WorkOrdersWorkspace({ detailPath }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const format = useZonedFormat()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('open')
  const [creating, setCreating] = useState(false)
  const debounced = useDebounce(search, 350)
  const query = useWorkOrderList({ search: debounced || undefined, status: status || undefined })
  const language = i18n.language

  const rows = useMemo(() => query.workOrders.map((entry) => ({ ...entry, customer_name: entry.customer?.name || '', resource_name: localizeLabel(entry.resource?.name, language, ''), type_label: t(`service.workOrders.types.${entry.type}`), when: entry.scheduled_start || '' })), [query.workOrders, language, t])
  const columns = useMemo(
    () => [
      { id: 'number', header: t('service.workOrders.fields.number'), accessor: 'number', width: 130, render: (row) => <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{row.number}</span> },
      { id: 'type', header: t('service.workOrders.fields.type'), accessor: 'type_label', filterType: 'select' },
      { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text', render: (row) => <span className="grid"><span className="font-medium text-[var(--text)]">{row.customer_name}</span><span className="text-xs text-[var(--text-muted)]">{row.location?.address}</span></span> },
      { id: 'status', header: t('service.workOrders.fields.status'), accessor: 'status', filterType: 'select', render: (row) => <WorkOrderStatusBadge status={row.status} /> },
      { id: 'when', header: t('service.workOrders.fields.scheduled'), accessor: 'when', sortable: true, render: (row) => <span className="text-xs">{row.scheduled_start ? format.dateTime(row.scheduled_start) : t('service.workOrders.unscheduled')}</span> },
      { id: 'resource', header: t('service.workOrders.fields.technician'), accessor: 'resource_name', filterType: 'select', render: (row) => <span className="text-xs">{row.resource_name || '—'}</span> },
      { id: 'coverage', header: t('service.workOrders.fields.coverage'), accessor: 'billable', render: (row) => <span className="text-xs">{row.entitlement ? t('service.workOrders.covered') : t('service.workOrders.billable')}</span> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, language, format]
  )

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full gap-2 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_12rem]">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.workOrders.searchPlaceholder')} aria-label={t('service.workOrders.searchPlaceholder')} startIcon={<Search size={16} aria-hidden="true" />} />
          <Select aria-label={t('service.workOrders.fields.status')} placeholder={t('service.workOrders.allStatuses')} value={status} onChange={setStatus} options={['open', ...WORK_ORDER_STATUSES].map((value) => ({ value, label: value === 'open' ? t('service.workOrders.open') : t(`service.workOrders.statuses.${value}`) }))} />
        </div>
        <Button onClick={() => setCreating(true)}><Plus size={16} aria-hidden="true" />{t('service.workOrders.create.button')}</Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        tableId="service-work-orders"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        emptyMessage={t('service.workOrders.empty')}
        onRowClick={(row) => navigate(detailPath(row))}
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
      <WorkOrderCreateDialog open={creating} onClose={() => setCreating(false)} detailPath={detailPath} />
    </div>
  )
}
