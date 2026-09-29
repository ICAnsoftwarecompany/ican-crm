import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Undo2 } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { useScheduleMutations } from '../api/schedulesApi'
import { useMoney } from '../utils/money'
import { ReasonDialog } from './ReasonDialog'

/** Payment records, newest first. A reversal is a new negative record; nothing is deleted (spec §29.11). */
export function SchedulePayments({ schedule }) {
  const { t, i18n } = useTranslation()
  const money = useMoney(schedule.currency)
  const { reversePayment } = useScheduleMutations(schedule.id)
  const [reversing, setReversing] = useState(null)
  const date = (value) => formatDate(value, i18n.language, { dateStyle: 'medium' })

  if (!schedule.payments.length) return <p className="text-sm text-[var(--text-muted)]">{t('service.billing.noPayments')}</p>

  const submit = (reason) =>
    reversePayment.mutate({ paymentId: reversing.id, reason }, {
      onSuccess: () => {
        toast.success(t('service.billing.done.reversed'))
        setReversing(null)
      },
    })

  return (
    <>
      <ul className="divide-y divide-[var(--border)]">
        {schedule.payments.map((payment) => {
          const reversible = payment.status === 'confirmed' && !payment.reversal_of_id && payment.amount > 0
          return (
            <li key={payment.id} className="grid gap-1 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <span className="grid gap-0.5">
                <span className={cn('font-medium', payment.status === 'reversed' ? 'text-[var(--text-muted)] line-through' : payment.amount < 0 ? 'text-sla-breached' : 'text-[var(--text)]')} dir="ltr">
                  {money(payment.amount)}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  <span dir="ltr">{payment.number}</span> · {t(`service.billing.methods.${payment.method}`, { defaultValue: payment.method })} · {date(payment.paid_at)}
                  {payment.recorded_by?.name ? ` · ${payment.recorded_by.name}` : ''}
                </span>
                {payment.reversal_of_id && <span className="text-xs text-[var(--text-muted)]">{t('service.billing.reversalOf')}{payment.reason ? `: ${payment.reason}` : ''}</span>}
                {payment.settlement_discounts?.length > 0 && <span className="text-xs text-[var(--text-muted)]">{t('service.billing.payoffSettlement')}</span>}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">{t(`service.billing.paymentStatuses.${payment.status}`, { defaultValue: payment.status })}</span>
                {reversible && (
                  <button type="button" className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] underline hover:text-[var(--text)]" onClick={() => setReversing(payment)}>
                    <Undo2 size={12} aria-hidden="true" />
                    {t('service.billing.actions.reverse')}
                  </button>
                )}
              </span>
            </li>
          )
        })}
      </ul>
      <ReasonDialog open={Boolean(reversing)} onClose={() => setReversing(null)} title={t('service.billing.actions.reverse')} description={reversing ? t('service.billing.reverseDescription', { amount: money(reversing.amount) }) : ''} submitText={t('service.billing.actions.reverse')} loading={reversePayment.isPending} onSubmit={submit} />
    </>
  )
}
