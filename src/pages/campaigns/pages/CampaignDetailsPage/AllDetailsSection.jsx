import { CampaignOverviewSection } from './CampaignOverviewSection'
import { AdSetsSection } from './AdSetsSection'
import { AdPerformanceSection } from './AdPerformanceSection'

export function AllDetailsSection({
  t,
  i18n,
  campaign,
  campaignsQuery,
  adSets,
  adSetsQuery,
  activeAdSetId,
  onSelectAdSet,
  insightsQuery,
}) {
  return (
    <div className="grid gap-4">
      <CampaignOverviewSection t={t} i18n={i18n} campaign={campaign} campaignsQuery={campaignsQuery} />
      <AdSetsSection
        t={t}
        i18n={i18n}
        adSets={adSets}
        adSetsQuery={adSetsQuery}
        activeAdSetId={activeAdSetId}
        onSelect={onSelectAdSet}
        campaign={campaign}
      />
      <AdPerformanceSection t={t} i18n={i18n} activeAdSetId={activeAdSetId} insightsQuery={insightsQuery} />
    </div>
  )
}
