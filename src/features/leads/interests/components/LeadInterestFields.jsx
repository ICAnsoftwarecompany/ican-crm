import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { INTEREST_LEVELS } from '../utils/interestForm'
import { InterestProductPicker } from './InterestProductPicker'
import { SelectedProductCard } from './SelectedProductCard'
import { InterestDetailsFields } from './InterestDetailsFields'
import { InterestRelationsField } from './InterestRelationsField'
import { InterestEstimate } from './InterestEstimate'

/**
 * The interest form without its dialog (2026-10-15): pick a catalog item, then the fields its capabilities need,
 * level, note and expected value. Used by `LeadInterestDialog` and embedded in the Leads Center follow-up dialog.
 * `state` = `useLeadInterestForm(...)`.
 */
export function LeadInterestFields({ state, disabled = false }) {
  const { t } = useTranslation()
  const noteId = useId()
  const { form, stage, product, profile } = state

  if (stage === 'pick' || !product) {
    return (
      <div className="space-y-3">
        <InterestProductPicker catalog={state.catalog} selectedId={form.productId} onChoose={state.chooseProduct} />
        {state.errors.productId && <p role="alert" className="text-xs text-[#EF4444]">{t('leads.interestDialog.errors.chooseProduct')}</p>}
        {product && (
          <Button type="button" variant="outline" size="sm" onClick={() => state.setStage('details')}>
            <ArrowRight size={14} className="rtl:rotate-180" />
            {t('leads.interestDialog.backToDetails')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SelectedProductCard product={product} itemType={state.itemType} profile={profile} onChange={() => state.setStage('pick')} disabled={disabled} />
      <InterestDetailsFields state={state} />
      <InterestRelationsField
        relations={state.relations}
        selectedIds={form.optionalIds}
        onToggle={(id) => state.toggleIn('optionalIds', id)}
        loading={state.resources.relationsLoading}
      />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{t('leads.interestDialog.fields.level')}</legend>
        <div className="inline-flex rounded-lg border border-[var(--border)] p-0.5" role="radiogroup">
          {INTEREST_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={form.level === level}
              onClick={() => state.update({ level })}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-bold transition-colors',
                form.level === level ? 'bg-[#00C2CB] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              {t(`activities.priority.${level}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={noteId} className="text-sm font-medium text-[var(--text)]">{t('leads.interestDialog.fields.note')}</label>
        <textarea
          id={noteId}
          rows={3}
          value={form.note}
          onChange={(event) => state.update({ note: event.target.value })}
          placeholder={t('leads.interestDialog.fields.notePlaceholder')}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
        />
      </div>

      <InterestEstimate estimate={state.estimate} profile={profile} />
    </div>
  )
}
