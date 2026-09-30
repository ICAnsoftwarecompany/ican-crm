import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '../../../../shared/utils/cn'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Select } from '../../../../shared/components/ui/Select'
import { formatDate } from '../../../../shared/utils/dateTime'
import { LINE_TONE } from '../../billing/components/ScheduleStatusBadge'
import { PAYMENT_METHODS, useMoney } from '../../billing/utils/money'
import { useSubscriptionMutations } from '../api/subscriptionsApi'

/** Billing periods (one due line per period in `crm` payments mode); open ones can be marked paid. */
export function SubscriptionPeriods({ subscription }) {
  const { t, i18n } = useTranslation()
  const money = useMoney(subscription.plan?.currency)
  const { payPeriod } = useSubscriptionMutations(subscription.id)
  const [paying, setPaying] = useState(null)
  const [method, setMethod] = useState('cash')
  const date = (value) => (value ? formatDate(value, i18n.language, { dateStyle: 'medium' }) : '—')
  const payable = !['cancelled'].includes(subscription.status)

  if (!subscription.periods.length) return <p className="text-sm text-[var(--text-muted)]">{t('service.subscriptions.noPeriods')}</p>

  const submit = () =>
    payPeriod.mutate({ id: subscription.id, periodId: paying.id, method }, {
      onSuccess: () => {
        toast.success(t('service.billing.done.payment'))
        setPaying(null)
      },
    })

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
          <tr>
            <th className="px-3 py-2 text-start font-medium">{t('service.subscriptions.fields.period')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('service.billing.columns.due')}</th>
            <th className="px-3 py-2 text-end font-medium">{t('service.billing.columns.amount')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('service.billing.columns.status')}</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {subscription.periods.map((period) => (
            <tr key={period.id} className="border-t border-[var(--border)]">
              <td className="whitespace-nowrap px-3 py-1.5 text-xs">{t('service.entitlements.range', { from: date(period.start), to: date(period.end) })}{period.kind === 'proration' && <span className="ms-1 text-[var(--text-muted)]">· {t('service.subscriptions.proration.line')}</span>}</td>
              <td className="whitespace-nowrap px-3 py-1.5 text-xs">{date(period.due_date)}</td>
              <td className="px-3 py-1.5 text-end"><span dir="ltr">{money(period.amount)}</span></td>
              <td className={cn('whitespace-nowrap px-3 py-1.5 text-xs font-medium', LINE_TONE[period.status])}>
                {t(`service.billing.lineStatuses.${period.status}`)}
                {period.paid_at && <span className="ms-1 font-normal text-[var(--text-muted)]">· {date(period.paid_at)}</span>}
              </td>
              <td className="px-3 py-1.5 text-end">
                {!period.paid_at && payable && (
                  <button type="button" className="text-xs text-[var(--text)] underline" onClick={() => { setMethod('cash'); setPaying(period) }}>
                    {t('service.subscriptions.actions.markPaid')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <FormDialog open={Boolean(paying)} onClose={() => setPaying(null)} title={t('service.subscriptions.actions.markPaid')} description={paying ? t('service.subscriptions.payDescription', { amount: money(paying.amount) }) : ''} submitText={t('service.billing.actions.recordPayment')} loading={payPeriod.isPending} onSubmit={submit}>
        <Select label={t('service.billing.fields.method')} value={method} onChange={(value) => setMethod(value || 'cash')} options={PAYMENT_METHODS.map((value) => ({ value, label: t(`service.billing.methods.${value}`) }))} />
      </FormDialog>
    </div>
  )
}
