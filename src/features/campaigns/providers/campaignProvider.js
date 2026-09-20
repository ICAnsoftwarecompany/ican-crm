export function createCampaignProvider(definition) {
  return {
    configured: false,
    getCampaigns: null,
    getCampaign: null,
    createCampaign: null,
    updateCampaign: null,
    pauseCampaign: null,
    activateCampaign: null,
    duplicateCampaign: null,
    getAnalytics: null,
    getBilling: null,
    ...definition,
  }
}
