import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useReservationMutations } from '../api/schedulingApi'
import { SlotPicker } from './SlotPicker'

const HOLD_HOURS = [2, 24, 72, 168]

/** Manual reservation: pick a slot, then hold it for a while or confirm it now (spec §19.3). */
export function NewReservationDialog({ open, onClose, timeZone }) {
  const { t } = useTranslation()
  const { reserve } = useReservationMutations()
  const [slot, setSlot] = useState(null)
  const [form, setForm] = useState({ status: 'hold', hold_hours: 24, note: '' })

  useEffect(() => {
    if (open) {
      setSlot(null)
      setForm({ status: 'hold', hold_hours: 24, note: '' })
      reserve.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    reserve.mutate({ resource_id: slot.resource_id, starts_at: slot.starts_at, ends_at: slot.ends_at, status: form.status, hold_minutes: form.status === 'hold' ? form.hold_hours * 60 : undefined, note: form.note || undefined }, {
      onSuccess: () => {
        toast.success(t(form.status === 'hold' ? 'service.scheduling.done.held' : 'service.scheduling.done.confirmed'))
        onClose()
      },
    })

  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-3xl" title={t('service.scheduling.newReservation')} description={t('service.scheduling.newReservationDescription')} submitText={t(form.status === 'hold' ? 'service.scheduling.actions.hold' : 'service.scheduling.actions.book')} loading={reserve.isPending} submitDisabled={!slot} onSubmit={submit}>
      <SlotPicker value={slot} onChange={setSlot} timeZone={timeZone} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label={t('service.scheduling.fields.status')} value={form.status} onChange={(status) => setForm((current) => ({ ...current, status: status || 'hold' }))} options={['hold', 'confirmed'].map((value) => ({ value, label: t(`service.scheduling.statuses.${value}`) }))} />
        {form.status === 'hold' && <Select label={t('service.scheduling.fields.holdFor')} value={String(form.hold_hours)} onChange={(hours) => setForm((current) => ({ ...current, hold_hours: Number(hours) || 24 }))} options={HOLD_HOURS.map((hours) => ({ value: String(hours), label: t('service.scheduling.hours', { count: hours }) }))} />}
        <Input label={t('service.scheduling.fields.note')} dir="auto" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
      </div>
    </FormDialog>
  )
}
