import { useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../../../../shared/components/data-table'
import { Button } from '../../../../shared/components/ui/Button'

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

function formatStatus(row, t) {
  const raw = row.general_status || row.status?.status || row.status?.name || row.status || ''
  const status = String(raw).trim()
  if (!status) return '-'
  const key = status.toLowerCase() === 'deal' ? 'won' : status.toLowerCase()
  return t(`customers.segmentStatuses.${key}`, { defaultValue: status })
}

export function CustomerDirectoryTable({ query, template }) {
  const { t } = useTranslation()
  const rows = useMemo(() => query.data?.pages.flatMap((page) => page.data || []) || [], [query.data])
  const columns = useMemo(() => {
    const definitions = [
      { id: 'id', accessor: 'id', header: t('customers.homeTab.id'), filterType: 'number' },
      { id: 'lead_id', accessor: 'lead_id', header: t('customers.table.leadId'), filterType: 'number' },
      { id: 'name', accessor: 'name', header: t('customers.table.customerName'), render: (row) => <span className="font-semibold">{row.name || '-'}</span> },
      { id: 'code', accessor: 'code', header: t('customers.table.customerCode') },
      { id: 'phone', accessor: 'phone', header: t('customers.phone') },
      { id: 'email', accessor: 'email', header: t('customers.email') },
      { id: 'company', accessor: 'company', header: t('customers.table.company') },
      { id: 'type', accessor: 'type', header: t('customers.newCustomerDialog.type'), render: (row) => row.type === 'customer' ? t('customers.newCustomerDialog.typeCustomer') : row.type === 'lead' ? t('customers.newCustomerDialog.typeLead') : row.type || '-' },
      { id: 'source', accessor: 'source', header: t('customers.table.marketingSourceData') },
      { id: 'general_status', accessor: 'general_status', header: t('customers.table.status'), render: (row) => <span className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs font-medium">{formatStatus(row, t)}</span> },
      { id: 'agent_id', accessor: 'agent_id', header: t('customers.table.assignedTo') },
      { id: 'linked_type', accessor: 'linked_type', header: t('customers.leadCreate.linkedType') },
      { id: 'linked_by', accessor: 'linked_by', header: t('customers.table.linkedBy'), render: (row) => row.linked_by?.name || row.linked_by || '-' },
      { id: 'tag', accessor: 'tag_id', header: t('customers.table.tag'), render: (row) => row.tag?.name || row.tag_id || '-' },
      { id: 'link_date', accessor: 'link_date', header: t('customers.leadCreate.linkDate'), render: (row) => formatDate(row.link_date), filterType: 'date' },
      { id: 'created_at', accessor: 'created_at', header: t('customers.table.createdAt'), render: (row) => formatDate(row.created_at), filterType: 'date' },
      { id: 'updated_at', accessor: 'updated_at', header: t('customers.homeTab.updatedAt'), render: (row) => formatDate(row.updated_at), filterType: 'date' },
    ]
    const visibleColumns = new Set(template?.columns || definitions.map(({ id }) => id))
    return definitions
      .filter(({ id }) => visibleColumns.has(id))
      .map((column) => ({ sortable: true, filterable: true, searchable: true, visible: true, filterType: 'text', ...column }))
  }, [t, template])

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw size={15} className={query.isFetching ? 'animate-spin' : ''} />
          {t('customers.deals.refresh')}
        </Button>
      </div>
      <DataTable
        tableId="customer-management-directory"
        data={rows}
        columns={columns}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        onLoadMore={query.fetchNextPage}
        emptyMessage={t('customers.noCustomers')}
      />
    </section>
  )
}
