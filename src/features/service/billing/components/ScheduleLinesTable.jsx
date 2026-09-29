import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { useScheduleMutations } from '../api/schedulesApi'
import { useMoney } from '../utils/money'
import { LineStatus } from './ScheduleStatusBadge'
import { ReasonDialog } from './ReasonDialog'

/** Schedule lines with paid / remaining / late fee per line; late fees can be waived with a reason (permission + audit). */
export function ScheduleLinesTable({ schedule, lines = schedule.lines, readOnly = false }) {
  const { t, i18n } = useTranslation()
  const money = useMoney(schedule.currency)
  const { waiveFee } = useScheduleMutations(schedule.id)
  const [waiving, setWaiving] = useState(null)
  const canWaive = !readOnly && schedule.status === 'active'
  const date = (value) => (value ? formatDate(value, i18n.language, { dateStyle: 'medium' }) : '—')
  const hasFees = lines.some((line) => line.late_fee_amount > 0)

  const submitWaive = (reason) =>
    waiveFee.mutate({ lineId: waiving.id, reason, version: schedule.version }, {
      onSuccess: () => {
        toast.success(t('service.billing.done.feeWaived'))
        setWaiving(null)
      },
    })

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
          <tr>
            <th className="px-3 py-2 text-start font-medium">#</th>
            <th className="px-3 py-2 text-start font-medium">{t('service.billing.columns.type')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('service.billing.columns.due')}</th>
            <th className="px-3 py-2 text-end font-medium">{t('service.billing.columns.amount')}</th>
            {!readOnly && <th className="px-3 py-2 text-end font-medium">{t('service.billing.columns.paid')}</th>}
            {!readOnly && <th className="px-3 py-2 text-end font-medium">{t('service.billing.columns.remaining')}</th>}
            {!readOnly && hasFees && <th className="px-3 py-2 text-end font-medium">{t('service.billing.columns.lateFee')}</th>}
            {!readOnly && <th className="px-3 py-2 text-start font-medium">{t('service.billing.columns.status')}</th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id || line.seq} className={cn('border-t border-[var(--border)]', !line.in_price && 'text-[var(--text-muted)]')}>
              <td className="px-3 py-1.5 text-xs" dir="ltr">{line.seq}</td>
              <td className="px-3 py-1.5">
                {t(`service.billing.lineTypes.${line.line_type}`, { defaultValue: line.line_type })}
                {!line.in_price && <span className="ms-1 text-xs">· {t('service.billing.outside')}</span>}
              </td>
              <td className="whitespace-nowrap px-3 py-1.5 text-xs">{date(line.due_date)}</td>
              <td className="px-3 py-1.5 text-end"><span dir="ltr">{money(line.amount)}</span></td>
              {!readOnly && <td className="px-3 py-1.5 text-end text-xs"><span dir="ltr">{line.paid_amount ? money(line.paid_amount) : '—'}</span></td>}
              {!readOnly && <td className="px-3 py-1.5 text-end text-xs font-medium"><span dir="ltr">{line.remaining ? money(line.remaining) : '—'}</span></td>}
              {!readOnly && hasFees && (
                <td className="px-3 py-1.5 text-end text-xs">
                  {line.late_fee_amount > 0 ? (
                    <span className="inline-flex items-center gap-2">
                      {line.fee_outstanding > 0 && canWaive && (
                        <button type="button" className="text-[var(--text-muted)] underline hover:text-[var(--text)]" onClick={() => setWaiving(line)}>
                          {t('service.billing.actions.waiveFee')}
                        </button>
                      )}
                      <span dir="ltr" className={line.fee_outstanding > 0 ? 'text-sla-breached' : 'text-[var(--text-muted)] line-through'}>{money(line.late_fee_amount)}</span>
                    </span>
                  ) : line.fee_waived ? (
                    <span className="text-[var(--text-muted)]">{t('service.billing.feeWaived')}</span>
                  ) : '—'}
                </td>
              )}
              {!readOnly && <td className="whitespace-nowrap px-3 py-1.5"><LineStatus status={line.status} daysOverdue={line.days_overdue} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
      <ReasonDialog open={Boolean(waiving)} onClose={() => setWaiving(null)} title={t('service.billing.actions.waiveFee')} description={waiving ? t('service.billing.waiveDescription', { amount: money(waiving.fee_outstanding), seq: waiving.seq }) : ''} submitText={t('service.billing.actions.waiveFee')} loading={waiveFee.isPending} onSubmit={submitWaive} />
    </div>
  )
}
