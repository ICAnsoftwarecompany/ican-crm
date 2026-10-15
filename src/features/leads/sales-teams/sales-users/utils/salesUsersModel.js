import { normalizeId } from '../../utils/teamModel'

/**
 * Sales users model (2026-10-16). Users come from `GET /api/tenant/users/get`; this page edits only `priority`,
 * `manager_id`, `role`, `type` and `active`, one field per request through `POST /api/tenant/users/update/{id}/`.
 * Priority is a rank (1 = first) and must be unique among users; 0 / empty = not ranked yet.
 */

export const SALES_TYPE = 'sales'
export const EDITABLE_FIELDS = ['priority', 'manager_id', 'role', 'type', 'active']
export const DEFAULT_ROLES = ['admin', 'manager', 'team_leader', 'sales', 'agent']
export const DEFAULT_TYPES = ['sales', 'internal', 'support', 'marketing', 'external']

const toBool = (value) => {
  if (value === undefined || value === null || value === '') return true
  if (typeof value === 'string') return !['0', 'false', 'inactive'].includes(value.toLowerCase())
  return Boolean(Number(value))
}

const toPriority = (value) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : 0
}

export function normalizeSalesUser(raw = {}) {
  const manager = raw.manager && typeof raw.manager === 'object' ? raw.manager : null
  return {
    id: normalizeId(raw.id),
    name: raw.name || raw.username || raw.email || `#${raw.id}`,
    email: raw.email || '',
    username: raw.username || '',
    phone: raw.phone || '',
    role: raw.role ? String(raw.role) : '',
    type: raw.type ? String(raw.type) : '',
    active: toBool(raw.active),
    priority: toPriority(raw.priority),
    managerId: normalizeId(raw.manager_id ?? manager?.id),
    managerName: manager?.name || '',
    raw,
  }
}

export const isSalesUser = (user) => user.type.toLowerCase() === SALES_TYPE

/** Ranked users first (1, 2, 3…), then the unranked ones by name. */
export function sortByPriority(users = []) {
  return [...users].sort((a, b) => {
    if (a.priority && b.priority) return a.priority - b.priority
    if (a.priority) return -1
    if (b.priority) return 1
    return a.name.localeCompare(b.name)
  })
}

/** Priorities used by more than one user → those users (to flag and fix). */
export function duplicatePriorities(users = []) {
  const byPriority = new Map()
  users.filter((user) => user.priority).forEach((user) => byPriority.set(user.priority, [...(byPriority.get(user.priority) || []), user]))
  return new Map([...byPriority].filter(([, list]) => list.length > 1))
}

export const priorityOwner = (users, priority, exceptId = '') => users.find((user) => user.priority === priority && user.id !== exceptId) || null

export const nextFreePriority = (users = []) => users.reduce((max, user) => Math.max(max, user.priority), 0) + 1

/** 'invalid' | { conflict: user } | null (ok). Empty = clear the rank (0). */
export function checkPriority(value, users, userId) {
  if (String(value).trim() === '') return null
  const number = Number(value)
  if (!Number.isInteger(number) || number < 0) return 'invalid'
  if (number === 0) return null
  const owner = priorityOwner(users, number, userId)
  return owner ? { conflict: owner } : null
}

/**
 * Update body for one field. The identity fields go along unchanged (the update endpoint validates them);
 * password and team_id are never sent from here.
 */
export function buildUserFieldPayload(user, field, value) {
  const base = { name: user.raw.name ?? user.name, email: user.raw.email ?? user.email, username: user.raw.username ?? user.username }
  if (user.raw.phone) base.phone = user.raw.phone
  if (field === 'priority') return { ...base, priority: toPriority(value) }
  if (field === 'manager_id') return { ...base, manager_id: normalizeId(value) ? Number(value) : null }
  if (field === 'active') return { ...base, active: value ? 1 : 0 }
  if (field === 'role' || field === 'type') return { ...base, [field]: String(value || '').trim() || null }
  throw new Error(`Unsupported field: ${field}`)
}

/** Two updates that swap the ranks of `a` and `b`. */
export const swapPlan = (a, b) => [{ user: a, priority: b.priority }, { user: b, priority: a.priority }]

/** Ranks 1..n in the given order; only users whose rank changes. */
export function renumberPlan(orderedUsers = []) {
  return orderedUsers.map((user, index) => ({ user, priority: index + 1 })).filter(({ user, priority }) => user.priority !== priority)
}

/**
 * Requests for a priority plan: users whose current rank is the new rank of another user in the plan are cleared
 * (0) first, so a backend enforcing unique priorities never sees two users on one rank.
 */
export function priorityUpdateSteps(plan = []) {
  const targetOwner = new Map(plan.map(({ user, priority }) => [priority, user.id]))
  const clearFirst = plan.filter(({ user }) => user.priority && targetOwner.has(user.priority) && targetOwner.get(user.priority) !== user.id)
  return [...clearFirst.map(({ user }) => ({ user, priority: 0 })), ...plan]
}

/** Suggestions for role / type: defaults plus the values already used. */
export function valueSuggestions(users = [], field, defaults = []) {
  return [...new Set([...defaults, ...users.map((user) => user[field]).filter(Boolean)])]
}

export function filterSalesUsers(users = [], { scope = 'sales', search = '', status = 'all' } = {}) {
  const query = search.trim().toLowerCase()
  return users.filter((user) => {
    if (scope === 'sales' && !isSalesUser(user)) return false
    if (status === 'active' && !user.active) return false
    if (status === 'inactive' && user.active) return false
    return !query || [user.name, user.email, user.username, user.phone, user.role, user.type].join(' ').toLowerCase().includes(query)
  })
}
