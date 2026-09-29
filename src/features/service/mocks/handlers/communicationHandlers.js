import { SERVICE_API, serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, required, requiredLabel } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError } from '../errors'
import { buildKbArticles, buildKbCategories, buildMacros, buildSavedReplies } from '../seeds/communicationSeed'
import { getMockCurrentUser } from '../seeds/seedUtils'
import { matchesSearch, nowIso } from '../utils'
import { addActivity, applyTransition, assertVersion, getCase, serializeCase, touch } from './casesHandlers'

registerSeed('savedReplies', buildSavedReplies)
registerSeed('macros', buildMacros)
registerSeed('kbCategories', buildKbCategories)
registerSeed('kbArticles', buildKbArticles)

const { settings } = serviceEndpoints
const text = (value, language = 'ar') => (value && typeof value === 'object' ? value[language] || value.en || value.ar || '' : value || '')

/** Server-side variable rendering (the frontend preview mirrors a subset). */
function renderTemplate(body, item) {
  const values = {
    'customer.name': item.customer?.name || '',
    'case.number': item.case_number,
    'agent.name': getMockCurrentUser().name,
  }
  return String(body).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => values[key] ?? match)
}

/** Macro = ordered actions applied atomically (all validated before any change). */
function applyMacro(item, macro, language) {
  const transition = macro.actions.find((action) => action.type === 'set_status')
  if (transition) {
    const snapshot = { ...item }
    try {
      applyTransition(item, transition.status_id, {})
    } catch (error) {
      Object.assign(item, snapshot)
      throw error
    }
  }
  macro.actions.forEach((action) => {
    if (action.type === 'reply' && text(action.body, language).trim()) {
      if (!item.first_response_at) item.first_response_at = nowIso()
      addActivity(item.id, { type: 'reply', visibility: 'customer', channel: item.source_channel, body: renderTemplate(text(action.body, language), item) })
    }
    if (action.type === 'add_note' && text(action.body, language).trim()) {
      addActivity(item.id, { type: 'internal_note', body: text(action.body, language) })
    }
    if (action.type === 'set_priority' && action.priority && action.priority !== item.priority) {
      addActivity(item.id, { type: 'field_change', metadata: { changes: { priority: { from: item.priority, to: action.priority } } } })
      item.priority = action.priority
    }
  })
  touch(item)
  addActivity(item.id, { type: 'macro_applied', metadata: { macro: { id: macro.id, name: macro.name } } })
}

const isLive = (article, now = Date.now()) =>
  article.status === 'published' && (!article.expires_at || new Date(article.expires_at).getTime() > now)

const words = (value) => String(value || '').toLowerCase().split(/[\s,.،؟?!:;()-]+/).filter((word) => word.length > 2)

function suggestArticles(item) {
  const subjectWords = new Set(words(item.subject))
  return getCollection('kbArticles')
    .filter((article) => isLive(article))
    .map((article) => {
      const typeMatch = article.related_case_type_ids?.includes(item.type_id) ? 10 : 0
      const overlap = words(`${article.title} ${article.tags?.join(' ')}`).filter((word) => subjectWords.has(word)).length
      return { article, score: typeMatch + overlap }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ article }) => serializeArticle(article))
}

function serializeArticle(article) {
  const category = getCollection('kbCategories').find((entry) => entry.id === article.category_id)
  return { ...article, category: category ? { id: category.id, label: category.label } : null }
}

function listArticles(query) {
  const data = getCollection('kbArticles')
    .filter((article) => !query.category_id || article.category_id === query.category_id)
    .filter((article) => !query.status || article.status === query.status)
    .filter((article) => !query.visibility || article.visibility === query.visibility)
    .filter((article) => matchesSearch([article.title, article.body, ...(article.tags || [])], query.search))
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
    .map(serializeArticle)
  return { data }
}

const ARTICLE_STATUSES = ['draft', 'published', 'archived']

/** @type {import('../router').MockRoute[]} */
export const communicationHandlers = [
  ...crudHandlers({
    collection: 'savedReplies',
    path: settings.savedReplies,
    prefix: 'sr',
    validate: (body) => ({
      ...(requiredLabel(body.title) && { title: ['required'] }),
      ...(requiredLabel(body.body) && { body: ['required'] }),
    }),
  }),
  ...crudHandlers({
    collection: 'macros',
    path: settings.macros,
    prefix: 'macro',
    validate: (body) => ({
      ...(requiredLabel(body.name) && { name: ['required'] }),
      ...(required(body.actions) && { actions: ['required'] }),
    }),
  }),
  ...crudHandlers({
    collection: 'kbCategories',
    path: settings.kbCategories,
    prefix: 'kbc',
    validate: (body) => ({ ...(requiredLabel(body.label) && { label: ['required'] }) }),
    canDelete: (category) => {
      if (getCollection('kbArticles').some((article) => article.category_id === category.id)) {
        throw new MockHttpError(409, 'RESOURCE_IN_USE', 'Category has articles')
      }
    },
  }),

  // Knowledge base articles
  ...crudHandlers({
    collection: 'kbArticles',
    path: serviceEndpoints.kbArticles,
    prefix: 'kb',
    serialize: serializeArticle,
    validate: (body) => ({
      ...(required(body.title) && { title: ['required'] }),
      ...(required(body.body) && { body: ['required'] }),
      ...(!body.category_id && { category_id: ['required'] }),
      ...(body.status && !ARTICLE_STATUSES.includes(body.status) && { status: ['invalid'] }),
    }),
  }).map((route) =>
    // List supports filters; creating always starts as a draft (publishing is a separate permission).
    route.method === 'GET' && route.path === serviceEndpoints.kbArticles
      ? { ...route, handler: ({ query }) => listArticles(query) }
      : route.method === 'POST' && route.path === serviceEndpoints.kbArticles
        ? { ...route, handler: (context) => route.handler({ ...context, body: { tags: [], related_case_type_ids: [], version: 1, ...context.body, status: 'draft', published_at: null } }) }
        : route
  ),
  {
    method: 'POST',
    path: `${serviceEndpoints.kbArticles}/:id/publish`,
    handler: ({ params }) => {
      const article = getCollection('kbArticles').find((entry) => entry.id === params.id)
      if (!article) throw new MockHttpError(404, 'NOT_FOUND', 'Article not found')
      Object.assign(article, { status: 'published', published_at: nowIso(), updated_at: nowIso(), version: (article.version || 1) + 1 })
      return { data: serializeArticle(article) }
    },
  },

  // Case integrations
  {
    method: 'GET',
    path: `${SERVICE_API}/cases/:caseId/suggested-articles`,
    handler: ({ params }) => ({ data: suggestArticles(getCase(params.caseId)) }),
  },
  {
    method: 'POST',
    path: `${SERVICE_API}/cases/:caseId/apply-macro`,
    handler: ({ params, body = {} }) => {
      const item = getCase(params.caseId)
      assertVersion(item, body.version)
      const macro = getCollection('macros').find((entry) => entry.id === body.macro_id && entry.active !== false)
      if (!macro) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { macro_id: ['required'] })
      applyMacro(item, macro, body.language)
      return { data: serializeCase(item) }
    },
  },
]
