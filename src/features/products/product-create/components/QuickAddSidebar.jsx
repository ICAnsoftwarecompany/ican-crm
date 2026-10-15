import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ListChecks } from 'lucide-react'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { cn } from '../../../../shared/utils/cn'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useNumberFormat } from '../../components/common/catalogUi'

/**
 * Side panel of quick add (2026-10-15): what was added in this session (newest first), or — with the toggle — every
 * product / service of this kind from `/product/data`. Each row opens the item's page.
 */
export function QuickAddSidebar({ kind, added = [], categories = [] }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const [showAll, setShowAll] = useState(false)
  const allQuery = useCatalogProducts()
  const categoryName = useMemo(() => new Map(categories.map((category) => [String(category.id), category._pathLabel || category.name])), [categories])
  const entity = kind

  const rows = showAll
    ? (allQuery.data || []).filter((item) => item.kind === kind)
      .map((item) => ({ key: String(item.id), id: item.id, name: item.name, price: item.price, category: categoryName.get(String(item.categoryId)) || item.category?.name }))
    : added.map((item) => ({ ...item, category: categoryName.get(String(item.categoryId)) }))

  const tabClass = (active) => cn(
    'flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
    active ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
  )

  return (
    <aside className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 lg:sticky lg:top-4" aria-label={t('productSetup.quickAdd.sidebarLabel')}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <ListChecks size={16} aria-hidden="true" />
        {t(`productSetup.quickAdd.sidebarTitle.${entity}`)}
      </h2>
      <div className="flex gap-1 rounded-lg bg-[var(--surface-2)] p-1" role="tablist">
        <button type="button" role="tab" aria-selected={!showAll} className={tabClass(!showAll)} onClick={() => setShowAll(false)}>
          {t('productSetup.quickAdd.thisSession', { count: added.length })}
        </button>
        <button type="button" role="tab" aria-selected={showAll} className={tabClass(showAll)} onClick={() => setShowAll(true)}>
          {t(`productSetup.quickAdd.showAll.${entity}`)}
        </button>
      </div>

      {showAll && allQuery.isLoading && <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
      {showAll && allQuery.isError && <p className="text-sm text-[#EF4444]">{t('productSetup.quickAdd.loadFailed')}</p>}
      {!rows.length && !(showAll && (allQuery.isLoading || allQuery.isError)) && (
        <p className="text-sm text-[var(--text-muted)]">{t(showAll ? `productSetup.quickAdd.noneAll.${entity}` : 'productSetup.quickAdd.noneYet')}</p>
      )}
      {rows.length > 0 && (
        <ul className="max-h-[60vh] divide-y divide-[var(--border)] overflow-y-auto">
          {rows.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="min-w-0">
                {item.id ? (
                  <Link to={`/products/${item.id}`} className="block truncate font-medium text-[var(--text)] hover:text-[var(--brand-accent)]">{item.name}</Link>
                ) : <span className="block truncate font-medium text-[var(--text)]">{item.name}</span>}
                {item.category && <span className="block truncate text-xs text-[var(--text-muted)]">{item.category}</span>}
              </span>
              <span className="shrink-0 text-xs text-[var(--text-muted)]" dir="ltr">{formatNumber(item.price)}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
