import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/Button'
import { CustomerDetailsDrawer } from './CustomerDetailsDrawer/CustomerDetailsDrawer'
import { useTranslation } from 'react-i18next'
import { useCustomerDealColumns } from '../../../features/customers'
import { DoneCustomerDrawer } from './DoneCustomerDrawer'

export function CustomerSegmentTable({ query, title, tableId, icon: Icon, showCustomerDeals = false }) {
  const { t } = useTranslation()
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const rows = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) || [], [query.data])
  const dealTable = useCustomerDealColumns(rows, showCustomerDeals)
  const columns = useMemo(() => [
    { id: 'name', accessor: 'name', header: t('customers.name'), render: (row) => <button type="button" onClick={() => setSelectedCustomer(row)} className="break-words text-start font-bold text-[var(--brand-accent)] hover:underline">{row.name || '-'}</button> },
    { id: 'code', accessor: 'code', header: t('customers.homeTab.code') },
    { id: 'phone', accessor: 'phone', header: t('customers.phone') },
    { id: 'email', accessor: 'email', header: t('customers.email') },
    { id: 'company', accessor: 'company', header: t('customers.homeTab.company') },
    { id: 'source', accessor: 'source', header: t('customers.table.source') },
    { id: 'general_status', accessor: 'general_status', header: t('customers.homeTab.status'), render: (row) => <span className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold text-[var(--text)]">{t(`customers.segmentStatuses.${row.general_status}`, { defaultValue: row.general_status || '-' })}</span> },
    { id: 'updated_at', accessor: 'updated_at', header: t('customers.homeTab.updatedAt'), render: (row) => {
      const date = row.updated_at ? new Date(row.updated_at) : null
      return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '-'
    } },
  ].map((column) => ({ sortable: true, filterable: true, searchable: true, visible: true, filterType: 'text', ...column })), [t])
  return (
    <div className="min-w-0 space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <h1 className="flex items-center gap-2 text-base font-bold text-[var(--text)]"><Icon size={19} className="text-[var(--brand-accent)]" />{title}</h1>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}><RefreshCw size={15} />{t('common.retry')}</Button>
      </header>
      <DataTable tableId={tableId} data={dealTable.rows} columns={[...columns, ...dealTable.columns]} isLoading={query.isLoading} error={query.error} onRetry={query.refetch} hasNextPage={query.hasNextPage} isFetchingNextPage={query.isFetchingNextPage} onLoadMore={query.fetchNextPage} emptyMessage={t('customers.noCustomers')} onRowDoubleClick={(row) => setSelectedCustomer(row)} />
      {showCustomerDeals
        ? <DoneCustomerDrawer customer={selectedCustomer} columns={columns} open={Boolean(selectedCustomer)} onClose={() => setSelectedCustomer(null)} />
        : <CustomerDetailsDrawer customer={selectedCustomer} open={Boolean(selectedCustomer)} onClose={() => setSelectedCustomer(null)} onStatusChanged={() => query.refetch()} />}
    </div>
  )
}
