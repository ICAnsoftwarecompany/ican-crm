import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, requiredLabel } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildQualityChecklists, buildQualityReviews, buildSamplingRules, buildSurveys } from '../seeds/qualitySeed'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { nowIso, paginate } from '../utils'
import { findStatus, getCaseSetup } from '../state/caseConfig'
import { SCALES, weightedScore, weightsValid } from '../state/qualityScore'
import '../state/feedback'

registerSeed('qualityChecklists', buildQualityChecklists)
registerSeed('samplingRules', buildSamplingRules)
registerSeed('qualityReviews', buildQualityReviews)
registerSeed('feedbackSurveys', buildSurveys)

const Q = serviceEndpoints.quality
const DAY = 24 * 60 * 60 * 1000
export const ROOT_CAUSES = ['training', 'process', 'product', 'communication', 'system', 'customer']
const SUBJECTS = ['case', 'follow_up', 'call']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const agentName = (id) => getCaseSetup().agents.find((agent) => agent.id === id)?.name || id
const checklistOf = (id) => getCollection('qualityChecklists').find((entry) => entry.id === id)
const serializeReview = (review) => {
  const checklist = checklistOf(review.checklist_id)
  return { ...review, agent: { id: review.agent_id, name: agentName(review.agent_id) }, reviewer: review.reviewer_id ? { id: review.reviewer_id, name: agentName(review.reviewer_id) } : null, checklist: checklist ? { id: checklist.id, name: checklist.name, criteria: checklist.criteria, pass_score: checklist.pass_score } : null }
}
function reviewById(id) {
  const review = getCollection('qualityReviews').find((entry) => entry.id === id)
  if (!review) throw notFound('Review')
  return review
}
const csatOf = (caseId) => getCollection('feedbackResponses').find((entry) => entry.case_id === caseId && (entry.survey || 'csat') === 'csat')

/**
 * Sampling (spec §42.2): for each active rule, pick resolved cases not reviewed yet — all low-CSAT ones for
 * `only_low_csat`, otherwise `percent` of each agent's cases (at least `min_per_agent`). Deterministic in the mock.
 */
export function runSampling() {
  const reviews = getCollection('qualityReviews')
  const reviewed = new Set(reviews.map((entry) => `${entry.subject_type}:${entry.subject_id}`))
  const since = Date.now() - 30 * DAY
  const cases = getCollection('cases').filter((item) => item.assignee_id && ['resolved', 'closed'].includes(findStatus(item.status_id)?.category) && Date.parse(item.resolved_at || item.closed_at || item.updated_at) > since)
  const created = []
  getCollection('samplingRules').filter((rule) => rule.active).forEach((rule) => {
    const eligible = cases.filter((item) => (!rule.case_type_ids?.length || rule.case_type_ids.includes(item.type_id)) && (!rule.only_low_csat || (csatOf(item.id)?.score ?? 5) <= 2))
    const byAgent = eligible.reduce((acc, item) => ({ ...acc, [item.assignee_id]: [...(acc[item.assignee_id] || []), item] }), {})
    Object.values(byAgent).forEach((list) => {
      // Target per agent = percent of their eligible cases (at least min); already-sampled cases count towards it.
      const target = rule.only_low_csat ? list.length : Math.min(list.length, Math.max(Number(rule.min_per_agent) || 0, Math.ceil((list.length * Number(rule.percent)) / 100)))
      const already = list.filter((item) => reviewed.has(`case:${item.id}`)).length
      list.filter((item) => !reviewed.has(`case:${item.id}`)).slice(0, Math.max(0, target - already)).forEach((item) => {
        reviewed.add(`case:${item.id}`)
        const review = { id: mockId('qr'), checklist_id: rule.checklist_id, subject_type: 'case', subject_id: item.id, subject: { id: item.id, number: item.case_number, title: item.subject }, agent_id: item.assignee_id, reviewer_id: null, source: rule.id, status: 'pending', scores: {}, total: null, passed: null, comments: null, root_cause: null, corrective_action: null, preventive_action: null, created_at: nowIso(), reviewed_at: null }
        reviews.push(review)
        created.push(review)
      })
    })
  })
  return created
}

const validateChecklist = (body) => ({
  ...(requiredLabel(body.name) && { name: ['required'] }),
  ...(!SUBJECTS.includes(body.subject_type) && { subject_type: ['required'] }),
  ...(!weightsValid(body.criteria) && { criteria: ['weights_100'] }),
  ...((body.criteria || []).some((criterion) => !criterion.key || requiredLabel(criterion.label)) && { criteria: ['invalid'] }),
  ...(!(Number(body.pass_score) >= 0 && Number(body.pass_score) <= 100) && { pass_score: ['invalid'] }),
})

