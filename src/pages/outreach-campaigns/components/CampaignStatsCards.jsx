import { useTranslation } from 'react-i18next'

/**
 * Aggregated from whatever campaigns the current query returned (there is
 * no dedicated stats/summary backend endpoint yet — see docs "Backend Gaps").
 * If the list endpoint turns out to be paginated server-side, these counts
 * reflect only the loaded page, not the tenant's full history.
 */
export function CampaignStatsCards({ campaigns = [] }) {
  const { t } = useTranslation()

  const counts = campaigns.reduce(
    (acc, campaign) => {
      acc.total += 1
      if (campaign.status === 'scheduled') acc.scheduled += 1
      else if (campaign.status === 'running') acc.running += 1
      else if (campaign.status === 'completed') acc.completed += 1
      else if (campaign.status === 'cancelled') acc.cancelled += 1
      return acc
    },
    { total: 0, scheduled: 0, running: 0, completed: 0, cancelled: 0 }
  )

  const cards = [
    { key: 'total', label: t('outreachCampaigns.stats.total'), value: counts.total },
    { key: 'scheduled', label: t('outreachCampaigns.stats.scheduled'), value: counts.scheduled },
    { key: 'running', label: t('outreachCampaigns.stats.running'), value: counts.running },
    { key: 'completed', label: t('outreachCampaigns.stats.completed'), value: counts.completed },
    { key: 'cancelled', label: t('outreachCampaigns.stats.cancelled'), value: counts.cancelled },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.key} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{card.label}</p>
          <p className="mt-1 text-2xl font-black text-[var(--text)]">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
