import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, RefreshCw, Settings2 } from 'lucide-react'
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

const LIST_COPY = { product: 'products', service: 'services', plan: 'plans', bundle: 'bundles' }
const LIST_KINDS = Object.keys(LIST_COPY)

/** Where "new" goes for a list: the kind's create wizard (and the item type, on a type page). */
function createPath(kind, itemTypeId) {
  const params = new URLSearchParams()
  if (kind !== 'product') params.set('kind', kind)
  if (itemTypeId) params.set('item_type', itemTypeId)
  return `/products/new${params.toString() ? `?${params}` : ''}`
}

/**
 * One list per kind (2026-10-15): `/products` products, `/products/services` services, `/products/services/plans`
 * plans, `/products/services/bundles` bundles — and one per item type (`itemTypeId`, `/products/types/:id`, title =
 * the type's name). Was: products (product / plan / bundle) or services — 2026-10-06.
 * 2026-10-15: every field as a column, a completeness column (what is missing), the quick-view drawer from the icon
 * next to the name (DataTable `onOpenRowDrawer`), no stat tiles (the numbers live on `/products/overview`).
 * Clicking a row opens `/products/:id`; "new" opens `/products/new`; edit stays a drawer.
 */
export function CatalogProductsView({ kind: kindProp = 'product', itemTypeId = '' }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const optionLabel = useOptionLabel()
  const capabilityName = useCapabilityName()
  const itemTypesQuery = useItemTypes()
  const scopeType = itemTypeId ? (itemTypesQuery.data || []).find((itemType) => String(itemType.id) === String(itemTypeId)) || null : null
  const kind = scopeType?.kind && LIST_KINDS.includes(scopeType.kind) ? scopeType.kind : LIST_KINDS.includes(kindProp) ? kindProp : 'product'
  const query = useCatalogProducts()
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
      .filter((product) => (itemTypeId ? String(product.itemTypeId) === String(itemTypeId) : product.kind === kind))
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
  }, [capabilityName, categoryPaths, i18n.language, itemTypeId, itemTypesById, kind, optionLabel, query.data, t])

  const openDetails = useCallback((row) => navigate(`/products/${row.id}`), [navigate])
  const openEdit = useCallback((row) => setDrawer({ mode: 'edit', product: row }), [])
  const openComplete = useCallback((row) => navigate(`/products/${row.id}/complete`), [navigate])
  const columns = useProductColumns({ showKind: false, onView: openDetails, onEdit: openEdit, onComplete: openComplete })
  const copyKey = LIST_COPY[kind]
  const title = itemTypeId ? scopeType?.name || t('catalog.list.byType.loading') : t(`catalog.list.${copyKey}.title`)
  const description = itemTypeId
    ? scopeType?.description || t('catalog.list.byType.description', { name: scopeType?.name || '' })
    : t(`catalog.list.${copyKey}.description`)

  return (
    <div className="space-y-4">
      <PageToolbar title={title} description={description}>
        {itemTypeId && (
          <Button variant="outline" onClick={() => navigate(`/products/item-types/${encodeURIComponent(itemTypeId)}`)}>
            <Settings2 size={16} />
            {t('catalog.list.byType.editType')}
          </Button>
        )}
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} />
          {t('catalog.common.refresh')}
        </Button>
        <Button onClick={() => navigate(createPath(kind, itemTypeId))}>
          <Plus size={16} />
          {t(`catalog.list.${copyKey}.create`)}
        </Button>
      </PageToolbar>

      {!itemTypeId && ['product', 'service'].includes(kind) && <CatalogSetupGuide kind={kind} />}
      {itemTypeId && !itemTypesQuery.isLoading && !scopeType && <p role="status" className="rounded-lg bg-[var(--surface-2)] p-3 text-sm text-[var(--text)]">{t('catalog.list.byType.notFound')}</p>}

      <DataTable
        data={rows}
        columns={columns}
        tableId={itemTypeId ? 'catalog-by-type' : `catalog-${copyKey}-v2`}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={openDetails}
        onOpenRowDrawer={setQuickView}
        emptyMessage={itemTypeId ? t('catalog.list.byType.empty') : t(`catalog.list.${copyKey}.empty`)}
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
        kind={kind}
        onClose={() => setDrawer(null)}
      />
    </div>
  )
}
