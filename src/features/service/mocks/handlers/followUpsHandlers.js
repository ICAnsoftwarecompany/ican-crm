import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, requiredLabel } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildFollowUpEnrollments, buildFollowUpPrograms, buildPortfolios } from '../seeds/followUpsSeed'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { matchesSearch, nowIso, paginate } from '../utils'
import { getCaseSetup } from '../state/caseConfig'
import { bucketOf, dueAt, parseOffset, parseRule, recordOutcome, stepIndex } from '../state/followUpEngine'
import { createCase, findOrAdoptCustomer } from './casesHandlers'

registerSeed('followUpPrograms', buildFollowUpPrograms)
registerSeed('followUpEnrollments', buildFollowUpEnrollments)
registerSeed('portfolios', (manifest) => buildPortfolios(manifest).portfolios)
registerSeed('portfolioMembers', (manifest) => buildPortfolios(manifest).members)

const F = serviceEndpoints.followUps
const P = serviceEndpoints.portfolios
const SUBJECTS = ['customer', 'contract', 'subscription', 'asset', 'record', 'case']
const CHANNELS = ['call', 'whatsapp', 'email', 'visit']
const ASSIGNMENT = ['owner', 'portfolio_owner', 'queue']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const conflict = (code, message) => new MockHttpError(409, code, message)
const agents = () => getCaseSetup().agents
const agentRef = (id) => {
  const agent = agents().find((entry) => entry.id === id)
  return agent ? { id: agent.id, name: agent.name } : null
}
const me = () => {
  const user = getMockCurrentUser()
  return { id: user.id, name: user.name }
}

/* ---------------- Programs ---------------- */

/** Steps need a unique key, a valid offset and at least one outcome; rules must point at a known outcome. */
function validateProgram(body) {
  const errors = requiredLabel(body.name) ? { name: ['required'] } : {}
  if (!SUBJECTS.includes(body.subject_type)) errors.subject_type = ['required']
  if (!ASSIGNMENT.includes(body.assignment?.type)) errors.assignment = ['required']
  const steps = body.steps || []
  const keys = steps.map((step) => step.key)
  const invalid = !steps.length || steps.some((step) => !step.key || !parseOffset(step.offset) || !CHANNELS.includes(step.channel) || !(step.outcomes || []).length || !String(step.task_title?.ar || step.task_title?.en || '').trim() || Object.entries(step.on_outcome || {}).some(([outcome, rule]) => rule && (!step.outcomes.includes(outcome) || !parseRule(rule))))
  if (invalid || new Set(keys).size !== keys.length) errors.steps = ['invalid']
  return errors
}

const programHandlers = crudHandlers({
  collection: 'followUpPrograms',
  path: serviceEndpoints.settings.followUpPrograms,
  prefix: 'fp',
  validate: validateProgram,
  serialize: (program) => ({ ...program, active_enrollments: getCollection('followUpEnrollments').filter((entry) => entry.program_id === program.id && entry.status === 'active').length }),
  canDelete: (program) => {
    if (getCollection('followUpEnrollments').some((entry) => entry.program_id === program.id && entry.status === 'active')) throw conflict('FOLLOW_UP_PROGRAM_IN_USE', 'Program has active enrollments')
  },
})
// Editing a program publishes a new version; running enrollments keep theirs (spec §39.2 `version`).
const programPatch = programHandlers.find((route) => route.method === 'PATCH')
const basePatch = programPatch.handler
programPatch.handler = (ctx) => {
  const result = basePatch(ctx)
  const program = getCollection('followUpPrograms').find((entry) => entry.id === ctx.params.id)
  program.version = (Number(program.version) || 1) + 1
  return { ...result, data: { ...result.data, version: program.version } }
}

/* ---------------- Enrollments ---------------- */

const programOf = (enrollment) => getCollection('followUpPrograms').find((entry) => entry.id === enrollment.program_id)

