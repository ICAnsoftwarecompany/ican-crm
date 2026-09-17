import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'

const METRICS_BY_CHANNEL = {
  whatsapp: ['sent', 'delivered', 'read', 'replied'],
  gmail: ['sent', 'delivered', 'opened', 'clicked', 'replied'],
  messenger: ['sent', 'delivered', 'read', 'replied'],
}

/**
 * No analytics/delivery-tracking endpoint exists today (see docs "Backend
 * Gaps"). Lists the metrics that WOULD apply to this channel once the
 * backend adds tracking, each explicitly marked unavailable — never a
 * fabricated number or a silent zero.
 */
export function CampaignDetailsPerformance({ campaign }) {
  const { t } = useTranslation()
  const metrics = METRICS_BY_CHANNEL[campaign.channel] || []

  if (metrics.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={24} />}
        title={t('outreachCampaigns.performance.notAvailableTitle')}
        description={t('outreachCampaigns.performance.notAvailableDescription')}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{t(`outreachCampaigns.performance.metrics.${metric}`)}</p>
          <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">{t('outreachCampaigns.metrics.notAvailable')}</p>
        </div>
      ))}
    </div>
  )
}
