import { BarChart3, Megaphone, Plus, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCampaignCenter } from '../../../features/campaigns'
import { useFacebookCampaigns, useFacebookCampaignMutations } from '../../../features/campaigns/facebook-campaign'
import { Button } from '../../../shared/components/ui/Button'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { CampaignUnavailableState } from '../components/CampaignUnavailableState'
import { CampaignPageHeading } from '../components/CampaignPageHeading'
import { CampaignListTable } from '../components/CampaignListTable'

export function CampaignOverviewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const context = useCampaignCenter()
  const canLoad = context.provider.configured && context.connectionStatus === 'connected'
  const query = useFacebookCampaigns({ tenantId: context.tenantId, accountId: context.accountId, enabled: context.platform.id === 'meta' && canLoad })
  const mutations = useFacebookCampaignMutations(context)
  if (!context.provider.configured) return <CampaignUnavailableState reason="unavailable" />
  if (context.connectionStatus !== 'connected') return <CampaignUnavailableState reason="disconnected" />
  const campaigns = query.data || []
  const activeCount = campaigns.filter((campaign) => String(campaign.status).toLowerCase() === 'active').length
  return (
    <div>
      <CampaignPageHeading title={t('campaigns.overview.title')} description={t('campaigns.overview.description')} actions={<><Button variant="outline" onClick={() => mutations.sync.mutate()} loading={mutations.sync.isPending}><RefreshCw size={15} />{t('campaigns.center.sync')}</Button><Button onClick={() => navigate(`/campaigns/${context.platform.id}/create`)}><Plus size={15} />{t('campaigns.center.nav.create')}</Button></>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={t('campaigns.metrics.totalCampaigns')} value={campaigns.length} icon={<Megaphone size={17} />} />
        <Metric label={t('campaigns.metrics.activeCampaigns')} value={activeCount} icon={<BarChart3 size={17} />} />
        <Metric label={t('campaigns.metrics.spend')} value={t('campaigns.metrics.notAvailable')} />
        <Metric label={t('campaigns.metrics.results')} value={t('campaigns.metrics.notAvailable')} />
      </div>
      <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
        <h3 className="mb-3 font-bold text-[var(--text)]">{t('campaigns.overview.recentCampaigns')}</h3>
        <ResourceState isLoading={query.isLoading} error={query.error} empty={campaigns.length === 0} emptyIcon={<Megaphone size={24} />} emptyTitle={t('campaigns.noCampaigns')} onRetry={query.refetch}>
          <CampaignListTable campaigns={campaigns.slice(0, 10)} platformId={context.platform.id} tableId="campaign-overview" onRowClick={(row) => navigate(`/campaigns/${context.platform.id}/${row.id}`)} />
        </ResourceState>
      </section>
    </div>
  )
}

function Metric({ label, value, icon }) {
  return <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3"><div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">{icon}{label}</div><div className="mt-2 text-xl font-bold text-[var(--text)]">{value}</div></div>
}
