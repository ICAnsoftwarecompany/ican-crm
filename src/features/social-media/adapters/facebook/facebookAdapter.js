/**
 * Facebook -> Social Media normalization. See
 * docs/SOCIAL_MEDIA_ARCHITECTURE_AR.md section "Facebook Adapter" for the
 * full field-mapping table and section "Adapter Architecture" for why this
 * layer exists (shared components never see a raw Facebook payload).
 *
 * Two response shapes are documented with a real example from the backend
 * (posts list, engagement) and are mapped exactly. Two are NOT documented
 * with a real example (comments, page/profile list from
 * `useFacebookIntegrations`) — those are mapped defensively against the
 * standard Facebook Graph API shape (comments) or against field names
 * already used elsewhere in this codebase for the same data
 * (`pages.map(page => page.page_id || page.id ...)` in
 * `CampaignCreatePage.jsx`), with every field read via optional chaining
 * so an unexpected shape degrades to `null`/empty instead of throwing.
 * Verify against a live response before relying on comment authors in
 * production.
 */

const PLATFORM = 'facebook'

function toId(externalId) {
  return `${PLATFORM}:${externalId}`
}

function toIsoOrNull(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizeMedia(attachments) {
  const items = attachments?.data
  if (!Array.isArray(items) || items.length === 0) return []

  return items.map((item) => ({
    url: item?.url || item?.media?.image?.src || null,
    type: item?.media_type === 'video' ? 'video' : item?.media_type === 'photo' ? 'image' : 'unknown',
  }))
}

function deriveMediaType(post) {
  const media = normalizeMedia(post?.attachments)
  if (media.length > 1) return 'carousel'
  if (media.length === 1) return media[0].type === 'video' ? 'video' : media[0].type === 'image' ? 'image' : 'unknown'
  if (post?.message) return 'text'
  return 'unknown'
}

/** @returns {import('../socialAdapterContract').SocialProfile} */
export function normalizeProfile(page) {
  const externalId = page?.page_id || page?.id || ''
  return {
    id: toId(externalId),
    externalId,
    platform: PLATFORM,
    name: page?.name || page?.page_name || externalId,
    username: page?.username || null,
    avatarUrl: page?.picture?.data?.url || page?.avatar || null,
    connectionStatus: page?.is_connected === false ? 'disconnected' : 'connected',
    lastSyncAt: toIsoOrNull(page?.synced_at || page?.last_synced_at),
    followers: Number.isFinite(page?.followers_count) ? page.followers_count : null,
    contentCount: Number.isFinite(page?.posts_count) ? page.posts_count : null,
    raw: page,
  }
}

/** @param {Object} post @param {string} pageId - Envelope-level page_id (posts list items don't carry their own). @returns {import('../socialAdapterContract').SocialContent} */
export function normalizeContent(post, pageId) {
  const externalId = post?.id || ''
  return {
    id: toId(externalId),
    externalId,
    profileId: pageId ? toId(pageId) : '',
    platform: PLATFORM,
    contentType: 'post',
    mediaType: deriveMediaType(post),
    message: post?.message ?? null,
    caption: post?.message ?? null,
    media: normalizeMedia(post?.attachments),
    thumbnail: post?.full_picture || null,
    permalink: post?.permalink_url || null,
    status: 'published',
    createdAt: toIsoOrNull(post?.created_time),
    publishedAt: toIsoOrNull(post?.created_time),
    scheduledAt: null,
    engagement: {
      likes: Number.isFinite(post?.likes?.summary?.total_count) ? post.likes.summary.total_count : null,
      comments: Number.isFinite(post?.comments?.summary?.total_count) ? post.comments.summary.total_count : null,
      shares: Number.isFinite(post?.shares?.count) ? post.shares.count : null,
      saves: null,
    },
    metrics: {
      reach: null,
      impressions: null,
      views: null,
    },
    raw: post,
  }
}

/** @returns {import('../socialAdapterContract').SocialContentList} */
export function normalizeContentList(response) {
  const pageId = response?.page_id
  const items = Array.isArray(response?.data) ? response.data.map((post) => normalizeContent(post, pageId)) : []
  return { items, pagination: normalizePagination(response?.paging) }
}

/** @returns {import('../socialAdapterContract').SocialPagination} */
export function normalizePagination(paging) {
  return {
    hasNext: Boolean(paging?.next),
    hasPrevious: Boolean(paging?.previous),
    nextCursor: paging?.after ?? null,
    previousCursor: paging?.before ?? null,
  }
}

/** @returns {import('../socialAdapterContract').SocialEngagement} */
export function normalizeEngagement(response) {
  const data = response?.data ?? response
  return {
    likes: Number.isFinite(data?.likes_count) ? data.likes_count : null,
    comments: Number.isFinite(data?.comments_count) ? data.comments_count : null,
    shares: Number.isFinite(data?.shares_count) ? data.shares_count : null,
    saves: null,
  }
}

/** @returns {import('../socialAdapterContract').SocialComment[]} */
export function normalizeComments(response) {
  const items = Array.isArray(response?.data) ? response.data : []

  return items.map((comment) => ({
    id: comment?.id || '',
    author: {
      name: comment?.from?.name ?? null,
      avatarUrl: comment?.from?.picture?.data?.url ?? null,
    },
    text: comment?.message ?? null,
    createdAt: toIsoOrNull(comment?.created_time),
    replies: Array.isArray(comment?.comments?.data) ? normalizeComments(comment.comments) : [],
    raw: comment,
  }))
}

export const facebookAdapter = {
  normalizeProfile,
  normalizeContent,
  normalizeContentList,
  normalizeEngagement,
  normalizeComments,
  normalizePagination,
}
