/**
 * Knowledge base read rules shared by staff, portal and AI mocks (spec §41):
 * - every content change is a new version; `published_version` is what customers, suggestions and AI see,
 * - an article is live only when it has a published version, is not archived and has not expired,
 * - the portal shows `customer` / `public` visibility only (never the category's visibility).
 */
const STOP = new Set(['the', 'and', 'for', 'with', 'you', 'your', 'how', 'what', 'من', 'في', 'على', 'عن', 'الى', 'إلى', 'مع', 'هل', 'ازاي', 'إزاي'])
export const words = (value) => String(value || '').toLowerCase().split(/[\s,.،؟?!:;()\-/]+/).filter((word) => word.length > 2 && !STOP.has(word))

/** Fills version fields for articles created before versioning (seeds, old data). Mutates and returns the article. */
export function ensureVersioned(article) {
  if (!Array.isArray(article.versions)) {
    article.version = article.version || 1
    article.versions = [{ version: article.version, title: article.title, body: article.body, created_at: article.updated_at || article.published_at, created_by: null, note: null }]
  }
  if (article.published_version === undefined) article.published_version = article.status === 'published' ? article.version : null
  article.type = article.type || 'article'
  article.view_count = article.view_count || 0
  article.helpful_count = article.helpful_count || 0
  article.not_helpful_count = article.not_helpful_count || 0
  return article
}

export const isExpired = (article, now = Date.now()) => Boolean(article.expires_at) && Date.parse(article.expires_at) <= now

export function isLive(article, now = Date.now()) {
  ensureVersioned(article)
  return article.published_version != null && article.status !== 'archived' && !isExpired(article, now)
}

/** The content customers / AI see: the published version, not the working draft. */
export function liveContent(article) {
  ensureVersioned(article)
  const version = article.versions.find((entry) => entry.version === article.published_version)
  return version ? { title: version.title, body: version.body, version: version.version } : null
}

export const customerVisible = (article) => ['customer', 'public'].includes(article.visibility)

/** Ranks live articles for a free-text query (+ an optional related case type). Returns [{ article, score }]. */
export function rankArticles(articles, text, { typeId = null, limit = 5, now = Date.now() } = {}) {
  const needles = new Set(words(text))
  return articles
    .filter((article) => isLive(article, now))
    .map((article) => {
      const content = liveContent(article)
      const titleHits = words(content.title).filter((word) => needles.has(word)).length
      const bodyHits = words(`${content.body} ${(article.tags || []).join(' ')}`).filter((word) => needles.has(word)).length
      const typeMatch = typeId && article.related_case_type_ids?.includes(typeId) ? 3 : 0
      return { article, score: titleHits * 3 + bodyHits + typeMatch }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
