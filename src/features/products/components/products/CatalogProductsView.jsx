import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { DataTable } from '../../../../shared/components/data-table'
import { PageToolbar } from '../../../../shared/components/data/PageToolbar'
import { formatDate } from '../../../../shared/utils/dateTime'
import { visibleCapabilities } from '../../constants/capabilityRegistry'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useItemTypes } from '../../hooks/useCatalogSetup'
import { useProductCategories } from '../../hooks/useProducts'
import { flattenCategoryTree, getCategoryLabel } from '../../utils/categoryTree'
import { CatalogSetupGuide } from '../../item-type-wizard'
import { ProductQuickDrawer } from '../../product-details/ProductQuickDrawer'
import { productCompleteness } from '../../product-details/utils/productCompleteness'
import { useCapabilityName, useOptionLabel } from '../common/catalogUi'
import { ProductFormDrawer } from './ProductFormDrawer'
import { useProductColumns } from './useProductColumns'

/**
 * Products (`kind` product / plan / bundle) or services (`kind` service) list — 2026-10-06.
 * 2026-10-15: every field as a column, a completeness column (what is missing), the quick-view drawer from the icon
 * next to the name (DataTable `onOpenRowDrawer`), no stat tiles (the numbers live on `/products/overview`).
 * Clicking a row opens `/products/:id`; "new" opens `/products/new`; edit stays a drawer.
 */
export function CatalogProductsView({ kind = 'product' }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const optionLabel = useOptionLabel()
  const capabilityName = useCapabilityName()
  const isServices = kind === 'service'
  const query = useCatalogProducts(isServices ? { kind: 'service' } : {})
  const itemTypesQuery = useItemTypes()
  const categoriesQuery = useProductCategories()
  const [drawer, setDrawer] = useState(null)
  const [quickView, setQuickView] = useState(null)

  const itemTypesById = useMemo(() => new Map((itemTypesQuery.data || []).map((itemType) => [String(itemType.id), itemType])), [itemTypesQuery.data])
  const categoryPaths = useMemo(
    () => new Map(flattenCategoryTree(categoriesQuery.data || []).map((category) => [String(category.id), category._pathLabel])),
    [categoriesQuery.data]
  )

  const rows = useMemo(() => {
    const date = (value) => (value ? formatDate(value, i18n.language, { dateStyle: 'medium' }) : '')
    return (query.data || [])
      .filter((product) => (isServices ? product.kind === 'service' : product.kind !== 'service'))
      .map((product) => {
        const itemType = itemTypesById.get(String(product.itemTypeId)) || product.itemType
        const capabilities = visibleCapabilities(itemType?.capabilities)
        const completeness = productCompleteness(product)
        const creates = product.fulfillmentConfig?.creates || itemType?.fulfillmentConfig?.creates
        return {
          ...product,
          _kindLabel: optionLabel('kinds', product.kind),
          _itemTypeLabel: itemType?.name || '',
          _capabilities: capabilities,
          _capabilitiesLabel: capabilities.map((capability) => capabilityName(capability.code)).join(' '),
          _categoryLabel: categoryPaths.get(String(product.categoryId)) || (product.category ? getCategoryLabel(product.category) : ''),
          _baseUnitLabel: product.baseUnit?.name || product.baseUnit?.code || '',
          _createsLabel: creates ? optionLabel('creates', creates) : '',
          _statusLabel: product.status ? t('catalog.common.active') : t('catalog.common.inactive'),
          _stockSort: product.isStockTracked ? product.stockQuantity ?? 0 : -1,
          _completeness: completeness,
          _completenessScore: completeness.score,
          _createdAtLabel: date(product.createdAt),
          _updatedAtLabel: date(product.updatedAt),
        }
      })
  }, [capabilityName, categoryPaths, i18n.language, isServices, itemTypesById, optionLabel, query.data, t])

  const openDetails = useCallback((row) => navigate(`/products/${row.id}`), [navigate])
  const openEdit = useCallback((row) => setDrawer({ mode: 'edit', product: row }), [])
  const openComplete = useCallback((row) => navigate(`/products/${row.id}/complete`), [navigate])
  const columns = useProductColumns({ showKind: !isServices, onView: openDetails, onEdit: openEdit, onComplete: openComplete })
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

      <CatalogSetupGuide kind={isServices ? 'service' : 'product'} />

      <DataTable
        data={rows}
        columns={columns}
        tableId={isServices ? 'catalog-services-v2' : 'catalog-products-v2'}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={openDetails}
        onOpenRowDrawer={setQuickView}
        emptyMessage={t(`catalog.list.${copyKey}.empty`)}
      />

      <ProductQuickDrawer
        open={Boolean(quickView)}
        product={quickView}
        onClose={() => setQuickView(null)}
        onEdit={(product) => {
          setQuickView(null)
          openEdit(product)
        }}
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
