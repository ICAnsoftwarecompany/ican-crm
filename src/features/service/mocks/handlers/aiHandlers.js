import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError } from '../errors'
import { nowIso } from '../utils'
import { getCaseSetup, findStatus } from '../state/caseConfig'
import { assignmentSuggestions, draftReply, duplicates, summarize, triage } from '../state/aiEngine'
import { liveContent, rankArticles } from '../state/kbLive'
import { addActivity, assertVersion, getCase, serializeCase, touch } from './casesHandlers'
import './communicationHandlers'
import './followUpsHandlers'

export const AI_FEATURES = ['triage', 'sentiment', 'suggested_reply', 'summaries', 'duplicates', 'smart_assignment', 'agent']
const defaults = () => ({
  features: Object.fromEntries(AI_FEATURES.map((key) => [key, true])),
  tone: 'friendly',
  language: 'auto',
  auto_reply: { enabled: false, min_confidence: 0.85, max_per_conversation: 3 },
  blocked_topics: ['محامي', 'lawyer'],
  handoff_topics: ['money', 'complaint', 'cancellation'],
  monthly_limit: 5000,
  provider: 'tenant-default',
})
registerSeed('aiSettings', () => [defaults()])
registerSeed('aiUsage', () => [{ month: new Date().toISOString().slice(0, 7), counts: { triage: 412, suggested_reply: 188, summaries: 96, duplicates: 240, smart_assignment: 150, agent: 730 }, feedback: { triage: { accepted: 61, rejected: 14 }, suggested_reply: { accepted: 42, rejected: 19 }, smart_assignment: { accepted: 33, rejected: 6 } } }])

const AI = serviceEndpoints.ai
const OPEN = ['open', 'in_progress', 'pending']
export const aiSettings = () => getCollection('aiSettings')[0]
function usage() {
  const month = new Date().toISOString().slice(0, 7)
  const list = getCollection('aiUsage')
  let row = list.find((entry) => entry.month === month)
  if (!row) list.push((row = { month, counts: {}, feedback: {} }))
  return row
}
const total = (row) => Object.values(row.counts).reduce((sum, value) => sum + value, 0)

/** Feature switch + monthly limit (spec §45.4). Counts one use. */
export function useAiFeature(feature) {
  if (!aiSettings().features[feature]) throw new MockHttpError(403, 'FEATURE_DISABLED', 'This AI feature is off')
  const row = usage()
  if (total(row) >= aiSettings().monthly_limit) throw new MockHttpError(429, 'AI_LIMIT_REACHED', 'Monthly AI limit reached')
  row.counts[feature] = (row.counts[feature] || 0) + 1
}
const blockedTopic = (text) => aiSettings().blocked_topics.find((topic) => topic && String(text).toLowerCase().includes(topic.toLowerCase())) || null
const caseTypes = () => getCollection('caseTypes')
const isOpen = (item) => OPEN.includes(findStatus(item.status_id)?.category)
const activitiesOf = (caseId) => getCollection('caseActivities').filter((entry) => entry.case_id === caseId)
const languageFor = (requested, text) => (requested && requested !== 'auto' ? requested : aiSettings().language !== 'auto' ? aiSettings().language : /[؀-ۿ]/.test(text) ? 'ar' : 'en')

function triageFor(item) {
  const result = triage(`${item.subject} ${item.description || ''}`, caseTypes())
  const differs = (result.type_id && result.type_id !== item.type_id) || result.priority !== item.priority
  return { ...result, differs }
}

