import { portalEndpoints as P } from '../../core/api/portalEndpoints'
import { getCollection } from '../db'
import { MockHttpError, notFound } from '../errors'
import { nowIso } from '../utils'
import { requirePermission, resolveSession } from '../state/portalAccess'
import { customerVisible, ensureVersioned, isLive, liveContent, rankArticles } from '../state/kbLive'
import { portalSettings } from './portalAdminHandlers'
import './communicationHandlers'
import './kbHandlers'

/**
 * Portal self-service (spec §41, §43): signed-in customers see `customer` + `public` articles; the public help
 * center (no sign-in) sees `public` only. Only the published version is served. Searches are logged so staff see
 * content gaps; "this solved it" on a new request is a deflection.
 */
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const categories = () => getCollection('kbCategories')
const categoryOf = (article) => categories().find((entry) => entry.id === article.category_id)
const visibleTo = (audience) => (article) => isLive(article) && (audience === 'public' ? article.visibility === 'public' : customerVisible(article))

function summary(article) {
  const content = liveContent(article)
  const category = categoryOf(article)
  return { id: article.id, title: content.title, excerpt: content.body.split('\n')[0].slice(0, 160), type: article.type, language: article.language, category: category ? { id: category.id, label: category.label } : null, updated_at: article.published_at || article.updated_at, helpful_count: article.helpful_count }
}
const detail = (article) => ({ ...summary(article), body: liveContent(article).body })

function signedIn(headers) {
  const ctx = resolveSession(headers)
  requirePermission(ctx, 'kb')
  return ctx
}
function publicEnabled() {
  if (!portalSettings().public_help_center) throw new MockHttpError(404, 'NOT_FOUND', 'Help center is not public')
}
/** Tries the portal session; public callers get `public` only. */
function audienceOf(headers) {
  try {
    signedIn(headers)
    return 'customer'
  } catch {
    publicEnabled()
    return 'public'
  }
}

function list(audience, query) {
  const all = getCollection('kbArticles').map(ensureVersioned).filter(visibleTo(audience))
  const search = String(query.search || '').trim()
  const items = (search ? rankArticles(all, search, { limit: 50 }).map((entry) => entry.article) : all.sort((a, b) => b.view_count - a.view_count))
    .filter((article) => !query.category_id || article.category_id === query.category_id)
  if (search) getCollection('kbSearchLog').push({ query: search, results: items.length, source: audience === 'public' ? 'public_help' : 'portal', at: nowIso() })
  const used = new Set(all.map((article) => article.category_id))
  return { data: items.map(summary), meta: { categories: categories().filter((entry) => used.has(entry.id)).map((entry) => ({ id: entry.id, label: entry.label })) } }
}

function read(audience, id) {
  const article = getCollection('kbArticles').map(ensureVersioned).find((entry) => entry.id === id)
  if (!article || !visibleTo(audience)(article)) throw notFound('Article')
  article.view_count += 1
  return { data: detail(article) }
}

/** @type {import('../router').MockRoute[]} */
export const portalKbHandlers = [
  { method: 'GET', path: P.kbSuggest, handler: ({ headers, query }) => {
    signedIn(headers)
    const all = getCollection('kbArticles').map(ensureVersioned).filter(visibleTo('customer'))
    return { data: rankArticles(all, query.q, { limit: 3 }).map(({ article }) => detail(article)) }
  } },
  { method: 'POST', path: P.kbDeflections, handler: ({ headers, body = {} }) => {
    const ctx = signedIn(headers)
    validation(body.article_id ? {} : { article_id: ['required'] })
    getCollection('kbDeflections').push({ article_id: body.article_id, query: body.query || null, account_id: ctx.account.id, at: nowIso() })
    return { status: 201, body: { data: { ok: true } } }
  } },
  { method: 'GET', path: P.kb, handler: ({ headers, query }) => {
    signedIn(headers)
    return list('customer', query)
  } },
  { method: 'GET', path: `${P.kb}/:id`, handler: ({ headers, params }) => {
    signedIn(headers)
    return read('customer', params.id)
  } },
  { method: 'POST', path: `${P.kb}/:id/vote`, handler: ({ headers, params, body = {} }) => {
    const audience = audienceOf(headers)
    const article = getCollection('kbArticles').map(ensureVersioned).find((entry) => entry.id === params.id)
    if (!article || !visibleTo(audience)(article)) throw notFound('Article')
    validation(typeof body.helpful === 'boolean' ? {} : { helpful: ['required'] })
    if (body.helpful) article.helpful_count += 1
    else article.not_helpful_count += 1
    return { data: { helpful_count: article.helpful_count } }
  } },
  { method: 'GET', path: P.publicKb, handler: ({ query }) => {
    publicEnabled()
    return list('public', query)
  } },
  { method: 'GET', path: `${P.publicKb}/:id`, handler: ({ params }) => {
    publicEnabled()
    return read('public', params.id)
  } },
]
