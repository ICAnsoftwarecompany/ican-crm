import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

const SCHEDULE_TONE = { active: 'bg-status-won', completed: 'bg-status-qualified', rescheduled: 'bg-status-contacted', transferred: 'bg-status-contacted', cancelled: 'bg-status-lost' }
export const LINE_TONE = {
  upcoming: 'text-[var(--text-muted)]',
  due: 'text-sla-at-risk',
  partially_paid: 'text-sla-at-risk',
  paid: 'text-sla-on-track',
  overdue: 'text-sla-breached',
  waived: 'text-[var(--text-muted)]',
  cancelled: 'text-[var(--text-muted)] line-through',
}

export function ScheduleStatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--text)]">
      <span className={cn('h-2 w-2 rounded-full', SCHEDULE_TONE[status] || 'bg-[var(--text-muted)]')} aria-hidden="true" />
      {t(`service.billing.scheduleStatuses.${status}`, { defaultValue: status })}
    </span>
  )
}

export function LineStatus({ status, daysOverdue }) {
  const { t } = useTranslation()
  return (
    <span className={cn('text-xs font-medium', LINE_TONE[status])}>
      {t(`service.billing.lineStatuses.${status}`, { defaultValue: status })}
      {status === 'overdue' && daysOverdue ? <span className="ms-1 font-normal">({t('service.billing.daysOverdue', { count: daysOverdue })})</span> : null}
    </span>
  )
}
