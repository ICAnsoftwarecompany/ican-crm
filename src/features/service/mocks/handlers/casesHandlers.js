import { SERVICE_API, serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { findStatus, getCaseSetup, getPipeline } from '../state/caseConfig'
import { computeSla, escalationActivities } from '../state/sla'
import { buildActivities, buildCases, buildCustomers } from '../seeds/casesSeed'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { matchesSearch, nowIso, paginate } from '../utils'

registerSeed('customers', buildCustomers)
registerSeed('cases', buildCases)
registerSeed('caseActivities', buildActivities)

const OPEN_CATEGORIES = ['open', 'in_progress', 'pending']

const setup = getCaseSetup

/** Server-side view filters (backend owns these definitions). */
const VIEW_FILTERS = {
  open: (item) => OPEN_CATEGORIES.includes(findStatus(item.status_id)?.category),
  mine: (item) => VIEW_FILTERS.open(item) && item.assignee_id === getMockCurrentUser().id,
  unassigned: (item) => VIEW_FILTERS.open(item) && !item.assignee_id,
  waiting_customer: (item) => findStatus(item.status_id)?.key === 'pending_customer',
  waiting_internal: (item) => findStatus(item.status_id)?.key === 'pending_internal',
  high_priority: (item) => VIEW_FILTERS.open(item) && ['high', 'urgent'].includes(item.priority),
  sla_at_risk: (item) => VIEW_FILTERS.open(item) && computeSla(item)?.state === 'at_risk',
  sla_breached: (item) => VIEW_FILTERS.open(item) && computeSla(item)?.state === 'breached',
  resolved: (item) => findStatus(item.status_id)?.category === 'resolved',
  closed: (item) => ['closed', 'cancelled'].includes(findStatus(item.status_id)?.category),
  all: () => true,
}

export function serializeCase(item) {
  const config = setup()
  const type = getCollection('caseTypes').find((entry) => entry.id === item.type_id)
  const status = findStatus(item.status_id)
  const queue = config.queues.find((entry) => entry.id === item.queue_id)
  const assignee = config.agents.find((entry) => entry.id === item.assignee_id)
  return {
    ...item,
    type: type ? { id: type.id, key: type.key, label: type.label, icon: type.icon } : null,
    status: status ? { id: status.id, key: status.key, label: status.label, category: status.category } : null,
    queue: queue ? { id: queue.id, label: queue.label } : null,
    assignee: assignee ? { id: assignee.id, name: assignee.name } : null,
    sla: computeSla(item),
  }
}

export function getCase(caseId) {
  const found = getCollection('cases').find((item) => item.id === caseId)
  if (!found) throw notFound('Case')
  return found
}

export function assertVersion(item, version) {
  if (version != null && Number(version) !== item.version) {
    throw new MockHttpError(409, 'CONFLICT_VERSION', 'This case was changed by someone else. Reload and try again.')
  }
}

export function addActivity(caseId, activity) {
  const me = getMockCurrentUser()
  const entry = {
    id: mockId('act'),
    case_id: caseId,
    visibility: 'internal',
    author: { type: 'user', id: me.id, name: me.name },
    body: null,
    metadata: {},
    occurred_at: nowIso(),
    ...activity,
  }
  getCollection('caseActivities').push(entry)
  return entry
}

export function touch(item) {
  item.version += 1
  item.updated_at = nowIso()
}

/** Validates and applies a pipeline transition (shared by /transition and macros). */
export function applyTransition(item, toStatusId, body = {}) {
  const transition = getPipeline().transitions.find(
    (entry) => entry.from === item.status_id && entry.to === toStatusId
  )
  if (!transition) throw new MockHttpError(409, 'CASE_TRANSITION_NOT_ALLOWED', 'This status change is not allowed.')
  const missing = transition.required_fields.filter((field) => !String(body[field] || '').trim())
  if (missing.length) {
    throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', Object.fromEntries(missing.map((field) => [field, ['required']])))
  }
  const from = findStatus(item.status_id)
  const to = findStatus(toStatusId)
  if (to.category === 'resolved') {
    item.resolved_at = nowIso()
    item.resolution_code = body.resolution_code
    item.resolution_summary = body.resolution_summary
  }
  if (to.category === 'closed') item.closed_at = nowIso()
  if (from.category === 'resolved' && OPEN_CATEGORIES.includes(to.category)) item.reopened_count += 1
  item.status_id = to.id
  touch(item)
  addActivity(item.id, {
    type: 'status_change',
    metadata: { from: { key: from.key, label: from.label }, to: { key: to.key, label: to.label } },
  })
}

const byUpdated = (a, b) => String(b.updated_at).localeCompare(String(a.updated_at))
const bySlaDue = (a, b) =>
  String(computeSla(a)?.next_due_at || '9999').localeCompare(String(computeSla(b)?.next_due_at || '9999'))

function listCases(query) {
  const filterView = VIEW_FILTERS[query.view] || VIEW_FILTERS.open
  const items = getCollection('cases')
    .filter(filterView)
    .filter((item) => !query.queue_id || item.queue_id === query.queue_id)
    .filter((item) => !query.type_id || item.type_id === query.type_id)
    .filter((item) => !query.priority || item.priority === query.priority)
    .filter((item) => !query.customer_id || item.customer.id === String(query.customer_id))
    .filter((item) => matchesSearch([item.case_number, item.subject, item.customer.name, item.customer.phone], query.search))
    .sort(query.sort === 'sla_due' || String(query.view).startsWith('sla_') ? bySlaDue : byUpdated)
  const page = paginate(items, query)
  return { data: page.data.map(serializeCase), meta: page.meta }
}

/**
 * Mock-only: a real customer id (from the drawer or a linked conversation) is
 * unknown to the demo data, so adopt it as a placeholder instead of failing.
 */
function findOrAdoptCustomer(customerId) {
  if (customerId == null || customerId === '') return null
  const customers = getCollection('customers')
  const id = String(customerId)
  let customer = customers.find((entry) => entry.id === id)
  if (!customer) {
    customer = { id, name: `#${id}`, phone: '' }
    customers.push(customer)
  }
  return customer
}

function createCase(body) {
  const config = setup()
  const type = config.case_types.find((entry) => entry.id === body.type_id)
  const customer = findOrAdoptCustomer(body.customer_id)
  const errors = {}
  if (!String(body.subject || '').trim()) errors.subject = ['required']
  if (!type) errors.type_id = ['required']
  if (!customer) errors.customer_id = ['required']
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)

  const cases = getCollection('cases')
  const initial = type.pipeline.statuses.find((status) => status.is_initial)
  const created = {
    id: mockId('case'),
    case_number: `CS-2026-${String(1040 + cases.length).padStart(5, '0')}`,
    subject: body.subject.trim(),
    description: body.description || '',
    customer,
    contact: null,
    type_id: type.id,
    status_id: initial.id,
    pipeline_version_id: type.pipeline.version_id,
    priority: body.priority || type.default_priority,
    severity: body.severity || 'moderate',
    queue_id: body.queue_id || null,
    assignee_id: body.assignee_id || null,
    source_channel: body.source_channel || 'internal',
    conversation_id: body.conversation_id || null,
    opened_at: nowIso(),
    first_response_at: null,
    resolved_at: null,
    closed_at: null,
    updated_at: nowIso(),
    resolution_code: null,
    resolution_summary: null,
    reopened_count: 0,
    version: 1,
  }
  cases.push(created)
  addActivity(created.id, { type: 'created', metadata: { channel: created.source_channel } })
  return created
}

