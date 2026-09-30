import { useTranslation } from 'react-i18next'
import { SearchX } from 'lucide-react'
import { useKbStats } from '../api/knowledgeApi'

/** Self-service health: live articles, views, helpful rate, deflections, and searches that found nothing (content gaps). */
export function KnowledgeStats() {
  const { t } = useTranslation()
  const stats = useKbStats()
  const data = stats.data
  if (!data) return null
  const tiles = [
    ['live', data.live],
    ['views', data.views],
    ['helpful', data.helpful_rate != null ? t('service.knowledge.percent', { value: data.helpful_rate }) : '—'],
    ['deflections', data.deflections_30d],
  ]
  return (
    <section className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-label={t('service.knowledge.stats.title')}>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([key, value]) => (
          <div key={key} className="grid gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <dt className="text-xs text-[var(--text-muted)]">{t(`service.knowledge.stats.${key}`)}</dt>
            <dd className="text-lg font-bold text-[var(--text)]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid content-start gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]"><SearchX size={14} aria-hidden="true" />{t('service.knowledge.stats.gaps')}</span>
        {data.content_gaps.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {data.content_gaps.slice(0, 6).map((gap) => (
              <li key={gap.query} className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--text)]"><bdi>{gap.query}</bdi> · {gap.count}</li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">{t('service.knowledge.stats.noGaps')}</span>
        )}
      </div>
    </section>
  )
}
