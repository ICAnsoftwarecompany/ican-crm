import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { CAMPAIGN_CHANNELS } from '../../features/outreach-campaigns/config/campaignChannels'
import { OutreachCreateContent } from '../../features/outreach-campaigns/components/OutreachCreateContent'
import { CampaignWizardModal } from './components/wizard/CampaignWizardModal'

export function OutreachCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedChannel = searchParams.get('channel')
  const channel = CAMPAIGN_CHANNELS[requestedChannel] ? requestedChannel : ''
  const title = channel
    ? t('outreachCampaigns.navigation.createForChannel', { channel: t(CAMPAIGN_CHANNELS[channel].labelKey) })
    : t('outreachCampaigns.createCampaign')

  return (
    <div className="min-h-full w-full bg-[var(--surface-2)]">
      <div className="px-4 pt-4 sm:px-6 sm:pt-6"><PageToolbar title={title} /></div>
      <OutreachCreateContent><CampaignWizardModal
        key={channel}
        open
        variant="page"
        initialChannel={channel}
        onClose={() => navigate('/outreach-campaigns/all')}
        onSuccess={(campaignId) => navigate(campaignId ? `/outreach-campaigns/${campaignId}` : '/outreach-campaigns/all')}
      /></OutreachCreateContent>
    </div>
  )
}
