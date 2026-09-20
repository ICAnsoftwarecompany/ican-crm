import { Megaphone, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCampaignCenter } from '../../../features/campaigns'
import { useFacebookCampaigns, useFacebookCampaignMutations } from '../../../features/campaigns/facebook-campaign'
import { Button } from '../../../shared/components/ui/Button'
import { ResourceState } from '../../../shared/components/data/ResourceState'
import { CampaignUnavailableState } from '../components/CampaignUnavailableState'
import { CampaignPageHeading } from '../components/CampaignPageHeading'
import { CampaignListTable } from '../components/CampaignListTable'

export function CampaignListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const context = useCampaignCenter()
  const enabled = context.provider.configured && context.connectionStatus === 'connected' && context.platform.id === 'meta'
  const query = useFacebookCampaigns({ tenantId: context.tenantId, accountId: context.accountId, enabled })
  const mutations = useFacebookCampaignMutations(context)
  if (!context.provider.configured) return <CampaignUnavailableState reason="unavailable" />
  if (context.connectionStatus !== 'connected') return <CampaignUnavailableState reason="disconnected" />
  const campaigns = query.data || []
  return <div><CampaignPageHeading title={t('campaigns.list.title')} description={t('campaigns.list.description')} actions={<Button variant="outline" onClick={() => mutations.sync.mutate()} loading={mutations.sync.isPending}><RefreshCw size={15} />{t('campaigns.center.sync')}</Button>} /><ResourceState isLoading={query.isLoading} error={query.error} empty={campaigns.length === 0} emptyIcon={<Megaphone size={24} />} emptyTitle={t('campaigns.noCampaigns')} onRetry={query.refetch}><CampaignListTable campaigns={campaigns} platformId={context.platform.id} onRowClick={(row) => navigate(`/campaigns/${context.platform.id}/${row.id}`)} /></ResourceState></div>
}
