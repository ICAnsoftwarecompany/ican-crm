import { facebookCampaignApi } from '../../campaigns/facebook-campaign'

/**
 * Social Media reuses the exact same organic-content endpoints Campaign
 * Center's Facebook integration already calls — no duplicate API client,
 * no changed contract, per docs/SOCIAL_MEDIA_ARCHITECTURE_AR.md section
 * "الفرق بين Social Media و Campaigns": the two modules may share Meta
 * integration/backend endpoints while staying separate UI domains. This
 * file is a thin, explicitly-named re-export — not a reimplementation —
 * so `features/social-media` never has to import `facebookCampaignApi`
 * directly (and pulls in nothing else from the campaigns feature).
 */
export const facebookSocialApi = {
  getPagePosts: facebookCampaignApi.getPagePosts,
  getPostEngagement: facebookCampaignApi.getPostEngagement,
  getPostComments: facebookCampaignApi.getPostComments,
}