function serializeEnrollment(enrollment, now = Date.now()) {
  const program = programOf(enrollment)
  const index = program ? stepIndex(program, enrollment.current_step) : -1
  const due = program ? dueAt(enrollment, program) : null
  return {
    ...enrollment,
    program: program ? { id: program.id, name: program.name, version: program.version } : null,
    step: index >= 0 ? program.steps[index] : null,
    step_number: index >= 0 ? index + 1 : null,
    steps_total: program?.steps.length || 0,
    next_due_at: due,
    bucket: bucketOf(due, now),
  }
}

function enrollmentById(id) {
  const enrollment = getCollection('followUpEnrollments').find((entry) => entry.id === id)
  if (!enrollment) throw notFound('Follow-up')
  return enrollment
}
const active = (enrollment) => {
  if (enrollment.status !== 'active') throw conflict('FOLLOW_UP_NOT_ACTIVE', 'Follow-up is not active')
}

/** Owner by the program's assignment: portfolio owner → the fallback user → me. */
export function followUpOwnerFor(program, customerId) {
  if (program.assignment?.type === 'portfolio_owner') {
    const member = getCollection('portfolioMembers').find((entry) => entry.customer_id === customerId)
    if (member) return agentRef(member.owner_user_id)
  }
  return agentRef(program.assignment?.fallback_user_id) || me()
}

const VIEWS = {
  all: () => true,
  active: (entry) => entry.status === 'active',
  overdue: (entry) => entry.bucket === 'overdue',
  due_today: (entry) => entry.bucket === 'due_today',
  upcoming: (entry) => entry.bucket === 'upcoming',
  completed: (entry) => entry.status !== 'active',
}

const enrollmentHandlers = [
  {
    method: 'GET',
    path: F,
    handler: ({ query }) => {
      const mine = query.mine === '1' || query.mine === 'true' || query.mine === true
      const scoped = getCollection('followUpEnrollments')
        .map((entry) => serializeEnrollment(entry))
        .filter((entry) => !mine || entry.owner?.id === me().id)
        .filter((entry) => !query.owner_id || entry.owner?.id === query.owner_id)
        .filter((entry) => !query.program_id || entry.program_id === query.program_id)
        .filter((entry) => !query.customer_id || entry.customer_id === query.customer_id)
        .filter((entry) => matchesSearch([entry.customer?.name, entry.customer?.phone], query.search))
      const summary = Object.fromEntries(['overdue', 'due_today', 'upcoming', 'completed', 'all'].map((view) => [view, scoped.filter(VIEWS[view]).length]))
      const items = scoped.filter(VIEWS[query.view] || VIEWS.active).sort((a, b) => (a.next_due_at || '9').localeCompare(b.next_due_at || '9'))
      return { ...paginate(items, query), summary }
    },
  },
  {
    method: 'POST',
    path: F,
    handler: ({ body = {} }) => {
      const program = getCollection('followUpPrograms').find((entry) => entry.id === body.program_id && entry.status === 'active')
      const customer = body.customer_id ? findOrAdoptCustomer(body.customer_id) : null
      const needsEnd = Boolean(program && parseOffset(program.steps[0]?.offset)?.fromEnd)
      validation({ ...(!program && { program_id: ['required'] }), ...(!customer && { customer_id: ['required'] }), ...(needsEnd && !body.subject_ends_at && { subject_ends_at: ['required'] }) })
      if (getCollection('followUpEnrollments').some((entry) => entry.program_id === program.id && entry.customer_id === customer.id && entry.status === 'active')) throw conflict('FOLLOW_UP_ALREADY_ENROLLED', 'Customer is already enrolled')
      const enrollment = {
        id: mockId('fe'),
        program_id: program.id,
        program_version: program.version,
        subject_type: program.subject_type,
        subject_ends_at: body.subject_ends_at ? new Date(body.subject_ends_at).toISOString() : null,
        customer: { id: customer.id, name: customer.name, phone: customer.phone },
        customer_id: customer.id,
        owner: agentRef(body.owner_id) || followUpOwnerFor(program, customer.id),
        status: 'active',
        current_step: program.steps[0].key,
        attempts: 0,
        retry_due_at: null,
        started_at: nowIso(),
        completed_at: null,
        exit_reason: null,
        history: [],
      }
      getCollection('followUpEnrollments').unshift(enrollment)
      return { status: 201, body: { data: serializeEnrollment(enrollment) } }
    },
  },
  {
    method: 'GET',
    path: `${F}/:id`,
    handler: ({ params }) => ({ data: serializeEnrollment(enrollmentById(params.id)) }),
  },
  {
    method: 'POST',
    path: `${F}/:id/outcome`,
    handler: ({ params, body = {} }) => {
      const enrollment = enrollmentById(params.id)
      active(enrollment)
      const program = programOf(enrollment)
      const step = program.steps[stepIndex(program, enrollment.current_step)]
      validation(step.outcomes.includes(body.outcome) ? {} : { outcome: ['required'] })
      const result = recordOutcome(enrollment, program, { outcome: body.outcome, note: body.note || null, checklist: body.checklist || [], by: me() })
      const caseType = result.caseTypeId && getCaseSetup().case_types.find((entry) => entry.id === result.caseTypeId)
      if (caseType) {
        const title = step.task_title?.en || step.task_title?.ar || step.key
        const created = createCase({ type_id: caseType.id, customer_id: enrollment.customer_id, subject: `${program.name?.en || program.name?.ar} · ${title}`, description: body.note || '', source_channel: 'internal', assignee_id: enrollment.owner?.id })
        enrollment.history[enrollment.history.length - 1].case = { id: created.id, case_number: created.case_number }
      }
      return { data: { ...serializeEnrollment(enrollment), effect: result.effect } }
    },
  },
  {
    method: 'POST',
    path: `${F}/:id/exit`,
    handler: ({ params, body = {} }) => {
      const enrollment = enrollmentById(params.id)
      active(enrollment)
      validation(String(body.reason || '').trim() ? {} : { reason: ['required'] })
      Object.assign(enrollment, { status: 'exited', exit_reason: body.reason, completed_at: nowIso(), current_step: null, retry_due_at: null })
      return { data: serializeEnrollment(enrollment) }
    },
  },
]