/** @type {import('../router').MockRoute[]} */
export const casesHandlers = [
  { method: 'GET', path: serviceEndpoints.caseSetup, handler: () => ({ data: setup() }) },
  {
    method: 'GET',
    path: serviceEndpoints.caseSummary,
    handler: () => ({
      data: {
        views: Object.fromEntries(Object.entries(VIEW_FILTERS).map(([key, filter]) => [key, getCollection('cases').filter(filter).length])),
      },
    }),
  },
  { method: 'GET', path: serviceEndpoints.cases, handler: ({ query }) => listCases(query) },
  { method: 'POST', path: serviceEndpoints.cases, handler: ({ body = {} }) => ({ status: 201, body: { data: serializeCase(createCase(body)) } }) },
  {
    method: 'POST',
    path: `${SERVICE_API}/cases/from-conversation/:conversationId`,
    handler: ({ params, body = {} }) => {
      const created = createCase({ ...body, conversation_id: params.conversationId })
      addActivity(created.id, {
        type: 'inbound',
        visibility: 'customer',
        channel: created.source_channel,
        author: { type: 'customer', id: created.customer.id, name: created.customer.name },
        body: created.subject,
        metadata: { conversation_id: params.conversationId },
      })
      return { status: 201, body: { data: serializeCase(created) } }
    },
  },
  { method: 'GET', path: `${SERVICE_API}/cases/:caseId`, handler: ({ params }) => ({ data: serializeCase(getCase(params.caseId)) }) },
  {
    method: 'PATCH',
    path: `${SERVICE_API}/cases/:caseId`,
    handler: ({ params, body = {} }) => {
      const item = getCase(params.caseId)
      assertVersion(item, body.version)
      const changes = {}
      ;['priority', 'severity', 'type_id', 'subject', 'description'].forEach((field) => {
        if (body[field] !== undefined && body[field] !== item[field]) {
          changes[field] = { from: item[field], to: body[field] }
          item[field] = body[field]
        }
      })
      if (Object.keys(changes).length) {
        touch(item)
        addActivity(item.id, { type: 'field_change', metadata: { changes } })
      }
      return { data: serializeCase(item) }
    },
  },
  {
    method: 'POST',
    path: `${SERVICE_API}/cases/:caseId/transition`,
    handler: ({ params, body = {} }) => {
      const item = getCase(params.caseId)
      assertVersion(item, body.version)
      applyTransition(item, body.to_status_id, body)
      return { data: serializeCase(item) }
    },
  },
  {
    method: 'POST',
    path: `${SERVICE_API}/cases/:caseId/assign`,
    handler: ({ params, body = {} }) => {
      const item = getCase(params.caseId)
      assertVersion(item, body.version)
      const config = setup()
      if (body.assignee_id !== undefined) item.assignee_id = body.assignee_id || null
      if (body.queue_id !== undefined) item.queue_id = body.queue_id || null
      touch(item)
      const assignee = config.agents.find((entry) => entry.id === item.assignee_id)
      const queue = config.queues.find((entry) => entry.id === item.queue_id)
      addActivity(item.id, {
        type: 'assignment',
        metadata: { assignee: assignee ? { name: assignee.name } : null, queue: queue ? { label: queue.label } : null },
      })
      return { data: serializeCase(item) }
    },
  },
  {
    method: 'GET',
    path: `${SERVICE_API}/cases/:caseId/activities`,
    handler: ({ params }) => {
      const agents = setup().agents
      const stored = getCollection('caseActivities').filter((entry) => entry.case_id === params.caseId)
      const items = [...stored, ...escalationActivities(getCase(params.caseId))]
        .map((entry) => ({
          ...entry,
          author: entry.author?.type === 'user' && !entry.author.name
            ? { ...entry.author, name: agents.find((agent) => agent.id === entry.author.id)?.name || null }
            : entry.author,
        }))
        .sort((a, b) => String(a.occurred_at).localeCompare(String(b.occurred_at)))
      return { data: items }
    },
  },
  {
    method: 'POST',
    path: `${SERVICE_API}/cases/:caseId/reply`,
    handler: ({ params, body = {} }) => {
      const item = getCase(params.caseId)
      if (!String(body.body || '').trim()) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { body: ['required'] })
      if (!item.first_response_at) item.first_response_at = nowIso()
      touch(item)
      const activity = addActivity(item.id, { type: 'reply', visibility: 'customer', channel: item.source_channel, body: body.body.trim() })
      return { status: 201, body: { data: activity } }
    },
  },
  {
    method: 'POST',
    path: `${SERVICE_API}/cases/:caseId/notes`,
    handler: ({ params, body = {} }) => {
      const item = getCase(params.caseId)
      if (!String(body.body || '').trim()) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { body: ['required'] })
      touch(item)
      const activity = addActivity(item.id, { type: 'internal_note', body: body.body.trim() })
      return { status: 201, body: { data: activity } }
    },
  },
  {
    method: 'GET',
    path: serviceEndpoints.customerLookup,
    handler: ({ query }) => ({
      data: getCollection('customers').filter((item) => matchesSearch([item.name, item.phone], query.search)).slice(0, 20),
    }),
  },
]

