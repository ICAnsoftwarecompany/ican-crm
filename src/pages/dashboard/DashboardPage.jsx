import { useTranslation } from 'react-i18next'
import { RefreshCcw, Users, TrendingUp, MessageSquare, Megaphone, UsersRound } from 'lucide-react'
import { Button } from '../../shared/components/ui/Button'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { useSalesDashboard } from '../../features/analytics/hooks/useSalesDashboard'

export function DashboardPage() {
  const { t } = useTranslation()
  const { myLeads, myTeams, isLoading, error, refetch } = useSalesDashboard()
  const leads = myLeads.data || []
  const teams = myTeams.data || []
  const contacted = leads.filter((lead) => String(lead.status || lead.status_name || '').toLowerCase().includes('contact')).length

  const kpis = [
    { label: t('dashboard.totalLeads'), value: leads.length, icon: Users, color: '#3B82F6' },
    { label: t('dashboard.converted'), value: contacted, icon: TrendingUp, color: '#10B981' },
    { label: t('dashboard.activeConversations'), value: '—', icon: MessageSquare, color: '#8B5CF6' },
    { label: t('nav.teams'), value: teams.length, icon: UsersRound, color: '#F59E0B' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold font-arabic text-[var(--text)]">{t('dashboard.title')}</h1>
        <Button variant="outline" onClick={refetch}>
          <RefreshCcw size={16} />
          {t('common.retry')}
        </Button>
      </div>

      <ResourceState isLoading={isLoading} error={error} onRetry={refetch}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-5 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + '18' }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold font-latin text-[var(--text)]">{value}</p>
                <p className="text-sm text-[var(--text-muted)] font-arabic">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 min-h-64">
            <h2 className="font-bold font-arabic text-[var(--text)] mb-4">أحدث العملاء المحتملين</h2>
            <div className="space-y-3">
              {leads.slice(0, 6).map((lead, index) => (
                <div key={lead.id || index} className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0">
                  <div>
                    <p className="font-medium font-arabic text-[var(--text)]">{lead.name || lead.customer_name || `Lead #${lead.id || index + 1}`}</p>
                    <p className="text-xs text-[var(--text-muted)]">{lead.phone || lead.source || '—'}</p>
                  </div>
                  <span className="text-xs rounded-full bg-[#E8F9FA] text-[#007A80] px-2 py-1">{lead.status || lead.status_name || 'new'}</span>
                </div>
              ))}
              {leads.length === 0 && <p className="text-sm text-[var(--text-muted)]">لا توجد بيانات Leads متاحة من API حاليا.</p>}
            </div>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 min-h-64">
            <h2 className="font-bold font-arabic text-[var(--text)] mb-4">فرقي</h2>
            <div className="grid gap-3">
              {teams.slice(0, 6).map((team, index) => (
                <div key={team.id || index} className="rounded-lg bg-[var(--surface-2)] p-3">
                  <p className="font-medium font-arabic text-[var(--text)]">{team.name || `Team #${team.id || index + 1}`}</p>
                  <p className="text-xs text-[var(--text-muted)]">القائد: {team.team_leader_name || team.leader_name || '—'}</p>
                </div>
              ))}
              {teams.length === 0 && <p className="text-sm text-[var(--text-muted)]">لا توجد Teams متاحة من API حاليا.</p>}
            </div>
          </div>
        </div>
      </ResourceState>
    </div>
  )
}
