import { useTranslation } from 'react-i18next'

/** NPS (promoters − detractors) or CES (average ease, % easy) for the period. Numbers carry the meaning; bars echo them. */
export function SurveySummary({ type, summary }) {
  const { t } = useTranslation()
  if (!summary?.count) return null
  if (type === 'nps') {
    const parts = [['promoters', 'bg-sla-on-track'], ['passives', 'bg-[var(--text-muted)]'], ['detractors', 'bg-sla-breached']]
    return (
      <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center" aria-label={t('service.feedback.types.nps')}>
        <div className="grid">
          <span className="text-xs text-[var(--text-muted)]">{t('service.feedback.nps.score')}</span>
          <span className="text-3xl font-bold text-[var(--text)]" dir="ltr">{summary.score > 0 ? `+${summary.score}` : summary.score}</span>
          <span className="text-xs text-[var(--text-muted)]">{t('service.feedback.answers', { count: summary.count })}</span>
        </div>
        <div className="grid gap-2">
          <div className="flex h-3 overflow-hidden rounded-full bg-[var(--surface-2)]" aria-hidden="true">
            {parts.map(([key, tone]) => <div key={key} className={tone} style={{ width: `${(summary[key] / summary.count) * 100}%` }} />)}
          </div>
          <dl className="grid grid-cols-3 gap-2 text-xs">
            {parts.map(([key]) => (
              <div key={key} className="grid"><dt className="text-[var(--text-muted)]">{t(`service.feedback.nps.${key}`)}</dt><dd className="font-semibold text-[var(--text)]">{summary[key]} · {Math.round((summary[key] / summary.count) * 100)}%</dd></div>
            ))}
          </dl>
        </div>
      </section>
    )
  }
  return (
    <section className="grid grid-cols-3 gap-3" aria-label={t('service.feedback.types.ces')}>
      {[['average', `${summary.average} / 7`], ['easy', `${summary.easy_percent}%`], ['count', summary.count]].map(([key, value]) => (
        <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">{t(`service.feedback.ces.${key}`)}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--text)]" dir="ltr">{value}</p>
        </div>
      ))}
    </section>
  )
}
