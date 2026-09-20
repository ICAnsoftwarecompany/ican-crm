/**
 * Social Media contracts, documented via JSDoc — mirrors the convention in
 * shared/components/visual-flow/types.js (typedefs only, nothing
 * executable, referenced elsewhere as `@param {import('.../socialAdapterContract').X}`).
 * See docs/SOCIAL_MEDIA_ARCHITECTURE_AR.md for the full narrative.
 *
 * `null` means "this metric is not available from the current API" —
 * never coerce it to `0`. `0` means the API returned zero. Components must
 * render `null` as "—" (or hide the metric), never as a fake zero.
 *
 * @typedef {Object} SocialProfile
 * @property {string} id                 - Normalized id, stable across re-fetches (platform + externalId).
 * @property {string} externalId         - The platform's own id (e.g. Facebook page_id).
 * @property {string} platform           - Registry platform id ('facebook', 'instagram', ...).
 * @property {string} name
 * @property {string|null} username
 * @property {string|null} avatarUrl
 * @property {'connected'|'disconnected'|'expired'|'error'} connectionStatus
 * @property {string|null} lastSyncAt    - ISO date string, or null if never synced / not reported.
 * @property {number|null} followers     - null when the API doesn't report it.
 * @property {number|null} contentCount  - null when the API doesn't report it.
 * @property {Object} raw                - Untouched source payload, for platform-specific screens only — shared components never read `raw`.
 *
 * @typedef {Object} SocialMediaItem
 * @property {(string|null)} url
 * @property {'image'|'video'|'unknown'} type
 *
 * @typedef {Object} SocialEngagement
 * @property {number|null} likes
 * @property {number|null} comments
 * @property {number|null} shares
 * @property {number|null} saves
 *
 * @typedef {Object} SocialMetrics
 * @property {number|null} reach
 * @property {number|null} impressions
 * @property {number|null} views
 *
 * @typedef {Object} SocialContent
 * @property {string} id                 - Normalized id (platform + externalId).
 * @property {string} externalId
 * @property {string} profileId          - Normalized SocialProfile.id this content belongs to.
 * @property {string} platform
 * @property {'post'|'story'|'reel'|'unknown'} contentType
 * @property {'text'|'image'|'video'|'carousel'|'link'|'unknown'} mediaType
 * @property {string|null} message       - The post's own text/caption.
 * @property {string|null} caption       - Alias kept distinct from `message` for platforms that separate the two (e.g. a caption vs. a comment-like message) — Facebook maps both to the same source field today.
 * @property {SocialMediaItem[]} media
 * @property {string|null} thumbnail
 * @property {string|null} permalink
 * @property {'draft'|'scheduled'|'published'|'failed'} status - Facebook's API today only ever produces 'published' — the other three exist so Planner (see docs "Future Publishing Architecture") doesn't need a model change later.
 * @property {string|null} createdAt     - ISO date string.
 * @property {string|null} publishedAt   - ISO date string; null for draft/scheduled content.
 * @property {string|null} scheduledAt   - ISO date string; reserved for future scheduling, always null today.
 * @property {SocialEngagement} engagement
 * @property {SocialMetrics} metrics
 * @property {Object} raw
 *
 * @typedef {Object} SocialCommentAuthor
 * @property {string|null} name
 * @property {string|null} avatarUrl
 *
 * @typedef {Object} SocialComment
 * @property {string} id
 * @property {SocialCommentAuthor} author
 * @property {string|null} text
 * @property {string|null} createdAt
 * @property {SocialComment[]} replies   - Empty array when the API doesn't return threaded replies.
 * @property {Object} raw
 *
 * @typedef {Object} SocialPagination
 * @property {boolean} hasNext
 * @property {boolean} hasPrevious
 * @property {string|null} nextCursor
 * @property {string|null} previousCursor
 *
 * @typedef {Object} SocialContentList
 * @property {SocialContent[]} items
 * @property {SocialPagination} pagination
 *
 * @typedef {Object} SocialAdapter
 * @property {(raw: any) => SocialProfile} normalizeProfile
 * @property {(raw: any) => SocialContent} normalizeContent
 * @property {(raw: any) => SocialContentList} normalizeContentList
 * @property {(raw: any) => SocialEngagement} normalizeEngagement
 * @property {(raw: any) => SocialComment[]} normalizeComments
 * @property {(raw: any) => SocialPagination} normalizePagination
 */

export {}
