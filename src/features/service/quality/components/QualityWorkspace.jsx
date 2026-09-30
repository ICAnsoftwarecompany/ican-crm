import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ClipboardCheck, Shuffle, X } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { cn } from '../../../../shared/utils/cn'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { BarList } from '../../reports/components/BarList'
import { useQualityMutations, useQualityReviews, useQualitySummary } from '../api/qualityApi'
import { QualityReviewDrawer } from './QualityReviewDrawer'

const Panel = ({ title, children }) => (
  <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
    <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
    {children}
  </section>
)

/** Reports → Quality: review queue (sampled + manual), scores per agent and criterion, top root causes. */
export function QualityWorkspace({ period }) {
  const { t, i18n } = useTranslation()
  const summary = useQualitySummary({ period })
  const pending = useQualityReviews({ status: 'pending' })
  const done = useQualityReviews({ status: 'done' })
  const { sample, remove } = useQualityMutations()
  const [open, setOpen] = useState(null)
  const data = summary.data
  const percent = (value) => (value == null ? '–' : t('service.quality.percent', { value }))
  const tiles = [['reviews', data?.reviews], ['pending', data?.pending], ['average', percent(data?.average)], ['pass_rate', percent(data?.pass_rate)]]
  const runSample = () => sample.mutate(undefined, { onSuccess: (result) => toast.success(t('service.quality.sampled', { count: result.created })) })

  const row = (review) => (
    <li key={review.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
      <button type="button" className="grid min-w-0 flex-1 gap-0.5 text-start" onClick={() => setOpen(review)}>
        <span className="truncate text-sm text-[var(--text)]"><span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{review.subject.number}</span> <bdi>{review.subject.title}</bdi></span>
        <span className="text-xs text-[var(--text-muted)]">{[review.agent?.name, t(`service.quality.sources.${review.source.startsWith('qs-') ? 'rule' : review.source}`), formatRelativeTime(review.reviewed_at || review.created_at, i18n.language)].join(' · ')}</span>
      </button>
      {review.status === 'done' ? (
        <span className={cn('text-sm font-semibold', review.passed ? 'text-sla-on-track' : 'text-sla-breached')}>{t('service.quality.percent', { value: review.total })}</span>
      ) : (
        <span className="flex gap-1">
          <Button size="sm" onClick={() => setOpen(review)}><ClipboardCheck size={14} aria-hidden="true" />{t('service.quality.reviewAction')}</Button>
          <Button size="icon" variant="ghost" aria-label={t('service.quality.skip')} title={t('service.quality.skip')} onClick={() => remove.mutate(review.id)}><X size={14} aria-hidden="true" /></Button>
        </span>
      )}
    </li>
  )

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <dl className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map(([key, value]) => (
            <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <dt className="text-xs text-[var(--text-muted)]">{t(`service.quality.kpis.${key}`)}</dt>
              <dd className="mt-1 text-2xl font-bold text-[var(--text)]">{value ?? '–'}</dd>
            </div>
          ))}
        </dl>
        <Button variant="outline" loading={sample.isPending} onClick={runSample}><Shuffle size={16} aria-hidden="true" />{t('service.quality.runSampling')}</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t('service.quality.queue')}>
          <ResourceState isLoading={pending.isLoading} error={pending.error} onRetry={pending.refetch} empty={!pending.data?.length} emptyTitle={t('service.quality.queueEmpty')}>
            <ul className="-mx-4 divide-y divide-[var(--border)]">{(pending.data || []).map(row)}</ul>
          </ResourceState>
        </Panel>
        <Panel title={t('service.quality.byCriterion')}>
          <BarList items={(data?.criteria || []).map((criterion) => ({ key: criterion.key, label: localizeLabel(criterion.label, i18n.language, criterion.key), value: criterion.average || 0 }))} formatValue={(value) => t('service.quality.percent', { value })} emptyText={t('service.quality.noData')} />
        </Panel>
        <Panel title={t('service.quality.byAgent')}>
          {data?.agents?.length ? (
            <table className="w-full text-sm">
              <thead className="text-xs text-[var(--text-muted)]"><tr><th className="pb-2 text-start font-medium">{t('service.reports.agent')}</th><th className="pb-2 text-end font-medium">{t('service.quality.kpis.reviews')}</th><th className="pb-2 text-end font-medium">{t('service.quality.kpis.average')}</th><th className="pb-2 text-end font-medium">{t('service.quality.kpis.pass_rate')}</th></tr></thead>
              <tbody className="text-[var(--text)]">
                {data.agents.map((entry) => (
                  <tr key={entry.agent.id} className="border-t border-[var(--border)]"><td className="py-1.5">{entry.agent.name}</td><td className="py-1.5 text-end">{entry.reviews}</td><td className="py-1.5 text-end">{percent(entry.average)}</td><td className="py-1.5 text-end">{percent(entry.pass_rate)}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="py-6 text-center text-xs text-[var(--text-muted)]">{t('service.quality.noData')}</p>}
        </Panel>
        <Panel title={t('service.quality.rootCausesTitle')}>
          <BarList items={(data?.root_causes || []).map((entry) => ({ key: entry.cause, label: t(`service.quality.rootCauses.${entry.cause}`), value: entry.count }))} emptyText={t('service.quality.noCauses')} />
        </Panel>
      </div>
      <Panel title={t('service.quality.recent')}>
        <ResourceState isLoading={done.isLoading} error={done.error} onRetry={done.refetch} empty={!done.data?.length} emptyTitle={t('service.quality.noData')}>
          <ul className="-mx-4 divide-y divide-[var(--border)]">{(done.data || []).slice(0, 10).map(row)}</ul>
        </ResourceState>
      </Panel>
      <QualityReviewDrawer review={open} onClose={() => setOpen(null)} />
    </div>
  )
}
