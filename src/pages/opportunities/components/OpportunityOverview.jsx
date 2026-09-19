import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Sparkles, Bell, Eye, Rocket, Target, Wallet } from 'lucide-react'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { useOpportunities } from '../../../features/opportunities/hooks/useOpportunities'
import { useOpportunityDrawerStore } from '../../../features/opportunities/store/opportunityDrawerStore'
import { getOpportunitySources } from '../../../features/opportunities/constants/opportunityTypes'
import {
  formatCurrency,
  getOpportunitySourceMeta,
  isHighPotentialOpportunity,
  isOpportunityOverdue,
} from '../../../features/opportunities/utils/opportunityFormatters'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex items-center gap-4">
      <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold font-latin text-[var(--text)]">{value}</p>
        <p className="text-sm text-[var(--text-muted)] font-arabic">{label}</p>
      </div>
    </div>
  )
}

export function OpportunityOverview() {
  const { t, i18n } = useTranslation()
  const opportunitiesQuery = useOpportunities()
  const openDrawer = useOpportunityDrawerStore((state) => state.open)
  const rows = opportunitiesQuery.data || []

  const stats = useMemo(() => {
    const now = Date.now()
    const active = rows.filter((row) => !['dismissed', 'expired'].includes(row.status))

    return {
      new: rows.filter((row) => row.status === 'new').length,
      highPotential: rows.filter(isHighPotentialOpportunity).length,
      needsAttention: rows.filter((row) => isOpportunityOverdue(row, now)).length,
      watching: rows.filter((row) => row.status === 'watching').length,
      activated: rows.filter((row) => row.status === 'activated').length,
      potentialRevenue: active.reduce((sum, row) => sum + (Number(row.estimated_value) || 0), 0),
    }
  }, [rows])

  const topOpportunities = useMemo(() => (
    [...rows]
      .filter((row) => !['dismissed', 'expired'].includes(row.status))
      .sort((a, b) => (Number(b.score?.total) || 0) - (Number(a.score?.total) || 0))
      .slice(0, 5)
  ), [rows])

  const sourceDistribution = useMemo(() => {
    const total = rows.length || 1
    return getOpportunitySources(t)
      .map((source) => {
        const count = rows.filter((row) => row.source?.type === source.value).length
        return { ...source, count, percent: Math.round((count / total) * 100) }
      })
      .filter((source) => source.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [rows, t])

  return (
    <ResourceState
      isLoading={opportunitiesQuery.isLoading}
      error={opportunitiesQuery.error}
      empty={rows.length === 0}
      emptyIcon={<Target size={24} />}
      emptyTitle={t('opportunities.noOpportunities')}
      onRetry={opportunitiesQuery.refetch}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard label={t('opportunities.statuses.new')} value={stats.new} icon={Sparkles} color="#3B82F6" />
        <StatCard label={t('opportunities.highPotential')} value={stats.highPotential} icon={Target} color="#EF4444" />
        <StatCard label={t('opportunities.needsAttention')} value={stats.needsAttention} icon={Bell} color="#F59E0B" />
        <StatCard label={t('opportunities.statuses.watching')} value={stats.watching} icon={Eye} color="#8B5CF6" />
        <StatCard label={t('opportunities.statuses.activated')} value={stats.activated} icon={Rocket} color="#10B981" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0 bg-[#E8F9FA] text-[#007A80]">
            <Wallet size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold font-latin text-[var(--text)]" dir="ltr">{formatCurrency(stats.potentialRevenue, 'EGP', i18n.language)}</p>
            <p className="text-sm text-[var(--text-muted)] font-arabic">{t('opportunities.potentialRevenue')}</p>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
          <h2 className="font-bold text-[var(--text)] mb-3">{t('opportunities.sourceDistribution')}</h2>
          <div className="grid gap-2.5">
            {sourceDistribution.map((source) => (
              <div key={source.value} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-semibold text-[var(--text-muted)] font-arabic">{source.label}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${source.percent}%`, background: source.color }} />
                </div>
                <span className="w-10 shrink-0 text-end text-xs font-bold text-[var(--text)]">{source.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5">
        <h2 className="font-bold text-[var(--text)] mb-3">{t('opportunities.topOpportunities')}</h2>
        <div className="grid gap-2">
          {topOpportunities.map((opportunity) => {
            const sourceMeta = getOpportunitySourceMeta(opportunity.source?.type, t)
            const SourceIcon = sourceMeta.icon

            return (
              <button
                key={opportunity.id}
                type="button"
                onClick={() => openDrawer(opportunity.id)}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-start transition-colors hover:bg-[var(--brand-bg)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${sourceMeta.color}18` }}>
                    {SourceIcon ? <SourceIcon size={16} style={{ color: sourceMeta.color }} /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[var(--text)] truncate">{opportunity.customer?.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{opportunity.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-[var(--text-muted)] font-latin" dir="ltr">
                    {formatCurrency(opportunity.estimated_value, opportunity.currency, i18n.language)}
                  </span>
                  <span className="inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-full bg-[#00C2CB] text-white text-xs font-black font-latin">
                    {opportunity.score?.total}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </ResourceState>
  )
}
