// Public API — see docs/SOCIAL_MEDIA_ARCHITECTURE_AR.md. Consumers should
// never import from internal paths inside features/social-media/* directly.

export {
  getSocialPlatforms,
  getSocialPlatform,
  isSocialPlatformEnabled,
  getVisibleSocialPlatforms,
  socialPlatformHasCapability,
  userHasSocialPermission,
} from './config/socialPlatformsRegistry'
export { SOCIAL_CAPABILITIES, SOCIAL_NAV_ITEMS } from './config/socialCapabilities'

export { facebookSocialApi } from './api/facebookSocialApi'
export { facebookAdapter } from './adapters/facebook/facebookAdapter'

export { socialKeys } from './hooks/socialKeys'
export { useSocialProfiles } from './hooks/useSocialProfiles'
export { useSocialContent } from './hooks/useSocialContent'
export { useSocialEngagement } from './hooks/useSocialEngagement'
export { useSocialComments } from './hooks/useSocialComments'

export { calculateTotalEngagement, rankContentByEngagement } from './utils/engagementUtils'
export { formatMetric, formatContentDate, formatContentDateTime, truncateCaption } from './utils/socialFormatters'

export { SocialPlatformBadge } from './components/SocialPlatformBadge'
export { SocialProfileCard } from './components/SocialProfileCard'
export { SocialProfileHeader } from './components/SocialProfileHeader'
export { SocialMetricsCards } from './components/SocialMetricsCards'
export { SocialPlatformUnavailable } from './components/SocialPlatformUnavailable'

export { SocialContentGrid } from './components/content/SocialContentGrid'
export { SocialContentCard } from './components/content/SocialContentCard'
export { SocialContentList } from './components/content/SocialContentList'
export { SocialContentCalendar } from './components/content/SocialContentCalendar'
export { SocialContentFilters } from './components/content/SocialContentFilters'
export { SocialContentEmptyState } from './components/content/SocialContentEmptyState'

export { SocialContentDrawer } from './components/details/SocialContentDrawer'
export { ContentMediaPreview } from './components/details/ContentMediaPreview'
export { ContentEngagement } from './components/details/ContentEngagement'
export { ContentComments } from './components/details/ContentComments'
