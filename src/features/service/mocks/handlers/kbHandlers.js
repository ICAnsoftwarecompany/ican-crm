import { serviceEndpoints } from '../../core/api/endpoints'
import { required } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { getMockCurrentUser } from '../seeds/seedUtils'
import { matchesSearch, nowIso } from '../utils'
import { ensureVersioned, isExpired, isLive, liveContent } from '../state/kbLive'
import { serializeArticle } from './communicationHandlers'

registerSeed('kbSearchLog', () => [
  ['استرداد فلوس الشحن', 0], ['refund shipping fee', 0], ['استرداد فلوس الشحن', 0], ['تغيير العنوان', 0], ['مواعيد العمل', 2], ['change delivery address', 0], ['متابعة طلب', 1],
].map(([query, results], index) => ({ query, results, source: 'portal', at: new Date(Date.now() - (index + 1) * 5 * 3600 * 1000).toISOString() })))
registerSeed('kbDeflections', () => [1, 2, 3, 5, 8, 13, 21].map((hours, index) => ({ article_id: index % 2 ? 'kb-6' : 'kb-2', query: null, at: new Date(Date.now() - hours * 3600 * 1000).toISOString() })))

const A = serviceEndpoints.kbArticles
const DAY = 24 * 60 * 60 * 1000
export const ARTICLE_TYPES = ['article', 'faq', 'troubleshooting', 'procedure', 'script', 'guide']
const VISIBILITIES = ['internal', 'agent', 'customer', 'public']
const EDITABLE = ['title', 'body', 'category_id', 'language', 'visibility', 'type', 'tags', 'related_case_type_ids', 'expires_at', 'owner_id', 'reviewer_id']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const conflict = (code, message) => new MockHttpError(409, code, message)
const me = () => {
  const user = getMockCurrentUser()
  return { id: user.id, name: user.name }
}
const articles = () => getCollection('kbArticles').map(ensureVersioned)
function byId(id) {
  const article = articles().find((entry) => entry.id === id)
  if (!article) throw notFound('Article')
  return article
}
const expiringSoon = (article, now = Date.now()) => Boolean(article.expires_at) && !isExpired(article, now) && Date.parse(article.expires_at) - now < 14 * DAY

/** Staff read model: working copy + live state flags. */
export function serializeKb(article) {
  ensureVersioned(article)
  const votes = article.helpful_count + article.not_helpful_count
  return {
    ...serializeArticle(article),
    live: isLive(article),
    expired: isExpired(article),
    expiring_soon: expiringSoon(article),
    has_unpublished_changes: article.published_version != null && article.version !== article.published_version,
    helpful_rate: votes ? Math.round((article.helpful_count / votes) * 100) : null,
    versions: [...article.versions].reverse().map(({ body: _body, ...meta }) => meta),
  }
}

function validate(body) {
  validation({
    ...(required(body.title) && { title: ['required'] }),
    ...(required(body.body) && { body: ['required'] }),
    ...(!body.category_id && { category_id: ['required'] }),
    ...(body.type && !ARTICLE_TYPES.includes(body.type) && { type: ['invalid'] }),
    ...(body.visibility && !VISIBILITIES.includes(body.visibility) && { visibility: ['invalid'] }),
  })
}

/** A content change (title / body) is a new version; metadata changes are not. */
function applyEdit(article, patch, note = null) {
  const contentChanged = ('title' in patch && patch.title !== article.title) || ('body' in patch && patch.body !== article.body)
  Object.assign(article, patch, { updated_at: nowIso() })
  if (contentChanged) {
    article.version += 1
    article.versions.push({ version: article.version, title: article.title, body: article.body, created_at: nowIso(), created_by: me(), note })
    if (article.status === 'published') article.status = 'draft'
  }
}

const VIEWS = {
  review: (article) => article.status === 'review',
  expiring: (article) => expiringSoon(article) || isExpired(article),
  changes: (article) => article.published_version != null && article.version !== article.published_version,
}

