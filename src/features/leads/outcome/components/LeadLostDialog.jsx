import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { cn } from '../../../../shared/utils/cn'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useLostReasons } from '../../../definitions'
import { useLeadOutcome } from '../hooks/useLeadOutcome'
import { buildLostPayload, leadIdOf, leadNameOf } from '../utils/leadOutcome'

const textareaClass = 'w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[#00C2CB]'

/**
 * Mark one or several leads as lost (2026-10-15): reason from the tenant's lost reasons (Definitions → the "lost"
 * status), note; `POST /leads/{id}/lost` per lead. With reasons defined, one is required; without any, the dialog
 * says where to define them and lets the user continue with a note.
 */
export function LeadLostDialog({ open, customers = [], onClose, onDone }) {
  const { t } = useTranslation()
  const reasonsQuery = useLostReasons({ activeOnly: true, enabled: open })
  const { markLost } = useLeadOutcome()
  const [reasonId, setReasonId] = useState('')
  const [note, setNote] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const reasons = reasonsQuery.data || []
  const leads = customers.map((row) => ({ row, leadId: leadIdOf(row) })).filter((item) => item.leadId !== null)
  const bulk = customers.length > 1
  const reasonMissing = reasons.length > 0 && !reasonId

  useEffect(() => {
    if (!open) return
    setReasonId('')
    setNote('')
    setShowErrors(false)
  }, [open])

  const submit = async () => {
    if (reasonMissing) {
      setShowErrors(true)
      return
    }
    setSaving(true)
    const payload = buildLostPayload({ reasonId, note })
    const failed = []
    let lastError = null
    for (const { leadId } of leads) {
      try {
        await markLost.mutateAsync({ leadId, payload })
      } catch (error) {
        failed.push(leadId)
        lastError = error
      }
    }
    setSaving(false)
    const saved = leads.length - failed.length
    if (!saved) {
      toast.error(extractMessage(lastError, t('customers.leadOutcome.lost.failed')))
      return
    }
    if (failed.length) toast.warning(t('customers.leadOutcome.lost.partial', { saved, failed: failed.length }))
    else toast.success(bulk ? t('customers.leadOutcome.lost.bulkSuccess', { count: saved }) : t('customers.leadOutcome.lost.success'))
    onDone?.()
    onClose?.()
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={saving}
      submitDisabled={!leads.length || reasonsQuery.isLoading}
      title={t('customers.leadOutcome.lost.title')}
      description={bulk ? t('customers.leadOutcome.lost.bulkDescription', { count: leads.length }) : t('customers.leadOutcome.lost.description', { name: leadNameOf(customers[0]) })}
      submitText={t('customers.leadOutcome.lost.submit')}
    >
      {customers.length > leads.length && (
        <p className="rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">{t('customers.leadOutcome.skippedNoLead', { count: customers.length - leads.length })}</p>
      )}

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">
          {t('customers.leadOutcome.lost.reason')}{reasons.length > 0 && <span className="text-[#EF4444]"> *</span>}
        </legend>
        {reasonsQuery.isLoading && <Skeleton className="h-9 w-full" />}
        {reasonsQuery.error && <p role="alert" className="text-xs text-[#EF4444]">{t('customers.lostReasons.loadFailed')}</p>}
        {!reasonsQuery.isLoading && !reasonsQuery.error && reasons.length === 0 && (
          <p className="rounded-lg border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-muted)]">
            {t('customers.leadOutcome.lost.noReasons')}{' '}
            <a href="/LeadsCenter/customization" target="_blank" rel="noreferrer" className="font-bold text-[#00A3AA] hover:underline">{t('customers.leadOutcome.lost.defineReasons')}</a>
          </p>
        )}
        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5" role="radiogroup">
            {reasons.map((reason) => {
              const active = String(reason.id) === reasonId
              return (
                <button
                  key={reason.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={reason.description !== reason.name ? reason.description : undefined}
                  onClick={() => setReasonId(String(reason.id))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    active ? 'border-[#EF4444] bg-red-50 font-bold text-red-700 dark:bg-red-950/40 dark:text-red-200' : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]'
                  )}
                >
                  {reason.name}
                </button>
              )
            })}
          </div>
        )}
        {showErrors && reasonMissing && <p role="alert" className="mt-1 text-xs text-[#EF4444]">{t('customers.leadOutcome.lost.reasonRequired')}</p>}
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[var(--text)]">{t('customers.leadOutcome.note')}</span>
        <textarea rows={3} className={textareaClass} value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('customers.leadOutcome.lost.notePlaceholder')} />
      </label>
    </FormDialog>
  )
}
