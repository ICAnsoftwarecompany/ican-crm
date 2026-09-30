/**
 * Industry template versioning (spec §47.2): template → versions → tenant installation → tenant overrides.
 * An upgrade is a list of changes against what version 1 installed. A change conflicts when the tenant already edited
 * that value (current ≠ the template's old value): conflicts are skipped unless the admin chooses "take template".
 * Nothing is deleted — a removed template entry is deactivated.
 */
import { buildOperationsSeed } from '../seeds/operationsSeed'

const L = (ar, en) => ({ ar, en })

export const LATEST_TEMPLATE_VERSION = 2
export const TEMPLATE_VERSIONS = [
  { version: 1, released_at: '2026-06-01', notes: L('الإصدار الأول', 'First release') },
  { version: 2, released_at: '2026-09-15', notes: L('متابعة التقييم المنخفض، برنامج بداية التعامل، رد أسرع للعاجل', 'Low-rating follow-up, onboarding program, faster first reply for urgent') },
]

/** Changes from v1 → v2 for a template (same structure for every industry in the demo). */
export function templateChanges(manifest) {
  const base = buildOperationsSeed(manifest)
  const urgent = base.slaPolicies.find((policy) => policy.id === 'sla-urgent')
  return [
    { id: 'sla-urgent-first-response', entity: 'slaPolicies', target_id: 'sla-urgent', change: 'changed', field: 'first_response_minutes', from: urgent?.first_response_minutes ?? 30, to: 15, label: urgent?.name, note: L('أول رد على العاجل خلال 15 دقيقة', 'First reply to urgent requests within 15 minutes') },
    { id: 'case-type-feedback', entity: 'caseTypes', change: 'added', label: L('متابعة تقييم منخفض', 'Low rating follow-up'), data: { id: 'ct-feedback_followup', key: 'feedback_followup', label: L('متابعة تقييم منخفض', 'Low rating follow-up'), icon: 'MessageSquareWarning', default_priority: 'high', default_queue_id: null, sla_policy_id: null, pipeline_id: null, form_fields: [], active: true }, note: L('نوع طلب للمشرف لما العميل يقيّم بدرجة منخفضة', 'A supervisor request type for low ratings') },
    { id: 'program-onboarding', entity: 'followUpPrograms', change: 'added', label: L('بداية التعامل', 'Onboarding'), data: { id: 'fp-onboarding', name: L('بداية التعامل', 'Onboarding'), subject_type: 'customer', enrollment_trigger: { type: 'event', event: 'contract.signed' }, steps: [
      { key: 'day1', offset: '+1 day', channel: 'whatsapp', task_title: L('رسالة ترحيب', 'Welcome message'), checklist: [], outcomes: ['satisfied', 'no_answer'], on_outcome: { no_answer: 'retry:+1 day:1' } },
      { key: 'day3', offset: '+3 day', channel: 'call', task_title: L('مكالمة التأكد من البداية', 'Getting-started call'), checklist: [], outcomes: ['satisfied', 'issue_found', 'no_answer'], on_outcome: { no_answer: 'retry:+1 day:2' } },
      { key: 'day14', offset: '+14 day', channel: 'call', task_title: L('مراجعة أول أسبوعين', 'Two-week review'), checklist: [], outcomes: ['satisfied', 'issue_found'], on_outcome: {} },
    ], assignment: { type: 'portfolio_owner', fallback_user_id: 'agent-1' }, exit_conditions: ['customer_opted_out'], status: 'active', version: 1 }, note: L('متابعات يوم 1 و3 و14 (المواصفات §47)', 'Day 1, 3 and 14 check-ins (spec §47)') },
    { id: 'kb-policies', entity: 'kbCategories', change: 'added', label: L('السياسات', 'Policies'), data: { id: 'kbc-policies', label: L('السياسات', 'Policies'), visibility: 'customer' }, note: L('تصنيف للمقالات العامة عن السياسات', 'A category for customer-facing policies') },
    { id: 'escalation-critical', entity: 'escalationRules', target_id: 'esc-critical', change: 'removed', label: L('الحالات العاجلة', 'Urgent cases'), note: L('اتدمجت في التصعيد الافتراضي', 'Merged into the default escalation') },
  ]
}

/** Current state of each change for this tenant: pending | conflict | already. */
export function changeStatus(change, collection) {
  const current = collection.find((entry) => entry.id === (change.target_id || change.data?.id))
  if (change.change === 'added') return current ? 'already' : 'pending'
  if (change.change === 'removed') return !current || current.active === false ? 'already' : 'pending'
  if (!current) return 'already'
  if (current[change.field] === change.to) return 'already'
  return current[change.field] === change.from ? 'pending' : 'conflict'
}

export function applyChange(change, collection) {
  const current = collection.find((entry) => entry.id === (change.target_id || change.data?.id))
  if (change.change === 'added' && !current) collection.push({ ...change.data, installed_from_template_version: LATEST_TEMPLATE_VERSION })
  if (change.change === 'removed' && current) current.active = false
  if (change.change === 'changed' && current) current[change.field] = change.to
}
