import { useTranslation } from 'react-i18next'
import { CalendarDays, StickyNote } from 'lucide-react'
import { Badge } from '../../../../shared/components/ui/Badge'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { CapabilityChips, KindBadge, ProductImage, useNumberFormat } from '../../../products'

const LEVEL_VARIANTS = { high: 'danger', medium: 'warning', low: 'success' }

/** Interest level as a word ("High"), not a letter. */
export function InterestLevelBadge({ level }) {
  const { t } = useTranslation()
  if (!level) return null
  return <Badge variant={LEVEL_VARIANTS[level] || 'default'}>{t(`leads.interestView.levels.${level}`)}</Badge>
}

/** `{ amount, suffix }`: "9,000,000", "800" + "/ month", "5,000" + "per person"; `null` without a price. */
export function useInterestPrice() {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  return (view) => {
    if (view.price === null || view.price === undefined) return null
    const amount = formatNumber(view.price)
    if (view.cycleUnit) return { amount, suffix: t('leads.interestDialog.facts.perCycle', { unit: t(`leads.interestDialog.cycle.${view.cycleUnit}`, { defaultValue: view.cycleUnit }) }) }
    if (view.perPerson) return { amount, suffix: t('leads.interestView.perPerson') }
    return { amount, suffix: '' }
  }
}

/** The number stays LTR; the suffix follows the page direction. */
function Price({ price, className }) {
  if (!price) return null
  return (
    <span className={cn('shrink-0 font-bold text-[var(--text)]', className)}>
      <bdi dir="ltr">{price.amount}</bdi>
      {price.suffix && <span className="ms-1 text-[10px] font-normal text-[var(--text-muted)]">{price.suffix}</span>}
    </span>
  )
}

function FactsList({ view, limit }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  const facts = view.facts.map((fact) => t(`leads.interestDialog.chips.${fact.key}`, {
    ...fact.params,
    value: typeof fact.params.value === 'number' ? formatNumber(fact.params.value) : fact.params.value,
  }))
  if (view.estimatedValue !== null) facts.push(t('leads.interestDialog.chips.value', { value: formatNumber(view.estimatedValue) }))
  const shown = limit ? facts.slice(0, limit) : facts
  if (!shown.length) return null
  return (
    <ul className="flex flex-wrap gap-1">
      {shown.map((fact) => (
        <li key={fact} className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">{fact}</li>
      ))}
    </ul>
  )
}

/**
 * A lead interest (or a catalog item) as the new catalog describes it: name, kind, item type · category, price
 * (per cycle / per person), level, deal / lost, note, interest details, capabilities.
 * `variant`: `full` (drawer tab, products dialog) | `compact` (table cell, timeline).
 * `actions`: buttons rendered at the end (full) or next to the name (compact).
 */
export function InterestCard({ view, variant = 'full', actions = null, showCapabilities = true, className }) {
  const { t, i18n } = useTranslation()
  const priceOf = useInterestPrice()
  const price = priceOf(view)
  const name = view.name || t('leads.interestView.productNumber', { id: view.productId || '—' })
  const meta = [view.itemTypeName, view.categoryName].filter(Boolean).join(' · ')
  const compact = variant === 'compact'

  const header = (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className={cn('min-w-0 break-words font-bold text-[var(--text)]', compact ? 'text-xs' : 'text-sm')}>{name}</span>
      {view.kind && <KindBadge kind={view.kind} />}
      {view.isMain && <Badge variant="success">{t('leads.interestView.main')}</Badge>}
      {view.isDeal && <Badge variant="success">{t('leads.interestView.deal')}</Badge>}
      {view.isLost && <Badge variant="danger">{t('leads.interestView.lost')}</Badge>}
    </div>
  )

  if (compact) {
    return (
      <div className={cn('min-w-0 space-y-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2', className)}>
        <div className="flex min-w-0 items-start gap-2">
          <div className="min-w-0 flex-1">{header}</div>
          <Price price={price} className="text-xs" />
          {actions}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {meta && <span className="min-w-0 truncate text-[10px] text-[var(--text-muted)]">{meta}</span>}
          <InterestLevelBadge level={view.level} />
        </div>
        {view.note && <p className="line-clamp-2 break-words text-[11px] text-[var(--text-muted)]">{view.note}</p>}
        <FactsList view={view} limit={3} />
      </div>
    )
  }

  return (
    <article className={cn('min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3', className)}>
      <div className="flex min-w-0 gap-3">
        <ProductImage src={view.image} name={name} size="lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0 flex-1">
              {header}
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {meta || (view.inCatalog ? t('leads.interestView.noType') : t('leads.interestView.notInCatalog'))}
              </p>
            </div>
            <Price price={price} className="text-sm" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <InterestLevelBadge level={view.level} />
            {view.sourceKind && <Badge>{t(`leads.interestView.sources.${view.sourceKind}`, { defaultValue: view.sourceKind })}</Badge>}
            {view.createdAt && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                <CalendarDays size={12} aria-hidden="true" />
                {formatDate(view.createdAt, i18n.language, { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            )}
          </div>

          {view.note && (
            <p className="flex min-w-0 items-start gap-1.5 rounded-lg bg-[var(--surface-2)] px-2 py-1.5 text-xs text-[var(--text)]">
              <StickyNote size={13} className="mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="min-w-0 break-words">{view.note}</span>
            </p>
          )}
          <FactsList view={view} />
          {showCapabilities && view.capabilities.length > 0 && <CapabilityChips capabilities={view.capabilities} />}
        </div>
      </div>
      {actions && <div className="mt-3 flex flex-wrap justify-end gap-1.5">{actions}</div>}
    </article>
  )
}
