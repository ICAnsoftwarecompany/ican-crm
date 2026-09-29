import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { formatDateInput } from '../../../../shared/utils/dateTime'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useScheduleMutations } from '../api/schedulesApi'
import { PAYMENT_METHODS, useMoney } from '../utils/money'

/**
 * Manual payment (payments_source = crm, spec §29.2). The server allocates it oldest line first,
 * late fee before principal; the dialog only suggests the next due amount.
 */
export function RecordPaymentDialog({ open, onClose, schedule, defaultAmount, payoff = false }) {
  const { t } = useTranslation()
  const money = useMoney(schedule.currency)
  const { action } = useScheduleMutations(schedule.id)
  const [form, setForm] = useState({})
  const errors = getServiceFieldErrors(action.error)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))

  useEffect(() => {
    if (open) {
      setForm({ amount: defaultAmount ?? (schedule.totals.overdue || schedule.next_due?.amount || ''), method: 'cash', paid_at: formatDateInput(new Date()), reference: '' })
      action.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    action.mutate(
      { id: schedule.id, action: 'payments', version: schedule.version, amount: Number(form.amount), method: form.method, paid_at: form.paid_at, reference: form.reference || undefined, payoff: payoff || undefined },
      {
        onSuccess: () => {
          toast.success(t('service.billing.done.payment'))
          onClose()
        },
      }
    )

  const AMOUNT_ERRORS = { exceeds_outstanding: t('service.billing.validation.exceeds', { amount: money(schedule.totals.outstanding) }), payoff_mismatch: t('service.billing.validation.payoffMismatch') }
  const amountError = errors.amount && (AMOUNT_ERRORS[errors.amount[0]] || t('service.billing.validation.amount'))
  return (
    <FormDialog open={open} onClose={onClose} title={t(payoff ? 'service.billing.actions.payQuote' : 'service.billing.actions.recordPayment')} description={payoff ? t('service.billing.payoffPaymentDescription') : t('service.billing.paymentDescription', { amount: money(schedule.totals.outstanding) })} submitText={t('service.billing.actions.recordPayment')} loading={action.isPending} submitDisabled={!(Number(form.amount) > 0)} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="number" dir="ltr" min="0" step="0.01" label={t('service.billing.columns.amount')} value={form.amount ?? ''} readOnly={payoff} onChange={(event) => set('amount')(event.target.value)} error={amountError} />
        <Select label={t('service.billing.fields.method')} value={form.method} onChange={(method) => set('method')(method || 'cash')} options={PAYMENT_METHODS.map((value) => ({ value, label: t(`service.billing.methods.${value}`) }))} error={errors.method && t('service.settings.validation.required')} />
        <Input type="date" dir="ltr" label={t('service.billing.fields.paidAt')} value={form.paid_at || ''} onChange={(event) => set('paid_at')(event.target.value)} />
        <Input dir="ltr" label={t('service.billing.fields.reference')} value={form.reference || ''} onChange={(event) => set('reference')(event.target.value)} />
      </div>
      {!payoff && <p className="text-xs text-[var(--text-muted)]">{t('service.billing.allocationNote')}</p>}
    </FormDialog>
  )
}
