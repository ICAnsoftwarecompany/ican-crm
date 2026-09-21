import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpLeft } from 'lucide-react'
import { CampaignStatsCards } from './CampaignStatsCards'
import { CampaignChannelBadge } from './CampaignChannelBadge'
import { CampaignStatusBadge } from './CampaignStatusBadge'

export function OutreachOverviewContent({ campaigns }) {
  const { t } = useTranslation()
  const live = campaigns.filter((campaign) => campaign.status === 'running')

  return (
    <>
      <CampaignStatsCards campaigns={campaigns} />
      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[var(--text)]">{t('outreachCampaigns.navigation.live')}</h2>
          <Link to="/outreach-campaigns/live" className="flex items-center gap-1 text-sm font-semibold text-[#00858c] hover:underline dark:text-cyan-300">
            {t('outreachCampaigns.navigation.viewAll')} <ArrowUpLeft size={15} />
          </Link>
        </div>
        {live.length ? (
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {live.map((campaign) => (
              <Link key={campaign.id} to={`/outreach-campaigns/${campaign.id}`} className="flex flex-wrap items-center gap-3 px-2 py-3 hover:bg-[var(--surface)]">
                <span className="min-w-0 flex-1 font-semibold text-[var(--text)]">{campaign.name}</span>
                <CampaignChannelBadge channel={campaign.channel} />
                <CampaignStatusBadge status={campaign.status} />
              </Link>
            ))}
          </div>
        ) : <p className="border-y border-[var(--border)] py-6 text-sm text-[var(--text-muted)]">{t('outreachCampaigns.navigation.noLive')}</p>}
      </section>
    </>
  )
}
