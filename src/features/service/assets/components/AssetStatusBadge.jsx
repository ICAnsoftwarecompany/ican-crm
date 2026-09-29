import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

const TONE = { active: 'bg-status-won', in_repair: 'bg-status-contacted', replaced: 'bg-status-qualified', retired: 'bg-[var(--text-muted)]', transferred: 'bg-status-new' }
export const WARRANTY_TONE = { active: 'text-sla-on-track', expired: 'text-[var(--text-muted)]', none: 'text-[var(--text-muted)]', void: 'text-sla-breached' }

export function AssetStatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--text)]">
      <span className={cn('h-2 w-2 rounded-full', TONE[status])} aria-hidden="true" />
      {t(`service.assets.statuses.${status}`, { defaultValue: status })}
    </span>
  )
}
