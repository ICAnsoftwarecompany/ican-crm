import { BarChart3 } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { getActionTypeLabel } from '../../../../features/campaigns/facebook-campaign'
import { formatDate, formatNumber, formatPercent, formatDecimal, formatCurrencyValue } from '../../utils/campaignFormatters'
import { Metric } from './Metric'
import { LatinValue } from './LatinValue'
import { ActionList } from './ActionList'

export function AdPerformanceSection({ t, i18n, activeAdSetId, insightsQuery }) {
  const insight = insightsQuery.data
  const actions = Array.isArray(insight?.actions)
    ? [...insight.actions].sort((a, b) => Number(b.value) - Number(a.value)).map((item) => ({ ...item, label: getActionTypeLabel(item.action_type, t) }))
    : []
  const costPerAction = Array.isArray(insight?.cost_per_action_type)
    ? insight.cost_per_action_type.map((item) => ({ ...item, label: getActionTypeLabel(item.action_type, t) }))
    : []
  const hasVideoMetrics = Boolean(insight?.video_play_actions?.length)

  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="mb-1 font-bold text-[var(--text)]">{t('campaigns.details.performance')}</h3>
      {!activeAdSetId ? (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('campaigns.details.selectAdSet')}</p>
      ) : (
        <div className="mt-3">
          <ResourceState
            isLoading={insightsQuery.isLoading}
            error={insightsQuery.error}
            empty={!insightsQuery.isLoading && !insight}
            emptyIcon={<BarChart3 size={24} />}
            emptyTitle={t('campaigns.details.noInsights')}
            onRetry={insightsQuery.refetch}
          >
            {insight && (
              <div className="grid gap-4">
                {(insight.date_start || insight.date_stop) && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {t('campaigns.details.reportingPeriod')}: <span dir="ltr">{formatDate(insight.date_start, i18n.language)} – {formatDate(insight.date_stop, i18n.language)}</span>
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label={t('campaigns.columns.impressions')} value={<LatinValue>{formatNumber(insight.impressions, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.columns.reach')} value={<LatinValue>{formatNumber(insight.reach, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.frequency')} value={<LatinValue>{formatDecimal(insight.frequency)}</LatinValue>} />
                  <Metric label={t('campaigns.columns.spend')} value={<LatinValue>{formatCurrencyValue(insight.spend, insight.account_currency, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.cpm')} value={<LatinValue>{formatCurrencyValue(insight.cpm, insight.account_currency, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.cpc')} value={<LatinValue>{formatCurrencyValue(insight.cpc, insight.account_currency, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.costPerUniqueClick')} value={<LatinValue>{formatCurrencyValue(insight.cost_per_unique_click, insight.account_currency, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.clicks')} value={<LatinValue>{formatNumber(insight.clicks, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.uniqueClicks')} value={<LatinValue>{formatNumber(insight.unique_clicks, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.columns.ctr')} value={<LatinValue>{formatPercent(insight.ctr)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.uniqueCtr')} value={<LatinValue>{formatPercent(insight.unique_ctr)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.inlineLinkClicks')} value={<LatinValue>{formatNumber(insight.inline_link_clicks, i18n.language)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.inlineLinkClickCtr')} value={<LatinValue>{formatPercent(insight.inline_link_click_ctr)}</LatinValue>} />
                  <Metric label={t('campaigns.insights.postEngagement')} value={<LatinValue>{formatNumber(insight.inline_post_engagement, i18n.language)}</LatinValue>} />
                </div>

                {actions.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-[var(--text)]">{t('campaigns.details.actionsBreakdown')}</h4>
                    <ActionList items={actions} renderValue={(value) => formatNumber(value, i18n.language)} />
                  </div>
                )}

                {costPerAction.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-[var(--text)]">{t('campaigns.details.costPerAction')}</h4>
                    <ActionList items={costPerAction} renderValue={(value) => formatCurrencyValue(value, insight.account_currency, i18n.language)} />
                  </div>
                )}

                {hasVideoMetrics && (
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-[var(--text)]">{t('campaigns.details.videoPerformance')}</h4>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <Metric label={t('campaigns.video.plays')} value={<LatinValue>{formatNumber(insight.video_play_actions?.[0]?.value, i18n.language)}</LatinValue>} />
                      <Metric label={t('campaigns.video.avgWatchTime')} value={<LatinValue>{formatNumber(insight.video_avg_time_watched_actions?.[0]?.value, i18n.language)}</LatinValue>} />
                      <Metric label={t('campaigns.video.watched25')} value={<LatinValue>{formatNumber(insight.video_p25_watched_actions?.[0]?.value, i18n.language)}</LatinValue>} />
                      <Metric label={t('campaigns.video.watched50')} value={<LatinValue>{formatNumber(insight.video_p50_watched_actions?.[0]?.value, i18n.language)}</LatinValue>} />
                      <Metric label={t('campaigns.video.watched75')} value={<LatinValue>{formatNumber(insight.video_p75_watched_actions?.[0]?.value, i18n.language)}</LatinValue>} />
                      <Metric label={t('campaigns.video.watched95')} value={<LatinValue>{formatNumber(insight.video_p95_watched_actions?.[0]?.value, i18n.language)}</LatinValue>} />
                      <Metric label={t('campaigns.video.watched100')} value={<LatinValue>{formatNumber(insight.video_p100_watched_actions?.[0]?.value, i18n.language)}</LatinValue>} />
                      <Metric label={t('campaigns.video.watched30Sec')} value={<LatinValue>{formatNumber(insight.video_30_sec_watched_actions?.[0]?.value, i18n.language)}</LatinValue>} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ResourceState>
        </div>
      )}
    </section>
  )
}
