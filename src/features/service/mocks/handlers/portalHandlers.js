import { portalEndpoints as P } from '../../core/api/portalEndpoints'
import { getCollection } from '../db'
import { MockHttpError, notFound } from '../errors'
import { mockId } from '../seeds/seedUtils'
import { nowIso, paginate } from '../utils'
import { allocatePayment, applyAllocations, serializeSchedule, todayIso } from '../state/billingLedger'
import { findStatus } from '../state/caseConfig'
import { SCALES, isLowScore } from '../state/qualityScore'
import './qualityHandlers'
import { DEMO_B2B_PASSWORD, can, checkOtp, findAccountByContact, forbidden, openSession, requestOtp, requirePermission, resolveSession, saveSessions } from '../state/portalAccess'
import { entitlementBalance, entitlementState } from './assetsHandlers'
import { createCase } from './casesHandlers'
import { portalSettings } from './portalAdminHandlers'
import { syncSubscription } from './subscriptionsHandlers'
import { serializeSubscription } from '../state/subscriptionLifecycle'
import '../state/feedback'
import './billingSchedulesHandlers'
import './communicationHandlers'
import './contractsHandlers'
import './deliveriesHandlers'

const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const own = (context, customerId) => String(customerId) === String(context.membership.customer_id)
const pick = (label, locale) => (label && typeof label === 'object' ? label[locale] || label.ar || label.en : label)

function sessionPayload(session) {
  const context = resolveSession({ Authorization: `Bearer ${session.token}` })
  return { token: session.token, ...mePayload(context) }
}
function mePayload(context) {
  const { account, membership } = context
  const policies = getCollection('portalPolicies')
  return {
    account: { id: account.id, name: account.name, phone: account.phone, email: account.email, locale: account.locale },
    memberships: account.memberships.filter((entry) => entry.status === 'active').map((entry) => ({ id: entry.id, customer: entry.customer, membership_type: entry.membership_type, role_id: entry.role_id, policy_name: policies.find((policy) => policy.id === entry.policy_id)?.name || null })),
    active_membership_id: membership.id,
    permissions: context.permissions,
    record_types: getCollection('recordTypes').filter((type) => type.portal_visible !== false && can(context, `record:${type.key}`)).map((type) => ({ key: type.key, label: type.label, icon: type.icon })),
  }
}

// ---- serializers (customer-safe: no internal notes, queues, agents or costs) --------------------------------------

function portalRecord(record, context, { detail = false } = {}) {
  const type = getCollection('recordTypes').find((entry) => entry.id === record.record_type_id)
  const status = findStatus(record.status_id)
  const base = {
    id: record.id,
    reference_no: record.reference_no,
    type: type ? { key: type.key, label: type.label, icon: type.icon } : null,
    status: status ? { key: status.key, label: status.customer_label || status.label, category: status.category } : null,
    starts_at: record.starts_at,
    ends_at: record.ends_at,
    expected_at: record.expected_at,
    fields: (type?.fields || []).filter((field) => record.data?.[field.key] != null && field.portal_visible !== false).map((field) => ({ key: field.key, label: field.label, type: field.type, value: record.data[field.key] })),
  }
  if (!detail) return base
  const entryKeys = (type?.entry_types || []).map((entry) => entry.key).filter((key) => can(context, `record_entry:${key}`))
  return {
    ...base,
    participants: getCollection('recordParticipants').filter((entry) => entry.record_id === record.id).map((entry) => ({ id: entry.id, role: entry.role, name: entry.name })),
    components: getCollection('recordComponents').filter((entry) => entry.record_id === record.id && entry.status !== 'cancelled').map((entry) => ({ id: entry.id, title: entry.title, status: entry.status, starts_at: entry.starts_at })),
    entries: getCollection('recordEntries').filter((entry) => entry.record_id === record.id && entryKeys.includes(entry.entry_type)).sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at))).map((entry) => ({ id: entry.id, entry_type: entry.entry_type, label: type.entry_types.find((item) => item.key === entry.entry_type)?.label, value: entry.value, occurred_at: entry.occurred_at })),
    documents: can(context, 'document') ? getCollection('recordDocuments').filter((entry) => entry.record_id === record.id).map(portalDocument) : [],
    timeline: getCollection('recordTimeline').filter((entry) => entry.subject_id === record.id && entry.visibility === 'customer').sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at))).map((entry) => ({ id: entry.id, event_type: entry.event_type, body: entry.body, payload: entry.payload, occurred_at: entry.occurred_at })),
  }
}
const portalDocument = (entry) => ({ id: entry.id, record_id: entry.record_id, document_type: entry.document_type, status: entry.status, file_name: entry.file_name, rejection_reason: entry.rejection_reason })

