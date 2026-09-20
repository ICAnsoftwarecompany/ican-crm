import { WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'
import { useCampaignCenter } from '../../../features/campaigns'
import { CampaignUnavailableState } from '../components/CampaignUnavailableState'
import { CampaignPageHeading } from '../components/CampaignPageHeading'

export function CampaignBillingPage() {
  const { t } = useTranslation()
  const { provider, connectionStatus } = useCampaignCenter()
  if (!provider.configured) return <CampaignUnavailableState reason="unavailable" />
  if (connectionStatus !== 'connected') return <CampaignUnavailableState reason="disconnected" />
  return <div><CampaignPageHeading title={t('campaigns.billing.title')} description={t('campaigns.billing.description')} /><section className="rounded-md border border-[var(--border)] bg-[var(--surface)]"><EmptyState icon={<WalletCards size={24} />} title={t('campaigns.states.notConfigured.title')} description={t('campaigns.states.notConfigured.description')} /></section></div>
}