/* ---------------- Portfolios ---------------- */

const members = () => getCollection('portfolioMembers')
function portfolioById(id) {
  const portfolio = getCollection('portfolios').find((entry) => entry.id === id)
  if (!portfolio) throw notFound('Portfolio')
  return portfolio
}
const serializePortfolio = (portfolio) => {
  const list = members().filter((entry) => entry.portfolio_id === portfolio.id)
  return { ...portfolio, members_count: list.length, owners: (portfolio.owner_ids || []).map((id) => ({ ...agentRef(id), members_count: list.filter((entry) => entry.owner_user_id === id).length })).filter((owner) => owner.id) }
}
/** Least loaded owner of the portfolio (ties → list order), the default for new members. */
function nextOwner(portfolio, counts) {
  return [...(portfolio.owner_ids || [])].sort((a, b) => (counts[a] || 0) - (counts[b] || 0))[0] || null
}
const loadOf = (portfolioId) => members().filter((entry) => entry.portfolio_id === portfolioId).reduce((acc, entry) => ({ ...acc, [entry.owner_user_id]: (acc[entry.owner_user_id] || 0) + 1 }), {})

const portfolioCrud = crudHandlers({
  collection: 'portfolios',
  path: P,
  prefix: 'pf',
  validate: (body) => ({ ...(requiredLabel(body.name) && { name: ['required'] }), ...(!(body.owner_ids || []).length && { owner_ids: ['required'] }) }),
  serialize: serializePortfolio,
  canDelete: (portfolio) => {
    if (members().some((entry) => entry.portfolio_id === portfolio.id)) throw conflict('PORTFOLIO_HAS_MEMBERS', 'Remove the customers first')
  },
})

