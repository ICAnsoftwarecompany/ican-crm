import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

export const CONTRACT_STATUS_TONE = {
  draft: 'bg-[var(--text-muted)]',
  sent: 'bg-status-new',
  partially_signed: 'bg-status-contacted',
  signed: 'bg-status-qualified',
  active: 'bg-status-won',
  expiring: 'bg-sla-at-risk',
  expired: 'bg-[var(--text-muted)]',
  terminated: 'bg-status-lost',
  cancelled: 'bg-status-lost',
  renewed: 'bg-status-qualified',
}

export function ContractStatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--text)]">
      <span className={cn('h-2 w-2 rounded-full', CONTRACT_STATUS_TONE[status])} aria-hidden="true" />
      {t(`service.contracts.statuses.${status}`, { defaultValue: status })}
    </span>
  )
}
