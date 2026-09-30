import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { ActivityStats, isOverdueActivity, useActivities, useActivityStatistics } from '../../activities'
import { buildAssigneeBreakdown, countBy } from '../utils/activityReport'

const LIST_PARAMS_BY_TYPE = {
  call: { type: 'call', per_page: 200 },
  meeting: { type: 'meeting', per_page: 200 },
}

function BreakdownCard({ title, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="mb-3 text-sm font-bold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  )
}

/** Reports for one activity type ('call' | 'meeting'), aggregated client-side from the list API. */
export function ActivityReports({ type }) {
  const { t } = useTranslation()
  const query = useActivities(LIST_PARAMS_BY_TYPE[type])
  const activities = useMemo(() => {
    const list = Array.isArray(query.data?.data) ? query.data.data : []
    return list.filter((activity) => activity.type === type)
  }, [query.data, type])
  const stats = useActivityStatistics(activities)
  const byAssignee = useMemo(() => buildAssigneeBreakdown(activities, isOverdueActivity), [activities])
  const byPriority = useMemo(() => countBy(activities, (activity) => activity.priority), [activities])

  return (
    <ResourceState
      isLoading={query.isLoading}
      error={query.error}
      onRetry={query.refetch}
      empty={!activities.length}
      emptyIcon={<BarChart3 size={24} />}
      emptyTitle={t('communication.reports.emptyTitle')}
      emptyDescription={t('communication.reports.emptyDescription')}
    >
      <div className="space-y-4">
        <ActivityStats stats={stats} />

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <BreakdownCard title={t('communication.reports.byAssignee')}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-start text-xs text-[var(--text-light)]">
                      <th className="py-2 text-start font-bold">{t('communication.reports.columns.assignee')}</th>
                      <th className="py-2 text-start font-bold">{t('communication.reports.columns.total')}</th>
                      <th className="py-2 text-start font-bold">{t('communication.reports.columns.completed')}</th>
                      <th className="py-2 text-start font-bold">{t('communication.reports.columns.overdue')}</th>
                      <th className="py-2 text-start font-bold">{t('communication.reports.columns.completionRate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byAssignee.map((row) => (
                      <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 text-[var(--text)]">{row.name || t('communication.reports.unassigned')}</td>
                        <td className="py-2 font-latin text-[var(--text)]">{row.total}</td>
                        <td className="py-2 font-latin text-[var(--text)]">{row.completed}</td>
                        <td className="py-2 font-latin text-[var(--text)]">{row.overdue}</td>
                        <td className="py-2 font-latin text-[var(--text)]">{row.completionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BreakdownCard>
          </div>

          <BreakdownCard title={t('communication.reports.byPriority')}>
            <ul className="space-y-2">
              {byPriority.map((row) => (
                <li key={row.key || 'none'} className="flex items-center justify-between rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm">
                  <span className="text-[var(--text)]">
                    {row.key ? t(`activities.priority.${row.key}`, { defaultValue: row.key }) : t('communication.reports.noPriority')}
                  </span>
                  <span className="font-latin font-bold text-[var(--text)]">{row.count}</span>
                </li>
              ))}
            </ul>
          </BreakdownCard>
        </div>

        <p className="text-xs text-[var(--text-light)]">{t('communication.reports.clientSideNote')}</p>
      </div>
    </ResourceState>
  )
}
