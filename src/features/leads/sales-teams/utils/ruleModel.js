import { normalizeId, isActiveFlag } from './teamModel'

/**
 * Lead assignment rules model (2026-10-15). Pure helpers between the lead-assignment API and the rules UI.
 *
 * Endpoints (features/leads/api/leadAssignmentApi.js):
 * - GET  lead-assignment/rules
 * - POST lead-assignment/create/rule, POST lead-assignment/update/rule/{id}, both JSON:
 *   { name, campaign_id, ad_id, form_id, source, assign_type, team_id, user_id, priority, active }
 * Empty conditions are sent as null (= "any"). The backend runs the assignment; this file only shapes data.
 */

export const ASSIGN_TYPES = ['round_robin', 'team', 'team_leader', 'user']

/** What each assign type needs as its target. */
export const ASSIGN_TYPE_TARGET = { user: 'user', team: 'team', round_robin: 'team', team_leader: 'team' }

/** Lead sources offered in the rule form; a stored value outside this list is still shown. */
export const RULE_SOURCES = ['facebook', 'messenger', 'whatsapp', 'lead_form', 'website', 'google', 'referral', 'manual', 'other']

export const CONDITION_KEYS = ['source', 'campaign_id', 'ad_id', 'form_id']

export const EMPTY_RULE_FORM = {
  name: '',
  source: '',
  campaign_id: '',
  ad_id: '',
  form_id: '',
  assign_type: 'round_robin',
  team_id: '',
  user_id: '',
  priority: '10',
  active: true,
}

export function targetOf(assignType) {
  return ASSIGN_TYPE_TARGET[assignType] || 'team'
}

const idOrNull = (value) => {
  const id = normalizeId(value)
  return id ? Number(id) : null
}

export function normalizeRule(rule = {}) {
  return {
    id: normalizeId(rule.id ?? rule.rule_id),
    name: rule.name || rule.rule_name || '',
    source: rule.source ? String(rule.source) : '',
    campaign_id: normalizeId(rule.campaign_id ?? rule.campaign),
    ad_id: normalizeId(rule.ad_id ?? rule.ad),
    form_id: normalizeId(rule.form_id ?? rule.form),
    assign_type: ASSIGN_TYPES.includes(rule.assign_type) ? rule.assign_type : 'round_robin',
    team_id: normalizeId(rule.team_id ?? rule.team),
    user_id: normalizeId(rule.user_id ?? rule.user),
    priority: Number.isFinite(Number(rule.priority)) ? Number(rule.priority) : 0,
    active: isActiveFlag(rule.active),
    names: {
      campaign: rule.campaign?.name || rule.campaign_name || '',
      ad: rule.ad?.name || rule.ad_name || '',
      form: rule.form?.name || rule.form_name || '',
      team: rule.team?.name || rule.team_name || '',
      user: rule.user?.name || rule.user_name || '',
    },
  }
}

/** Higher priority first, then newest id first (how the list is shown; see README "known gaps"). */
export function sortRules(rules = []) {
  return [...rules].sort((a, b) => b.priority - a.priority || Number(b.id || 0) - Number(a.id || 0))
}

export function toRuleForm(rule, defaults = {}) {
  if (!rule) return { ...EMPTY_RULE_FORM, ...defaults }
  const normalized = rule.names ? rule : normalizeRule(rule)
  return {
    name: normalized.name,
    source: normalized.source,
    campaign_id: normalized.campaign_id,
    ad_id: normalized.ad_id,
    form_id: normalized.form_id,
    assign_type: normalized.assign_type,
    team_id: normalized.team_id,
    user_id: normalized.user_id,
    priority: String(normalized.priority),
    active: normalized.active,
  }
}

/** Field change with the dependent resets: target follows the assign type, a new campaign drops its old ad. */
export function applyRuleField(form, key, value) {
  const next = { ...form, [key]: value }
  if (key === 'assign_type') {
    if (targetOf(value) === 'user') next.team_id = ''
    else next.user_id = ''
  }
  if (key === 'campaign_id' && value !== form.campaign_id) next.ad_id = ''
  return next
}

export function validateRuleForm(form) {
  const errors = {}
  if (!String(form.name || '').trim()) errors.name = 'nameRequired'
  if (!ASSIGN_TYPES.includes(form.assign_type)) errors.assign_type = 'assignTypeRequired'
  else if (targetOf(form.assign_type) === 'user' && !normalizeId(form.user_id)) errors.user_id = 'userRequired'
  else if (targetOf(form.assign_type) === 'team' && !normalizeId(form.team_id)) errors.team_id = 'teamRequired'
  const priority = Number(form.priority)
  if (String(form.priority).trim() === '' || !Number.isInteger(priority) || priority < 0) errors.priority = 'priorityInvalid'
  return errors
}

export function buildRulePayload(form) {
  const target = targetOf(form.assign_type)
  return {
    name: String(form.name).trim(),
    campaign_id: idOrNull(form.campaign_id),
    ad_id: idOrNull(form.ad_id),
    form_id: idOrNull(form.form_id),
    source: String(form.source || '').trim() || null,
    assign_type: form.assign_type,
    team_id: target === 'team' ? idOrNull(form.team_id) : null,
    user_id: target === 'user' ? idOrNull(form.user_id) : null,
    priority: Number(form.priority),
    active: Boolean(form.active),
  }
}

/** The update endpoint gets the full rule, so toggling `active` resends everything else unchanged. */
export function buildToggleRulePayload(rule, active) {
  return buildRulePayload({ ...toRuleForm(rule), active })
}

/** Conditions that are set on a rule, in display order. None = the rule catches every lead. */
export function ruleConditions(rule) {
  return CONDITION_KEYS.filter((key) => rule[key]).map((key) => ({ key, value: rule[key] }))
}

/** How many rules route to each team (active and all). */
export function countRulesByTeam(rules = []) {
  const counts = new Map()
  rules.forEach((rule) => {
    if (!rule.team_id || targetOf(rule.assign_type) !== 'team') return
    const current = counts.get(rule.team_id) || { total: 0, active: 0 }
    counts.set(rule.team_id, { total: current.total + 1, active: current.active + (rule.active ? 1 : 0) })
  })
  return counts
}

/** Problems worth flagging on a rule card: inactive / missing target. */
export function ruleWarnings(rule, { teamById = new Map(), userById = new Map() } = {}) {
  const warnings = []
  const target = targetOf(rule.assign_type)
  if (target === 'team') {
    const team = teamById.get(rule.team_id)
    if (!rule.team_id) warnings.push('missingTeam')
    else if (team && !team.active) warnings.push('inactiveTeam')
    else if (team && rule.assign_type === 'team_leader' && !team.leaderId) warnings.push('noLeader')
    else if (team && rule.assign_type !== 'team_leader' && team.memberIds.length === 0 && !team.leaderId) warnings.push('emptyTeam')
  } else if (!rule.user_id) warnings.push('missingUser')
  else if (userById.size && !userById.has(rule.user_id)) warnings.push('unknownUser')
  return warnings
}

export function filterRules(rules = [], { search = '', status = 'all', assignType = 'all' } = {}) {
  const query = search.trim().toLowerCase()
  return rules.filter((rule) => {
    if (status === 'active' && !rule.active) return false
    if (status === 'inactive' && rule.active) return false
    if (assignType !== 'all' && rule.assign_type !== assignType) return false
    return !query || [rule.name, rule.source, ...Object.values(rule.names)].join(' ').toLowerCase().includes(query)
  })
}
