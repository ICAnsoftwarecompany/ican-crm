import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Edit3, ExternalLink } from 'lucide-react'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { Skeleton } from '../../../shared/components/feedback/Skeleton'
import { Button } from '../../../shared/components/ui/Button'
import { useProductInfo } from '../hooks/useCatalogProducts'
import { useProductRelations, useProductUnits } from '../hooks/useProductResources'
import { ActiveBadge, KindBadge, useNumberFormat, useOptionLabel } from '../components/common/catalogUi'
import { ProductImage } from '../components/common/ProductImage'
import { CompletenessCard } from './components/CompletenessCard'
import { useResolvedItemType } from './hooks/useResolvedItemType'
import { ProductOverviewTab } from './tabs/ProductOverviewTab'
import { productCompleteness } from './utils/productCompleteness'

function MiniList({ title, loading, items, empty }) {
  return (
    <section>
      <h3 className="mb-1.5 text-sm font-semibold text-[var(--text)]">{title}</h3>
      {loading ? <Skeleton className="h-8 w-full" /> : items.length ? (
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] text-sm">
          {items.map((item) => <li key={item.key} className="flex justify-between gap-2 px-3 py-2"><span className="text-[var(--text)]">{item.label}</span><span className="text-xs text-[var(--text-muted)]">{item.meta}</span></li>)}
        </ul>
      ) : <p className="text-sm text-[var(--text-muted)]">{empty}</p>}
    </section>
  )
}

/**
 * Everything about one product / service (2026-10-15): image, kind, status, price, completeness, every field, units
 * and attached items, links to the full page and edit. `product` = a list row (shown at once); the info request
 * refreshes it. Used by `ProductQuickDrawer` and by the catalog browser (Leads Center), which shows it in place.
 */
export function ProductQuickView({ product: row, enabled = true, onEdit }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const formatNumber = useNumberFormat()
  const optionLabel = useOptionLabel()
  const infoQuery = useProductInfo(enabled ? row?.id : null)
  const product = infoQuery.data || row
  const itemType = useResolvedItemType(product)
  const unitsQuery = useProductUnits(enabled ? row?.id : null)
  const relationsQuery = useProductRelations(enabled ? row?.id : null)
  if (!row) return null
  const completeness = productCompleteness(product)

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <ProductImage src={product.image} name={product.name} size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2"><KindBadge kind={product.kind} /><ActiveBadge active={product.status} /></div>
          <p className="text-sm text-[var(--text-muted)]">{t('catalog.product.fields.price')}: <span className="font-semibold text-[var(--text)]" dir="ltr">{formatNumber(product.price)}</span></p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(`/products/${product.id}`)}><ExternalLink size={14} />{t('productDetails.drawer.openPage')}</Button>
            {onEdit && <Button size="sm" variant="outline" onClick={() => onEdit(product)}><Edit3 size={14} />{t('actions.edit')}</Button>}
          </div>
        </div>
      </header>

      <CompletenessCard completeness={completeness} onComplete={() => navigate(`/products/${product.id}/complete`)} />
      <ProductOverviewTab product={product} itemType={itemType} />

      <MiniList
        title={t('catalog.details.tabs.units')}
        loading={unitsQuery.isLoading}
        empty={t('productDetails.drawer.noUnits')}
        items={(unitsQuery.data || []).map((unit) => ({ key: unit.id, label: unit.unitName, meta: `×${unit.factor ?? 1} · ${formatNumber(unit.price)}` }))}
      />
      <MiniList
        title={t('catalog.details.tabs.relations')}
        loading={relationsQuery.isLoading}
        empty={t('catalog.create.relationsEmpty')}
        items={(relationsQuery.data || []).map((relation) => ({ key: relation.id, label: relation.childName || `#${relation.childProductId}`, meta: optionLabel('inclusion', relation.inclusion) }))}
      />
    </div>
  )
}

/** Quick view drawer, opened by the icon next to the name in the products list (2026-10-15). */
export function ProductQuickDrawer({ product, open, onClose, onEdit }) {
  const { t } = useTranslation()
  if (!product) return null
  return (
    <AppDrawer open={open} onClose={onClose} size="lg" title={product.name || `#${product.id}`} description={t('productDetails.drawer.description')}>
      <ProductQuickView product={product} enabled={open} onEdit={onEdit} />
    </AppDrawer>
  )
}
