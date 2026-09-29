import { getCollection } from '../db'
import { findStatus } from './caseConfig'

/**
 * Mock SLA engine. The real backend computes SLA in business time (business
 * calendar, holidays, pauses accumulated from status history) and stores
 * `sla_timers`; the mock uses wall-clock time and treats "pending customer"
 * as a pause without accumulating it. The OUTPUT SHAPE is the contract:
 *
 * sla: {
 *   policy: { id, name },
 *   state: 'on_track' | 'at_risk' | 'breached' | 'paused' | 'met',
 *   next_due_at: ISO | null,          // earliest running target
 *   first_response: Metric, resolution: Metric,
 * }
 * Metric: { target_minutes, due_at, completed_at, state, elapsed_percent }
 */
export const AT_RISK_PERCENT = 75
const MINUTE = 60 * 1000
const CLOSED_CATEGORIES = ['resolved', 'closed', 'cancelled']

const applies = (list, value) => !list?.length || list.map(String).includes(String(value))

/** Case type can pin a policy; otherwise the first active policy (by order) that matches. */
export function findSlaPolicy(item) {
  const policies = getCollection('slaPolicies').filter((policy) => policy.active !== false)
  const type = getCollection('caseTypes').find((entry) => entry.id === item.type_id)
  const pinned = type?.sla_policy_id && policies.find((policy) => policy.id === type.sla_policy_id)
  if (pinned) return pinned
  return [...policies]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .find((policy) => applies(policy.priorities, item.priority) && applies(policy.case_type_ids, item.type_id)) || null
}

function metric(openedAt, targetMinutes, completedAt, now) {
  const opened = new Date(openedAt).getTime()
  const due = opened + targetMinutes * MINUTE
  const end = completedAt ? new Date(completedAt).getTime() : now
  const elapsedPercent = Math.round(((end - opened) / (targetMinutes * MINUTE)) * 100)
  let state
  if (completedAt) state = end <= due ? 'met' : 'breached'
  else if (now > due) state = 'breached'
  else if (elapsedPercent >= AT_RISK_PERCENT) state = 'at_risk'
  else state = 'on_track'
  return {
    target_minutes: targetMinutes,
    due_at: new Date(due).toISOString(),
    completed_at: completedAt || null,
    state,
    elapsed_percent: Math.max(0, elapsedPercent),
  }
}

const RANK = { breached: 3, at_risk: 2, on_track: 1, met: 0 }

export function computeSla(item, now = Date.now()) {
  const policy = findSlaPolicy(item)
  if (!policy) return null
  const status = findStatus(item.status_id)
  const done = CLOSED_CATEGORIES.includes(status?.category)
  const endedAt = done ? item.resolved_at || item.closed_at || item.updated_at : null
  const firstResponse = metric(item.opened_at, policy.first_response_minutes, item.first_response_at || endedAt, now)
  const resolution = metric(item.opened_at, policy.resolution_minutes, endedAt, now)
  const metrics = [firstResponse, resolution]
  const running = metrics.filter((entry) => !entry.completed_at)

  let state
  if (done) state = metrics.some((entry) => entry.state === 'breached') ? 'breached' : 'met'
  else if (policy.pause_on_pending_customer && status?.key === 'pending_customer') state = 'paused'
  else state = metrics.reduce((worst, entry) => (RANK[entry.state] > RANK[worst] ? entry.state : worst), 'met')
  if (state === 'met' && running.length) state = 'on_track'

  const nextDue = running.map((entry) => entry.due_at).sort()[0] || null
  return {
    policy: { id: policy.id, name: policy.name },
    state,
    next_due_at: state === 'paused' ? null : nextDue,
    first_response: firstResponse,
    resolution,
  }
}

/** Escalation rule for a case: first active rule whose priorities match (empty = all). */
export function findEscalationRule(item) {
  return getCollection('escalationRules')
    .filter((rule) => rule.active !== false)
    .find((rule) => applies(rule.priorities, item.priority) && rule.priorities?.length) ||
    getCollection('escalationRules').find((rule) => rule.active !== false && !rule.priorities?.length) ||
    null
}

/**
 * Escalation steps that have fired so far, as timeline activities.
 * Backend writes these as `sla_escalated` activities when its scheduler runs;
 * the mock derives them from the resolution clock so they stay consistent.
 */
export function escalationActivities(item, now = Date.now()) {
  const sla = computeSla(item, now)
  const rule = findEscalationRule(item)
  if (!sla || !rule || sla.state === 'paused') return []
  const opened = new Date(item.opened_at).getTime()
  const target = sla.resolution.target_minutes * MINUTE
  const stoppedAt = sla.resolution.completed_at ? new Date(sla.resolution.completed_at).getTime() : now
  return (rule.triggers || [])
    .map((trigger, index) => ({ trigger, index, at: opened + (target * trigger.at) / 100 }))
    .filter(({ at }) => at <= stoppedAt)
    .map(({ trigger, index, at }) => ({
      id: `${item.id}-esc-${index}`,
      case_id: item.id,
      type: 'sla_escalated',
      visibility: 'internal',
      author: { type: 'system', id: null, name: null },
      body: null,
      metadata: { percent: trigger.at, action: trigger.action, target: trigger.target, metric: 'resolution', rule: rule.name },
      occurred_at: new Date(at).toISOString(),
    }))
}
