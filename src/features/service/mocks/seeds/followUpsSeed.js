import { buildCustomers } from './casesSeed'
import { hoursAgo } from './seedUtils'
import { parseOffset } from '../state/followUpEngine'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Follow-up programs (spec §39) and portfolios (§12.5) per template. Programs generate tasks for the owner;
 * the seeded enrollments sit at different steps so the workspace shows due today / overdue / upcoming.
 */
const L = (ar, en) => ({ ar, en })
const step = (key, offset, channel, title, checklist, outcomes, onOutcome = {}) => ({ key, offset, channel, task_title: title, checklist, outcomes, on_outcome: onOutcome })
const AFTER_SALE = {
  devices: ['contract', 'contract.signed', [
    step('day2', '+2 day', 'call', L('مكالمة بعد التركيب', 'Post-installation call'), [L('التركيب تم بشكل سليم؟', 'Installed correctly?'), L('العميل فاهم طريقة الاستخدام؟', 'Customer knows how to use it?')], ['satisfied', 'issue_found', 'no_answer'], { issue_found: 'create_case:ct-complaint', no_answer: 'retry:+1 day:2' }),
    step('day30', '+30 day', 'whatsapp', L('رسالة متابعة بعد شهر', 'One-month check-in'), [], ['satisfied', 'issue_found'], { issue_found: 'create_case:ct-maintenance' }),
    step('day90', '+90 day', 'call', L('تذكير بالصيانة الدورية', 'Maintenance reminder'), [], ['booked', 'not_interested', 'no_answer'], { no_answer: 'retry:+2 day:1' }),
  ]],
  tourism: ['record', 'record.completed', [
    step('day1', '+1 day', 'whatsapp', L('رسالة شكر بعد الرحلة', 'Thank-you after the trip'), [], ['satisfied', 'issue_found'], { issue_found: 'create_case:ct-complaint' }),
    step('day30', '+30 day', 'call', L('عرض الرحلة الجاية', 'Next trip offer'), [], ['interested', 'not_interested', 'no_answer'], { no_answer: 'retry:+2 day:1' }),
  ]],
  school: ['record', 'record.created', [
    step('week1', '+7 day', 'call', L('مكالمة ترحيب بولي الأمر', 'Welcome call to the guardian'), [L('استلم الجدول؟', 'Received the timetable?'), L('مشترك في الباص؟', 'Uses the bus?')], ['satisfied', 'issue_found', 'no_answer'], { issue_found: 'create_case:ct-complaint', no_answer: 'retry:+1 day:2' }),
    step('month2', '+60 day', 'call', L('متابعة مستوى الطالب', 'Student progress check'), [], ['satisfied', 'issue_found']),
  ]],
  shipping: ['customer', 'contract.signed', [
    step('day3', '+3 day', 'call', L('مكالمة تفعيل التاجر', 'Merchant activation call'), [L('عمل أول شحنة؟', 'First shipment created?'), L('فاهم تسويات التحصيل؟', 'Understands COD settlements?')], ['satisfied', 'issue_found', 'no_answer'], { issue_found: 'create_case:ct-inquiry', no_answer: 'retry:+1 day:2' }),
    step('day14', '+14 day', 'call', L('مراجعة أداء أول أسبوعين', 'Two-week performance review'), [], ['satisfied', 'issue_found']),
  ]],
}

export function buildFollowUpPrograms(manifest) {
  const [subject, trigger, steps] = AFTER_SALE[manifest.template] || AFTER_SALE.devices
  const complaintType = manifest.template === 'shipping' ? 'ct-inquiry' : 'ct-complaint'
  return [
    { id: 'fp-after-sale', name: L('متابعة ما بعد البيع', 'After-sale follow-up'), subject_type: subject, enrollment_trigger: { type: 'event', event: trigger }, steps, assignment: { type: 'portfolio_owner', fallback_user_id: 'agent-1' }, exit_conditions: ['customer_opted_out', 'contract_terminated'], status: 'active', version: 1 },
    {
      id: 'fp-renewal',
      name: L('تذكير التجديد', 'Renewal reminders'),
      subject_type: manifest.template === 'shipping' || manifest.template === 'devices' ? 'subscription' : 'contract',
      enrollment_trigger: { type: 'event', event: 'subscription.renewal_window' },
      steps: [
        step('d30', '-30 day from end', 'call', L('مكالمة تجديد قبل 30 يوم', 'Renewal call, 30 days before'), [], ['renewing', 'thinking', 'not_renewing', 'no_answer'], { no_answer: 'retry:+2 day:2', not_renewing: `create_case:${complaintType}` }),
        step('d7', '-7 day from end', 'whatsapp', L('تذكير أخير قبل 7 أيام', 'Final reminder, 7 days before'), [], ['renewing', 'not_renewing']),
      ],
      assignment: { type: 'owner', fallback_user_id: 'agent-3' },
      exit_conditions: ['renewed', 'cancelled'],
      status: 'active',
      version: 2,
    },
  ]
}

