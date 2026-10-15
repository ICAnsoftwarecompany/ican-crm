import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { useNumberFormat } from '../../../products'
import { relationPrice } from '../utils/interestForm'

/**
 * The item's attached items: `included` ones come with it (shown, nothing to choose), `optional` ones are offered
 * to the lead (add-ons / upsell) and count in the estimate when ticked.
 */
export function InterestRelationsField({ relations, selectedIds, onToggle, loading }) {
  const { t } = useTranslation()
  const formatNumber = useNumberFormat()
  if (loading) return <Skeleton className="h-14 w-full" />
  const included = relations.filter((relation) => relation.inclusion === 'included')
  const optional = relations.filter((relation) => relation.inclusion !== 'included')
  if (!relations.length) return null

  const name = (relation) => relation.childName || `#${relation.childProductId}`
  const quantity = (relation) => (relation.quantity > 1 ? ` ×${formatNumber(relation.quantity)}` : '')

  return (
    <div className="space-y-2">
      {included.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-[var(--text)]">{t('leads.interestDialog.relations.included')}</h4>
          <ul className="flex flex-wrap gap-1.5">
            {included.map((relation) => (
              <li key={relation.id} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--text)]">
                <CheckCircle2 size={13} className="text-[#10B981]" aria-hidden="true" />
                {name(relation)}{quantity(relation)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {optional.length > 0 && (
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-[var(--text)]">{t('leads.interestDialog.relations.optional')}</legend>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {optional.map((relation) => {
              const id = String(relation.childProductId)
              const price = relationPrice(relation)
              return (
                <li key={relation.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] p-2 text-sm text-[var(--text)]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 accent-[#00C2CB]"
                      checked={selectedIds.includes(id)}
                      onChange={() => onToggle(id)}
                    />
                    <span className="min-w-0 flex-1 truncate">{name(relation)}{quantity(relation)}</span>
                    <span className="shrink-0 text-xs font-bold" dir="ltr">
                      {price === null ? '—' : price === 0 ? t('leads.interestDialog.relations.free') : `+${formatNumber(price)}`}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
      )}
    </div>
  )
}
