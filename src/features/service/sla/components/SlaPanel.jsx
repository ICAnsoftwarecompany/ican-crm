import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { formatDate, formatRelativeTime } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { SLA_BG_TONE, SLA_TEXT_TONE } from '../utils/slaState'
import { SlaBadge } from './SlaBadge'

function MetricRow({ name, metric, paused }) {
  const { t, i18n } = useTranslation()
  if (!metric) return null
  const state = paused && !metric.completed_at ? 'paused' : metric.state
  const percent = Math.min(100, metric.elapsed_percent ?? 0)
  let when
  if (metric.completed_at) when = t('service.sla.completedAt', { time: formatDate(metric.completed_at, i18n.language, { dateStyle: 'medium', timeStyle: 'short' }) })
  else if (state === 'paused') when = t('service.sla.pausedHint')
  else when = t('service.sla.dueAt', { time: formatRelativeTime(metric.due_at, i18n.language) })

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-[var(--text)]">{t(`service.sla.metrics.${name}`)}</span>
        <span className={cn('font-medium', SLA_TEXT_TONE[state])}>{t(`service.sla.states.${state}`)}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"
        role="progressbar"
        aria-label={t(`service.sla.metrics.${name}`)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={cn('h-full rounded-full', SLA_BG_TONE[state])} style={{ width: `${Math.max(percent, 2)}%` }} />
      </div>
      <p className="text-[11px] text-[var(--text-muted)]">{when}</p>
    </div>
  )
}

/** SLA block for the case detail side panel. */
export function SlaPanel({ sla }) {
  const { t, i18n } = useTranslation()
  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.sla.title')}</h2>
        {sla && <SlaBadge sla={sla} showState />}
      </header>
      {sla ? (
        <>
          <MetricRow name="first_response" metric={sla.first_response} paused={sla.state === 'paused'} />
          <MetricRow name="resolution" metric={sla.resolution} paused={sla.state === 'paused'} />
          <p className="text-[11px] text-[var(--text-muted)]">
            {t('service.sla.policy', { name: localizeLabel(sla.policy?.name, i18n.language, '-') })}
          </p>
        </>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">{t('service.sla.none')}</p>
      )}
    </section>
  )
}
