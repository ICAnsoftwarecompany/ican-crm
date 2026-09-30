/**
 * Mock of the portal identity + policy layer (spec §43.1–43.3). The real server keeps portal sessions apart
 * from staff sessions and scopes every portal query by the active membership — never by IDs the client sends.
 */
import { getCollection } from '../db'
import { MockHttpError } from '../errors'
import { mockId } from '../seeds/seedUtils'
import { nowIso } from '../utils'

export const DEMO_OTP = '123456'
export const DEMO_B2B_PASSWORD = 'Portal@123'
const OTP_TTL_MS = 5 * 60 * 1000
const MAX_OTP_ATTEMPTS = 5
const MAX_OTP_REQUESTS = 5

export const unauthorized = () => new MockHttpError(401, 'PORTAL_UNAUTHENTICATED', 'Sign in again')
export const forbidden = () => new MockHttpError(403, 'PORTAL_FORBIDDEN', 'Not allowed by your access policy')

// The mock DB is rebuilt on every page load; keep portal sessions in storage so a reload stays signed in (mock only).
const SESSION_STORAGE_KEY = 'ican-portal-mock-sessions'
function storedSessions() {
  try {
    return JSON.parse(globalThis.localStorage?.getItem(SESSION_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}
function persistSessions() {
  try {
    globalThis.localStorage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(getCollection('portalSessions').slice(-20)))
  } catch {
    // storage unavailable: sessions live in memory only
  }
}
function sessionsCollection() {
  const sessions = getCollection('portalSessions')
  if (!sessions.length) sessions.push(...storedSessions())
  return sessions
}

const normalize = (target) => String(target || '').trim().toLowerCase().replace(/\s+/g, '')

/** OTP request: same answer whether or not an account exists (no enumeration), rate limited per target. */
export function requestOtp(target, purpose = 'login') {
  const key = normalize(target)
  if (!key) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { target: ['required'] })
  const otps = getCollection('portalOtps')
  let entry = otps.find((item) => item.target === key && item.purpose === purpose)
  if (!entry) {
    entry = { target: key, purpose, requests: 0, attempts: 0 }
    otps.push(entry)
  }
  if (entry.requests >= MAX_OTP_REQUESTS) throw new MockHttpError(429, 'OTP_RATE_LIMITED', 'Too many codes requested')
  Object.assign(entry, { requests: entry.requests + 1, attempts: 0, code: DEMO_OTP, expires_at: Date.now() + OTP_TTL_MS })
  return { sent: true, expires_in: OTP_TTL_MS / 1000 }
}

export function checkOtp(target, code, purpose = 'login') {
  const entry = getCollection('portalOtps').find((item) => item.target === normalize(target) && item.purpose === purpose)
  const invalid = () => new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { code: ['invalid'] })
  if (!entry || !entry.code || entry.expires_at < Date.now()) throw invalid()
  if (entry.attempts >= MAX_OTP_ATTEMPTS) throw new MockHttpError(429, 'OTP_TOO_MANY_ATTEMPTS', 'Request a new code')
  if (String(code) !== entry.code) {
    entry.attempts += 1
    throw invalid()
  }
  entry.code = null
}

export function findAccountByContact(target) {
  const key = normalize(target)
  return getCollection('portalAccounts').find((account) => normalize(account.phone) === key || normalize(account.email) === key)
}

const activeMemberships = (account) => account.memberships.filter((membership) => membership.status === 'active')

export function openSession(account) {
  if (account.status === 'disabled') throw new MockHttpError(403, 'PORTAL_ACCOUNT_DISABLED', 'Account disabled')
  const memberships = activeMemberships(account)
  if (!memberships.length) throw new MockHttpError(403, 'PORTAL_NO_ACCESS', 'No active access')
  if (account.status === 'invited') account.status = 'active'
  Object.assign(account, { last_login_at: nowIso(), active_sessions: (account.active_sessions || 0) + 1 })
  const session = { token: `pt_${mockId('s')}`, account_id: account.id, membership_id: memberships[0].id, created_at: nowIso(), revoked_at: account.sessions_revoked_at || null }
  sessionsCollection().push(session)
  persistSessions()
  return session
}

/** Resolves the bearer token → session, account and active membership (+ its policy). */
export function resolveSession(headers = {}) {
  const auth = headers.Authorization || headers.authorization || ''
  const token = String(auth).replace(/^Bearer\s+/i, '')
  const session = sessionsCollection().find((entry) => entry.token === token && !entry.ended_at)
  if (!session) throw unauthorized()
  const account = getCollection('portalAccounts').find((entry) => entry.id === session.account_id)
  // "Sign out everywhere" from the CRM ends every session created before it.
  if (!account || account.status === 'disabled' || (account.sessions_revoked_at && account.sessions_revoked_at > session.created_at)) throw unauthorized()
  const membership = activeMemberships(account).find((entry) => entry.id === session.membership_id) || activeMemberships(account)[0]
  if (!membership) throw unauthorized()
  const policy = getCollection('portalPolicies').find((entry) => entry.id === membership.policy_id && entry.active !== false)
  return { session, account, membership, policy, permissions: permissionsOf(policy) }
}

/** { object: [allowed actions] } — deny wins over allow. */
export function permissionsOf(policy) {
  const result = {}
  ;(policy?.rules || []).forEach((rule) => {
    const deny = new Set(rule.deny || [])
    const allowed = (rule.actions || []).filter((action) => !deny.has(action))
    if (allowed.length) result[rule.object] = [...new Set([...(result[rule.object] || []), ...allowed])]
  })
  return result
}

export const can = (context, object, action = 'view') => Boolean(context.permissions[object]?.includes(action))
export function requirePermission(context, object, action = 'view') {
  if (!can(context, object, action)) throw forbidden()
}

/** Ends or re-points a session and keeps the mock storage in sync. */
export function saveSessions() {
  persistSessions()
}