function portalCase(item, { detail = false } = {}) {
  const type = getCollection('caseTypes').find((entry) => entry.id === item.type_id)
  const status = findStatus(item.status_id)
  const base = { id: item.id, case_number: item.case_number, subject: item.subject, type: type ? { id: type.id, label: type.label, icon: type.icon } : null, status: status ? { key: status.key, label: status.customer_label || status.label, category: status.category } : null, opened_at: item.opened_at, updated_at: item.updated_at }
  if (!detail) return base
  const messages = getCollection('caseActivities')
    .filter((entry) => entry.case_id === item.id && entry.visibility === 'customer' && entry.body)
    .sort((a, b) => String(a.occurred_at).localeCompare(String(b.occurred_at)))
    .map((entry) => ({ id: entry.id, from: entry.author?.type === 'customer' ? 'customer' : 'team', author: entry.author?.type === 'customer' ? entry.author.name : null, body: entry.body, occurred_at: entry.occurred_at }))
  return { ...base, description: item.description, messages }
}

function context(headers) {
  return resolveSession(headers)
}
const recordsOf = (ctx) => getCollection('serviceRecords').filter((record) => own(ctx, record.customer_id)).filter((record) => {
  const type = getCollection('recordTypes').find((entry) => entry.id === record.record_type_id)
  return type && type.portal_visible !== false && can(ctx, `record:${type.key}`)
})

