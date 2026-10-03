import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Search } from 'lucide-react'
import { dealInputClass } from './FieldLabel'
import { ProductUnitBadge } from './ProductUnitBadge'

/** Searchable multi-select of catalog products (name / category), each with its unit badge. */
export function ProductPicker({ products = [], selectedIds = [], onToggle, excludeIds = [], isLoading = false }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const selected = useMemo(() => new Set(selectedIds.map(String)), [selectedIds])
  const rows = useMemo(() => {
    const excluded = new Set(excludeIds.map(String))
    const needle = query.trim().toLowerCase()
    return products
      .filter((product) => !excluded.has(String(product.id)))
      .filter((product) => !needle || `${product.name} ${product.categoryName || ''}`.toLowerCase().includes(needle))
  }, [excludeIds, products, query])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute start-3 top-3 text-[var(--text-muted)]" />
        <input className={`${dealInputClass} ps-8`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('dealWorkspace.products.search')} aria-label={t('dealWorkspace.products.search')} />
      </div>
      <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] p-1">
        {isLoading && <p className="p-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.common.loading')}</p>}
        {!isLoading && !rows.length && <p className="p-3 text-xs text-[var(--text-muted)]">{t('dealWorkspace.products.noCatalog')}</p>}
        {rows.map((product) => {
          const id = String(product.id)
          const checked = selected.has(id)
          return (
            <button key={id} type="button" onClick={() => onToggle(id)} aria-pressed={checked} className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-sm ${checked ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]'}`}>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[var(--text)]">{product.name || `#${id}`}</span>
                {product.categoryName && <span className="block text-xs text-[var(--text-muted)]">{product.categoryName}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <ProductUnitBadge product={product} />
                {checked && <Check size={16} className="text-[var(--brand-accent)]" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
