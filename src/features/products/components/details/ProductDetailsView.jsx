import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Edit3, RefreshCw } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Tabs } from '../../../../shared/components/ui/Tabs'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { useProductInfo } from '../../hooks/useCatalogProducts'
import { useItemTypes } from '../../hooks/useCatalogSetup'
import { formatApiError } from '../../utils/apiErrors'
import { ActiveBadge, CapabilityChips, KindBadge, useNumberFormat } from '../common/catalogUi'
import { ProductImage } from '../common/ProductImage'
import { ProductFormDrawer } from '../products/ProductFormDrawer'
import { ProductInstancesTab } from './ProductInstancesTab'
import { ProductOverviewTab } from './ProductOverviewTab'
import { ProductRelationsTab } from './ProductRelationsTab'
import { ProductUnitsTab } from './ProductUnitsTab'

const TABS = ['overview', 'units', 'relations', 'instances']

/** `/products/:productId` — one product or service with its units, attached services and instances (2026-10-06). */
export function ProductDetailsView({ productId }) {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const formatNumber = useNumberFormat()
  const query = useProductInfo(productId)
  const itemTypesQuery = useItemTypes()
  const product = query.data
  const activeTab = TABS.includes(params.get('tab')) ? params.get('tab') : 'overview'

  // The info response may carry only `item_type_id`; capabilities then come from the item types list.
  const itemType = useMemo(() => {
    if (!product) return null
    const listed = (itemTypesQuery.data || []).find((item) => String(item.id) === String(product.itemTypeId))
    if (product.itemType?.capabilities?.length || !listed) return product.itemType || listed || null
    return listed
  }, [itemTypesQuery.data, product])

  const backTo = product?.kind === 'service' ? '/products/services' : '/products'
  const backLabel = product?.kind === 'service' ? t('catalog.list.services.title') : t('catalog.list.products.title')

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (query.error || !product) {
    return (
      <EmptyState
        title={query.error ? t('catalog.details.loadFailed') : t('catalog.details.notFound')}
        description={query.error ? formatApiError(query.error, '') : undefined}
        action={(
          <div className="flex gap-2">
            <Link to="/products"><Button variant="outline">{t('catalog.details.backToList')}</Button></Link>
            {query.error && <Button onClick={() => query.refetch()}>{t('catalog.common.retry')}</Button>}
          </div>
        )}
      />
    )
  }

  const tabs = [
    { id: 'overview', label: t('catalog.details.tabs.overview'), content: <ProductOverviewTab product={product} itemType={itemType} /> },
    { id: 'units', label: t('catalog.details.tabs.units'), content: <ProductUnitsTab product={product} /> },
    { id: 'relations', label: t('catalog.details.tabs.relations'), content: <ProductRelationsTab product={product} /> },
    { id: 'instances', label: t('catalog.details.tabs.instances'), content: <ProductInstancesTab product={product} itemType={itemType} /> },
  ]

  return (
    <div className="space-y-4">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={14} className="rtl:-scale-x-100" aria-hidden="true" />
        {backLabel}
      </Link>

      <header className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-start">
        <ProductImage src={product.image} name={product.name} size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="break-words text-xl font-bold text-[var(--text)]">{product.name || `#${product.id}`}</h1>
            <KindBadge kind={product.kind} />
            <ActiveBadge active={product.status} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--text-muted)]">
            <span>{t('catalog.product.fields.price')}: <span className="font-semibold text-[var(--text)]" dir="ltr">{formatNumber(product.price)}</span></span>
            {product.isStockTracked && <span>{t('catalog.product.fields.stockQuantity')}: <span className="font-semibold text-[var(--text)]" dir="ltr">{formatNumber(product.stockQuantity)}</span></span>}
            {itemType && <span>{t('catalog.product.fields.itemType')}: <span className="font-semibold text-[var(--text)]">{itemType.name}</span></span>}
          </div>
          <CapabilityChips capabilities={itemType?.capabilities || []} />
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="icon" onClick={() => query.refetch()} aria-label={t('catalog.common.refresh')} disabled={query.isFetching}>
            <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={() => setEditing(true)}><Edit3 size={16} />{t('actions.edit')}</Button>
        </div>
      </header>

      <Tabs
        items={tabs}
        active={activeTab}
        variant="underline"
        onChange={(tab) => setParams((current) => {
          const next = new URLSearchParams(current)
          if (tab === 'overview') next.delete('tab')
          else next.set('tab', tab)
          return next
        }, { replace: true })}
      />

      <ProductFormDrawer open={editing} mode="edit" product={product} kind={product.kind} onClose={() => setEditing(false)} />
    </div>
  )
}
