import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useDebounce } from '../../../../shared/hooks/useDebounce'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useMoney } from '../../billing/utils/money'
import { subscriptionsApi, useSubscriptionMutations } from '../api/subscriptionsApi'

/**
 * Change price / plan: from the next period (default, spec §30) or today with proration (F7) — the server quotes the
 * credit for unused days, the charge at the new price and the net (due today, or kept as credit).
 */
export function ChangePlanDialog({ open, subscription, initialPrice, onClose }) {
  const { t } = useTranslation()
  const money = useMoney()
  const { update } = useSubscriptionMutations(subscription.id)
  const [price, setPrice] = useState('')
  const [effective, setEffective] = useState('next_period')
  const debounced = useDebounce(price, 400)
  const errors = getServiceFieldErrors(update.error)
  useEffect(() => {
    if (open) {
      setPrice(initialPrice ?? subscription.plan.price)
      setEffective('next_period')
      update.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const canProrate = ['active', 'past_due'].includes(subscription.status) && subscription.current_period_end
  const quote = useQuery({ queryKey: ['service', 'subscriptions', 'change-preview', subscription.id, debounced], queryFn: () => subscriptionsApi.changePreview(subscription.id, { price: Number(debounced) }), enabled: open && effective === 'now' && Number(debounced) > 0 })
  const save = () =>
    update.mutate({ id: subscription.id, version: subscription.version, pending_change: { price: Number(price), effective } }, {
      onSuccess: () => {
        toast.success(t(effective === 'now' ? 'service.subscriptions.done.changedNow' : 'service.subscriptions.done.changeScheduled'))
        onClose()
      },
    })
  const q = quote.data
  return (
    <FormDialog open={open} onClose={onClose} title={t('service.subscriptions.actions.changePlan')} description={t('service.subscriptions.changeDescription')} submitText={t(effective === 'now' ? 'service.subscriptions.actions.changeNow' : 'service.subscriptions.actions.scheduleChange')} loading={update.isPending} submitDisabled={!(Number(price) > 0)} onSubmit={save}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="number" dir="ltr" min="0" label={t('service.subscriptions.fields.newPrice')} value={price ?? ''} onChange={(event) => setPrice(event.target.value)} error={errors.price && t('service.billing.validation.amount')} />
        <Select label={t('service.subscriptions.fields.effective')} value={effective} onChange={(value) => setEffective(value || 'next_period')} options={['next_period', ...(canProrate ? ['now'] : [])].map((value) => ({ value, label: t(`service.subscriptions.effective.${value}`) }))} />
      </div>
      {effective === 'now' && q && (
        <dl className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm sm:grid-cols-4">
          <div className="grid"><dt className="text-xs text-[var(--text-muted)]">{t('service.subscriptions.proration.daysLeft')}</dt><dd className="font-semibold text-[var(--text)]">{t('service.subscriptions.proration.days', { left: q.days_left, total: q.period_days })}</dd></div>
          <div className="grid"><dt className="text-xs text-[var(--text-muted)]">{t('service.subscriptions.proration.credit')}</dt><dd className="font-semibold text-[var(--text)]" dir="ltr">{money(-q.credit_unused)}</dd></div>
          <div className="grid"><dt className="text-xs text-[var(--text-muted)]">{t('service.subscriptions.proration.charge')}</dt><dd className="font-semibold text-[var(--text)]" dir="ltr">{money(q.charge_new)}</dd></div>
          <div className="grid"><dt className="text-xs text-[var(--text-muted)]">{t(q.net >= 0 ? 'service.subscriptions.proration.dueToday' : 'service.subscriptions.proration.creditKept')}</dt><dd className="font-bold text-[var(--text)]" dir="ltr">{money(Math.abs(q.net))}</dd></div>
        </dl>
      )}
    </FormDialog>
  )
}