/** @type {import('../router').MockRoute[]} */
export const aiHandlers = [
  { method: 'GET', path: AI.settings, handler: () => ({ data: aiSettings() }) },
  {
    method: 'PUT',
    path: AI.settings,
    handler: ({ body = {} }) => {
      const limit = Number(body.monthly_limit)
      const confidence = Number(body.auto_reply?.min_confidence)
      const errors = {
        ...(body.monthly_limit != null && !(limit >= 0) && { monthly_limit: ['invalid'] }),
        ...(body.auto_reply && !(confidence >= 0.5 && confidence <= 1) && { 'auto_reply.min_confidence': ['invalid'] }),
      }
      if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
      Object.assign(aiSettings(), body)
      return { data: aiSettings() }
    },
  },
  {
    method: 'GET',
    path: AI.usage,
    handler: () => {
      const row = usage()
      const rate = (feature) => {
        const entry = row.feedback[feature]
        return entry && entry.accepted + entry.rejected ? Math.round((entry.accepted / (entry.accepted + entry.rejected)) * 100) : null
      }
      return { data: { month: row.month, used: total(row), limit: aiSettings().monthly_limit, counts: row.counts, acceptance: Object.fromEntries(['triage', 'suggested_reply', 'smart_assignment'].map((key) => [key, rate(key)])) } }
    },
  },
  {
    method: 'POST',
    path: AI.triage,
    handler: ({ body = {} }) => {
      useAiFeature('triage')
      return { data: triage(`${body.subject || ''} ${body.description || ''}`, caseTypes()) }
    },
  },
  {
    method: 'GET',
    path: AI.case(':caseId', 'insights'),
    handler: ({ params }) => {
      const item = getCase(params.caseId)
      const features = aiSettings().features
      return { data: { triage: features.triage ? triageFor(item) : null, features } }
    },
  },
  {
    method: 'POST',
    path: AI.case(':caseId', 'summary'),
    handler: ({ params }) => {
      const item = getCase(params.caseId)
      useAiFeature('summaries')
      item.ai_summary = { ...summarize(item, activitiesOf(item.id)), generated_at: nowIso() }
      return { data: item.ai_summary }
    },
  },
  {
    method: 'POST',
    path: AI.case(':caseId', 'suggest-reply'),
    handler: ({ params, body = {} }) => {
      const item = getCase(params.caseId)
      const text = `${item.subject} ${item.description || ''}`
      const topic = blockedTopic(text)
      if (topic) return { data: { blocked: true, topic } }
      useAiFeature('suggested_reply')
      const language = languageFor(body.language, text)
      // Only ground the draft on articles written in the reply language (no mixed-language replies).
      const top = rankArticles(getCollection('kbArticles').filter((article) => article.language === language), text, { typeId: item.type_id, limit: 1 })[0]?.article
      const content = top ? liveContent(top) : null
      const draft = draftReply({ ...item, customer: item.customer }, { article: content, tone: aiSettings().tone, language })
      return { data: { ...draft, sources: top ? [{ id: top.id, title: content.title, version: content.version }] : [], blocked: false } }
    },
  },
  {
    method: 'GET',
    path: AI.case(':caseId', 'duplicates'),
    handler: ({ params }) => {
      const item = getCase(params.caseId)
      if (!aiSettings().features.duplicates) return { data: [] }
      return { data: duplicates(item, getCollection('cases'), { isOpen }).map(({ case: other, score, reasons }) => ({ case: { id: other.id, case_number: other.case_number, subject: other.subject, customer: other.customer, status: findStatus(other.status_id) ? { key: findStatus(other.status_id).key, label: findStatus(other.status_id).label } : null }, score, reasons })) }
    },
  },
  {
    method: 'GET',
    path: AI.case(':caseId', 'assignment'),
    handler: ({ params }) => {
      const item = getCase(params.caseId)
      if (!aiSettings().features.smart_assignment) return { data: [] }
      const openLoad = getCollection('cases').filter(isOpen).reduce((acc, entry) => ({ ...acc, [entry.assignee_id]: (acc[entry.assignee_id] || 0) + 1 }), {})
      const queue = getCollection('queues').find((entry) => entry.id === item.queue_id)
      const owner = getCollection('portfolioMembers').find((entry) => entry.customer_id === item.customer?.id)?.owner_user_id || null
      return { data: assignmentSuggestions(item, { agents: getCaseSetup().agents, openLoad, queueAgentIds: queue?.agent_ids || [], portfolioOwnerId: owner }) }
    },
  },
  {
    method: 'POST',
    path: AI.case(':caseId', 'feedback'),
    handler: ({ params, body = {} }) => {
      getCase(params.caseId)
      const row = usage()
      const entry = (row.feedback[body.feature] = row.feedback[body.feature] || { accepted: 0, rejected: 0 })
      entry[body.accepted ? 'accepted' : 'rejected'] += 1
      return { data: entry }
    },
  },
  {
    method: 'POST',
    path: serviceEndpoints.caseMarkDuplicate(':caseId'),
    handler: ({ params, body = {} }) => {
      const item = getCase(params.caseId)
      assertVersion(item, body.version)
      const original = getCase(body.of_case_id)
      if (original.id === item.id) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { of_case_id: ['invalid'] })
      const closed = getCaseSetup().case_types[0]?.pipeline.statuses.find((status) => status.category === 'closed')
      const from = findStatus(item.status_id)
      Object.assign(item, { duplicate_of: { id: original.id, case_number: original.case_number }, resolution_code: 'duplicate', status_id: closed.id, closed_at: nowIso() })
      touch(item)
      addActivity(item.id, { type: 'status_change', metadata: { from: { key: from.key, label: from.label }, to: { key: closed.key, label: closed.label }, duplicate_of: item.duplicate_of } })
      addActivity(original.id, { type: 'field_change', metadata: { field: 'duplicates', value: item.case_number } })
      return { data: serializeCase(item) }
    },
  },
]
