import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { DataTable } from '../../../../shared/components/data-table'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { useAssetList } from '../api/assetsApi'
import { AssetCreateDialog } from './AssetCreateDialog'
import { AssetStatusBadge, WARRANTY_TONE } from './AssetStatusBadge'

const STATUSES = ['active', 'in_repair', 'replaced', 'retired', 'transferred']

/** Customer assets with warranty state; row opens the asset. */
export function AssetsWorkspace({ detailPath }) {
  const { t, i18n } = useTranslation()
  const term = useServiceTerminology()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const debounced = useDebounce(search, 350)
  const query = useAssetList({ search: debounced || undefined, status: status || undefined })
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')

  const rows = useMemo(() => query.assets.map((asset) => ({ ...asset, name_label: localizeLabel(asset.name, language, asset.id), customer_name: asset.customer?.name || '' })), [query.assets, language])
  const columns = useMemo(
    () => [
      { id: 'name', header: t('service.assets.fields.name'), accessor: 'name_label', render: (row) => <span className="font-medium text-[var(--text)]">{row.name_label}</span> },
      { id: 'serial', header: t('service.assets.fields.serial'), accessor: 'serial_number', render: (row) => <span dir="ltr" className="font-mono text-xs">{row.serial_number || '—'}</span> },
      { id: 'customer', header: term('customer'), accessor: 'customer_name', filterType: 'text' },
      { id: 'status', header: t('service.assets.fields.status'), accessor: 'status', filterType: 'select', render: (row) => <AssetStatusBadge status={row.status} /> },
      {
        id: 'warranty',
        header: t('service.assets.fields.warranty'),
        accessor: 'warranty_status',
        render: (row) => (
          <span className={cn('text-xs font-medium', WARRANTY_TONE[row.warranty_status])}>
            {row.warranty ? t('service.assets.warrantyUntil', { date: date(row.warranty.ends_at) }) : t(`service.assets.warrantyStatus.${row.warranty_status}`)}
          </span>
        ),
      },
      { id: 'installation', header: t('service.assets.fields.installation'), accessor: 'installation_date', sortable: true, render: (row) => <span className="text-xs">{date(row.installation_date)}</span> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, term, language]
  )

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full gap-2 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_12rem]">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('service.assets.searchPlaceholder')} aria-label={t('service.assets.searchPlaceholder')} startIcon={<Search size={16} aria-hidden="true" />} />
          <Select aria-label={t('service.assets.fields.status')} placeholder={t('service.assets.allStatuses')} value={status} onChange={setStatus} options={STATUSES.map((value) => ({ value, label: t(`service.assets.statuses.${value}`) }))} />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          {t('service.assets.create.button')}
        </Button>
      </div>
      <DataTable
        data={rows}
        columns={columns}
        tableId="service-assets"
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        emptyMessage={t('service.assets.empty')}
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
      <AssetCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} detailPath={detailPath} />
    </div>
  )
}
