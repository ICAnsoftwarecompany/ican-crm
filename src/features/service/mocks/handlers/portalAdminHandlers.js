import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, requiredLabel } from '../crud'
import { getCollection, getMockManifest, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildPortalAccounts, buildPortalPolicies, buildPortalSettings, buildRequestCatalog } from '../seeds/portalSeed'
import { mockId } from '../seeds/seedUtils'
import { matchesSearch, nowIso, paginate } from '../utils'
import { findOrAdoptCustomer } from './casesHandlers'

registerSeed('portalPolicies', buildPortalPolicies)
registerSeed('requestCatalog', buildRequestCatalog)
registerSeed('portalSettings', (manifest) => [buildPortalSettings(manifest)])
registerSeed('portalAccounts', buildPortalAccounts)

const E = serviceEndpoints
const TYPES = ['self', 'guardian', 'organization_member']
const ROLES = ['admin', 'operations', 'warehouse', 'customer_service', 'accounting']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const conflict = (code, message) => new MockHttpError(409, code, message)

export const portalSettings = () => {
  const list = getCollection('portalSettings')
  if (!list.length) list.push(buildPortalSettings(getMockManifest()))
  return list[0]
}

function accountById(id) {
  const account = getCollection('portalAccounts').find((entry) => entry.id === id)
  if (!account) throw notFound('Portal account')
  return account
}
function serializeAccount(account) {
  const policies = getCollection('portalPolicies')
  return { ...account, memberships: account.memberships.map((membership) => ({ ...membership, policy: policies.find((entry) => entry.id === membership.policy_id) ? { id: membership.policy_id, name: policies.find((entry) => entry.id === membership.policy_id).name } : null })) }
}
function validateMembership(body) {
  const customer = body.customer_id ? findOrAdoptCustomer(body.customer_id) : null
  validation({
    ...(!customer && { customer_id: ['required'] }),
    ...(!TYPES.includes(body.membership_type) && { membership_type: ['required'] }),
    ...(body.membership_type === 'organization_member' && !ROLES.includes(body.role_id) && { role_id: ['required'] }),
    ...(!getCollection('portalPolicies').some((entry) => entry.id === body.policy_id) && { policy_id: ['required'] }),
  })
  return { id: mockId('pm'), customer_id: customer.id, customer: { id: customer.id, name: customer.name }, membership_type: body.membership_type, role_id: body.membership_type === 'organization_member' ? body.role_id : null, policy_id: body.policy_id, status: 'active' }
}

