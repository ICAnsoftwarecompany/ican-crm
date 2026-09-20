import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCampaignCenter } from '../../../../features/campaigns'
import { useFacebookCampaigns, useFacebookAdSets, useFacebookAdSetInsights } from '../../../../features/campaigns/facebook-campaign'
import { displayValue } from '../../../../shared/utils/apiResponse'
import { CampaignUnavailableState } from '../../components/CampaignUnavailableState'
import { CampaignPageHeading } from '../../components/CampaignPageHeading'
import { CampaignPicker } from './CampaignPicker'
import { StageNav } from './StageNav'
import { AllDetailsSection } from './AllDetailsSection'
import { CampaignOverviewSection } from './CampaignOverviewSection'
import { AdSetsSection } from './AdSetsSection'
import { AdPerformanceSection } from './AdPerformanceSection'

export function CampaignDetailsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { campaignId } = useParams()
  const context = useCampaignCenter()
  const canLoad = context.provider.configured && context.connectionStatus === 'connected'
  const enabled = context.platform.id === 'meta' && canLoad

  const campaignsQuery = useFacebookCampaigns({ tenantId: context.tenantId, accountId: context.accountId, enabled })
  const campaigns = campaignsQuery.data || []
  const campaign = useMemo(
    () => campaigns.find((row) => String(row.id) === String(campaignId)) || null,
    [campaigns, campaignId],
  )

  const adSetsQuery = useFacebookAdSets({ tenantId: context.tenantId, accountId: context.accountId, campaignId, enabled })
  const adSets = adSetsQuery.data || []

  const [selectedAdSetId, setSelectedAdSetId] = useState(null)
  const activeAdSetId = selectedAdSetId || adSets[0]?.id || null

  const insightsQuery = useFacebookAdSetInsights({
    tenantId: context.tenantId,
    accountId: context.accountId,
    adSetId: activeAdSetId,
    enabled: enabled && Boolean(activeAdSetId),
  })

  const [activeStage, setActiveStage] = useState('all')

  if (!context.provider.configured) return <CampaignUnavailableState reason="unavailable" />
  if (context.connectionStatus !== 'connected') return <CampaignUnavailableState reason="disconnected" />

  return (
    <div className="grid gap-4">
      <CampaignPageHeading
        title={displayValue(campaign?.name, t('campaigns.details.title', { id: campaignId }))}
        description={t('campaigns.details.description')}
      />

      {campaigns.length > 0 && (
        <CampaignPicker
          t={t}
          i18n={i18n}
          campaigns={campaigns}
          activeCampaignId={campaignId}
          onSelect={(id) => {
            setSelectedAdSetId(null)
            navigate(`/campaigns/${context.platform.id}/${id}`)
          }}
        />
      )}

      <StageNav t={t} activeStage={activeStage} onSelect={setActiveStage} />

      {activeStage === 'all' && (
        <AllDetailsSection
          t={t}
          i18n={i18n}
          campaign={campaign}
          campaignsQuery={campaignsQuery}
          adSets={adSets}
          adSetsQuery={adSetsQuery}
          activeAdSetId={activeAdSetId}
          onSelectAdSet={setSelectedAdSetId}
          insightsQuery={insightsQuery}
        />
      )}

      {activeStage === 'campaign' && (
        <CampaignOverviewSection t={t} i18n={i18n} campaign={campaign} campaignsQuery={campaignsQuery} />
      )}

      {activeStage === 'adset' && (
        <AdSetsSection
          t={t}
          i18n={i18n}
          adSets={adSets}
          adSetsQuery={adSetsQuery}
          activeAdSetId={activeAdSetId}
          onSelect={setSelectedAdSetId}
          campaign={campaign}
        />
      )}

      {activeStage === 'ad' && (
        <AdPerformanceSection t={t} i18n={i18n} activeAdSetId={activeAdSetId} insightsQuery={insightsQuery} />
      )}
    </div>
  )
}
