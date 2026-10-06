import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { AVAILABILITY_STATUSES, EXPIRING_WITHIN_DAYS } from '../../constants/catalogOptions'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useProductInstances } from '../../hooks/useProductResources'
import { useOptions } from '../common/catalogUi'
import { InstancesTable } from './InstancesTable'
import { useInstanceActions } from './useInstanceActions'

const PER_PAGE = 200

/** `/products/instances` — every serial, unit and batch, with server filters (2026-10-06). */
export function InstancesView() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({ product_id: '', availability_status: '', expiring_within: '', status: '' })
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const availabilityOptions = useOptions('availability', AVAILABILITY_STATUSES)
  const catalogQuery = useCatalogProducts()
  const query = useProductInstances({ ...filters, search, per_page: PER_PAGE })
  const actions = useInstanceActions()

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 400)
    return () => clearTimeout(timer)
  }, [searchText])

  // Names for rows whose response carries only `product_id`.
  const instances = useMemo(() => {
    const names = new Map((catalogQuery.data || []).map((item) => [String(item.id), item.name]))
    return (query.data || []).map((instance) => ({ ...instance, productName: instance.productName || names.get(String(instance.productId)) || '' }))
  }, [catalogQuery.data, query.data])

  const productOptions = useMemo(
    () => (catalogQuery.data || []).filter((item) => item.kind !== 'service').map((item) => ({ value: String(item.id), label: item.name })),
    [catalogQuery.data]
  )
  const set = (key) => (value) => setFilters((current) => ({ ...current, [key]: value }))

  return (
    <div className="space-y-4">
      <PageToolbar title={t('catalog.instances.pageTitle')} description={t('catalog.instances.pageDescription')}>
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} />
          {t('catalog.common.refresh')}
        </Button>
      </PageToolbar>

      <div className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-2 xl:grid-cols-5">
        <Input label={t('catalog.common.search')} value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder={t('catalog.instances.searchPlaceholder')} />
        <Select label={t('catalog.instances.fields.product')} value={filters.product_id} placeholder={t('catalog.common.all')} options={productOptions} onChange={set('product_id')} />
        <Select label={t('catalog.instances.fields.availability')} value={filters.availability_status} placeholder={t('catalog.common.all')} options={availabilityOptions} onChange={set('availability_status')} />
        <Select
          label={t('catalog.instances.fields.expiringWithin')}
          value={filters.expiring_within}
          placeholder={t('catalog.common.all')}
          options={EXPIRING_WITHIN_DAYS.map((days) => ({ value: String(days), label: t('catalog.instances.withinDays', { count: days }) }))}
          onChange={set('expiring_within')}
        />
        <Select
          label={t('catalog.columns.status')}
          value={filters.status}
          placeholder={t('catalog.common.all')}
          options={[{ value: '1', label: t('catalog.common.active') }, { value: '0', label: t('catalog.instances.voided') }]}
          onChange={set('status')}
        />
      </div>

      {instances.length >= PER_PAGE && <p className="text-xs text-[var(--text-muted)]">{t('catalog.instances.limitNote', { count: PER_PAGE })}</p>}

      <InstancesTable
        instances={instances}
        showProduct
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        tableId="catalog-instances"
        onEdit={actions.onEdit}
        onVoid={actions.onVoid}
        onRestore={actions.onRestore}
      />
      {actions.dialogs}
    </div>
  )
}
