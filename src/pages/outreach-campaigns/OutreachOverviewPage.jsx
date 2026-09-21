import { useTranslation } from 'react-i18next'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { useOutreachCampaigns } from '../../features/outreach-campaigns/hooks/useOutreachCampaigns'
import { OutreachOverviewContent } from '../../features/outreach-campaigns/components/OutreachOverviewContent'

export function OutreachOverviewPage() {
  const { t } = useTranslation()
  const query = useOutreachCampaigns()
  const campaigns = query.campaigns || []

  return (
    <div className="space-y-5">
      <PageToolbar title={t('outreachCampaigns.navigation.overview')} description={t('outreachCampaigns.pageDescription')} />
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch}>
        <OutreachOverviewContent campaigns={campaigns} />
      </ResourceState>
    </div>
  )
}
