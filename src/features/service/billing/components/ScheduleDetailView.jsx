import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileSignature } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatDate } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useSchedule } from '../api/schedulesApi'
import { useMoney } from '../utils/money'
import { PendingReschedule } from './PendingReschedule'
import { ScheduleActions } from './ScheduleActions'
import { ScheduleLinesTable } from './ScheduleLinesTable'
import { SchedulePayments } from './SchedulePayments'
import { SchedulePromises } from './SchedulePromises'
import { ScheduleStatusBadge } from './ScheduleStatusBadge'

function Section({ title, children }) {
  return (
    <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  )
}

const TOTALS = [
  ['inPrice', 'in_price'],
  ['paid', 'paid'],
  ['outstanding', 'outstanding'],
  ['overdue', 'overdue'],
  ['lateFees', 'late_fees'],
]

/** One payment schedule: totals, lines, payments, promises, reschedule approval and lifecycle actions. */
export function ScheduleDetailView({ scheduleId, backTo, detailPath, contractPath }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const query = useSchedule(scheduleId)
  const schedule = query.data
  const money = useMoney(schedule?.currency)
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')

  return (
    <div className="grid gap-4">
      <Link to={backTo} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.billing.back')}
      </Link>
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch}>
        {schedule && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{schedule.schedule_number}</span>
                  <ScheduleStatusBadge status={schedule.status} />
                  <span>{localizeLabel(schedule.plan_snapshot?.name, language, '')} · {t('service.pipelines.version', { version: schedule.plan_snapshot?.version || 1 })}</span>
                </div>
                <h1 className="text-lg font-bold text-[var(--text)]">{schedule.customer?.name}</h1>
                {contractPath && schedule.contract_id && (
                  <Link to={contractPath(schedule.contract_id)} className="inline-flex w-fit items-center gap-1 text-xs text-[var(--text)] underline">
                    <FileSignature size={14} aria-hidden="true" />
                    {t('service.billing.contractLink')} <span dir="ltr">{schedule.contract_number}</span>
                  </Link>
                )}
                {schedule.replaces_schedule_id && <Link to={detailPath({ id: schedule.replaces_schedule_id })} className="w-fit text-xs text-[var(--text-muted)] underline">{t('service.billing.replacesLink')}</Link>}
                {schedule.replaced_by_schedule_id && <Link to={detailPath({ id: schedule.replaced_by_schedule_id })} className="w-fit text-xs font-medium text-[var(--text)] underline">{t('service.billing.replacedByLink')}</Link>}
                {schedule.cancelled_reason && <p className="text-xs text-status-lost">{localizeLabel(schedule.cancelled_reason, language, '')}</p>}
              </div>
              <ScheduleActions schedule={schedule} />
            </header>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {TOTALS.map(([key, field]) => (
                <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <dt className="text-xs text-[var(--text-muted)]">{t(`service.billing.totals.${key}`)}</dt>
                  <dd className={cn('text-base font-bold', key === 'overdue' && schedule.totals[field] > 0 ? 'text-sla-breached' : 'text-[var(--text)]')}><span dir="ltr">{money(schedule.totals[field])}</span></dd>
                </div>
              ))}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <dt className="text-xs text-[var(--text-muted)]">{t('service.billing.columns.nextDue')}</dt>
                <dd className="text-sm font-bold text-[var(--text)]">{schedule.next_due ? <>{date(schedule.next_due.date)} · <span dir="ltr">{money(schedule.next_due.amount)}</span></> : '—'}</dd>
              </div>
            </dl>

            <PendingReschedule schedule={schedule} onApproved={(next) => navigate(detailPath(next))} />

            <Section title={t('service.billing.lines')}>
              <ScheduleLinesTable schedule={schedule} />
            </Section>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Section title={t('service.billing.payments')}>
                <SchedulePayments schedule={schedule} />
              </Section>
              <Section title={t('service.billing.promises')}>
                <SchedulePromises schedule={schedule} />
              </Section>
            </div>
          </>
        )}
      </ResourceState>
    </div>
  )
}
