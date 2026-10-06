import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { DataTable } from '../../../../shared/components/data-table'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { formatDate } from '../../../../shared/utils/dateTime'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useItemTypes } from '../../hooks/useCatalogSetup'
import { getCategoryLabel } from '../../utils/categoryTree'
import { useOptionLabel } from '../common/catalogUi'
import { ProductFormDrawer } from './ProductFormDrawer'
import { useProductColumns } from './useProductColumns'

const STAT_CLASS = 'rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3'

/**
 * Products (`kind` product / plan / bundle) or services (`kind` service) list — 2026-10-06.
 * Clicking a row opens `/products/:id`; "new" opens the create wizard `/products/new` (2026-10-07); edit stays a drawer.
 */
export function CatalogProductsView({ kind = 'product' }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const optionLabel = useOptionLabel()
  const isServices = kind === 'service'
  const query = useCatalogProducts(isServices ? { kind: 'service' } : {})
  const itemTypesQuery = useItemTypes()
  const [drawer, setDrawer] = useState(null)

  const itemTypeNames = useMemo(
    () => new Map((itemTypesQuery.data || []).map((itemType) => [String(itemType.id), itemType.name])),
    [itemTypesQuery.data]
  )

  const rows = useMemo(() => (query.data || [])
    .filter((product) => (isServices ? product.kind === 'service' : product.kind !== 'service'))
    .map((product) => ({
      ...product,
      _kindLabel: optionLabel('kinds', product.kind),
      _itemTypeLabel: product.itemType?.name || itemTypeNames.get(String(product.itemTypeId)) || '',
      _categoryLabel: product.category ? getCategoryLabel(product.category) : '',
      _statusLabel: product.status ? t('catalog.common.active') : t('catalog.common.inactive'),
      _stockSort: product.isStockTracked ? product.stockQuantity ?? 0 : -1,
      _createdAtLabel: product.createdAt ? formatDate(product.createdAt, i18n.language, { dateStyle: 'medium' }) : '',
    })), [i18n.language, isServices, itemTypeNames, optionLabel, query.data, t])

  const openDetails = useCallback((row) => navigate(`/products/${row.id}`), [navigate])
  const openEdit = useCallback((row) => setDrawer({ mode: 'edit', product: row }), [])
  const columns = useProductColumns({ showKind: !isServices, onView: openDetails, onEdit: openEdit })

  const stats = [
    { id: 'total', label: t(`catalog.list.${kind === 'service' ? 'services' : 'products'}.total`), value: rows.length },
    { id: 'active', label: t('catalog.list.activeCount'), value: rows.filter((row) => row.status).length },
    { id: 'tracked', label: t('catalog.list.trackedCount'), value: rows.filter((row) => row.isStockTracked).length },
    { id: 'typed', label: t('catalog.list.withItemType'), value: rows.filter((row) => row.itemTypeId).length },
  ]
  const copyKey = isServices ? 'services' : 'products'

  return (
    <div className="space-y-4">
      <PageToolbar title={t(`catalog.list.${copyKey}.title`)} description={t(`catalog.list.${copyKey}.description`)}>
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} />
          {t('catalog.common.refresh')}
        </Button>
        <Button onClick={() => navigate(isServices ? '/products/new?kind=service' : '/products/new')}>
          <Plus size={16} />
          {t(`catalog.list.${copyKey}.create`)}
        </Button>
      </PageToolbar>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.id} className={STAT_CLASS}>
            <div className="text-xs font-semibold text-[var(--text-muted)]">{stat.label}</div>
            <div className="mt-1 text-xl font-bold text-[var(--text)]">{query.isLoading ? '…' : stat.value}</div>
          </div>
        ))}
      </div>

      <DataTable
        data={rows}
        columns={columns}
        tableId={isServices ? 'catalog-services' : 'catalog-products'}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={openDetails}
        emptyMessage={t(`catalog.list.${copyKey}.empty`)}
      />

      <ProductFormDrawer
        open={Boolean(drawer)}
        mode={drawer?.mode}
        product={drawer?.product}
        kind={isServices ? 'service' : 'product'}
        onClose={() => setDrawer(null)}
      />
    </div>
  )
}
