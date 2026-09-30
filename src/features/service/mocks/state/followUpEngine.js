/**
 * Mock of the Follow-up Program engine (spec §39). A program is a versioned list of steps; an enrollment walks
 * them. Each step's due date comes from its offset ("+7 day" from enrollment, "-30 day from end" before the
 * subject ends). An outcome can advance, retry the same step later (bounded) or open a case. The server also
 * creates a Task in the Task Engine per due step; the mock keeps the due date on the enrollment.
 */
const DAY_MS = 24 * 60 * 60 * 1000
const UNIT_MS = { hour: 60 * 60 * 1000, day: DAY_MS, week: 7 * DAY_MS, month: 30 * DAY_MS }

/** "+7 day" | "-30 day from end" | "+1 week" → { ms, fromEnd } (null when invalid). */
export function parseOffset(text) {
  const match = /^([+-])?\s*(\d+)\s*(hour|day|week|month)s?(\s+from\s+end)?$/i.exec(String(text || '').trim())
  if (!match) return null
  const sign = match[1] === '-' ? -1 : 1
  return { ms: sign * Number(match[2]) * UNIT_MS[match[3].toLowerCase()], fromEnd: Boolean(match[4]) }
}

/** "retry:+1 day:2" → { offset, max } · "create_case:ct-x" → { caseTypeId } · otherwise null (advance). */
export function parseRule(rule) {
  if (!rule) return null
  const [kind, ...rest] = String(rule).split(':')
  if (kind === 'retry') return { type: 'retry', offset: parseOffset(rest[0]), max: Number(rest[1]) || 1 }
  if (kind === 'create_case') return { type: 'create_case', caseTypeId: rest.join(':') }
  return null
}

export const stepIndex = (program, key) => program.steps.findIndex((step) => step.key === key)

/** Due date of the current step (a pending retry wins). */
export function dueAt(enrollment, program) {
  if (enrollment.status !== 'active') return null
  if (enrollment.retry_due_at) return enrollment.retry_due_at
  const step = program.steps[stepIndex(program, enrollment.current_step)]
  const offset = parseOffset(step?.offset)
  if (!offset) return null
  const base = offset.fromEnd ? enrollment.subject_ends_at : enrollment.started_at
  if (!base) return null
  return new Date(Date.parse(base) + offset.ms).toISOString()
}

const dayStart = (ms) => {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/** overdue | due_today | upcoming (local calendar day, like the agent sees it). */
export function bucketOf(due, now = Date.now()) {
  if (!due) return null
  const today = dayStart(now)
  const at = Date.parse(due)
  if (at < today) return 'overdue'
  if (at < today + DAY_MS) return 'due_today'
  return 'upcoming'
}

/**
 * Records an outcome on the current step. Mutates the enrollment; returns
 * { effect: 'advanced'|'retry'|'completed', caseTypeId? } so the caller can open the case.
 */
export function recordOutcome(enrollment, program, { outcome, note = null, checklist = [], by = null, now = Date.now() }) {
  const index = stepIndex(program, enrollment.current_step)
  const step = program.steps[index]
  enrollment.history.push({ step_key: step.key, outcome, note, checklist, at: new Date(now).toISOString(), by })
  const rule = parseRule(step.on_outcome?.[outcome])
  if (rule?.type === 'retry' && rule.offset && enrollment.attempts < rule.max) {
    enrollment.attempts += 1
    enrollment.retry_due_at = new Date(now + rule.offset.ms).toISOString()
    return { effect: 'retry' }
  }
  const caseTypeId = rule?.type === 'create_case' ? rule.caseTypeId : null
  Object.assign(enrollment, { attempts: 0, retry_due_at: null })
  const next = program.steps[index + 1]
  if (!next) {
    Object.assign(enrollment, { status: 'completed', current_step: null, completed_at: new Date(now).toISOString() })
    return { effect: 'completed', caseTypeId }
  }
  enrollment.current_step = next.key
  return { effect: 'advanced', caseTypeId }
}