const portfolioHandlers = [
  {
    method: 'GET',
    path: `${P}/:id/members`,
    handler: ({ params, query }) => {
      portfolioById(params.id)
      const items = members()
        .filter((entry) => entry.portfolio_id === params.id)
        .filter((entry) => !query.owner_id || entry.owner_user_id === query.owner_id)
        .filter((entry) => matchesSearch([entry.customer?.name, entry.customer?.phone], query.search))
      return paginate(items, { per_page: 100, ...query })
    },
  },
  {
    method: 'POST',
    path: `${P}/:id/members`,
    handler: ({ params, body = {} }) => {
      const portfolio = portfolioById(params.id)
      const ids = [...new Set(body.customer_ids || [])]
      validation({ ...(!ids.length && { customer_ids: ['required'] }), ...(body.owner_user_id && !(portfolio.owner_ids || []).includes(body.owner_user_id) && { owner_user_id: ['invalid'] }) })
      // A customer has one portfolio owner (spec §12.5): already in any portfolio → 409.
      if (ids.some((id) => members().some((entry) => entry.customer_id === id))) throw conflict('CUSTOMER_IN_PORTFOLIO', 'Customer already belongs to a portfolio')
      const counts = loadOf(portfolio.id)
      const added = ids.map((id) => {
        const customer = findOrAdoptCustomer(id)
        if (!customer) validation({ customer_ids: ['required'] })
        const owner = body.owner_user_id || nextOwner(portfolio, counts)
        counts[owner] = (counts[owner] || 0) + 1
        const member = { portfolio_id: portfolio.id, customer_id: customer.id, customer: { id: customer.id, name: customer.name, phone: customer.phone }, owner_user_id: owner, owner: agentRef(owner), assigned_at: nowIso() }
        members().push(member)
        return member
      })
      return { status: 201, body: { data: added } }
    },
  },
  {
    method: 'PATCH',
    path: `${P}/:id/members/:customerId`,
    handler: ({ params, body = {} }) => {
      const portfolio = portfolioById(params.id)
      const member = members().find((entry) => entry.portfolio_id === portfolio.id && entry.customer_id === params.customerId)
      if (!member) throw notFound('Member')
      validation((portfolio.owner_ids || []).includes(body.owner_user_id) ? {} : { owner_user_id: ['required'] })
      Object.assign(member, { owner_user_id: body.owner_user_id, owner: agentRef(body.owner_user_id), assigned_at: nowIso() })
      return { data: member }
    },
  },
  {
    method: 'DELETE',
    path: `${P}/:id/members/:customerId`,
    handler: ({ params }) => {
      const list = members()
      const index = list.findIndex((entry) => entry.portfolio_id === params.id && entry.customer_id === params.customerId)
      if (index < 0) throw notFound('Member')
      list.splice(index, 1)
      return { status: 204, body: null }
    },
  },
  {
    method: 'POST',
    path: `${P}/:id/distribute`,
    handler: ({ params }) => {
      // Rebalances: members whose owner left the portfolio, then evens out the load (round robin by least loaded).
      const portfolio = portfolioById(params.id)
      if (!(portfolio.owner_ids || []).length) throw conflict('PORTFOLIO_NO_OWNERS', 'Portfolio has no owners')
      const list = members().filter((entry) => entry.portfolio_id === portfolio.id)
      const target = Math.ceil(list.length / portfolio.owner_ids.length)
      const counts = Object.fromEntries(portfolio.owner_ids.map((id) => [id, 0]))
      let moved = 0
      const keep = []
      list.forEach((entry) => {
        if (entry.owner_user_id in counts && counts[entry.owner_user_id] < target) {
          counts[entry.owner_user_id] += 1
          keep.push(entry)
        }
      })
      list.filter((entry) => !keep.includes(entry)).forEach((entry) => {
        const owner = nextOwner(portfolio, counts)
        counts[owner] += 1
        Object.assign(entry, { owner_user_id: owner, owner: agentRef(owner), assigned_at: nowIso() })
        moved += 1
      })
      return { data: { ...serializePortfolio(portfolio), moved } }
    },
  },
]

/** @type {import('../router').MockRoute[]} */
export const followUpsHandlers = [...programHandlers, ...enrollmentHandlers, ...portfolioHandlers, ...portfolioCrud]
