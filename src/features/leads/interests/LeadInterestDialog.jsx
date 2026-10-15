import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { FormDialog } from '../../../shared/components/overlays/FormDialog'
import { Button } from '../../../shared/components/ui/Button'
import { cn } from '../../../shared/utils/cn'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { useLeadInterestForm } from './hooks/useLeadInterestForm'
import { INTEREST_LEVELS } from './utils/interestForm'
import { InterestProductPicker } from './components/InterestProductPicker'
import { SelectedProductCard } from './components/SelectedProductCard'
import { InterestDetailsFields } from './components/InterestDetailsFields'
import { InterestRelationsField } from './components/InterestRelationsField'
import { InterestEstimate } from './components/InterestEstimate'

const leadIdOf = (customer) => customer?.lead_id || customer?.lead?.id
const customerName = (customer) => customer?.name || customer?.lead?.name || customer?.email || customer?.phone || ''

/**
 * Add / edit a lead interest on the new catalog (2026-10-15). Step 1 picks a product, service, plan or bundle;
 * step 2 asks only what that item's capabilities need (see utils/interestProfile.js) plus level and note.
 * Props match the old `InterestFormDialog`: `{ open, customer, interest?, onClose, onSaved(response, payload) }`.
 */
export function LeadInterestDialog({ open, customer, interest = null, onClose, onSaved }) {
  const { t } = useTranslation()
  const noteId = useId()
  const leadId = leadIdOf(customer)
  const state = useLeadInterestForm({ open, interest, leadId })
  const { form, stage, product, profile, saving, isEdit } = state

  const handleSubmit = async () => {
    if (!leadId) {
      toast.error(t('leads.interestDialog.noLead'))
      return
    }
    try {
      const result = await state.submit()
      if (!result) return
      toast.success(isEdit ? t('leads.interestDialog.updated') : t('leads.interestDialog.added'))
      onSaved?.(result.response, result.payload)
      onClose?.()
    } catch (error) {
      toast.error(extractMessage(error, isEdit ? t('leads.interestDialog.updateFailed') : t('leads.interestDialog.addFailed')))
    }
  }

  const name = customerName(customer) || t('customers.table.theCustomer')
  const picking = stage === 'pick' || !product

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? t('leads.interestDialog.editTitle') : t('leads.interestDialog.addTitle')}
      description={picking
        ? t('leads.interestDialog.pickDescription', { name })
        : t('leads.interestDialog.detailsDescription', { name })}
      onSubmit={handleSubmit}
      submitText={isEdit ? t('leads.interestDialog.save') : t('leads.interestDialog.submit')}
      loading={saving}
      submitDisabled={!leadId || !product || picking}
      size="lg"
      className="max-w-3xl"
    >
      {picking ? (
        <>
          <InterestProductPicker catalog={state.catalog} selectedId={form.productId} onChoose={state.chooseProduct} />
          {state.errors.productId && <p role="alert" className="text-xs text-[#EF4444]">{t('leads.interestDialog.errors.chooseProduct')}</p>}
          {product && (
            <Button type="button" variant="outline" size="sm" onClick={() => state.setStage('details')}>
              <ArrowRight size={14} className="rtl:rotate-180" />
              {t('leads.interestDialog.backToDetails')}
            </Button>
          )}
        </>
      ) : (
        <>
          <SelectedProductCard
            product={product}
            itemType={state.itemType}
            profile={profile}
            onChange={() => state.setStage('pick')}
            disabled={saving}
          />
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
        </>
      )}
    </FormDialog>
  )
}
