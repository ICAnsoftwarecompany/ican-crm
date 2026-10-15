import { useTranslation } from 'react-i18next'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { CapabilityChips, KindBadge, useNumberFormat } from '../../../products'

/**
 * The chosen catalog item at the top of the details step: name, kind, item type, category, price, its
 * capabilities and what selling it means (warranty, billing cycle, installments, what the sale creates).
 */
export function SelectedProductCard({ product, itemType, profile, onChange, disabled }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const facts = []
  if (profile.warranty?.months) facts.push(t('leads.interestDialog.facts.warranty', { count: profile.warranty.months }))
  if (profile.recurrence) {
    facts.push(t('leads.interestDialog.facts.recurrence', {
      every: profile.recurrence.every,
      unit: t(`leads.interestDialog.cycle.${profile.recurrence.unit}`, { defaultValue: profile.recurrence.unit }),
    }))
  }
  if (profile.perPerson) facts.push(t('leads.interestDialog.facts.perPerson'))
  if (profile.installments) facts.push(t('leads.interestDialog.facts.installments'))
  if (profile.creates && profile.creates !== 'none') {
    facts.push(t('leads.interestDialog.facts.creates', { value: t(`catalog.options.creates.${profile.creates}`, { defaultValue: profile.creates }) }))
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-[var(--text)]">{product.name || `#${product.id}`}</h3>
            <KindBadge kind={product.kind} />
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {[itemType?.name || t('leads.interestDialog.picker.noType'), product.category?.name].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="shrink-0 text-end">
          <div className="text-base font-bold text-[var(--text)]" dir="ltr">{product.price === null ? '—' : formatNumber(product.price)}</div>
          {profile.recurrence && (
            <div className="text-xs text-[var(--text-muted)]">
              {t('leads.interestDialog.facts.perCycle', { unit: t(`leads.interestDialog.cycle.${profile.recurrence.unit}`, { defaultValue: profile.recurrence.unit }) })}
            </div>
          )}
        </div>
      </div>

      {itemType ? (
        <div className="mt-2"><CapabilityChips capabilities={itemType.capabilities} /></div>
      ) : (
        <p className="mt-2 text-xs text-[var(--text-muted)]">{t('leads.interestDialog.noTypeHint')}</p>
      )}

      {facts.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
          {facts.map((fact) => <li key={fact}>• {fact}</li>)}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onChange} disabled={disabled}>
          <RefreshCw size={14} />
          {t('leads.interestDialog.changeProduct')}
        </Button>
        <a
          href={`/products/${product.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#00A3AA] hover:underline"
        >
          <ExternalLink size={13} />
          {t('leads.interestDialog.openProduct')}
        </a>
      </div>
    </section>
  )
}
