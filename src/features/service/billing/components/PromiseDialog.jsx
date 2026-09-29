import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { formatDateInput } from '../../../../shared/utils/dateTime'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useScheduleMutations } from '../api/schedulesApi'

/** Promise to pay (collections, spec §29.13). The server marks it kept or broken from later payments. */
export function PromiseDialog({ open, onClose, schedule }) {
  const { t } = useTranslation()
  const { action } = useScheduleMutations(schedule.id)
  const [form, setForm] = useState({})
  const errors = getServiceFieldErrors(action.error)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))

  useEffect(() => {
    if (open) {
      setForm({ amount: schedule.totals.overdue || schedule.next_due?.amount || '', promised_date: formatDateInput(new Date()), note: '' })
      action.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    action.mutate({ id: schedule.id, action: 'promises', version: schedule.version, amount: Number(form.amount), promised_date: form.promised_date, note: form.note || undefined }, {
      onSuccess: () => {
        toast.success(t('service.billing.done.promise'))
        onClose()
      },
    })

  return (
    <FormDialog open={open} onClose={onClose} title={t('service.billing.actions.addPromise')} submitText={t('service.billing.actions.addPromise')} loading={action.isPending} submitDisabled={!(Number(form.amount) > 0)} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="number" dir="ltr" min="0" label={t('service.billing.columns.amount')} value={form.amount ?? ''} onChange={(event) => set('amount')(event.target.value)} error={errors.amount && t('service.billing.validation.amount')} />
        <Input type="date" dir="ltr" label={t('service.billing.fields.promisedDate')} value={form.promised_date || ''} onChange={(event) => set('promised_date')(event.target.value)} error={errors.promised_date && t('service.billing.validation.futureDate')} />
      </div>
      <Input label={t('service.billing.fields.note')} dir="auto" value={form.note || ''} onChange={(event) => set('note')(event.target.value)} />
    </FormDialog>
  )
}
