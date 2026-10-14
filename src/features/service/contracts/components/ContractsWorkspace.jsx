import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { DataTable } from '../../../../shared/components/data-table'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { useContractList } from '../api/contractsApi'
import { ContractCreateDialog } from './ContractCreateDialog'
import { ContractStatusBadge } from './ContractStatusBadge'

const STATUSES = ['draft', 'sent', 'partially_signed', 'signed', 'active', 'expiring', 'expired', 'terminated', 'cancelled', 'renewed']

/** Contracts list: status filter + search + DataTable; new draft. */
export function ContractsWorkspace({ detailPath }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const debounced = useDebounce(search, 350)
  const query = useContractList({ search: debounced || undefined, status: status || undefined })
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')
  const money = (value, currency = 'EGP') => new Intl.NumberFormat(language, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0)

  const rows = useMemo(() => query.contracts.map((contract) => ({ ...contract, customer_name: contract.customer?.name || '', type_label: localizeLabel(contract.type?.label, language, '') })), [query.contracts, language])
  const columns = useMemo(
    () => [
      { id: 'number', header: t('service.contracts.fields.number'), accessor: 'contract_number', width: 140, render: (row) => <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{row.contract_number}</span> },
      { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text', render: (row) => <span className="font-medium text-[var(--text)]">{row.customer_name}</span> },
      { id: 'type', header: t('service.contracts.fields.type'), accessor: 'type_label', filterType: 'select' },
      { id: 'status', header: t('service.contracts.fields.status'), accessor: 'status', filterType: 'select', render: (row) => <ContractStatusBadge status={row.status} /> },
      { id: 'value', header: t('service.contracts.fields.value'), accessor: 'total_value', sortable: true, render: (row) => <span dir="ltr" className="text-xs">{money(row.total_value, row.currency)}</span> },
      { id: 'period', header: t('service.contracts.fields.period'), accessor: 'start_date', sortable: true, render: (row) => <span className="text-xs">{t('service.entitlements.range', { from: date(row.start_date), to: date(row.end_date) })}</span> },
      { id: 'handoff', header: t('service.hub.handoffs'), accessor: 'handoff', render: (row) => (row.handoff ? <span className="text-xs">{t(`service.handoffs.statuses.${row.handoff.status}`)}</span> : <span className="text-xs text-[var(--text-muted)]">—</span>) },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, language]
  )

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full gap-2 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_12rem]">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.contracts.searchPlaceholder')} aria-label={t('service.contracts.searchPlaceholder')} startIcon={<Search size={16} aria-hidden="true" />} />
          <Select aria-label={t('service.contracts.fields.status')} placeholder={t('service.contracts.allStatuses')} value={status} onChange={setStatus} options={STATUSES.map((value) => ({ value, label: t(`service.contracts.statuses.${value}`) }))} />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          {t('service.contracts.create.button')}
        </Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        tableId="service-contracts"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        emptyMessage={t('service.contracts.empty')}
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
      <ContractCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} detailPath={detailPath} />
    </div>
  )
}