const AGENTS = [{ id: 'agent-1', name: 'سارة محمود' }, { id: 'agent-2', name: 'أحمد علي' }, { id: 'agent-3', name: 'منى حسن' }, { id: 'agent-4', name: 'كريم سمير' }]

export function buildPortfolios(manifest) {
  const customers = buildCustomers(manifest)
  const portfolios = [
    { id: 'pf-premium', name: L('عملاء مميزون', 'Premium customers'), team_id: null, criteria: { tier: 'Premium', min_value: 50000 }, owner_ids: ['agent-1', 'agent-2'], status: 'active' },
    { id: 'pf-alex', name: L('عملاء الإسكندرية', 'Alexandria customers'), team_id: null, criteria: { city: 'Alexandria' }, owner_ids: ['agent-3', 'agent-4'], status: 'active' },
  ]
  const members = customers.slice(0, 10).map((customer, index) => {
    const portfolio = portfolios[index % 2]
    const owner = portfolio.owner_ids[Math.floor(index / 2) % 2]
    return { portfolio_id: portfolio.id, customer_id: customer.id, customer: { id: customer.id, name: customer.name, phone: customer.phone }, owner_user_id: owner, owner: AGENTS.find((agent) => agent.id === owner), assigned_at: hoursAgo(24 * (40 - index)) }
  })
  return { portfolios, members }
}

/**
 * Seeded enrollments: each row says which step it is on and when that step falls due relative to now (days),
 * so every template shows overdue, due today and upcoming work. Start / end dates are derived from the offset.
 */
export function buildFollowUpEnrollments(manifest) {
  const customers = buildCustomers(manifest)
  const programs = buildFollowUpPrograms(manifest)
  const { members } = buildPortfolios(manifest)
  // [customer, program, step index (null = completed), due in days, outcomes already recorded, retry attempts]
  const plan = [
    [0, 'fp-after-sale', 0, -2, [], 0],
    [1, 'fp-after-sale', 0, 0, [['no_answer']], 1],
    [2, 'fp-after-sale', 1, 0, [['satisfied']], 0],
    [3, 'fp-after-sale', 0, 1, [], 0],
    [4, 'fp-renewal', 0, -1, [], 0],
    [5, 'fp-renewal', 0, 4, [], 0],
    [7, 'fp-renewal', 1, 2, [['renewing']], 0],
    [6, 'fp-after-sale', null, -20, [], 0],
  ]
  return plan.map(([customerIndex, programId, index, dueInDays, outcomes, attempts], n) => {
    const program = programs.find((entry) => entry.id === programId)
    const customer = customers[customerIndex % customers.length]
    const owner = members.find((member) => member.customer_id === customer.id)?.owner || AGENTS[0]
    const step = program.steps[index ?? program.steps.length - 1]
    const offset = parseOffset(step.offset)
    const due = Date.now() + dueInDays * DAY_MS
    const retrying = attempts > 0
    const recorded = index == null ? program.steps.map((entry) => [entry.outcomes[0]]) : outcomes
    const anchor = new Date(retrying ? due - 3 * DAY_MS : due - offset.ms).toISOString()
    const startedAt = offset.fromEnd ? hoursAgo(24 * 20) : anchor
    return {
      id: `fe-${n + 1}`,
      program_id: program.id,
      program_version: program.version,
      subject_type: program.subject_type,
      subject_ends_at: offset.fromEnd ? anchor : null,
      customer: { id: customer.id, name: customer.name, phone: customer.phone },
      customer_id: customer.id,
      owner,
      status: index == null ? 'completed' : 'active',
      current_step: index == null ? null : step.key,
      attempts,
      retry_due_at: retrying ? new Date(due).toISOString() : null,
      started_at: startedAt,
      completed_at: index == null ? hoursAgo(24 * 20) : null,
      exit_reason: null,
      history: recorded.map(([outcome], k) => ({ step_key: program.steps[retrying ? index : k]?.key, outcome, note: null, checklist: [], at: hoursAgo(24 * (recorded.length - k + 2)), by: owner })),
    }
  })
}
