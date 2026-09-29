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
import { useScheduleList } from '../api/schedulesApi'
import { SCHEDULE_STATUSES, useMoney } from '../utils/money'
import { ScheduleStatusBadge } from './ScheduleStatusBadge'

/** Payment schedules: search + status (incl. "has overdue") + DataTable. Schedules come from signed contracts. */
export function SchedulesList({ detailPath, customerId }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const money = useMoney('EGP', 0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const debounced = useDebounce(search, 350)
  const query = useScheduleList({ search: debounced || undefined, status: status || undefined, customer_id: customerId })
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')

  const rows = useMemo(
    () => query.schedules.map((schedule) => ({ ...schedule, customer_name: schedule.customer?.name || '', plan_name: localizeLabel(schedule.plan?.name, language, ''), outstanding: schedule.totals?.outstanding || 0, overdue: schedule.totals?.overdue || 0, next_due_date: schedule.next_due?.date || '' })),
    [query.schedules, language]
  )
  const columns = useMemo(
    () => [
      { id: 'number', header: t('service.billing.columns.number'), accessor: 'schedule_number', width: 150, render: (row) => <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{row.schedule_number}</span> },
      { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text', render: (row) => <span className="font-medium text-[var(--text)]">{row.customer_name}</span> },
      { id: 'contract', header: t('service.billing.columns.contract'), accessor: 'contract_number', render: (row) => <span dir="ltr" className="text-xs">{row.contract_number}</span> },
      { id: 'plan', header: t('service.billing.fields.plan'), accessor: 'plan_name', filterType: 'select' },
      { id: 'status', header: t('service.billing.columns.status'), accessor: 'status', filterType: 'select', render: (row) => <ScheduleStatusBadge status={row.status} /> },
      { id: 'outstanding', header: t('service.billing.totals.outstanding'), accessor: 'outstanding', sortable: true, render: (row) => <span dir="ltr" className="text-xs">{money(row.outstanding)}</span> },
      { id: 'overdue', header: t('service.billing.totals.overdue'), accessor: 'overdue', sortable: true, render: (row) => (row.overdue ? <span dir="ltr" className="text-xs font-semibold text-sla-breached">{money(row.overdue)}</span> : <span className="text-xs text-[var(--text-muted)]">—</span>) },
      { id: 'next', header: t('service.billing.columns.nextDue'), accessor: 'next_due_date', sortable: true, render: (row) => <span className="text-xs">{date(row.next_due_date)}</span> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, language, money]
  )

  return (
    <div className="grid gap-4">
      <div className="grid w-full gap-2 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_12rem]">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.billing.searchPlaceholder')} aria-label={t('service.billing.searchPlaceholder')} startIcon={<Search size={16} aria-hidden="true" />} />
        <Select aria-label={t('service.billing.columns.status')} placeholder={t('service.billing.allStatuses')} value={status} onChange={setStatus} options={['overdue', ...SCHEDULE_STATUSES].map((value) => ({ value, label: value === 'overdue' ? t('service.billing.hasOverdue') : t(`service.billing.scheduleStatuses.${value}`) }))} />
      </div>
      <DataTable
        data={rows}
        columns={columns}
        tableId="service-payment-schedules"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        emptyMessage={t('service.billing.empty')}
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
    </div>
  )
}