/** @type {import('../router').MockRoute[]} */
export const qualityHandlers = [
  ...crudHandlers({ collection: 'qualityChecklists', path: Q.checklists, prefix: 'qc', validate: validateChecklist, canDelete: (item) => {
    if (getCollection('qualityReviews').some((entry) => entry.checklist_id === item.id)) throw new MockHttpError(409, 'RESOURCE_IN_USE', 'Checklist has reviews')
  } }),
  ...crudHandlers({ collection: 'samplingRules', path: Q.samplingRules, prefix: 'qs', validate: (body) => ({
    ...(requiredLabel(body.name) && { name: ['required'] }),
    ...(!checklistOf(body.checklist_id) && { checklist_id: ['required'] }),
    ...(!(Number(body.percent) >= 1 && Number(body.percent) <= 100) && { percent: ['invalid'] }),
  }) }),
  ...crudHandlers({ collection: 'feedbackSurveys', path: serviceEndpoints.feedbackSurveys, prefix: 'sv', validate: (body) => ({
    ...(requiredLabel(body.name) && { name: ['required'] }),
    ...(!SCALES[body.type] && { type: ['required'] }),
    ...(requiredLabel(body.question) && { question: ['required'] }),
  }) }),
  { method: 'POST', path: Q.sample, handler: () => ({ data: { created: runSampling().length } }) },
  {
    method: 'GET',
    path: Q.reviews,
    handler: ({ query }) => {
      const items = getCollection('qualityReviews')
        .filter((entry) => !query.status || entry.status === query.status)
        .filter((entry) => !query.agent_id || entry.agent_id === query.agent_id)
        .sort((a, b) => String(b.reviewed_at || b.created_at).localeCompare(String(a.reviewed_at || a.created_at)))
        .map(serializeReview)
      return paginate(items, { per_page: 100, ...query })
    },
  },
  {
    method: 'POST',
    path: Q.reviews,
    handler: ({ body = {} }) => {
      // Manual: a supervisor sends one case to review.
      const item = getCollection('cases').find((entry) => entry.id === body.subject_id)
      const checklist = checklistOf(body.checklist_id) || getCollection('qualityChecklists').find((entry) => entry.subject_type === 'case' && entry.active)
      validation({ ...(!item && { subject_id: ['required'] }), ...(!checklist && { checklist_id: ['required'] }) })
      if (getCollection('qualityReviews').some((entry) => entry.subject_id === item.id && entry.status === 'pending')) throw new MockHttpError(409, 'REVIEW_ALREADY_QUEUED', 'Already waiting for review')
      const review = { id: mockId('qr'), checklist_id: checklist.id, subject_type: 'case', subject_id: item.id, subject: { id: item.id, number: item.case_number, title: item.subject }, agent_id: item.assignee_id, reviewer_id: null, source: 'manual', status: 'pending', scores: {}, total: null, passed: null, comments: null, root_cause: null, corrective_action: null, preventive_action: null, created_at: nowIso(), reviewed_at: null }
      getCollection('qualityReviews').push(review)
      return { status: 201, body: { data: serializeReview(review) } }
    },
  },
  { method: 'GET', path: `${Q.reviews}/:id`, handler: ({ params }) => ({ data: serializeReview(reviewById(params.id)) }) },
  {
    method: 'PATCH',
    path: `${Q.reviews}/:id`,
    handler: ({ params, body = {} }) => {
      const review = reviewById(params.id)
      if (review.status === 'done') throw new MockHttpError(409, 'REVIEW_DONE', 'Review already submitted')
      const checklist = checklistOf(review.checklist_id)
      const scores = body.scores || {}
      const missing = checklist.criteria.filter((criterion) => !(Number(scores[criterion.key]) >= 0 && Number(scores[criterion.key]) <= 5) || scores[criterion.key] === null || scores[criterion.key] === undefined)
      const total = weightedScore(checklist.criteria, scores)
      const failing = total < checklist.pass_score
      validation({
        ...(missing.length && { scores: ['all_required'] }),
        // A failed review needs a root cause and a corrective action (spec §42.2: RCA + CAPA).
        ...(!missing.length && failing && !ROOT_CAUSES.includes(body.root_cause) && { root_cause: ['required'] }),
        ...(!missing.length && failing && !String(body.corrective_action || '').trim() && { corrective_action: ['required'] }),
      })
      Object.assign(review, { scores, total, passed: !failing, comments: body.comments || null, root_cause: body.root_cause || null, corrective_action: body.corrective_action || null, preventive_action: body.preventive_action || null, reviewer_id: getMockCurrentUser().id, status: 'done', reviewed_at: nowIso() })
      return { data: serializeReview(review) }
    },
  },
  {
    method: 'DELETE',
    path: `${Q.reviews}/:id`,
    handler: ({ params }) => {
      const list = getCollection('qualityReviews')
      const index = list.findIndex((entry) => entry.id === params.id && entry.status === 'pending')
      if (index < 0) throw notFound('Review')
      list.splice(index, 1)
      return { status: 204, body: null }
    },
  },
  {
    method: 'GET',
    path: Q.summary,
    handler: ({ query }) => {
      const days = { '7d': 7, '30d': 30, '90d': 90 }[query.period] || 30
      const done = getCollection('qualityReviews').filter((entry) => entry.status === 'done' && Date.parse(entry.reviewed_at) > Date.now() - days * DAY)
      const avg = (values) => (values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null)
      const agents = [...new Set(done.map((entry) => entry.agent_id))].map((id) => {
        const list = done.filter((entry) => entry.agent_id === id)
        return { agent: { id, name: agentName(id) }, reviews: list.length, average: avg(list.map((entry) => entry.total)), pass_rate: Math.round((list.filter((entry) => entry.passed).length / list.length) * 100) }
      }).sort((a, b) => (b.average ?? 0) - (a.average ?? 0))
      const checklist = checklistOf('qc-case') || getCollection('qualityChecklists')[0]
      const criteria = (checklist?.criteria || []).map((criterion) => ({ key: criterion.key, label: criterion.label, average: avg(done.filter((entry) => entry.checklist_id === checklist.id).map((entry) => (Number(entry.scores[criterion.key]) / 5) * 100)) }))
      const causes = ROOT_CAUSES.map((cause) => ({ cause, count: done.filter((entry) => entry.root_cause === cause).length })).filter((entry) => entry.count).sort((a, b) => b.count - a.count)
      return { data: { reviews: done.length, pending: getCollection('qualityReviews').filter((entry) => entry.status === 'pending').length, average: avg(done.map((entry) => entry.total)), pass_rate: done.length ? Math.round((done.filter((entry) => entry.passed).length / done.length) * 100) : null, agents, criteria, root_causes: causes } }
    },
  },
]
