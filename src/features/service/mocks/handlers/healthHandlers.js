import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection } from '../db'
import { notFound } from '../errors'
import { findStatus, getCaseSetup } from '../state/caseConfig'
import { signals } from '../state/aiEngine'
import { healthScore } from '../state/healthScore'
import { serializeSchedule, todayIso } from '../state/billingLedger'
import { findOrAdoptCustomer } from './casesHandlers'
import './aiAgentHandlers'
import './followUpsHandlers'
import './kbHandlers'
import './qualityHandlers'
import './subscriptionsHandlers'

const DAY = 24 * 60 * 60 * 1000
const OPEN = ['open', 'in_progress', 'pending']
const PERIODS = { '7d': 7, '30d': 30, '90d': 90 }
const isOpen = (item) => OPEN.includes(findStatus(item.status_id)?.category)

/** Service signals of one customer → health score (spec §45.2). */
export function customerHealth(customerId) {
  const since = Date.now() - 90 * DAY
  const cases = getCollection('cases').filter((item) => item.customer?.id === customerId)
  const feedback = getCollection('feedbackResponses')
  const csat = feedback.filter((entry) => (entry.survey || 'csat') === 'csat' && cases.some((item) => item.id === entry.case_id))
  const nps = feedback.filter((entry) => entry.survey === 'nps' && entry.customer_id === customerId).sort((a, b) => String(b.responded_at).localeCompare(String(a.responded_at)))[0]
  const overdueLines = getCollection('paymentSchedules').filter((schedule) => schedule.customer_id === customerId && schedule.status === 'active').reduce((sum, schedule) => sum + serializeSchedule(schedule, todayIso()).lines.filter((line) => line.status === 'overdue').length, 0)
  const subscriptionTrouble = getCollection('subscriptions').some((entry) => entry.customer_id === customerId && ['past_due', 'suspended'].includes(entry.status))
  const activity = cases.filter((item) => Date.parse(item.opened_at) > since).length + getCollection('serviceRecords').filter((record) => record.customer_id === customerId && Date.parse(record.created_at || record.updated_at || 0) > since).length
  const followUpIssues = getCollection('followUpEnrollments').filter((entry) => entry.customer_id === customerId).reduce((sum, entry) => sum + entry.history.filter((item) => ['issue_found', 'not_renewing'].includes(item.outcome)).length, 0)
  const open = cases.filter(isOpen)
  const result = healthScore({
    openCases: open.length,
    negativeSignals: open.filter((item) => signals(`${item.subject} ${item.description || ''}`).sentiment === 'negative').length,
    csatAverage: csat.length ? Math.round((csat.reduce((sum, entry) => sum + entry.score, 0) / csat.length) * 10) / 10 : null,
    lastNps: nps ? nps.score : null,
    overdueLines,
    subscriptionTrouble,
    activity90d: activity,
    followUpIssues,
  })
  const customer = findOrAdoptCustomer(customerId)
  return { customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone } : { id: customerId }, ...result, computed_at: new Date().toISOString() }
}

/** Advanced analytics (spec §46.3): aging, repeat contact, self-service, AI resolution, workload, follow-ups. */
function advancedReport(period) {
  const days = PERIODS[period] || 30
  const from = Date.now() - days * DAY
  const cases = getCollection('cases')
  const open = cases.filter(isOpen)
  const ageDays = (item) => (Date.now() - Date.parse(item.opened_at)) / DAY
  const aging = [['0_1', 0, 1], ['1_3', 1, 3], ['3_7', 3, 7], ['7_plus', 7, Infinity]].map(([key, min, max]) => ({ key, count: open.filter((item) => ageDays(item) >= min && ageDays(item) < max).length }))
  const inPeriod = cases.filter((item) => Date.parse(item.opened_at) >= from)
  const perCustomer = inPeriod.reduce((acc, item) => ({ ...acc, [item.customer?.id]: (acc[item.customer?.id] || 0) + 1 }), {})
  const customers = Object.keys(perCustomer).length
  const repeat = Object.values(perCustomer).filter((count) => count > 1).length
  const deflections = getCollection('kbDeflections').filter((entry) => Date.parse(entry.at) >= from).length
  const conversations = getCollection('aiConversations').filter((entry) => entry.channel !== 'test' && Date.parse(entry.started_at) >= from)
  const agents = getCaseSetup().agents
  const workload = agents.map((agent) => ({ agent: { id: agent.id, name: agent.name }, open: open.filter((item) => item.assignee_id === agent.id).length, overdue: open.filter((item) => item.assignee_id === agent.id && ageDays(item) >= 3).length })).sort((a, b) => b.open - a.open)
  const enrollments = getCollection('followUpEnrollments')
  const outcomes = enrollments.flatMap((entry) => entry.history).filter((entry) => Date.parse(entry.at) >= from).reduce((acc, entry) => ({ ...acc, [entry.outcome]: (acc[entry.outcome] || 0) + 1 }), {})
  return {
    period: `${days}d`,
    backlog: open.length,
    aging,
    repeat_contact_percent: customers ? Math.round((repeat / customers) * 100) : null,
    self_service: { deflections, requests: inPeriod.length, deflection_percent: deflections + inPeriod.length ? Math.round((deflections / (deflections + inPeriod.length)) * 100) : null },
    ai: { conversations: conversations.length, resolved_by_ai: conversations.filter((entry) => entry.status === 'ai').length, handed_off: conversations.filter((entry) => entry.status === 'handed_off').length },
    workload,
    follow_ups: { active: enrollments.filter((entry) => entry.status === 'active').length, completed: enrollments.filter((entry) => entry.status === 'completed').length, outcomes: Object.entries(outcomes).map(([outcome, count]) => ({ outcome, count })).sort((a, b) => b.count - a.count) },
  }
}

/** @type {import('../router').MockRoute[]} */
export const healthHandlers = [
  {
    method: 'GET',
    path: serviceEndpoints.customerHealth(':customerId'),
    handler: ({ params }) => {
      if (!findOrAdoptCustomer(params.customerId)) throw notFound('Customer')
      return { data: customerHealth(params.customerId) }
    },
  },
  {
    method: 'GET',
    path: serviceEndpoints.health,
    handler: ({ query }) => {
      const list = getCollection('customers').map((customer) => customerHealth(customer.id))
      const counts = { healthy: 0, watch: 0, at_risk: 0 }
      list.forEach((entry) => { counts[entry.band] += 1 })
      const items = list.filter((entry) => !query.band || entry.band === query.band).sort((a, b) => a.score - b.score).slice(0, Number(query.limit) || 50)
      return { data: items, meta: { counts } }
    },
  },
  { method: 'GET', path: serviceEndpoints.reportAdvanced, handler: ({ query }) => ({ data: advancedReport(query.period) }) },
]