/** @type {import('../router').MockRoute[]} */
export const portalHandlers = [
  // Public
  {
    method: 'GET',
    path: P.publicSettings,
    handler: () => {
      const { role_policies: _hidden, ...settings } = portalSettings()
      return { data: settings }
    },
  },
  { method: 'POST', path: P.otp, handler: ({ body = {} }) => ({ data: requestOtp(body.target) }) },
  {
    method: 'POST',
    path: P.verify,
    handler: ({ body = {} }) => {
      checkOtp(body.target, body.code)
      const account = findAccountByContact(body.target)
      // Same error as a wrong code: never reveal whether an account exists.
      if (!account) validation({ code: ['invalid'] })
      return { data: sessionPayload(openSession(account)) }
    },
  },
  {
    method: 'POST',
    path: P.login,
    handler: ({ body = {} }) => {
      const account = findAccountByContact(body.email)
      const allowed = portalSettings().b2b_password_login && account?.memberships.some((entry) => entry.membership_type === 'organization_member')
      if (!allowed || body.password !== DEMO_B2B_PASSWORD) validation({ password: ['invalid'] })
      return { data: sessionPayload(openSession(account)) }
    },
  },
  {
    method: 'POST',
    path: P.logout,
    handler: ({ headers }) => {
      const ctx = context(headers)
      ctx.session.ended_at = nowIso()
      saveSessions()
      ctx.account.active_sessions = Math.max((ctx.account.active_sessions || 1) - 1, 0)
      return { status: 204, body: null }
    },
  },
  { method: 'GET', path: P.me, handler: ({ headers }) => ({ data: mePayload(context(headers)) }) },
  {
    method: 'POST',
    path: P.switchMembership,
    handler: ({ headers, body = {} }) => {
      const ctx = context(headers)
      const target = ctx.account.memberships.find((entry) => entry.id === body.membership_id && entry.status === 'active')
      if (!target) throw forbidden()
      ctx.session.membership_id = target.id
      saveSessions()
      return { data: mePayload(context(headers)) }
    },
  },

  // Records
  {
    method: 'GET',
    path: P.records,
    handler: ({ headers, query }) => {
      const ctx = context(headers)
      const items = recordsOf(ctx).filter((record) => !query.type || getCollection('recordTypes').find((entry) => entry.id === record.record_type_id)?.key === query.type).map((record) => portalRecord(record, ctx))
      return paginate(items, query)
    },
  },
  {
    method: 'GET',
    path: `${P.records}/:id`,
    handler: ({ headers, params }) => {
      const ctx = context(headers)
      const record = recordsOf(ctx).find((entry) => entry.id === params.id)
      if (!record) throw notFound('Record')
      return { data: portalRecord(record, ctx, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: P.documentUpload(':id'),
    handler: ({ headers, params, body = {} }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'document', 'upload')
      const document = getCollection('recordDocuments').find((entry) => entry.id === params.id)
      if (!document || !recordsOf(ctx).some((record) => record.id === document.record_id)) throw notFound('Document')
      validation(String(body.file_name || '').trim() ? {} : { file: ['required'] })
      Object.assign(document, { status: 'uploaded', file_name: body.file_name, rejection_reason: null, uploaded_via: 'portal', uploaded_at: nowIso() })
      return { data: portalDocument(document) }
    },
  },
  {
    method: 'GET',
    path: P.documents,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'document')
      const ids = new Set(recordsOf(ctx).map((record) => record.id))
      return { data: getCollection('recordDocuments').filter((entry) => ids.has(entry.record_id)).map((entry) => ({ ...portalDocument(entry), reference_no: getCollection('serviceRecords').find((record) => record.id === entry.record_id)?.reference_no })) }
    },
  },

  // Assets, entitlements, subscriptions, contracts, remittances
  {
    method: 'GET',
    path: P.assets,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'asset')
      return {
        data: getCollection('assets').filter((asset) => own(ctx, asset.customer_id) && asset.status !== 'retired').map((asset) => {
          const warranty = getCollection('warranties').find((entry) => entry.asset_id === asset.id && entry.status === 'active' && new Date(entry.ends_at).getTime() > Date.now())
          return { id: asset.id, name: asset.name, serial_number: asset.serial_number, status: asset.status, installation_date: asset.installation_date, warranty_ends_at: warranty?.ends_at || null }
        }),
      }
    },
  },
  {
    method: 'GET',
    path: P.entitlements,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'entitlement')
      return { data: getCollection('entitlements').filter((entry) => own(ctx, entry.customer_id)).map((entry) => ({ id: entry.id, type: entry.type, status: entitlementState(entry), balance: entitlementBalance(entry), ends_at: entry.ends_at })) }
    },
  },
  {
    method: 'GET',
    path: P.subscriptions,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'subscription')
      return { data: getCollection('subscriptions').filter((entry) => own(ctx, entry.customer_id)).map((entry) => { const { events, periods, ...rest } = serializeSubscription(syncSubscription(entry), todayIso()); return rest }) }
    },
  },
  {
    method: 'GET',
    path: P.contracts,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'contract')
      return { data: getCollection('contracts').filter((entry) => own(ctx, entry.customer_id) && ['signed', 'active', 'expiring', 'expired', 'renewed'].includes(entry.status)).map((entry) => ({ id: entry.id, contract_number: entry.contract_number, status: entry.status, start_date: entry.start_date, end_date: entry.end_date, total_value: entry.total_value, currency: entry.currency })) }
    },
  },
  {
    method: 'GET',
    path: P.remittances,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'remittance')
      return { data: getCollection('codRemittances').filter((entry) => own(ctx, entry.customer_id)) }
    },
  },

  // Payments
  {
    method: 'GET',
    path: P.schedules,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'payment_schedule')
      return { data: getCollection('paymentSchedules').filter((entry) => own(ctx, entry.customer_id) && ['active', 'completed'].includes(entry.status)).map((entry) => { const view = serializeSchedule(entry); return { id: view.id, schedule_number: view.schedule_number, contract_number: view.contract_number, status: view.status, currency: view.currency, totals: view.totals, next_due: view.next_due, lines: view.lines.map((line) => ({ id: line.id, seq: line.seq, line_type: line.line_type, due_date: line.due_date, amount: line.amount, paid_amount: line.paid_amount, remaining: line.remaining, late_fee_amount: line.late_fee_amount, status: line.status, in_price: line.in_price })) } }) }
    },
  },
  {
    method: 'POST',
    path: P.payments,
    handler: ({ headers, body = {} }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'payment_schedule', 'pay')
      const schedule = getCollection('paymentSchedules').find((entry) => entry.id === body.schedule_id && own(ctx, entry.customer_id))
      if (!schedule) throw notFound('Schedule')
      if (schedule.status !== 'active') throw new MockHttpError(409, 'SCHEDULE_NOT_ACTIVE', 'Schedule is not active')
      const amount = Math.round(Number(body.amount) * 100) / 100
      validation(amount > 0 ? {} : { amount: ['required'] })
      const result = allocatePayment(schedule, amount)
      if (result.error) validation({ amount: ['exceeds_outstanding'] })
      // Gateway mock: always succeeds. The real flow redirects to Paymob/Fawry and confirms by webhook (spec §29.2).
      const payment = { id: mockId('pay'), number: `GW-${Date.now().toString(36).toUpperCase()}`, amount, currency: schedule.currency, paid_at: nowIso(), method: 'card', source: 'gateway', reference: null, recorded_by: { id: ctx.account.id, name: ctx.account.name }, status: 'confirmed', reversal_of_id: null, allocations: result.allocations, settlement_discounts: [] }
      applyAllocations(schedule, result.allocations)
      schedule.payments.unshift(payment)
      schedule.version += 1
      return { status: 201, body: { data: { status: 'succeeded', receipt_number: payment.number, amount } } }
    },
  },

  // Cases
  {
    method: 'GET',
    path: P.cases,
    handler: ({ headers, query }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'case')
      const items = getCollection('cases').filter((item) => own(ctx, item.customer?.id)).sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at))).map((item) => portalCase(item))
      return paginate(items, query)
    },
  },
  {
    method: 'GET',
    path: `${P.cases}/:id`,
    handler: ({ headers, params }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'case')
      const item = getCollection('cases').find((entry) => entry.id === params.id && own(ctx, entry.customer?.id))
      if (!item) throw notFound('Case')
      return { data: portalCase(item, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: P.cases,
    handler: ({ headers, body = {} }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'case', 'create')
      validation({ ...(!String(body.subject || '').trim() && { subject: ['required'] }), ...(!String(body.description || '').trim() && { description: ['required'] }) })
      const type = getCollection('caseTypes').find((entry) => entry.id === body.type_id) || getCollection('caseTypes')[0]
      const created = createCase({ type_id: type.id, customer_id: ctx.membership.customer_id, subject: body.subject, description: body.description, source_channel: 'portal' })
      getCollection('caseActivities').push({ id: mockId('act'), case_id: created.id, type: 'inbound', visibility: 'customer', author: { type: 'customer', id: ctx.account.id, name: ctx.account.name }, body: body.description, metadata: {}, occurred_at: nowIso() })
      return { status: 201, body: { data: portalCase(created, { detail: true }) } }
    },
  },
  {
    method: 'POST',
    path: `${P.cases}/:id/reply`,
    handler: ({ headers, params, body = {} }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'case', 'reply')
      const item = getCollection('cases').find((entry) => entry.id === params.id && own(ctx, entry.customer?.id))
      if (!item) throw notFound('Case')
      validation(String(body.body || '').trim() ? {} : { body: ['required'] })
      getCollection('caseActivities').push({ id: mockId('act'), case_id: item.id, type: 'inbound', visibility: 'customer', author: { type: 'customer', id: ctx.account.id, name: ctx.account.name }, body: body.body.trim(), metadata: { via: 'portal' }, occurred_at: nowIso() })
      item.updated_at = nowIso()
      return { data: portalCase(item, { detail: true }) }
    },
  },

  // Request catalog
  {
    method: 'GET',
    path: P.catalog,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'catalog')
      return { data: getCollection('requestCatalog').filter((item) => item.status === 'active' && item.portal_visible && (!item.audience_policy_ids?.length || item.audience_policy_ids.includes(ctx.membership.policy_id))) }
    },
  },
  {
    method: 'POST',
    path: P.catalogRequest(':id'),
    handler: ({ headers, params, body = {} }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'catalog', 'request')
      const item = getCollection('requestCatalog').find((entry) => entry.id === params.id && entry.status === 'active' && (!entry.audience_policy_ids?.length || entry.audience_policy_ids.includes(ctx.membership.policy_id)))
      if (!item) throw notFound('Catalog item')
      const answers = body.answers || {}
      const errors = {}
      ;(item.form_schema || []).forEach((field) => {
        if (field.required && !String(answers[field.key] ?? '').trim()) errors[`answers.${field.key}`] = ['required']
      })
      ;(item.required_documents || []).forEach((doc) => {
        if (!(body.documents || []).includes(doc)) errors[`documents.${doc}`] = ['required']
      })
      validation(errors)
      const locale = ctx.account.locale || 'ar'
      const lines = (item.form_schema || []).filter((field) => answers[field.key] != null && answers[field.key] !== '').map((field) => `${pick(field.label, locale)}: ${answers[field.key]}`)
      const created = createCase({ type_id: item.case_type_id, customer_id: ctx.membership.customer_id, subject: pick(item.name, locale), description: lines.join('\n'), source_channel: 'portal' })
      Object.assign(created, { catalog_item_id: item.id, catalog_answers: answers, attachments: body.documents || [] })
      getCollection('caseActivities').push({ id: mockId('act'), case_id: created.id, type: 'inbound', visibility: 'customer', author: { type: 'customer', id: ctx.account.id, name: ctx.account.name }, body: lines.join('\n') || pick(item.name, locale), metadata: { catalog_item_id: item.id }, occurred_at: nowIso() })
      return { status: 201, body: { data: portalCase(created, { detail: true }) } }
    },
  },

  // Help center + feedback
  {
    method: 'POST',
    path: P.feedback,
    handler: ({ headers, body = {} }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'feedback', 'create')
      // F6: the answer belongs to a survey (CSAT by default; NPS 0–10, CES 1–7). A low score runs the survey's
      // follow-up action — here "open a case for a supervisor" (spec §42.1; live: through the Workflow Engine).
      const survey = body.survey_id ? getCollection('feedbackSurveys').find((entry) => entry.id === body.survey_id && entry.active) : null
      if (body.survey_id && !survey) throw notFound('Survey')
      const type = survey?.type || 'csat'
      const [min, max] = SCALES[type]
      const score = Number(body.score)
      validation(body.score !== undefined && body.score !== null && score >= min && score <= max ? {} : { score: ['required'] })
      const customerId = ctx.membership.customer_id
      const response = { id: mockId('fb'), case_id: body.case_id || null, customer_id: customerId, customer: { id: customerId, name: ctx.membership.customer?.name }, survey: type, survey_id: survey?.id || null, score, comment: body.comment || null, channel: 'portal', responded_at: nowIso() }
      getCollection('feedbackResponses').push(response)
      if (survey?.low_score_action?.type === 'create_case' && isLowScore(type, score)) {
        const caseType = getCollection('caseTypes').find((entry) => entry.key === survey.low_score_action.case_type_key) || getCollection('caseTypes')[0]
        const created = createCase({ type_id: caseType.id, customer_id: customerId, subject: `${type.toUpperCase()} ${score}: ${survey.name?.en || survey.name?.ar}`, description: body.comment || '', source_channel: 'portal', priority: 'high' })
        response.follow_up_case_id = created.id
      }
      return { status: 201, body: { data: { id: response.id, survey: type, score } } }
    },
  },

  {
    method: 'GET',
    path: P.activeSurvey,
    handler: ({ headers }) => {
      // The one survey to ask now in the portal: an active portal survey this customer has not answered in 90 days.
      const ctx = context(headers)
      requirePermission(ctx, 'feedback', 'create')
      const since = Date.now() - 90 * 24 * 3600 * 1000
      const answered = new Set(getCollection('feedbackResponses').filter((entry) => entry.customer_id === ctx.membership.customer_id && Date.parse(entry.responded_at) > since).map((entry) => entry.survey_id))
      const survey = getCollection('feedbackSurveys').find((entry) => entry.active && entry.channel === 'portal' && entry.type !== 'csat' && !answered.has(entry.id))
      return { data: survey ? { id: survey.id, type: survey.type, question: survey.question, scale: SCALES[survey.type] } : null }
    },
  },

  // B2B: company users (admin role with org_users.manage)
  {
    method: 'GET',
    path: P.orgUsers,
    handler: ({ headers }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'org_users')
      return {
        data: getCollection('portalAccounts')
          .filter((account) => account.memberships.some((entry) => own(ctx, entry.customer_id) && entry.membership_type === 'organization_member'))
          .map((account) => {
            const membership = account.memberships.find((entry) => own(ctx, entry.customer_id))
            return { id: account.id, membership_id: membership.id, name: account.name, email: account.email, phone: account.phone, role_id: membership.role_id, status: membership.status === 'active' ? account.status : 'suspended', last_login_at: account.last_login_at, is_me: account.id === ctx.account.id }
          }),
      }
    },
  },
  {
    method: 'POST',
    path: P.orgUsers,
    handler: ({ headers, body = {} }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'org_users', 'manage')
      const policyId = portalSettings().role_policies?.[body.role_id]
      validation({ ...(!String(body.name || '').trim() && { name: ['required'] }), ...(!body.email && !body.phone && { email: ['required'] }), ...(!policyId && { role_id: ['required'] }) })
      const existing = findAccountByContact(body.email) || findAccountByContact(body.phone)
      const membership = { id: mockId('pm'), customer_id: ctx.membership.customer_id, customer: ctx.membership.customer, membership_type: 'organization_member', role_id: body.role_id, policy_id: policyId, status: 'active' }
      if (existing) {
        if (existing.memberships.some((entry) => own(ctx, entry.customer_id) && entry.status === 'active')) throw new MockHttpError(409, 'MEMBERSHIP_EXISTS', 'Already a company user')
        existing.memberships.push(membership)
      } else {
        getCollection('portalAccounts').push({ id: mockId('pa'), name: body.name, phone: body.phone || null, email: body.email || null, locale: ctx.account.locale, status: 'invited', mfa_enabled: false, last_login_at: null, active_sessions: 0, memberships: [membership], created_at: nowIso(), version: 1 })
      }
      return { status: 201, body: { data: { invited: true } } }
    },
  },
  {
    method: 'PATCH',
    path: `${P.orgUsers}/:id`,
    handler: ({ headers, params, body = {} }) => {
      const ctx = context(headers)
      requirePermission(ctx, 'org_users', 'manage')
      if (params.id === ctx.account.id) throw new MockHttpError(409, 'PORTAL_CANNOT_CHANGE_SELF', 'You cannot change your own access')
      const account = getCollection('portalAccounts').find((entry) => entry.id === params.id)
      const membership = account?.memberships.find((entry) => own(ctx, entry.customer_id))
      if (!membership) throw notFound('User')
      if (body.role_id) {
        const policyId = portalSettings().role_policies?.[body.role_id]
        validation(policyId ? {} : { role_id: ['required'] })
        Object.assign(membership, { role_id: body.role_id, policy_id: policyId })
      }
      if (body.status) membership.status = body.status === 'suspended' ? 'suspended' : 'active'
      return { data: { id: account.id, role_id: membership.role_id, status: membership.status } }
    },
  },

  // Guest tracking (spec §43.1): reference → OTP to the recipient's phone → one record, limited fields.
  {
    method: 'POST',
    path: P.track,
    handler: ({ body = {} }) => {
      const reference = String(body.reference || '').trim().toUpperCase()
      validation(reference ? {} : { reference: ['required'] })
      const record = getCollection('serviceRecords').find((entry) => entry.reference_no === reference)
      const recipient = record && getCollection('recordParticipants').find((entry) => entry.record_id === record.id && entry.role === 'recipient')
      if (!body.code) {
        if (recipient) requestOtp(recipient.phone, `track:${reference}`)
        // Same answer for unknown references (no enumeration).
        return { data: { otp_sent: true, masked_phone: recipient ? `${recipient.phone.slice(0, 4)}•••••${recipient.phone.slice(-3)}` : null } }
      }
      if (!recipient) validation({ code: ['invalid'] })
      checkOtp(recipient.phone, body.code, `track:${reference}`)
      const status = findStatus(record.status_id)
      const delivery = getCollection('deliveries').find((entry) => entry.record_id === record.id)
      return {
        data: {
          reference_no: record.reference_no,
          status: status ? { key: status.key, label: status.customer_label || status.label, category: status.category } : null,
          delivery_status: delivery?.status || null,
          expected_at: record.expected_at,
          city: record.data?.city || null,
          cod_amount: delivery?.cod_amount || null,
          attempts: getCollection('recordEntries').filter((entry) => entry.record_id === record.id && entry.entry_type === 'delivery_attempt').map((entry) => ({ value: entry.value, occurred_at: entry.occurred_at })),
        },
      }
    },
  },
]

