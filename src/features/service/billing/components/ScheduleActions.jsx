import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Banknote, CalendarClock, HandCoins, Receipt, XCircle } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useScheduleMutations } from '../api/schedulesApi'
import { PayoffQuoteDialog } from './PayoffQuoteDialog'
import { PromiseDialog } from './PromiseDialog'
import { ReasonDialog } from './ReasonDialog'
import { RecordPaymentDialog } from './RecordPaymentDialog'
import { RescheduleDialog } from './RescheduleDialog'

/** Header actions of an active schedule. Every one is re-validated by the server (status, version, permission). */
export function ScheduleActions({ schedule }) {
  const { t } = useTranslation()
  const { action } = useScheduleMutations(schedule.id)
  const [dialog, setDialog] = useState(null)
  const [payAmount, setPayAmount] = useState(null)
  if (schedule.status !== 'active') return null
  const close = () => setDialog(null)

  const cancel = (reason) =>
    action.mutate({ id: schedule.id, action: 'cancel', version: schedule.version, reason }, {
      onSuccess: () => {
        toast.success(t('service.billing.done.cancelled'))
        close()
      },
    })

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => { setPayAmount(null); setDialog('pay') }} disabled={!(schedule.totals.outstanding > 0)}>
        <Banknote size={16} aria-hidden="true" />
        {t('service.billing.actions.recordPayment')}
      </Button>
      <Button variant="outline" onClick={() => setDialog('promise')}>
        <HandCoins size={16} aria-hidden="true" />
        {t('service.billing.actions.addPromise')}
      </Button>
      <Button variant="outline" onClick={() => setDialog('quote')}>
        <Receipt size={16} aria-hidden="true" />
        {t('service.billing.actions.payoffQuote')}
      </Button>
      <Button variant="outline" onClick={() => setDialog('reschedule')} disabled={Boolean(schedule.pending_reschedule)}>
        <CalendarClock size={16} aria-hidden="true" />
        {t('service.billing.actions.reschedule')}
      </Button>
      <Button variant="outline" onClick={() => setDialog('cancel')}>
        <XCircle size={16} aria-hidden="true" />
        {t('service.billing.actions.cancel')}
      </Button>

      <RecordPaymentDialog open={dialog === 'pay'} onClose={close} schedule={schedule} defaultAmount={payAmount} payoff={payAmount != null} />
      <PromiseDialog open={dialog === 'promise'} onClose={close} schedule={schedule} />
      <RescheduleDialog open={dialog === 'reschedule'} onClose={close} schedule={schedule} />
      <PayoffQuoteDialog open={dialog === 'quote'} onClose={close} schedule={schedule} onPay={(amount) => { setPayAmount(amount); setDialog('pay') }} />
      <ReasonDialog open={dialog === 'cancel'} onClose={close} title={t('service.billing.actions.cancel')} description={t('service.billing.cancelDescription')} submitText={t('service.billing.actions.cancel')} loading={action.isPending} onSubmit={cancel} />
    </div>
  )
}
