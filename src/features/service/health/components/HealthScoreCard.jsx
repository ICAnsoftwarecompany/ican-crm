import { useTranslation } from 'react-i18next'
import { HeartPulse } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { cn } from '../../../../shared/utils/cn'
import { useCustomerHealth } from '../api/healthApi'

export const BAND_TONE = { healthy: 'text-sla-on-track', watch: 'text-sla-at-risk', at_risk: 'text-sla-breached' }

/** Customer drawer: health score with the factors that moved it (the number and words carry meaning, not the color). */
export function HealthScoreCard({ customerId }) {
  const { t } = useTranslation()
  const health = useCustomerHealth(customerId)
  const data = health.data
  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.health.title')}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]"><HeartPulse size={16} className="text-[var(--text-muted)]" aria-hidden="true" />{t('service.health.title')}</h2>
      <ResourceState isLoading={health.isLoading} error={health.error} onRetry={health.refetch}>
        {data && (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--text)]" dir="ltr">{data.score}</span>
              <span className={cn('text-sm font-semibold', BAND_TONE[data.band])}>{t(`service.health.bands.${data.band}`)}</span>
            </div>
            <ul className="grid gap-1 text-sm">
              {data.factors.slice(0, 5).map((factor) => (
                <li key={factor.key} className="flex items-center justify-between gap-2">
                  <span className="text-[var(--text)]">{t(`service.health.factors.${factor.key}`, { value: String(factor.value) })}</span>
                  <span className={cn('text-xs font-semibold', factor.impact > 0 ? 'text-sla-on-track' : 'text-sla-breached')} dir="ltr">{factor.impact > 0 ? `+${factor.impact}` : factor.impact}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--text-muted)]">{t('service.health.hint')}</p>
          </>
        )}
      </ResourceState>
    </section>
  )
}
