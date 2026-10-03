import { useTranslation } from 'react-i18next'
import { Boxes, Car, Home, Layers } from 'lucide-react'
import { getProductUnits } from '../../utils/dealProductMode'

const ICONS = { open: Layers, single_unit: Home, single_product: Car, multi_product: Boxes }

/** Explains how the deal works for its products (one piece / one product in units / several products / open). */
export function DealProductModeCard({ mode, products = [], compact = false }) {
  const { t } = useTranslation()
  const Icon = ICONS[mode] || Layers
  const product = products[0]
  const units = product ? getProductUnits(product) : null
  return (
    <section className={`flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] ${compact ? 'p-3' : 'p-4'}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"><Icon size={17} /></span>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-bold text-[var(--text)]">
          {t(`dealWorkspace.productMode.deal.${mode}.title`)}
          {(mode === 'single_unit' || mode === 'single_product') && product?.name ? ` · ${product.name}` : ''}
          {mode === 'multi_product' ? ` · ${t('dealWorkspace.productMode.productsCount', { count: products.length })}` : ''}
        </p>
        {!compact && <p className="text-xs leading-5 text-[var(--text-muted)]">{t(`dealWorkspace.productMode.deal.${mode}.description`)}</p>}
        {mode === 'single_product' && units !== null && <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.productMode.availableUnits', { count: units })}</p>}
      </div>
    </section>
  )
}
