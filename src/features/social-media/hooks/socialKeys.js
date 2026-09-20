/**
 * Feature-local query keys, matching the convention already established by
 * `features/campaigns/facebook-campaign/hooks/useFacebookCampaigns.js`'s
 * `facebookCampaignKeys` (tenant/platform/resource/filters) rather than
 * the simpler flat entries in `shared/constants/queryKeys.js` — that
 * shared file serves single-tenant-scope CRUD entities (leads, tasks,
 * ...); a multi-platform module with per-platform/per-profile scoping
 * needs the richer key shape its closest real precedent already uses. See
 * docs "React Query Strategy" for the reasoning.
 */
export const socialKeys = {
  all: (tenantId) => ['social-media', tenantId],
  profiles: (tenantId, platform) => ['social-media', tenantId, platform || 'all', 'profiles'],
  content: (tenantId, platform, profileId, cursor) => ['social-media', tenantId, platform, 'profile', profileId, 'content', cursor || 'first'],
  engagement: (tenantId, platform, contentId) => ['social-media', tenantId, platform, 'content', contentId, 'engagement'],
  comments: (tenantId, platform, contentId) => ['social-media', tenantId, platform, 'content', contentId, 'comments'],
}
