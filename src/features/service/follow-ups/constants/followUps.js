/** Follow-up program vocabulary (spec §39). Labels live in `service.followUps.*`. */
export const FOLLOW_UP_VIEWS = ['overdue', 'due_today', 'upcoming', 'completed', 'all']
export const SUBJECT_TYPES = ['customer', 'contract', 'subscription', 'asset', 'record', 'case']
export const STEP_CHANNELS = ['call', 'whatsapp', 'email', 'visit']
export const ASSIGNMENT_TYPES = ['owner', 'portfolio_owner', 'queue']
export const ENROLLMENT_TRIGGERS = ['manual', 'contract.signed', 'record.created', 'record.completed', 'subscription.renewal_window', 'case.resolved']
export const EXIT_CONDITIONS = ['customer_opted_out', 'contract_terminated', 'renewed', 'cancelled']
export const EXIT_REASONS = ['customer_opted_out', 'duplicate', 'no_longer_relevant', 'other']
/** Outcomes offered by default; programs may add their own keys (shown as-is when no label exists). */
export const KNOWN_OUTCOMES = ['satisfied', 'issue_found', 'no_answer', 'booked', 'interested', 'not_interested', 'renewing', 'thinking', 'not_renewing']
export const RULE_TYPES = ['next', 'retry', 'create_case']

/** "retry:+1 day:2" ⇄ { type: 'retry', every: 1, unit: 'day', max: 2 } for the step editor. */
export function ruleToForm(rule) {
  const [kind, ...rest] = String(rule || '').split(':')
  if (kind === 'retry') {
    const match = /^\+?(\d+)\s*(hour|day|week)/.exec(rest[0] || '')
    return { type: 'retry', every: Number(match?.[1]) || 1, unit: match?.[2] || 'day', max: Number(rest[1]) || 1 }
  }
  if (kind === 'create_case') return { type: 'create_case', case_type_id: rest.join(':') }
  return { type: 'next' }
}
export function formToRule(form) {
  if (form?.type === 'retry') return `retry:+${Number(form.every) || 1} ${form.unit || 'day'}:${Number(form.max) || 1}`
  if (form?.type === 'create_case' && form.case_type_id) return `create_case:${form.case_type_id}`
  return null
}

/** "+7 day" / "-30 day from end" ⇄ { direction: 'after_start'|'before_end', amount, unit }. */
export function offsetToForm(offset) {
  const match = /^([+-])?\s*(\d+)\s*(hour|day|week|month)s?(\s+from\s+end)?$/i.exec(String(offset || '').trim())
  if (!match) return { direction: 'after_start', amount: 1, unit: 'day' }
  return { direction: match[4] ? 'before_end' : 'after_start', amount: Number(match[2]), unit: match[3].toLowerCase() }
}
export const formToOffset = ({ direction, amount, unit }) => (direction === 'before_end' ? `-${Number(amount) || 0} ${unit} from end` : `+${Number(amount) || 0} ${unit}`)
