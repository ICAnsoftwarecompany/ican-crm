import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { SlotPicker } from '../../scheduling/components/SlotPicker'
import { useWorkOrderMutations } from '../api/workOrdersApi'

const COMPLETION = ['completed', 'partial', 'failed', 'rescheduled']
const FAILURES = ['part_unavailable', 'customer_absent', 'access_denied', 'needs_second_visit', 'other']

/** Assign a technician + slot; the server books it (409 when someone took it first → pick again). */
export function ScheduleWorkOrderDialog({ open, onClose, workOrder }) {
  const { t } = useTranslation()
  const { schedule } = useWorkOrderMutations(workOrder.id)
  const [slot, setSlot] = useState(null)
  useEffect(() => {
    if (open) {
      setSlot(null)
      schedule.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const submit = () =>
    schedule.mutate({ id: workOrder.id, version: workOrder.version, resource_id: slot.resource_id, scheduled_start: slot.starts_at, scheduled_end: slot.ends_at }, {
      onSuccess: () => {
        toast.success(t('service.workOrders.done.scheduled'))
        onClose()
      },
    })
  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-3xl" title={t(workOrder.status === 'scheduled' ? 'service.workOrders.actions.reschedule' : 'service.workOrders.actions.schedule')} description={t('service.workOrders.scheduleDescription')} submitText={t('service.workOrders.actions.book')} loading={schedule.isPending} submitDisabled={!slot} onSubmit={submit}>
      <SlotPicker value={slot} onChange={setSlot} resourceType="technician" defaultDuration={workOrder.duration_minutes || 60} />
    </FormDialog>
  )
}

/** Finish the visit: outcome, notes, parts, labor, customer signature. Completing consumes the entitlement (server). */
export function CompleteWorkOrderDialog({ open, onClose, workOrder }) {
  const { t } = useTranslation()
  const { action } = useWorkOrderMutations(workOrder.id)
  const [form, setForm] = useState({})
  const errors = getServiceFieldErrors(action.error)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))

  useEffect(() => {
    if (open) {
      setForm({ completion_status: 'completed', work_notes: workOrder.work_notes || '', labor_minutes: workOrder.labor_minutes || '', signature_name: workOrder.customer?.name || '', failure_reason: '', parts: workOrder.parts?.length ? workOrder.parts : [] })
      action.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const needsReason = form.completion_status !== 'completed'
  const submit = () =>
    action.mutate(
      { id: workOrder.id, action: 'complete', version: workOrder.version, completion_status: form.completion_status, work_notes: form.work_notes || null, labor_minutes: Number(form.labor_minutes) || null, signature_name: form.signature_name || null, failure_reason: needsReason ? form.failure_reason : null, parts: form.parts.filter((part) => part.name?.trim()) },
      {
        onSuccess: (result) => {
          toast.success(t(`service.workOrders.done.${form.completion_status}`))
          if (result?.entitlement_result?.warning) toast.warning(t('service.workOrders.entitlementNotAvailable'))
          onClose()
        },
      }
    )
  const updatePart = (index, patch) => set('parts')(form.parts.map((part, current) => (current === index ? { ...part, ...patch } : part)))

  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-2xl" title={t('service.workOrders.actions.complete')} description={workOrder.entitlement ? t('service.workOrders.completeConsumes') : undefined} submitText={t('service.workOrders.actions.complete')} loading={action.isPending} submitDisabled={needsReason && !form.failure_reason} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label={t('service.workOrders.fields.outcome')} value={form.completion_status} onChange={(value) => set('completion_status')(value || 'completed')} options={COMPLETION.map((value) => ({ value, label: t(`service.workOrders.completion.${value}`) }))} />
        {needsReason && <Select label={t('service.workOrders.fields.failureReason')} value={form.failure_reason} onChange={set('failure_reason')} error={errors.failure_reason && t('service.settings.validation.required')} options={FAILURES.map((value) => ({ value, label: t(`service.workOrders.failures.${value}`) }))} />}
      </div>
      <Input label={t('service.workOrders.fields.workNotes')} dir="auto" value={form.work_notes || ''} onChange={(event) => set('work_notes')(event.target.value)} />
      <div className="grid gap-2">
        <p className="text-sm font-medium text-[var(--text)]">{t('service.workOrders.fields.parts')}</p>
        {(form.parts || []).map((part, index) => (
          <div key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_auto] gap-2">
            <Input dir="auto" aria-label={t('service.workOrders.fields.partName')} placeholder={t('service.workOrders.fields.partName')} value={part.name} onChange={(event) => updatePart(index, { name: event.target.value })} />
            <Input type="number" dir="ltr" min="1" aria-label={t('service.workOrders.fields.quantity')} value={part.quantity} onChange={(event) => updatePart(index, { quantity: Number(event.target.value) || 1 })} />
            <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => set('parts')(form.parts.filter((_, current) => current !== index))}><Trash2 size={15} aria-hidden="true" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => set('parts')([...(form.parts || []), { name: '', quantity: 1 }])}><Plus size={14} aria-hidden="true" />{t('service.workOrders.addPart')}</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="number" dir="ltr" min="0" label={t('service.workOrders.fields.labor')} value={form.labor_minutes ?? ''} onChange={(event) => set('labor_minutes')(event.target.value)} />
        <Input dir="auto" label={t('service.workOrders.fields.signature')} value={form.signature_name || ''} onChange={(event) => set('signature_name')(event.target.value)} />
      </div>
    </FormDialog>
  )
}