/** @type {import('../router').MockRoute[]} */
export const portalAdminHandlers = [
  ...crudHandlers({
    collection: 'portalPolicies',
    path: E.portalPolicies,
    prefix: 'pp',
    validate: (body) => ({ ...(requiredLabel(body.name) && { name: ['required'] }), ...(!(body.rules || []).length && { rules: ['required'] }) }),
    canDelete: (policy) => {
      if (getCollection('portalAccounts').some((account) => account.memberships.some((membership) => membership.policy_id === policy.id))) throw new MockHttpError(409, 'RESOURCE_IN_USE', 'Policy is used by portal memberships')
    },
  }),
  ...crudHandlers({
    collection: 'requestCatalog',
    path: E.requestCatalog,
    prefix: 'sc',
    validate: (body) => ({
      ...(requiredLabel(body.name) && { name: ['required'] }),
      ...(!body.case_type_id && { case_type_id: ['required'] }),
      ...((body.form_schema || []).some((field) => !String(field.key || '').trim()) && { form_schema: ['invalid'] }),
    }),
  }),
  { method: 'GET', path: E.portalSettings, handler: () => ({ data: portalSettings() }) },
  {
    method: 'PUT',
    path: E.portalSettings,
    handler: ({ body = {} }) => {
      validation({
        ...(requiredLabel(body.brand_name) && { brand_name: ['required'] }),
        ...(body.primary_color && !/^#[0-9a-f]{6}$/i.test(body.primary_color) && { primary_color: ['invalid'] }),
        ...(body.subdomain && !/^[a-z0-9-]{2,30}$/.test(body.subdomain) && { subdomain: ['invalid'] }),
      })
      Object.assign(portalSettings(), body)
      return { data: portalSettings() }
    },
  },
  {
    method: 'GET',
    path: E.portalAccounts,
    handler: ({ query }) => {
      const items = getCollection('portalAccounts')
        .filter((account) => !query.customer_id || account.memberships.some((membership) => membership.customer_id === query.customer_id))
        .filter((account) => !query.status || account.status === query.status)
        .filter((account) => matchesSearch([account.name, account.phone, account.email, ...account.memberships.map((membership) => membership.customer?.name)], query.search))
        .map(serializeAccount)
      return paginate(items, query)
    },
  },
  {
    method: 'POST',
    path: E.portalAccounts,
    handler: ({ body = {} }) => {
      validation({ ...(!String(body.name || '').trim() && { name: ['required'] }), ...(!body.phone && !body.email && { phone: ['required'] }) })
      const contact = [body.phone, body.email].filter(Boolean)
      if (getCollection('portalAccounts').some((account) => contact.includes(account.phone) || contact.includes(account.email))) throw conflict('PORTAL_ACCOUNT_EXISTS', 'An account with this phone or email exists — add a membership to it')
      const membership = validateMembership(body)
      const account = { id: mockId('pa'), name: body.name, phone: body.phone || null, email: body.email || null, locale: body.locale || 'ar', status: 'invited', mfa_enabled: false, last_login_at: null, active_sessions: 0, memberships: [membership], created_at: nowIso(), version: 1 }
      getCollection('portalAccounts').unshift(account)
      return { status: 201, body: { data: serializeAccount(account) } }
    },
  },
  {
    method: 'PATCH',
    path: `${E.portalAccounts}/:id`,
    handler: ({ params, body = {} }) => {
      const account = accountById(params.id)
      if (body.status) {
        validation(['active', 'disabled'].includes(body.status) ? {} : { status: ['invalid'] })
        account.status = body.status
        if (body.status === 'disabled') account.active_sessions = 0
      }
      account.version += 1
      return { data: serializeAccount(account) }
    },
  },
  {
    method: 'POST',
    path: `${E.portalAccounts}/:id/memberships`,
    handler: ({ params, body = {} }) => {
      const account = accountById(params.id)
      const membership = validateMembership(body)
      if (account.memberships.some((entry) => entry.customer_id === membership.customer_id && entry.status === 'active')) throw conflict('MEMBERSHIP_EXISTS', 'Already a member of this customer')
      account.memberships.push(membership)
      account.version += 1
      return { data: serializeAccount(account) }
    },
  },
  {
    method: 'DELETE',
    path: `${E.portalAccounts}/:id/memberships/:membershipId`,
    handler: ({ params }) => {
      const account = accountById(params.id)
      const membership = account.memberships.find((entry) => entry.id === params.membershipId)
      if (!membership) throw notFound('Membership')
      membership.status = 'revoked'
      account.version += 1
      return { data: serializeAccount(account) }
    },
  },
  {
    method: 'POST',
    path: `${E.portalAccounts}/:id/revoke-sessions`,
    handler: ({ params }) => {
      const account = accountById(params.id)
      account.active_sessions = 0
      account.sessions_revoked_at = nowIso()
      return { data: serializeAccount(account) }
    },
  },
  {
    method: 'POST',
    path: `${E.portalAccounts}/:id/resend-invite`,
    handler: ({ params }) => {
      const account = accountById(params.id)
      if (account.status !== 'invited') throw conflict('PORTAL_ACCOUNT_ACTIVE', 'Account already active')
      account.invited_at = nowIso()
      return { data: serializeAccount(account) }
    },
  },
]
