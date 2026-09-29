import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { formatDate } from '../../../../shared/utils/dateTime'
import { useMoney } from '../utils/money'

const TONE = { open: 'text-sla-at-risk', kept: 'text-sla-on-track', broken: 'text-sla-breached' }

/** Promises to pay; kept / broken is decided by the server from later payments. */
export function SchedulePromises({ schedule }) {
  const { t, i18n } = useTranslation()
  const money = useMoney(schedule.currency)
  if (!schedule.promises?.length) return <p className="text-sm text-[var(--text-muted)]">{t('service.billing.noPromises')}</p>
  return (
    <ul className="grid gap-2">
      {schedule.promises.map((promise) => (
        <li key={promise.id} className="grid gap-0.5 text-sm">
          <span className="flex justify-between gap-2">
            <span className="text-[var(--text)]"><span dir="ltr">{money(promise.amount)}</span> · {formatDate(promise.promised_date, i18n.language, { dateStyle: 'medium' })}</span>
            <span className={cn('text-xs font-medium', TONE[promise.status])}>{t(`service.billing.promiseStatuses.${promise.status}`)}</span>
          </span>
          {promise.note && <span className="text-xs text-[var(--text-muted)]"><bdi>{promise.note}</bdi>{promise.created_by?.name ? ` · ${promise.created_by.name}` : ''}</span>}
        </li>
      ))}
    </ul>
  )
}
