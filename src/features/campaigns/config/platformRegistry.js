import { Facebook, Search, Music2, Ghost } from 'lucide-react'
import { CAMPAIGN_CAPABILITIES } from './campaignCapabilities'
import { metaCampaignProvider } from '../providers/meta/metaCampaignProvider'
import { createCampaignProvider } from '../providers/campaignProvider'

const commonShellCapabilities = [
  CAMPAIGN_CAPABILITIES.OVERVIEW,
  CAMPAIGN_CAPABILITIES.CREATE,
  CAMPAIGN_CAPABILITIES.LIST,
  CAMPAIGN_CAPABILITIES.ANALYTICS,
  CAMPAIGN_CAPABILITIES.BILLING,
]

const platformDefinitions = [
  {
    id: 'meta',
    labelKey: 'campaigns.platforms.meta',
    icon: Facebook,
    moduleKeys: ['campaigns', 'campaigns.meta', 'meta-ads', 'growth'],
    capabilities: [...commonShellCapabilities, CAMPAIGN_CAPABILITIES.DETAILS, CAMPAIGN_CAPABILITIES.AD_SETS, CAMPAIGN_CAPABILITIES.ADS, CAMPAIGN_CAPABILITIES.POSTS],
    provider: metaCampaignProvider,
  },
  {
    id: 'google',
    labelKey: 'campaigns.platforms.google',
    icon: Search,
    moduleKeys: ['campaigns.google', 'google-ads'],
    capabilities: commonShellCapabilities,
    provider: createCampaignProvider({ id: 'google' }),
  },
  {
    id: 'tiktok',
    labelKey: 'campaigns.platforms.tiktok',
    icon: Music2,
    moduleKeys: ['campaigns.tiktok', 'tiktok-ads'],
    capabilities: commonShellCapabilities,
    provider: createCampaignProvider({ id: 'tiktok' }),
  },
  {
    id: 'snapchat',
    labelKey: 'campaigns.platforms.snapchat',
    icon: Ghost,
    moduleKeys: ['campaigns.snapchat', 'snapchat-ads'],
    capabilities: commonShellCapabilities,
    provider: createCampaignProvider({ id: 'snapchat' }),
  },
]

export function getCampaignPlatforms() {
  return platformDefinitions
}

export function getCampaignPlatform(platformId) {
  return platformDefinitions.find((platform) => platform.id === platformId) || null
}

export function isCampaignPlatformEnabled(platform, enabledModules) {
  if (!Array.isArray(enabledModules)) return true
  return platform.moduleKeys.some((moduleKey) => enabledModules.includes(moduleKey))
}

export function platformHasCapability(platform, capability) {
  return Boolean(platform?.capabilities?.includes(capability))
}

export function userHasCampaignPermission(permission, permissions) {
  if (!permission || !Array.isArray(permissions)) return true
  return permissions.includes(permission)
}

export function getVisibleCampaignPlatforms(enabledModules) {
  return platformDefinitions.filter((platform) => isCampaignPlatformEnabled(platform, enabledModules))
}
