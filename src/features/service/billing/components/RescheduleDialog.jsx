import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { formatDateInput } from '../../../../shared/utils/dateTime'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useScheduleMutations } from '../api/schedulesApi'

const PERIODS = { m1: '1 month', m2: '2 month', m3: '3 month', m6: '6 month' }

/** Request a reschedule (spec §29.11): the server builds the new lines and holds them until approved. */
export function RescheduleDialog({ open, onClose, schedule }) {
  const { t } = useTranslation()
  const { action } = useScheduleMutations(schedule.id)
  const [form, setForm] = useState({})
  const errors = getServiceFieldErrors(action.error)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))
  const required = (name) => errors[name] && t('service.settings.validation.required')

  useEffect(() => {
    if (open) {
      const next = new Date()
      next.setMonth(next.getMonth() + 1)
      setForm({ count: 6, every: '1 month', first_due: formatDateInput(next), reason: '' })
      action.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    action.mutate(
      { id: schedule.id, action: 'reschedule', version: schedule.version, count: Number(form.count), every: form.every, first_due: form.first_due, reason: form.reason },
      {
        onSuccess: () => {
          toast.success(t('service.billing.done.rescheduleRequested'))
          onClose()
        },
      }
    )

  return (
    <FormDialog open={open} onClose={onClose} title={t('service.billing.actions.reschedule')} description={t('service.billing.rescheduleDescription')} submitText={t('service.billing.actions.requestApproval')} loading={action.isPending} submitDisabled={!form.reason?.trim()} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input type="number" dir="ltr" min="1" max="120" label={t('service.billing.fields.count')} value={form.count ?? ''} onChange={(event) => set('count')(event.target.value)} error={required('count')} />
        <Select label={t('service.billing.fields.every')} value={form.every} onChange={(every) => set('every')(every || '1 month')} options={Object.entries(PERIODS).map(([key, value]) => ({ value, label: t(`service.billing.everyPeriods.${key}`) }))} />
        <Input type="date" dir="ltr" label={t('service.billing.fields.firstDue')} value={form.first_due || ''} onChange={(event) => set('first_due')(event.target.value)} error={required('first_due')} />
      </div>
      <Input label={t('service.billing.reason')} dir="auto" value={form.reason || ''} onChange={(event) => set('reason')(event.target.value)} error={required('reason')} />
    </FormDialog>
  )
}
