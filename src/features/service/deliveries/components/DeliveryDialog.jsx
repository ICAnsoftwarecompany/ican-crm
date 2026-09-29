import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useMoney } from '../../billing/utils/money'
import { useDeliveryMutations } from '../api/deliveriesApi'

const OUTCOMES = ['delivered', 'no_answer', 'wrong_address', 'refused', 'rescheduled']
const POD_METHODS = ['signature', 'photo', 'otp']

/** One shipment: assign a courier, send out, record an attempt with proof of delivery and collected COD. */
export function DeliveryDialog({ delivery, couriers, onClose }) {
  const { t, i18n } = useTranslation()
  const money = useMoney('EGP', 0)
  const { assign, outForDelivery, attempt } = useDeliveryMutations()
  const [courierId, setCourierId] = useState('')
  const [form, setForm] = useState({})
  const errors = getServiceFieldErrors(attempt.error)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))

  useEffect(() => {
    if (!delivery) return
    setCourierId(delivery.courier?.id || '')
    setForm({ outcome: 'delivered', pod_method: 'otp', receiver_name: delivery.recipient?.name || '', otp: '', cod_collected: delivery.cod_amount || '', note: '' })
    attempt.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery?.id])

  if (!delivery) return null
  const done = (key) => () => {
    toast.success(t(`service.deliveries.done.${key}`))
    onClose()
  }
  const delivered = form.outcome === 'delivered'
  const submitAttempt = () =>
    attempt.mutate(
      { recordId: delivery.record_id, outcome: form.outcome, note: form.note || undefined, ...(delivered ? { pod: { method: form.pod_method, receiver_name: form.receiver_name, otp: form.otp || undefined }, cod_collected: Number(form.cod_collected) || 0 } : {}) },
      { onSuccess: done(delivered ? 'delivered' : 'attempt') }
    )
  const rows = [
    ['merchant', delivery.merchant?.name],
    ['recipient', delivery.recipient?.name],
    ['phone', delivery.recipient?.phone && <span dir="ltr">{delivery.recipient.phone}</span>],
    ['address', delivery.recipient?.address && <bdi>{delivery.recipient.address}</bdi>],
    ['cod', delivery.cod_amount ? <span dir="ltr">{money(delivery.cod_amount)}</span> : t('service.deliveries.noCod')],
    ['attempts', delivery.attempts],
    delivery.pod && ['pod', `${t(`service.deliveries.podMethods.${delivery.pod.method}`)} · ${delivery.pod.receiver_name}`],
  ].filter(Boolean)

  return (
    <AppModal isOpen onClose={onClose} size="lg" title={delivery.reference_no} description={t(`service.deliveries.statuses.${delivery.status}`)}>
      <div className="grid gap-4">
        <dl className="grid gap-2 text-sm">
          {rows.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3">
              <dt className="text-[var(--text-muted)]">{t(`service.deliveries.fields.${key}`)}</dt>
              <dd className="text-end text-[var(--text)]">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>

        {['unassigned', 'assigned', 'out_for_delivery'].includes(delivery.status) && (
          <div className="grid gap-2 border-t border-[var(--border)] pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Select label={t('service.deliveries.fields.courier')} value={courierId} onChange={setCourierId} placeholder={t('service.deliveries.chooseCourier')} options={couriers.map((courier) => ({ value: courier.id, label: `${localizeLabel(courier.name, i18n.language, courier.id)} · ${(courier.zones || []).join(', ')}` }))} />
            <div className="flex gap-2">
              <Button variant="outline" disabled={!courierId || courierId === delivery.courier?.id} loading={assign.isPending} onClick={() => assign.mutate({ recordId: delivery.record_id, courierId }, { onSuccess: done('assigned') })}>{t('service.deliveries.actions.assign')}</Button>
              {delivery.status === 'assigned' && <Button loading={outForDelivery.isPending} onClick={() => outForDelivery.mutate(delivery.record_id, { onSuccess: done('out') })}>{t('service.deliveries.actions.out')}</Button>}
            </div>
          </div>
        )}

        {delivery.status === 'out_for_delivery' && (
          <form className="grid gap-3 border-t border-[var(--border)] pt-3" onSubmit={(event) => { event.preventDefault(); submitAttempt() }}>
            <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.deliveries.recordAttempt')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label={t('service.deliveries.fields.outcome')} value={form.outcome} onChange={(value) => set('outcome')(value || 'delivered')} options={OUTCOMES.map((value) => ({ value, label: t(`service.deliveries.outcomes.${value}`) }))} />
              {delivered ? (
                <Select label={t('service.deliveries.fields.podMethod')} value={form.pod_method} onChange={(value) => set('pod_method')(value || 'otp')} options={POD_METHODS.map((value) => ({ value, label: t(`service.deliveries.podMethods.${value}`) }))} />
              ) : (
                <Input label={t('service.deliveries.fields.note')} dir="auto" value={form.note} onChange={(event) => set('note')(event.target.value)} />
              )}
            </div>
            {delivered && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label={t('service.deliveries.fields.receiverName')} dir="auto" value={form.receiver_name} onChange={(event) => set('receiver_name')(event.target.value)} error={errors.receiver_name && t('service.settings.validation.required')} />
                {form.pod_method === 'otp' && <Input label={t('service.deliveries.fields.otp')} dir="ltr" inputMode="numeric" maxLength={4} value={form.otp} onChange={(event) => set('otp')(event.target.value)} error={errors.otp && t('service.deliveries.validation.otp')} />}
                {delivery.cod_amount > 0 && <Input type="number" dir="ltr" label={t('service.deliveries.fields.codCollected')} value={form.cod_collected} onChange={(event) => set('cod_collected')(event.target.value)} error={errors.cod_collected && t('service.deliveries.validation.codMismatch', { amount: money(delivery.cod_amount) })} />}
              </div>
            )}
            {!delivered && <p className="text-xs text-[var(--text-muted)]">{t('service.deliveries.failHint', { count: delivery.attempts + 1 })}</p>}
            <Button type="submit" className="w-fit" loading={attempt.isPending}>{t('service.deliveries.actions.saveAttempt')}</Button>
          </form>
        )}
      </div>
    </AppModal>
  )
}
