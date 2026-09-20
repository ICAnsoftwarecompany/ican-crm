import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { Badge } from '../../../../shared/components/ui/Badge'
import { displayValue } from '../../../../shared/utils/apiResponse'
import { getCampaignResultCount } from '../../../../features/campaigns/facebook-campaign'
import { formatDate, formatNumber, formatPercent, formatCurrencyValue } from '../../utils/campaignFormatters'
import { Metric } from './Metric'
import { LatinValue } from './LatinValue'

export function CampaignOverviewSection({ t, i18n, campaign, campaignsQuery }) {
  const resultCount = campaign ? getCampaignResultCount(campaign) : null

  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="mb-3 font-bold text-[var(--text)]">{t('campaigns.details.basics')}</h3>
      <ResourceState
        isLoading={campaignsQuery.isLoading}
        error={campaignsQuery.error}
        empty={!campaignsQuery.isLoading && !campaign}
        emptyTitle={t('campaigns.noCampaigns')}
        onRetry={campaignsQuery.refetch}
      >
        {campaign && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label={t('campaigns.columns.status')} value={<Badge variant={String(campaign.status).toLowerCase() === 'active' ? 'success' : 'default'}>{displayValue(campaign.status)}</Badge>} />
            <Metric label={t('campaigns.columns.objective')} value={displayValue(campaign.objective)} />
            <Metric label={t('campaigns.columns.page')} value={displayValue(campaign.page_name)} />
            <Metric label={t('campaigns.columns.budget')} value={campaign.daily_budget || campaign.lifetime_budget ? <LatinValue>{formatCurrencyValue(campaign.daily_budget ?? campaign.lifetime_budget, campaign.account_currency, i18n.language)}</LatinValue> : t('campaigns.metrics.notAvailable')} />
            <Metric label={t('campaigns.columns.spend')} value={<LatinValue>{formatCurrencyValue(campaign.spend, campaign.account_currency, i18n.language)}</LatinValue>} />
            <Metric label={t('campaigns.columns.impressions')} value={<LatinValue>{formatNumber(campaign.impressions, i18n.language)}</LatinValue>} />
            <Metric label={t('campaigns.columns.reach')} value={<LatinValue>{formatNumber(campaign.reach, i18n.language)}</LatinValue>} />
            <Metric label={t('campaigns.columns.ctr')} value={<LatinValue>{formatPercent(campaign.ctr)}</LatinValue>} />
            <Metric label={t('campaigns.columns.results')} value={resultCount === null ? t('campaigns.metrics.notAvailable') : <LatinValue>{formatNumber(resultCount, i18n.language)}</LatinValue>} />
            <Metric label={t('campaigns.columns.startDate')} value={<LatinValue>{formatDate(campaign.start_time, i18n.language)}</LatinValue>} />
            <Metric label={t('campaigns.columns.endDate')} value={<LatinValue>{formatDate(campaign.stop_time, i18n.language)}</LatinValue>} />
          </div>
        )}
      </ResourceState>
    </section>
  )
}
