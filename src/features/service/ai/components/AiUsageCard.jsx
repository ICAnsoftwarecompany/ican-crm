import { useTranslation } from 'react-i18next'
import { useAiUsage } from '../api/aiApi'

const FEATURES = ['triage', 'suggested_reply', 'summaries', 'duplicates', 'smart_assignment', 'agent']

/** This month's AI usage against the limit, per feature, and how often agents accept suggestions. */
export function AiUsageCard() {
  const { t } = useTranslation()
  const usage = useAiUsage()
  const data = usage.data
  if (!data) return null
  const percent = data.limit ? Math.min(100, Math.round((data.used / data.limit) * 100)) : 0
  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.ai.usage.title')}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--text)]">{t('service.ai.usage.title')}</h3>
        <span className="text-sm text-[var(--text)]">{t('service.ai.usage.used', { used: data.used, limit: data.limit })}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={t('service.ai.usage.title')}>
        <div className={percent >= 90 ? 'h-full bg-sla-breached' : 'h-full bg-[var(--ai-color)]'} style={{ width: `${percent}%` }} />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        {FEATURES.map((key) => (
          <div key={key} className="grid">
            <dt className="text-[var(--text-muted)]">{t(`service.ai.features.${key}.label`)}</dt>
            <dd className="font-semibold text-[var(--text)]">
              {data.counts[key] || 0}
              {data.acceptance[key] != null && <span className="ms-1 font-normal text-[var(--text-muted)]">{t('service.ai.usage.accepted', { value: data.acceptance[key] })}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
