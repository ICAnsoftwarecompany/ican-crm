import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { KpiRow, ReportChart } from '../../../../shared/components/reports'
import { Button } from '../../../../shared/components/ui/Button'
import { formatRelativeTime } from '../../../../shared/utils/dateTime'
import { useDealAnalytics } from '../../hooks/useDealAnalytics'
import { useDealAnalyticsView } from '../../hooks/useDealAnalyticsView'
import { DealStatusBadge } from '../common/DealStatusBadge'
import { ProgressBar } from '../common/ProgressBar'
import { DealOwnersTable } from './DealOwnersTable'

/**
 * Full backend overview of one deal (Overview page tab): stats, targets and time, stages funnel, lead status share,
 * owners. Shows the saved numbers at once and refreshes them (useDealAnalytics).
 */
export function DealAnalyticsPanel({ dealId, fallbackName }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const analytics = useDealAnalytics(dealId)
  const view = useDealAnalyticsView(analytics)
  const { overview } = analytics

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <span className="truncate">{overview?.deal.name || fallbackName || `#${dealId}`}</span>
            {overview?.deal.status && <DealStatusBadge status={overview.deal.status} />}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {overview?.deal.startDate && <><span dir="ltr">{overview.deal.startDate} → {overview.deal.endDate || '—'}</span>{' · '}</>}
            {analytics.updatedAt ? t('dealWorkspace.analytics.updated', { time: formatRelativeTime(analytics.updatedAt, i18n.language) }) : t('dealWorkspace.common.loading')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => analytics.refetch()} disabled={analytics.isFetching}>
            <RefreshCw size={14} className={analytics.isFetching ? 'animate-spin' : ''} />{t('dealWorkspace.analytics.refresh')}
          </Button>
          <Button size="sm" onClick={() => navigate(`/deals/${dealId}`)}><ExternalLink size={14} />{t('dealWorkspace.analytics.openDeal')}</Button>
        </div>
      </div>

      <ResourceState isLoading={analytics.isLoading} error={analytics.error} onRetry={analytics.refetch} empty={!overview} emptyTitle={t('dealWorkspace.analytics.emptyTitle')} emptyDescription={t('dealWorkspace.analytics.emptyDescription')}>
        {overview && (
          <div className="space-y-4">
            <KpiRow items={view.leadKpis} />
            <KpiRow items={view.moneyKpis} />
            <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-3">
              <ProgressBar value={overview.stats.leadsProgress ?? 0} label={<><span>{t('dealWorkspace.analytics.progress.leads')}</span><span dir="ltr">{overview.stats.total} / {overview.deal.targetLeads ?? '—'}</span></>} />
              <ProgressBar value={overview.stats.achievement ?? 0} label={<><span>{t('dealWorkspace.analytics.progress.revenue')}</span><span dir="ltr">{view.percent(overview.stats.achievement)}</span></>} />
              <ProgressBar value={view.time?.elapsedPercent ?? 0} label={<><span>{t('dealWorkspace.analytics.progress.time')}</span><span dir="ltr">{view.time ? `${view.time.elapsedPercent}%` : '—'}</span></>} />
            </section>
            <div className="grid gap-4 xl:grid-cols-2">
              {view.charts.slice(0, 2).map((chart) => <ReportChart key={chart.id} chart={chart} />)}
            </div>
            <DealOwnersTable owners={analytics.owners} isLoading={analytics.ownersLoading} error={analytics.ownersError} onRetry={analytics.refetch} />
          </div>
        )}
      </ResourceState>
    </div>
  )
}
