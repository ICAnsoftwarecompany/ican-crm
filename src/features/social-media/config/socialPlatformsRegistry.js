import { Facebook, Instagram, Music2, Ghost } from 'lucide-react'
import { SOCIAL_CAPABILITIES } from './socialCapabilities'
import { facebookAdapter } from '../adapters/facebook/facebookAdapter'

/**
 * Central Social Media platform registry — see docs "Platform Registry"
 * and "كيفية إضافة Platform جديدة". Every platform is registered here
 * exactly once, regardless of whether it has a real backend integration
 * yet. `available: false` platforms render their "not connected yet"
 * state through the exact same shared components as Facebook — nothing
 * about the UI branches on platform id beyond reading this registry.
 *
 * `available` here means "ICAN has a real, working API + adapter for this
 * platform" — separate from whether a given tenant's package includes it
 * (`moduleKeys`, checked against `user.modules`, same dormant-until-real-
 * data convention as navigation.config.js) and separate from whether the
 * tenant has actually connected an account (`useSocialProfiles`, runtime
 * data). See docs "Package Gating" for why these three are different
 * questions that must never be collapsed into one boolean.
 */
const platformDefinitions = [
  {
    id: 'facebook',
    labelKey: 'socialMedia.platforms.facebook',
    icon: Facebook,
    available: true,
    moduleKeys: ['social-media', 'social-media.facebook', 'growth'],
    adapter: facebookAdapter,
    capabilities: {
      [SOCIAL_CAPABILITIES.PROFILES]: true,
      [SOCIAL_CAPABILITIES.CONTENT_READ]: true,
      [SOCIAL_CAPABILITIES.ENGAGEMENT_READ]: true,
      [SOCIAL_CAPABILITIES.COMMENTS_READ]: true,
      [SOCIAL_CAPABILITIES.CONTENT_CREATE]: false,
      [SOCIAL_CAPABILITIES.CONTENT_SCHEDULE]: false,
      [SOCIAL_CAPABILITIES.CONTENT_PUBLISH]: false,
      [SOCIAL_CAPABILITIES.PROFILE_INSIGHTS]: false,
      [SOCIAL_CAPABILITIES.CONTENT_INSIGHTS]: false,
    },
  },
  {
    id: 'instagram',
    labelKey: 'socialMedia.platforms.instagram',
    icon: Instagram,
    available: false,
    moduleKeys: ['social-media.instagram'],
    adapter: null,
    capabilities: {},
  },
  {
    id: 'tiktok',
    labelKey: 'socialMedia.platforms.tiktok',
    icon: Music2,
    available: false,
    moduleKeys: ['social-media.tiktok'],
    adapter: null,
    capabilities: {},
  },
  {
    id: 'snapchat',
    labelKey: 'socialMedia.platforms.snapchat',
    icon: Ghost,
    available: false,
    moduleKeys: ['social-media.snapchat'],
    adapter: null,
    capabilities: {},
  },
]

export function getSocialPlatforms() {
  return platformDefinitions
}

export function getSocialPlatform(platformId) {
  return platformDefinitions.find((platform) => platform.id === platformId) || null
}

export function isSocialPlatformEnabled(platform, enabledModules) {
  if (!Array.isArray(enabledModules)) return true
  return platform.moduleKeys.some((moduleKey) => enabledModules.includes(moduleKey))
}

export function getVisibleSocialPlatforms(enabledModules) {
  return platformDefinitions.filter((platform) => isSocialPlatformEnabled(platform, enabledModules))
}

export function socialPlatformHasCapability(platform, capability) {
  return Boolean(platform?.capabilities?.[capability])
}

export function userHasSocialPermission(permission, permissions) {
  if (!permission || !Array.isArray(permissions)) return true
  return permissions.includes(permission)
}
