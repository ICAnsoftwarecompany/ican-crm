import { SERVICE_API, serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, required, requiredLabel } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError } from '../errors'
import { buildKbArticles, buildKbCategories, buildMacros, buildSavedReplies } from '../seeds/communicationSeed'
import { getMockCurrentUser } from '../seeds/seedUtils'
import { nowIso } from '../utils'
import { rankArticles } from '../state/kbLive'
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

function suggestArticles(item) {
  return rankArticles(getCollection('kbArticles'), `${item.subject} ${item.description || ''}`, { typeId: item.type_id }).map(({ article }) => serializeArticle(article))
}

export function serializeArticle(article) {
  const category = getCollection('kbCategories').find((entry) => entry.id === article.category_id)
  return { ...article, category: category ? { id: category.id, label: category.label } : null }
}

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
