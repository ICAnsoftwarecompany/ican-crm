import { Eye, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { InterestCard } from '../../../../../features/leads'
import { KindCounts } from './KindCounts'

export function DetailsButton({ onClick }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-bold text-[#007A80] transition hover:bg-[var(--surface-2)]"
      title={t('customers.productsDialog.viewProductDetails')}
    >
      <Eye size={13} />
      {t('customers.productsDialog.details')}
    </button>
  )
}

/** Left panel: what the customer is interested in, on the shared interest card (2026-10-15). */
export function InterestedProductsPanel({ items = [], onOpenProductInfo }) {
  const { t } = useTranslation()

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[#007A80]">
            <Heart size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-sm font-bold text-[var(--text)]">{t('customers.productsDialog.interestedTitle')}</h3>
            <KindCounts items={items} />
          </div>
        </div>
        <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-bold text-[var(--text)]">{items.length}</span>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {items.length ? (
          items.map((item) => (
            <InterestCard key={item.view.key || item.product.id} view={item.view} actions={<DetailsButton onClick={() => onOpenProductInfo?.(item.product)} />} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-5 text-center text-sm font-bold text-[var(--text-muted)]">
            {t('customers.productsDialog.noInterestedProducts')}
          </div>
        )}
      </div>
    </section>
  )
}
