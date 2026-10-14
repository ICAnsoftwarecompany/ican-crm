import { createCampaignProvider } from '../campaignProvider'
import { facebookCampaignApi } from '../../facebook-campaign/index'

export const metaCampaignProvider = createCampaignProvider({
  id: 'meta',
  configured: true,
  getCampaigns: facebookCampaignApi.getCampaigns,
  createCampaign: facebookCampaignApi.createCampaign,
  syncCampaigns: facebookCampaignApi.syncCampaigns,
  getCampaignAdSets: facebookCampaignApi.getCampaignAdSets,
})
