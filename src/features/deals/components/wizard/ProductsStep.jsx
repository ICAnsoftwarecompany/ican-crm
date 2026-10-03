import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { resolveDealProductMode } from '../../utils/dealProductMode'
import { DealProductModeCard } from '../common/DealProductModeCard'
import { ProductPicker } from '../common/ProductPicker'
import { ProductUnitBadge } from '../common/ProductUnitBadge'

/**
 * Step 3 — the products the deal works on. Their number and unit data decide how the workspace sells:
 * one piece, one product in several units, or several products (utils/dealProductMode).
 */
export function ProductsStep({ value, onChange }) {
  const { t } = useTranslation()
  const catalog = useCatalogProducts()
  const selected = useMemo(() => value.ids.map((id) => catalog.products.find((product) => product.id === String(id)) || { id: String(id), name: `#${id}` }), [catalog.products, value.ids])
  const mode = resolveDealProductMode(selected)
  const toggle = (id) => onChange({ ids: value.ids.includes(id) ? value.ids.filter((current) => current !== id) : [...value.ids, id] })

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ProductPicker products={catalog.products} selectedIds={value.ids} onToggle={toggle} isLoading={catalog.isLoading} />
      <div className="space-y-3">
        <DealProductModeCard mode={mode} products={selected} />
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <h3 className="mb-2 text-sm font-bold text-[var(--text)]">{t('dealWorkspace.wizard.products.selected', { count: selected.length })}</h3>
          {!selected.length && <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.products.none')}</p>}
          <ul className="space-y-1">
            {selected.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--surface-2)]">
                <span className="min-w-0 truncate text-sm text-[var(--text)]">{product.name}</span>
                <span className="flex items-center gap-2">
                  <ProductUnitBadge product={product} />
                  <button type="button" onClick={() => toggle(product.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:text-red-600" aria-label={t('dealWorkspace.products.remove')}><X size={14} /></button>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <p className="text-xs leading-5 text-[var(--text-muted)]">{t('dealWorkspace.wizard.products.unitNote')}</p>
      </div>
    </div>
  )
}
