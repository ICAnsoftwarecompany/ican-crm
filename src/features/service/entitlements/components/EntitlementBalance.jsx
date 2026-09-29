import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

export const ENTITLEMENT_TONE = { active: 'text-sla-on-track', exhausted: 'text-sla-breached', expired: 'text-[var(--text-muted)]', suspended: 'text-sla-at-risk' }

/** "Used 3 of 4" with a meter, or "Unlimited". Numbers carry the meaning; the bar is secondary. */
export function EntitlementBalance({ balance, compact = false }) {
  const { t } = useTranslation()
  if (!balance) return null
  if (balance.quota == null) return <span className="text-xs text-[var(--text-muted)]">{t('service.entitlements.unlimited', { used: balance.used })}</span>
  const percent = balance.quota ? Math.min((balance.used / balance.quota) * 100, 100) : 0
  return (
    <span className={cn('grid gap-1', compact ? 'w-28' : 'w-40')}>
      <span className="text-xs text-[var(--text)]">{t('service.entitlements.usedOf', { used: balance.used, quota: balance.quota })}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]" role="meter" aria-valuemin={0} aria-valuemax={balance.quota} aria-valuenow={balance.used} aria-label={t('service.entitlements.usedOf', { used: balance.used, quota: balance.quota })}>
        <span className={cn('block h-full rounded-full', balance.remaining === 0 ? 'bg-sla-breached' : 'bg-[var(--chart-1)]')} style={{ width: `${percent}%` }} />
      </span>
    </span>
  )
}
