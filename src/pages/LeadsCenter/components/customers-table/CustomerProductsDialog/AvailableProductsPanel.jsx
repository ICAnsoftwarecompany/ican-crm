import { useMemo, useState } from 'react'
import { PackageSearch, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InterestCard } from '../../../../../features/leads'
import { cn } from '../../../../../shared/utils/cn'
import { DetailsButton } from './InterestedProductsPanel'
import { KindCounts } from './KindCounts'
import { DIALOG_KINDS, categoryOptions, countKinds, filterDialogItems } from './productsDialogItems'

/**
 * Right panel: catalog items the customer is not interested in yet. Since 2026-10-15 the tabs follow the catalog
 * kinds (products / services / plans / bundles) and each item shows its item type, category, price and capabilities.
 */
export function AvailableProductsPanel({ items = [], isLoading = false, isError = false, onRetry, onOpenProductInfo }) {
  const { t } = useTranslation()
  const [kind, setKind] = useState('all')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  const counts = useMemo(() => countKinds(items), [items])
  const categories = useMemo(() => categoryOptions(items), [items])
  const visible = useMemo(() => filterDialogItems(items, { kind, category, search }), [category, items, kind, search])
  const kindTabs = ['all', ...DIALOG_KINDS.filter((value) => counts[value] > 0)]

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <header className="shrink-0 border-b border-[var(--border)] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
              <PackageSearch size={16} />
            </span>
            <div className="min-w-0">
              <h3 className="break-words text-sm font-bold text-[var(--text)]">{t('customers.productsDialog.notInterestedTitle')}</h3>
              <KindCounts items={items} />
            </div>
          </div>
          <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-bold text-[var(--text)]">{visible.length} / {items.length}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="relative min-w-[12rem] flex-1">
            <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('customers.productsDialog.searchPlaceholder')}
              aria-label={t('customers.productsDialog.searchPlaceholder')}
              className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-9 pe-3 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[#00C2CB]"
            />
          </label>

          <div className="flex min-w-0 flex-wrap rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1" role="tablist">
            {kindTabs.map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={kind === value}
                onClick={() => setKind(value)}
                className={cn(
                  'h-7 rounded-md px-2.5 text-xs font-bold transition',
                  kind === value ? 'bg-[var(--surface)] text-[#007A80] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                {t(`leads.interestDialog.kinds.${value}`)}
              </button>
            ))}
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label={t('customers.productsDialog.allCategories')}
            className="h-9 min-w-40 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[#00C2CB]"
          >
            <option value="">{t('customers.productsDialog.allCategories')}</option>
            {categories.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {isLoading && (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-sm font-bold text-[var(--text-muted)]">
            {t('customers.productsDialog.loadingProducts')}
          </div>
        )}

        {isError && (
          <div className="space-y-3 rounded-xl border border-red-100 bg-red-50 p-5 text-center text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <div>{t('customers.productsDialog.loadProductsError')}</div>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 dark:text-red-200"
            >
              <RefreshCw size={13} />
              {t('customers.productsDialog.retry')}
            </button>
          </div>
        )}

        {!isLoading && !isError && visible.map((item) => (
          <InterestCard key={item.view.key || item.product.id} view={item.view} actions={<DetailsButton onClick={() => onOpenProductInfo?.(item.product)} />} />
        ))}

        {!isLoading && !isError && !visible.length && (
          <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-sm font-bold text-[var(--text-muted)]">
            {t('customers.productsDialog.noMatchingProducts')}
          </div>
        )}
      </div>
    </section>
  )
}
