import { useCampaignCenter } from '../../../../features/campaigns'
import { MetaCampaignWizard } from '../../../../features/campaigns/meta-wizard'
import { CampaignUnavailableState } from '../../components/CampaignUnavailableState'

/**
 * Route: /campaigns/:platform/create — composition only.
 * The wizard (and its docs) live in src/features/campaigns/meta-wizard.
 */
export function CampaignCreatePage() {
  const context = useCampaignCenter()

  if (!context.provider.configured) return <CampaignUnavailableState reason="unavailable" />
  if (context.connectionStatus !== 'connected') return <CampaignUnavailableState reason="disconnected" />
  if (!context.accountId) return <CampaignUnavailableState reason="noAccount" />
  if (context.platform.id !== 'meta') return <CampaignUnavailableState reason="unavailable" />

  return <MetaCampaignWizard key={`${context.tenantId}:${context.accountId}`} center={context} />
}
