import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

const TONE = { trial: 'bg-status-new', active: 'bg-status-won', past_due: 'bg-sla-at-risk', suspended: 'bg-sla-breached', cancelled: 'bg-status-lost', expired: 'bg-[var(--text-muted)]' }

export function SubscriptionStatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--text)]">
      <span className={cn('h-2 w-2 rounded-full', TONE[status] || 'bg-[var(--text-muted)]')} aria-hidden="true" />
      {t(`service.subscriptions.statuses.${status}`, { defaultValue: status })}
    </span>
  )
}
