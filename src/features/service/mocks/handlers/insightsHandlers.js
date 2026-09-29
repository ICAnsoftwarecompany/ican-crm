import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, required } from '../crud'
import { getCollection, registerSeed } from '../db'
import { findStatus, getCaseSetup } from '../state/caseConfig'
import { computeSla } from '../state/sla'
import '../state/feedback'
import { getMockCurrentUser } from '../seeds/seedUtils'
import { paginate } from '../utils'

registerSeed('savedViews', () => [
  { id: 'sv-urgent-whatsapp', entity: 'service_case', name: 'العاجل المفتوح', visibility: 'shared', owner_id: 'system', filters: { view: 'open', priority: 'urgent', search: '' } },
])

const DAY = 24 * 60 * 60 * 1000
const PERIODS = { '7d': 7, '30d': 30, '90d': 90 }
const OPEN = ['open', 'in_progress', 'pending']
const minutesBetween = (from, to) => (new Date(to).getTime() - new Date(from).getTime()) / 60000
const average = (values) => (values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null)
const round1 = (value) => (value == null ? null : Math.round(value * 10) / 10)
const inPeriod = (value, from) => value && new Date(value).getTime() >= from

function csatSummary(responses) {
  const distribution = [1, 2, 3, 4, 5].map((score) => ({ score, count: responses.filter((entry) => entry.score === score).length }))
  const count = responses.length
  return {
    count,
    average: count ? round1(responses.reduce((sum, entry) => sum + entry.score, 0) / count) : null,
    satisfied_percent: count ? Math.round((responses.filter((entry) => entry.score >= 4).length / count) * 100) : null,
    distribution,
  }
}

function groupCount(items, keyOf) {
  const map = new Map()
  items.forEach((item) => map.set(keyOf(item), (map.get(keyOf(item)) || 0) + 1))
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

function buildTrend(cases, days, now) {
  const step = days > 30 ? 7 : 1
  const buckets = Math.ceil(days / step)
  return Array.from({ length: buckets }, (_, index) => {
    const start = now - (buckets - index) * step * DAY
    const end = start + step * DAY
    const within = (value) => value && new Date(value).getTime() >= start && new Date(value).getTime() < end
    return {
      date: new Date(start).toISOString().slice(0, 10),
      created: cases.filter((item) => within(item.opened_at)).length,
      resolved: cases.filter((item) => within(item.resolved_at)).length,
    }
  })
}

/** GET /service/reports/overview?period=7d|30d|90d — backend aggregates; the mock recomputes. */
function reportOverview(query) {
  const days = PERIODS[query.period] || 30
  const now = Date.now()
  const from = now - days * DAY
  const setup = getCaseSetup()
  const cases = getCollection('cases')
  const created = cases.filter((item) => inPeriod(item.opened_at, from))
  const resolved = cases.filter((item) => inPeriod(item.resolved_at, from))
  const slaStates = resolved.map((item) => computeSla(item)?.resolution.state).filter(Boolean)
  const met = slaStates.filter((state) => state === 'met').length
  const responses = getCollection('feedbackResponses').filter((entry) => inPeriod(entry.responded_at, from))
  const csatFor = (ids) => csatSummary(responses.filter((entry) => ids.has(entry.case_id))).average
  const types = getCollection('caseTypes')

  return {
    period: { key: `${days}d`, from: new Date(from).toISOString(), to: new Date(now).toISOString() },
    kpis: {
      created: created.length,
      resolved: resolved.length,
      open_now: cases.filter((item) => OPEN.includes(findStatus(item.status_id)?.category)).length,
      avg_first_response_minutes: average(created.filter((item) => item.first_response_at).map((item) => minutesBetween(item.opened_at, item.first_response_at))),
      avg_resolution_minutes: average(resolved.map((item) => minutesBetween(item.opened_at, item.resolved_at))),
      sla_compliance_percent: slaStates.length ? Math.round((met / slaStates.length) * 100) : null,
      reopened: resolved.filter((item) => item.reopened_count > 0).length,
    },
    csat: csatSummary(responses),
    sla: { met, breached: slaStates.length - met },
    trend: buildTrend(cases, days, now),
    by_type: groupCount(created, (item) => item.type_id).map(([id, count]) => {
      const type = types.find((entry) => entry.id === id)
      return { type: type ? { id, key: type.key, label: type.label } : { id, key: id, label: null }, count }
    }),
    by_channel: groupCount(created, (item) => item.source_channel).map(([channel, count]) => ({ channel, count })),
    by_agent: groupCount(resolved.filter((item) => item.assignee_id), (item) => item.assignee_id).map(([agentId, count]) => {
      const agentCases = resolved.filter((item) => item.assignee_id === agentId)
      return {
        agent: { id: agentId, name: setup.agents.find((agent) => agent.id === agentId)?.name || agentId },
        resolved: count,
        avg_resolution_minutes: average(agentCases.map((item) => minutesBetween(item.opened_at, item.resolved_at))),
        csat_average: csatFor(new Set(agentCases.map((item) => item.id))),
      }
    }),
  }
}

/** GET /service/feedback/responses?score=&period=&page= — newest first, with a summary. */
function feedbackList(query) {
  const days = PERIODS[query.period] || 90
  const from = Date.now() - days * DAY
  const cases = getCollection('cases')
  const all = getCollection('feedbackResponses')
    .filter((entry) => inPeriod(entry.responded_at, from))
    .sort((a, b) => String(b.responded_at).localeCompare(String(a.responded_at)))
  const filtered = all.filter((entry) => !query.score || String(entry.score) === String(query.score))
  const page = paginate(filtered, query)
  return {
    data: page.data.map((entry) => {
      const item = cases.find((candidate) => candidate.id === entry.case_id)
      return { ...entry, case: item ? { id: item.id, case_number: item.case_number, subject: item.subject, customer: { id: item.customer.id, name: item.customer.name } } : null }
    }),
    meta: { ...page.meta, summary: csatSummary(all) },
  }
}

const visibleTo = (view, userId) => view.visibility === 'shared' || view.owner_id === userId

/** @type {import('../router').MockRoute[]} */
export const insightsHandlers = [
  { method: 'GET', path: serviceEndpoints.reportOverview, handler: ({ query }) => ({ data: reportOverview(query) }) },
  { method: 'GET', path: serviceEndpoints.feedbackResponses, handler: ({ query }) => feedbackList(query) },
  ...crudHandlers({
    collection: 'savedViews',
    path: serviceEndpoints.savedViews,
    prefix: 'sv',
    validate: (body) => ({ ...(required(body.name) && { name: ['required'] }), ...(!body.entity && { entity: ['required'] }) }),
  }).map((route) => {
    if (route.method === 'GET' && route.path === serviceEndpoints.savedViews) {
      return {
        ...route,
        handler: ({ query }) => {
          const me = getMockCurrentUser().id
          return { data: getCollection('savedViews').filter((view) => (!query.entity || view.entity === query.entity) && visibleTo(view, me)) }
        },
      }
    }
    if (route.method === 'POST' && route.path === serviceEndpoints.savedViews) {
      return { ...route, handler: (context) => route.handler({ ...context, body: { visibility: 'private', ...context.body, owner_id: getMockCurrentUser().id } }) }
    }
    return route
  }),
]

