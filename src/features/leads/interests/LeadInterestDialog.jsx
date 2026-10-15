import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { useLeadInterestForm } from './hooks/useLeadInterestForm'
import { LeadInterestFields } from './components/LeadInterestFields'

const leadIdOf = (customer) => customer?.lead_id || customer?.lead?.id
const customerName = (customer) => customer?.name || customer?.lead?.name || customer?.email || customer?.phone || ''

/**
 * Add / edit a lead interest on the new catalog (2026-10-15). Step 1 picks a product, service, plan or bundle;
 * step 2 asks only what that item's capabilities need (see utils/interestProfile.js) plus level and note.
 * Props: `{ open, customer, interest?, onClose, onSaved(response, payload) }` — or `customers` (array) to add the same
 * interest to several customers (Leads Center bulk action; customers without a lead are skipped).
 */
export function LeadInterestDialog({ open, customer, customers = null, interest = null, onClose, onSaved }) {
  const { t } = useTranslation()
  const targets = customers || (customer ? [customer] : [])
  const leadIds = targets.map(leadIdOf).filter(Boolean)
  const bulk = Boolean(customers)
  const state = useLeadInterestForm({ open, interest, leadIds })
  const { stage, product, saving, isEdit } = state

  const handleSubmit = async () => {
    if (!leadIds.length) {
      toast.error(t('leads.interestDialog.noLead'))
      return
    }
    try {
      const result = await state.submit()
      if (!result) return
      if (result.failed.length) {
        toast.warning(t('leads.interestDialog.bulkPartial', { saved: result.saved, failed: result.failed.length }))
      } else {
        toast.success(bulk ? t('leads.interestDialog.bulkAdded', { count: result.saved }) : isEdit ? t('leads.interestDialog.updated') : t('leads.interestDialog.added'))
      }
      if (result.saved) onSaved?.(result.response, result.payload)
      onClose?.()
    } catch (error) {
      toast.error(extractMessage(error, isEdit ? t('leads.interestDialog.updateFailed') : t('leads.interestDialog.addFailed')))
    }
  }

  const name = customerName(customer) || t('customers.table.theCustomer')
  const picking = stage === 'pick' || !product
  const description = bulk
    ? t('leads.interestDialog.bulkDescription', { count: leadIds.length })
    : t(picking ? 'leads.interestDialog.pickDescription' : 'leads.interestDialog.detailsDescription', { name })

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? t('leads.interestDialog.editTitle') : t('leads.interestDialog.addTitle')}
      description={description}
      onSubmit={handleSubmit}
      submitText={isEdit ? t('leads.interestDialog.save') : t('leads.interestDialog.submit')}
      loading={saving}
      submitDisabled={!leadIds.length || !product || picking}
      size="lg"
      className="max-w-3xl"
    >
      {bulk && targets.length > leadIds.length && (
        <p className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">
          {t('leads.interestDialog.skippedNoLead', { count: targets.length - leadIds.length })}
        </p>
      )}
      <LeadInterestFields state={state} disabled={saving} />
    </FormDialog>
  )
}