/** @type {import('../router').MockRoute[]} */
export const kbHandlers = [
  {
    method: 'GET',
    path: A,
    handler: ({ query }) => {
      const all = articles()
      const data = all
        .filter((article) => !query.category_id || article.category_id === query.category_id)
        .filter((article) => !query.status || (VIEWS[query.status] ? VIEWS[query.status](article) : article.status === query.status))
        .filter((article) => !query.visibility || article.visibility === query.visibility)
        .filter((article) => !query.type || article.type === query.type)
        .filter((article) => matchesSearch([article.title, article.body, ...(article.tags || [])], query.search))
        .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
        .map(serializeKb)
      const counts = { draft: 0, review: 0, published: 0, archived: 0, expiring: all.filter(VIEWS.expiring).length, changes: all.filter(VIEWS.changes).length }
      all.forEach((article) => { counts[article.status] = (counts[article.status] || 0) + 1 })
      return { data, meta: { counts } }
    },
  },
  {
    method: 'POST',
    path: A,
    handler: ({ body = {} }) => {
      validate(body)
      const patch = Object.fromEntries(EDITABLE.filter((key) => key in body).map((key) => [key, body[key]]))
      const article = ensureVersioned({ tags: [], related_case_type_ids: [], language: 'ar', visibility: 'agent', type: 'article', expires_at: null, ...patch, id: `kb-${Date.now().toString(36)}`, status: 'draft', version: 1, published_version: null, published_at: null, owner_id: patch.owner_id || me().id, created_at: nowIso(), updated_at: nowIso() })
      article.versions[0].created_by = me()
      getCollection('kbArticles').unshift(article)
      return { status: 201, body: { data: serializeKb(article) } }
    },
  },
  { method: 'GET', path: `${A}/:id`, handler: ({ params }) => ({ data: serializeKb(byId(params.id)) }) },
  {
    method: 'PATCH',
    path: `${A}/:id`,
    handler: ({ params, body = {} }) => {
      const article = byId(params.id)
      if (body.version != null && Number(body.version) !== article.version) throw conflict('CONFLICT_VERSION', 'Article changed')
      const patch = Object.fromEntries(EDITABLE.filter((key) => key in body).map((key) => [key, body[key]]))
      validate({ ...article, ...patch })
      applyEdit(article, patch)
      return { data: serializeKb(article) }
    },
  },
  {
    method: 'DELETE',
    path: `${A}/:id`,
    handler: ({ params }) => {
      const list = getCollection('kbArticles')
      const index = list.findIndex((entry) => entry.id === params.id)
      if (index < 0) throw notFound('Article')
      list.splice(index, 1)
      return { status: 204, body: null }
    },
  },
  {
    method: 'GET',
    path: `${A}/:id/versions/:version`,
    handler: ({ params }) => {
      const version = byId(params.id).versions.find((entry) => entry.version === Number(params.version))
      if (!version) throw notFound('Version')
      return { data: version }
    },
  },
  {
    method: 'POST',
    path: `${A}/:id/versions/:version/restore`,
    handler: ({ params }) => {
      const article = byId(params.id)
      const version = article.versions.find((entry) => entry.version === Number(params.version))
      if (!version) throw notFound('Version')
      applyEdit(article, { title: version.title, body: version.body }, `restore:${version.version}`)
      return { data: serializeKb(article) }
    },
  },
  {
    method: 'POST',
    path: `${A}/:id/submit-review`,
    handler: ({ params, body = {} }) => {
      const article = byId(params.id)
      if (article.status !== 'draft') throw conflict('KB_INVALID_STATUS', 'Only drafts go to review')
      Object.assign(article, { status: 'review', reviewer_id: body.reviewer_id || article.reviewer_id || null, review_note: null, submitted_at: nowIso(), updated_at: nowIso() })
      return { data: serializeKb(article) }
    },
  },
  {
    method: 'POST',
    path: `${A}/:id/reject`,
    handler: ({ params, body = {} }) => {
      const article = byId(params.id)
      if (article.status !== 'review') throw conflict('KB_INVALID_STATUS', 'Not in review')
      validation(String(body.note || '').trim() ? {} : { note: ['required'] })
      Object.assign(article, { status: 'draft', review_note: body.note, reviewed_by: me(), updated_at: nowIso() })
      return { data: serializeKb(article) }
    },
  },
  {
    method: 'POST',
    path: `${A}/:id/publish`,
    handler: ({ params }) => {
      // Server: needs `kb.publish`. Publishing makes the current version the live one.
      const article = byId(params.id)
      if (!['draft', 'review', 'published'].includes(article.status)) throw conflict('KB_INVALID_STATUS', 'Archived articles must be restored first')
      Object.assign(article, { status: 'published', published_version: article.version, published_at: nowIso(), reviewed_by: me(), review_note: null, updated_at: nowIso() })
      return { data: serializeKb(article) }
    },
  },
  {
    method: 'POST',
    path: `${A}/:id/archive`,
    handler: ({ params }) => {
      const article = byId(params.id)
      Object.assign(article, { status: 'archived', archived_at: nowIso(), updated_at: nowIso() })
      return { data: serializeKb(article) }
    },
  },
  {
    method: 'POST',
    path: `${A}/:id/unarchive`,
    handler: ({ params }) => {
      const article = byId(params.id)
      if (article.status !== 'archived') throw conflict('KB_INVALID_STATUS', 'Not archived')
      Object.assign(article, { status: 'draft', updated_at: nowIso() })
      return { data: serializeKb(article) }
    },
  },
  {
    method: 'GET',
    path: `${serviceEndpoints.kbStats}`,
    handler: () => {
      const all = articles()
      const since = Date.now() - 30 * DAY
      const searches = getCollection('kbSearchLog').filter((entry) => Date.parse(entry.at) > since)
      const gaps = Object.values(searches.filter((entry) => !entry.results).reduce((acc, entry) => {
        const key = entry.query.trim().toLowerCase()
        acc[key] = { query: entry.query, count: (acc[key]?.count || 0) + 1, last_at: entry.at }
        return acc
      }, {})).sort((a, b) => b.count - a.count).slice(0, 8)
      const helpful = all.reduce((sum, article) => sum + article.helpful_count, 0)
      const votes = all.reduce((sum, article) => sum + article.helpful_count + article.not_helpful_count, 0)
      return {
        data: {
          live: all.filter((article) => isLive(article)).length,
          views: all.reduce((sum, article) => sum + article.view_count, 0),
          helpful_rate: votes ? Math.round((helpful / votes) * 100) : null,
          deflections_30d: getCollection('kbDeflections').filter((entry) => Date.parse(entry.at) > since).length,
          searches_30d: searches.length,
          content_gaps: gaps,
          top_articles: [...all].filter((article) => isLive(article)).sort((a, b) => b.view_count - a.view_count).slice(0, 5).map((article) => ({ id: article.id, title: liveContent(article).title, views: article.view_count, helpful_rate: article.helpful_count + article.not_helpful_count ? Math.round((article.helpful_count / (article.helpful_count + article.not_helpful_count)) * 100) : null })),
        },
      }
    },
  },
]
