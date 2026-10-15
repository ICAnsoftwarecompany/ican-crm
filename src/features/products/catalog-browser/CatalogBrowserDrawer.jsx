import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Package, PackageSearch, Search } from 'lucide-react'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { Skeleton } from '../../../shared/components/feedback/Skeleton'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { Button } from '../../../shared/components/ui/Button'
import { cn } from '../../../shared/utils/cn'
import { useCatalogProducts } from '../hooks/useCatalogProducts'
import { useItemTypes } from '../hooks/useCatalogSetup'
import { ActiveBadge, KindBadge, catalogInputClass, useNumberFormat } from '../components/common/catalogUi'
import { buildCatalogImageUrl } from '../components/common/ProductImage'
import { ProductQuickView } from '../product-details/ProductQuickDrawer'
import { BROWSER_KINDS, categoryOptions, countKinds, filterCatalog, itemTypeNameOf, itemTypeOptions } from './utils/catalogBrowser'

/** Plain thumbnail (the row is a button, so no nested clickable image). */
function Thumb({ src }) {
  const url = buildCatalogImageUrl(src)
  return url
    ? <img src={url} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
    : <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]"><Package size={16} aria-hidden="true" /></span>
}

const EMPTY_FILTERS = { kind: 'all', itemTypeId: '', category: '', search: '', showInactive: false }

/**
 * Side panel to browse the catalog from anywhere (2026-10-15; opened from the Leads Center header): kind tabs,
 * item type and category filters, search; a click shows the item's full data in place (`ProductQuickView`) with
 * a back button. Filters are kept while the panel stays mounted.
 */
export function CatalogBrowserDrawer({ open, onClose }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const productsQuery = useCatalogProducts()
  const itemTypesQuery = useItemTypes()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selected, setSelected] = useState(null)
  const products = useMemo(() => productsQuery.data || [], [productsQuery.data])
  const itemTypes = useMemo(() => itemTypesQuery.data || [], [itemTypesQuery.data])

  const scoped = useMemo(() => filterCatalog(products, { showInactive: filters.showInactive }, itemTypes), [filters.showInactive, itemTypes, products])
  const counts = useMemo(() => countKinds(scoped), [scoped])
  const ofKind = useMemo(() => filterCatalog(scoped, { kind: filters.kind, showInactive: true }, itemTypes), [filters.kind, itemTypes, scoped])
  const typeOptions = useMemo(() => itemTypeOptions(ofKind, itemTypes), [itemTypes, ofKind])
  const categories = useMemo(() => categoryOptions(ofKind), [ofKind])
  const visible = useMemo(() => filterCatalog(products, filters, itemTypes), [filters, itemTypes, products])
  const set = (patch) => setFilters((current) => ({ ...current, ...patch }))

  const close = () => {
    setSelected(null)
    onClose?.()
  }

  return (
    <AppDrawer
      open={open}
      onClose={close}
      size="xl"
      drawerKey="catalog-browser"
      title={selected ? selected.name || `#${selected.id}` : t('catalog.browser.title')}
      description={selected ? itemTypeNameOf(selected, itemTypes) : t('catalog.browser.description')}
    >
      {selected ? (
        <div className="space-y-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setSelected(null)}>
            <ArrowLeft size={14} className="rtl:rotate-180" />
            {t('catalog.browser.back')}
          </Button>
          <ProductQuickView product={selected} enabled={open} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label={t('catalog.browser.kindLabel')}>
            {BROWSER_KINDS.filter((kind) => kind === 'all' || counts[kind] > 0).map((kind) => (
              <button
                key={kind}
                type="button"
                role="tab"
                aria-selected={filters.kind === kind}
                onClick={() => set({ kind, itemTypeId: '', category: '' })}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors',
                  filters.kind === kind ? 'border-[#00C2CB] bg-[var(--surface-2)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                {t(`catalog.browser.kinds.${kind}`)}
                <span className="text-[var(--text-light)]">{counts[kind]}</span>
              </button>
            ))}
          </div>

          <label className="relative block">
            <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => set({ search: event.target.value })}
              placeholder={t('catalog.browser.search')}
              aria-label={t('catalog.browser.search')}
              className={cn(catalogInputClass, 'ps-9')}
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            <select value={filters.itemTypeId} onChange={(event) => set({ itemTypeId: event.target.value })} aria-label={t('catalog.browser.itemType')} className={catalogInputClass}>
              <option value="">{t('catalog.browser.allTypes')}</option>
              {typeOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.id === 'none' ? t('catalog.browser.noType') : option.name}</option>
              ))}
            </select>
            <select value={filters.category} onChange={(event) => set({ category: event.target.value })} aria-label={t('catalog.browser.category')} className={catalogInputClass}>
              <option value="">{t('catalog.browser.allCategories')}</option>
              {categories.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-[#00C2CB]" checked={filters.showInactive} onChange={(event) => set({ showInactive: event.target.checked })} />
              {t('catalog.browser.showInactive')}
            </label>
            <span>{t('catalog.browser.count', { shown: visible.length, total: scoped.length })}</span>
          </div>

          {productsQuery.isLoading && <div className="space-y-2">{[0, 1, 2, 3].map((key) => <Skeleton key={key} className="h-16 w-full" />)}</div>}

          {!productsQuery.isLoading && productsQuery.error && (
            <EmptyState
              icon={<PackageSearch size={24} />}
              title={t('catalog.browser.loadFailed')}
              action={<Button type="button" variant="outline" onClick={() => productsQuery.refetch()}>{t('catalog.browser.retry')}</Button>}
            />
          )}

          {!productsQuery.isLoading && !productsQuery.error && visible.length === 0 && (
            <p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
              {products.length ? t('catalog.browser.noResults') : t('catalog.browser.empty')}
            </p>
          )}

          {!productsQuery.isLoading && !productsQuery.error && visible.length > 0 && (
            <ul className="space-y-1.5">
              {visible.map((product) => {
                const meta = [itemTypeNameOf(product, itemTypes), product.category?.name].filter(Boolean).join(' · ')
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(product)}
                      className="flex w-full min-w-0 items-center gap-3 rounded-lg border border-[var(--border)] p-2.5 text-start transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <Thumb src={product.image} />
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <span className="truncate text-sm font-bold text-[var(--text)]">{product.name || `#${product.id}`}</span>
                          <KindBadge kind={product.kind} />
                          {!product.status && <ActiveBadge active={false} />}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">{meta || t('catalog.browser.noType')}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-[var(--text)]" dir="ltr">{product.price === null ? '—' : formatNumber(product.price)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </AppDrawer>
  )
}
