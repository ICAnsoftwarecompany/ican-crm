/**
 * Mirrors features/campaigns/config/campaignCapabilities.js exactly —
 * capability-based UI is the whole point (see docs
 * "Capability-Based UI"): never branch on `platform === 'facebook'`,
 * branch on `capabilities.xRead === true`.
 */
export const SOCIAL_CAPABILITIES = Object.freeze({
  PROFILES: 'profiles',
  CONTENT_READ: 'contentRead',
  ENGAGEMENT_READ: 'engagementRead',
  COMMENTS_READ: 'commentsRead',

  CONTENT_CREATE: 'contentCreate',
  CONTENT_SCHEDULE: 'contentSchedule',
  CONTENT_PUBLISH: 'contentPublish',

  PROFILE_INSIGHTS: 'profileInsights',
  CONTENT_INSIGHTS: 'contentInsights',
})

/** Internal navigation for the Social Media module shell — config-driven, not hardcoded JSX (see docs "Routing"). */
export const SOCIAL_NAV_ITEMS = [
  { id: 'overview', labelKey: 'socialMedia.nav.overview', path: '' },
  { id: 'profiles', labelKey: 'socialMedia.nav.profiles', path: 'profiles', capability: SOCIAL_CAPABILITIES.PROFILES },
  { id: 'content', labelKey: 'socialMedia.nav.content', path: 'content', capability: SOCIAL_CAPABILITIES.CONTENT_READ },
  { id: 'planner', labelKey: 'socialMedia.nav.planner', path: 'planner' },
  { id: 'analytics', labelKey: 'socialMedia.nav.analytics', path: 'analytics' },
]
