import { CONDITION_KEYS, normalizeRule, ruleConditions, sortRules, targetOf, validateRuleForm } from '../../utils/ruleModel'

/**
 * Rule builder model (2026-10-16): the steps of the "new / edit distribution rule" page and the pure helpers its
 * panels use (step validation, target preview, priority placement). The body sent is still `buildRulePayload`.
 */

export const RULE_STEPS = ['basics', 'conditions', 'method', 'target', 'priority', 'review']

const STEP_FIELDS = {
  basics: ['name'],
  conditions: [],
  method: ['assign_type'],
  target: ['team_id', 'user_id'],
  priority: ['priority'],
  review: [],
}

/** Errors of one step only (keys from `validateRuleForm`). */
export function stepErrors(step, form) {
  const all = validateRuleForm(form)
  return Object.fromEntries(Object.entries(all).filter(([key]) => STEP_FIELDS[step]?.includes(key)))
}

/** First step that still has an error, or '' when the rule can be saved. */
export function firstInvalidStep(form) {
  return RULE_STEPS.find((step) => Object.keys(stepErrors(step, form)).length > 0) || ''
}

/** A step is reachable when every step before it is valid (in edit mode the form starts complete). */
export function reachableSteps(form) {
  const invalid = firstInvalidStep(form)
  const stop = invalid ? RULE_STEPS.indexOf(invalid) : RULE_STEPS.length - 1
  return RULE_STEPS.slice(0, stop + 1)
}

/** Who receives the leads, resolved for previews. */
export function targetPreview(form, { teamById = new Map(), userById = new Map() } = {}) {
  if (targetOf(form.assign_type) === 'user') {
    const user = form.user_id ? userById.get(form.user_id) : null
    return { kind: 'user', id: form.user_id, user, team: null }
  }
  const team = form.team_id ? teamById.get(form.team_id) : null
  return { kind: 'team', id: form.team_id, user: null, team }
}

/**
 * Who would get the next `count` leads, as an illustration of the assign type: round robin cycles the members
 * (the leader too when the team has no members), team leader = the leader every time, user = that user.
 * Returns [] when it cannot be shown (team / users unknown, or assign type "team" = shared).
 */
export function nextLeadsPreview(form, preview, count = 4) {
  if (preview.kind === 'user') return preview.user ? Array.from({ length: count }, () => preview.user) : []
  const team = preview.team
  if (!team) return []
  if (form.assign_type === 'team_leader') return team.leader ? Array.from({ length: count }, () => team.leader) : []
  if (form.assign_type !== 'round_robin') return []
  const pool = team.members.length ? team.members : team.leader ? [team.leader] : []
  return pool.length ? Array.from({ length: count }, (_, index) => pool[index % pool.length]) : []
}

const DRAFT_ID = '__draft__'

/** `a` catches every lead `b` catches: each condition set on `a` is set to the same value on `b`. */
export function isBroaderOrEqual(a, b) {
  return CONDITION_KEYS.every((key) => !a[key] || String(a[key]) === String(b[key] || ''))
}

export function sameConditions(a, b) {
  return CONDITION_KEYS.every((key) => String(a[key] || '') === String(b[key] || ''))
}

/**
 * Where the rule sits among the active rules (higher priority first; on a tie the draft goes after the existing
 * ones), plus the rules above it that already catch every lead it would (first-match semantics, to confirm with
 * the backend) and the rules with exactly the same conditions.
 */
export function placeRule(rules = [], form, editingId = '') {
  const others = sortRules(rules.filter((rule) => rule.active && rule.id !== editingId))
  const draft = { ...normalizeRule({ ...form, id: DRAFT_ID }), isDraft: true }
  const priority = Number(form.priority)
  const index = others.findIndex((rule) => rule.priority < priority)
  const position = index === -1 ? others.length : index
  const ordered = [...others.slice(0, position), draft, ...others.slice(position)]
  const above = others.slice(0, position)
  return {
    ordered,
    position,
    shadowedBy: above.filter((rule) => isBroaderOrEqual(rule, draft)),
    sameAs: others.filter((rule) => sameConditions(rule, draft)),
    tiesWith: others.filter((rule) => rule.priority === priority),
  }
}

/**
 * Suggested priority when a broader active rule would be checked first: just above the highest one. null when the
 * current priority is already above every broader rule (nothing to fix).
 */
export function suggestPriority(rules = [], form, editingId = '') {
  const draft = normalizeRule(form)
  const broader = rules.filter((rule) => rule.active && rule.id !== editingId && isBroaderOrEqual(rule, draft))
  if (!broader.length) return null
  const highest = Math.max(...broader.map((rule) => rule.priority))
  const current = Number(form.priority)
  return Number.isFinite(current) && String(form.priority).trim() !== '' && current > highest ? null : highest + 1
}

/** Conditions of the form in display order (same shape as `ruleConditions`). */
export const formConditions = (form) => ruleConditions(form)
