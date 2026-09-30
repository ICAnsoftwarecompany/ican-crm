import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Ban, PauseCircle, PlayCircle, RefreshCw, Replace } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ReasonDialog } from '../../billing/components/ReasonDialog'
import { useSubscriptionMutations } from '../api/subscriptionsApi'
import { ChangePlanDialog } from './ChangePlanDialog'

const LIVE = ['trial', 'active', 'past_due']

/** Lifecycle actions (spec §30). The server re-checks status, version and permission for each. */
export function SubscriptionActions({ subscription }) {
  const { t } = useTranslation()
  const { action } = useSubscriptionMutations(subscription.id)
  const [dialog, setDialog] = useState(null)
  const [form, setForm] = useState({})
  const close = () => setDialog(null)
  const status = subscription.status

  const run = (name, payload = {}, done = name) =>
    action.mutate({ id: subscription.id, action: name, version: subscription.version, ...payload }, {
      onSuccess: () => {
        toast.success(t(`service.subscriptions.done.${done}`))
        close()
      },
    })

  const canRenew = (subscription.renewal_type !== 'auto' && ['active', 'past_due'].includes(status)) || status === 'expired'
  const canResume = (status === 'suspended' && subscription.suspend_reason === 'manual') || (subscription.cancel_at_period_end && LIVE.includes(status))

  return (
    <div className="flex flex-wrap gap-2">
      {canRenew && (
        <Button loading={action.isPending && action.variables?.action === 'renew'} onClick={() => run('renew')}>
          <RefreshCw size={16} aria-hidden="true" />
          {t('service.subscriptions.actions.renew')}
        </Button>
      )}
      {canResume && (
        <Button onClick={() => run('resume', {}, subscription.cancel_at_period_end ? 'cancelWithdrawn' : 'resume')}>
          <PlayCircle size={16} aria-hidden="true" />
          {t(subscription.cancel_at_period_end ? 'service.subscriptions.actions.keep' : 'service.subscriptions.actions.resume')}
        </Button>
      )}
      {LIVE.includes(status) && (
        <Button variant="outline" onClick={() => { setForm({ price: subscription.pending_change?.price ?? subscription.plan.price }); setDialog('change') }}>
          <Replace size={16} aria-hidden="true" />
          {t('service.subscriptions.actions.changePlan')}
        </Button>
      )}
      {['active', 'past_due'].includes(status) && (
        <Button variant="outline" onClick={() => setDialog('suspend')}>
          <PauseCircle size={16} aria-hidden="true" />
          {t('service.subscriptions.actions.suspend')}
        </Button>
      )}
      {[...LIVE, 'suspended'].includes(status) && !subscription.cancel_at_period_end && (
        <Button variant="outline" onClick={() => { setForm({ mode: ['active', 'past_due'].includes(status) ? 'period_end' : 'now', reason: '' }); setDialog('cancel') }}>
          <Ban size={16} aria-hidden="true" />
          {t('service.subscriptions.actions.cancel')}
        </Button>
      )}

      <ReasonDialog open={dialog === 'suspend'} onClose={close} title={t('service.subscriptions.actions.suspend')} description={t('service.subscriptions.suspendDescription')} submitText={t('service.subscriptions.actions.suspend')} loading={action.isPending} onSubmit={(reason) => run('suspend', { reason })} />
      <FormDialog open={dialog === 'cancel'} onClose={close} title={t('service.subscriptions.actions.cancel')} submitText={t('service.subscriptions.actions.cancel')} loading={action.isPending} submitDisabled={!form.reason?.trim()} onSubmit={() => run('cancel', { mode: form.mode, reason: form.reason }, form.mode === 'now' ? 'cancelled' : 'cancelScheduled')}>
        <Select label={t('service.subscriptions.cancelWhen')} value={form.mode} onChange={(mode) => setForm((current) => ({ ...current, mode: mode || 'now' }))} options={(['active', 'past_due'].includes(status) ? ['period_end', 'now'] : ['now']).map((value) => ({ value, label: t(`service.subscriptions.cancelModes.${value}`) }))} />
        <Input label={t('service.billing.reason')} dir="auto" value={form.reason || ''} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} />
      </FormDialog>
      <ChangePlanDialog open={dialog === 'change'} subscription={subscription} initialPrice={form.price} onClose={close} />
    </div>
  )
}
