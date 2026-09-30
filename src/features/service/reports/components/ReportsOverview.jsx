import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { formatMinutes } from '../../settings/resources/resourceHelpers'
import { useReportOverview } from '../api/reportsApi'
import { BarList } from './BarList'
import { KpiTiles } from './KpiTiles'
import { TrendChart } from './TrendChart'

function Panel({ title, children, className }) {
  return (
    <section className={`grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 ${className || ''}`}>
      <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  )
}

/** Overview dashboard for one period: KPIs, trend, breakdowns, CSAT, agents. */
export function ReportsOverview({ period }) {
  const { t, i18n } = useTranslation()
  const report = useReportOverview(period)
  const data = report.data
  const empty = t('service.reports.noData')

  return (
    <ResourceState isLoading={report.isLoading} error={report.error} onRetry={report.refetch}>
      {data && (
        <div className="grid gap-4">
          <KpiTiles report={data} />
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel title={t('service.reports.trendTitle')} className="xl:col-span-2">
              <TrendChart data={data.trend} />
            </Panel>
            <Panel title={t('service.reports.csatTitle')}>
              <BarList
                emptyText={empty}
                items={[...(data.csat?.distribution || [])].reverse().map((entry) => ({ key: String(entry.score), label: t('service.reports.stars', { count: entry.score }), value: entry.count }))}
              />
            </Panel>
            <Panel title={t('service.reports.byType')}>
              <BarList emptyText={empty} items={data.by_type.map((entry) => ({ key: entry.type.id, label: localizeLabel(entry.type.label, i18n.language, entry.type.key), value: entry.count }))} />
            </Panel>
            <Panel title={t('service.reports.byChannel')}>
              <BarList emptyText={empty} items={data.by_channel.map((entry) => ({ key: entry.channel, label: t(`service.cases.channels.${entry.channel}`, { defaultValue: entry.channel }), value: entry.count }))} />
            </Panel>
            <Panel title={t('service.reports.byAgent')}>
              {data.by_agent.length ? (
                <table className="w-full text-xs">
                  <thead className="text-[var(--text-muted)]">
                    <tr>
                      <th className="pb-2 text-start font-medium">{t('service.reports.agent')}</th>
                      <th className="pb-2 text-end font-medium">{t('service.reports.series.resolved')}</th>
                      <th className="pb-2 text-end font-medium">{t('service.reports.kpis.avg_resolution')}</th>
                      <th className="pb-2 text-end font-medium">{t('service.reports.kpis.csat')}</th>
                      <th className="pb-2 text-end font-medium">{t('service.quality.kpis.average')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--text)]">
                    {data.by_agent.map((row) => (
                      <tr key={row.agent.id} className="border-t border-[var(--border)]">
                        <td className="py-1.5">{row.agent.name}</td>
                        <td className="py-1.5 text-end" dir="ltr">{row.resolved}</td>
                        <td className="py-1.5 text-end">{row.avg_resolution_minutes == null ? '–' : formatMinutes(row.avg_resolution_minutes, t)}</td>
                        <td className="py-1.5 text-end" dir="ltr">{row.csat_average ?? '–'}</td>
                        <td className="py-1.5 text-end" dir="ltr">{row.quality_average == null ? '–' : `${row.quality_average}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="py-6 text-center text-xs text-[var(--text-muted)]">{empty}</p>
              )}
            </Panel>
          </div>
        </div>
      )}
    </ResourceState>
  )
}
