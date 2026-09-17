import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, X } from 'lucide-react'
import { DataTable } from '../../../../shared/components/data-table'
import { Button } from '../../../../shared/components/ui/Button'
import { useCustomers } from '../../../../features/customers/hooks/useCustomers'
import { extractList } from '../../../../shared/utils/apiResponse'
import { getCustomerName, getCustomerPhone, getCustomerEmail } from '../../../../features/outreach-campaigns/utils/campaignAudience'

function extractCustomersFromInfinite(data) {
  if (!data?.pages) return []
  return data.pages.flatMap((page) => (Array.isArray(page?.data) ? page.data : extractList(page, ['data'])))
}

/**
 * Audience builder for the wizard's Audience step.
 *
 * There is no backend "select all N,000 matching this filter" endpoint
 * (see docs "Backend Gaps") — DataTable's own select-all only covers rows
 * already loaded into the browser. So this works as an accumulator: the
 * user filters/searches, selects a batch of visible rows, clicks "add
 * selected to audience", and repeats across as many filter passes as
 * needed. The running audience list survives filter changes and is what
 * ultimately becomes `customer_ids` in the campaign payload.
 */
export function CampaignAudienceBuilder({ selectedCustomers = [], onChange }) {
  const { t } = useTranslation()
  // DataTable filters/searches this `rows` array client-side (same
  // convention as the rest of the app); pagination/loading more is the
  // only thing driven by the server, via useCustomers' infinite query.
  const customersQuery = useCustomers({ per_page: 60 })
  const rows = extractCustomersFromInfinite(customersQuery.data)

  const selectedIds = useMemo(() => new Set(selectedCustomers.map((customer) => customer.id)), [selectedCustomers])

  const columns = useMemo(() => [
    {
      id: 'name',
      header: t('customers.name'),
      accessor: 'lead.name',
      searchable: true,
      sortable: true,
      render: (row) => <span className="font-bold text-[var(--text)]">{getCustomerName(row)}</span>,
    },
    {
      id: 'phone',
      header: t('customers.phone'),
      accessor: 'lead.phone',
      searchable: true,
      render: (row) => <span dir="ltr">{getCustomerPhone(row) || '—'}</span>,
    },
    {
      id: 'email',
      header: t('customers.email'),
      accessor: 'lead.email',
      searchable: true,
      render: (row) => <span dir="ltr">{getCustomerEmail(row) || '—'}</span>,
    },
    {
      id: 'inAudience',
      header: t('outreachCampaigns.audience.inAudience'),
      accessor: 'id',
      enableFilter: false,
      sortable: false,
      render: (row) => (selectedIds.has(row.id) ? (
        <span className="text-xs font-bold text-[#087D3E]">{t('outreachCampaigns.audience.added')}</span>
      ) : null),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, selectedIds])

  const addToAudience = (rowsToAdd, clearSelection) => {
    const merged = [...selectedCustomers]
    const existingIds = new Set(merged.map((customer) => customer.id))
    rowsToAdd.forEach((row) => {
      if (!existingIds.has(row.id)) {
        merged.push(row)
        existingIds.add(row.id)
      }
    })
    onChange(merged)
    clearSelection?.()
  }

  const removeFromAudience = (customerId) => {
    onChange(selectedCustomers.filter((customer) => customer.id !== customerId))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#A0ECF0] bg-[#E8F9FA] px-4 py-3 text-sm font-bold text-[#007A80]">
        {t('outreachCampaigns.audience.matchCount', { count: selectedCustomers.length })}
      </div>

      <DataTable
        data={rows}
        columns={columns}
        tableId="outreach-campaign-audience"
        isLoading={customersQuery.isLoading}
        error={customersQuery.error}
        onRetry={customersQuery.refetch}
        hasNextPage={customersQuery.hasNextPage}
        isFetchingNextPage={customersQuery.isFetchingNextPage}
        onLoadMore={customersQuery.fetchNextPage}
        toolbarActions={({ selectedRows, selectedCount, clearSelection }) => (
          <Button
            variant="accent"
            size="sm"
            disabled={selectedCount === 0}
            onClick={() => addToAudience(selectedRows, clearSelection)}
          >
            <UserPlus size={14} />
            {t('outreachCampaigns.audience.addSelected', { count: selectedCount })}
          </Button>
        )}
        emptyMessage={t('customers.noCustomers')}
        enableSorting
        enableFiltering
        enableGlobalSearch
        enablePagination={false}
        enableColumnVisibility={false}
        enableExport={false}
        showToolbar
        showFooter
      />

      {selectedCustomers.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="mb-2 text-xs font-bold text-[var(--text-muted)]">{t('outreachCampaigns.audience.currentAudience')}</p>
          <div className="flex flex-wrap gap-2">
            {selectedCustomers.map((customer) => (
              <span key={customer.id} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--text)]">
                {getCustomerName(customer)}
                <button type="button" onClick={() => removeFromAudience(customer.id)} aria-label={t('actions.delete')}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
