import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { portalApi, usePortalList, usePortalMutation } from '../../api/portalApi'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { Card, PortalPage, StatusPill } from '../PortalPage'

const LINE_TONE = { paid: 'ok', overdue: 'bad', due: 'warn', partially_paid: 'warn', upcoming: 'muted', waived: 'muted', cancelled: 'muted' }

/** Payment schedules: what's paid, left and next; online payment through the gateway (server confirms). */
export function PortalPayments() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const { can } = usePortalAccess()
  const schedules = usePortalList('schedules', P.schedules, undefined, { enabled: can('payment_schedule') })
  const remittances = usePortalList('remittances', P.remittances, undefined, { enabled: can('remittance') })
  const [paying, setPaying] = useState(null)
  const [amount, setAmount] = useState('')
  const pay = usePortalMutation(() => portalApi.post(P.payments, { schedule_id: paying.id, amount: Number(amount) }), { onSuccess: (result) => { toast.success(t('portal.payments.paid', { receipt: result.receipt_number })); setPaying(null) } })
  const amountError = pay.error?.response?.data?.errors?.amount

  return (
    <PortalPage title={t('portal.sections.payments')} description={t('portal.payments.description')}>
      {can('payment_schedule') && (
        <PortalPage level={2} title={t('portal.payments.schedules')} query={schedules} empty={!schedules.data?.length} emptyTitle={t('portal.payments.empty')}>
          <div className="grid gap-4">
            {(schedules.data || []).map((schedule) => (
              <Card key={schedule.id} className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm"><span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{schedule.schedule_number}</span>{schedule.contract_number && <span className="text-xs text-[var(--text-muted)]"> · {t('portal.payments.contract')} <span dir="ltr">{schedule.contract_number}</span></span>}</span>
                  {can('payment_schedule', 'pay') && schedule.totals.outstanding > 0 && <Button size="sm" onClick={() => { setAmount(String(schedule.totals.overdue || schedule.next_due?.amount || schedule.totals.outstanding)); pay.reset(); setPaying(schedule) }}><CreditCard size={14} aria-hidden="true" />{t('portal.payments.payNow')}</Button>}
                </div>
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[['paid', schedule.totals.paid], ['outstanding', schedule.totals.outstanding], ['overdue', schedule.totals.overdue]].map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-[var(--surface-2)] p-2"><dt className="text-xs text-[var(--text-muted)]">{t(`portal.payments.totals.${key}`)}</dt><dd className={`font-bold ${key === 'overdue' && value > 0 ? 'text-sla-breached' : ''}`}><span dir="ltr">{format.money(value, schedule.currency)}</span></dd></div>
                  ))}
                  <div className="rounded-lg bg-[var(--surface-2)] p-2"><dt className="text-xs text-[var(--text-muted)]">{t('portal.payments.totals.next')}</dt><dd className="font-bold">{schedule.next_due ? <><span dir="ltr">{format.money(schedule.next_due.amount, schedule.currency)}</span> · {format.date(schedule.next_due.date)}</> : '—'}</dd></div>
                </dl>
                <details>
                  <summary className="cursor-pointer text-sm text-[var(--text-muted)]">{t('portal.payments.lines', { count: schedule.lines.length })}</summary>
                  <ul className="mt-2 divide-y divide-[var(--border)] text-sm">
                    {schedule.lines.map((line) => (
                      <li key={line.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                        <span>{t(`portal.payments.lineTypes.${line.line_type}`, { defaultValue: line.line_type })} · {format.date(line.due_date)}</span>
                        <span className="flex items-center gap-2"><span dir="ltr">{format.money(line.amount, schedule.currency)}</span><StatusPill tone={LINE_TONE[line.status]}>{t(`portal.payments.lineStatuses.${line.status}`)}</StatusPill></span>
                      </li>
                    ))}
                  </ul>
                </details>
              </Card>
            ))}
          </div>
        </PortalPage>
      )}
      {can('remittance') && (
        <PortalPage level={2} title={t('portal.payments.remittances')} query={remittances} empty={!remittances.data?.length} emptyTitle={t('portal.payments.noRemittances')}>
          <Card>
            <ul className="divide-y divide-[var(--border)] text-sm">
              {(remittances.data || []).map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span><span dir="ltr" className="font-mono text-xs">{entry.number}</span> · {t('portal.payments.shipments', { count: entry.lines.length })}</span>
                  <span className="flex items-center gap-2"><span dir="ltr" className="font-semibold">{format.money(entry.net_amount)}</span><StatusPill tone={entry.status === 'paid' ? 'ok' : 'warn'}>{t(`portal.payments.remittanceStatuses.${entry.status}`)}</StatusPill></span>
                </li>
              ))}
            </ul>
          </Card>
        </PortalPage>
      )}
      <FormDialog open={Boolean(paying)} onClose={() => setPaying(null)} title={t('portal.payments.payNow')} description={t('portal.payments.gatewayNote')} submitText={t('portal.payments.confirm')} loading={pay.isPending} submitDisabled={!(Number(amount) > 0)} onSubmit={() => pay.mutate()}>
        <Input type="number" dir="ltr" min="1" step="0.01" label={t('portal.payments.amount')} value={amount} onChange={(event) => setAmount(event.target.value)} error={amountError && t('portal.payments.amountError')} />
      </FormDialog>
    </PortalPage>
  )
}
