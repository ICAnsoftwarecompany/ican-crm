import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { BarList } from '../../reports/components/BarList'
import { useAdvancedReport } from '../api/healthApi'
import { AtRiskCustomers } from './AtRiskCustomers'

const Panel = ({ title, children }) => (
  <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
    <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
    {children}
  </section>
)

/** Reports → Advanced (spec §46.3): backlog aging, repeat contact, self-service, AI resolution, workload, follow-ups, health. */
export function AdvancedReport({ period }) {
  const { t } = useTranslation()
  const report = useAdvancedReport(period)
  const data = report.data
  const pct = (value) => (value == null ? '–' : t('service.quality.percent', { value }))
  return (
    <ResourceState isLoading={report.isLoading} error={report.error} onRetry={report.refetch}>
      {data && (
        <div className="grid gap-4">
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['backlog', data.backlog],
              ['repeat', pct(data.repeat_contact_percent)],
              ['deflection', pct(data.self_service.deflection_percent)],
              ['aiResolved', data.ai.conversations ? pct(Math.round((data.ai.resolved_by_ai / data.ai.conversations) * 100)) : '–'],
            ].map(([key, value]) => (
              <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <dt className="text-xs text-[var(--text-muted)]">{t(`service.advanced.kpis.${key}`)}</dt>
                <dd className="mt-1 text-2xl font-bold text-[var(--text)]">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title={t('service.advanced.aging')}>
              <BarList items={data.aging.map((bucket) => ({ key: bucket.key, label: t(`service.advanced.ages.${bucket.key}`), value: bucket.count }))} emptyText={t('service.advanced.noOpen')} />
            </Panel>
            <Panel title={t('service.advanced.workload')}>
              <table className="w-full text-sm">
                <thead className="text-xs text-[var(--text-muted)]"><tr><th className="pb-2 text-start font-medium">{t('service.reports.agent')}</th><th className="pb-2 text-end font-medium">{t('service.advanced.open')}</th><th className="pb-2 text-end font-medium">{t('service.advanced.old')}</th></tr></thead>
                <tbody className="text-[var(--text)]">
                  {data.workload.map((row) => <tr key={row.agent.id} className="border-t border-[var(--border)]"><td className="py-1.5">{row.agent.name}</td><td className="py-1.5 text-end">{row.open}</td><td className="py-1.5 text-end">{row.overdue}</td></tr>)}
                </tbody>
              </table>
            </Panel>
            <Panel title={t('service.advanced.selfService')}>
              <p className="text-sm text-[var(--text)]">{t('service.advanced.selfServiceLine', { deflections: data.self_service.deflections, requests: data.self_service.requests })}</p>
              <p className="text-sm text-[var(--text)]">{t('service.advanced.aiLine', { total: data.ai.conversations, ai: data.ai.resolved_by_ai, handed: data.ai.handed_off })}</p>
            </Panel>
            <Panel title={t('service.advanced.followUps')}>
              <p className="text-sm text-[var(--text)]">{t('service.advanced.followUpsLine', { active: data.follow_ups.active, completed: data.follow_ups.completed })}</p>
              <BarList items={data.follow_ups.outcomes.map((entry) => ({ key: entry.outcome, label: t(`service.followUps.outcomes.${entry.outcome}`, { defaultValue: entry.outcome }), value: entry.count }))} emptyText={t('service.advanced.noOutcomes')} />
            </Panel>
          </div>
          <Panel title={t('service.health.atRisk')}>
            <AtRiskCustomers />
          </Panel>
        </div>
      )}
    </ResourceState>
  )
}
