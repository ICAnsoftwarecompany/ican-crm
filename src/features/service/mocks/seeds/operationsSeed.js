/**
 * Operations configuration seed: SLA policies, business calendars and
 * escalation rules. Same for every template except labels — industries
 * differ in content, not in structure.
 */
const L = (ar, en) => ({ ar, en })

const WEEK = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export function buildOperationsSeed() {
  const businessCalendars = [
    {
      id: 'cal-main',
      name: L('مواعيد العمل الرئيسية', 'Main business hours'),
      timezone: 'Africa/Cairo',
      working_hours: WEEK.map((day) => ({ day, enabled: day !== 'friday', start: '09:00', end: '18:00' })),
      holidays: [
        { date: '2026-10-06', name: L('عيد القوات المسلحة', 'Armed Forces Day') },
        { date: '2027-01-07', name: L('عيد الميلاد المجيد', 'Coptic Christmas') },
      ],
    },
  ]

  const slaPolicies = [
    {
      id: 'sla-urgent',
      name: L('عاجل', 'Urgent'),
      order: 1,
      priorities: ['urgent'],
      case_type_ids: [],
      first_response_minutes: 30,
      resolution_minutes: 240,
      business_calendar_id: 'cal-main',
      pause_on_pending_customer: true,
      active: true,
    },
    {
      id: 'sla-high',
      name: L('أولوية عالية', 'High priority'),
      order: 2,
      priorities: ['high'],
      case_type_ids: [],
      first_response_minutes: 60,
      resolution_minutes: 8 * 60,
      business_calendar_id: 'cal-main',
      pause_on_pending_customer: true,
      active: true,
    },
    {
      id: 'sla-standard',
      name: L('قياسي', 'Standard'),
      order: 3,
      priorities: ['low', 'normal'],
      case_type_ids: [],
      first_response_minutes: 4 * 60,
      resolution_minutes: 48 * 60,
      business_calendar_id: 'cal-main',
      pause_on_pending_customer: true,
      active: true,
    },
  ]

  const escalationRules = [
    {
      id: 'esc-default',
      name: L('تصعيد افتراضي', 'Default escalation'),
      priorities: [],
      triggers: [
        { at: 80, action: 'notify', target: 'assignee' },
        { at: 90, action: 'notify', target: 'team_leader' },
        { at: 100, action: 'escalate', target: 'manager' },
      ],
      active: true,
    },
    {
      id: 'esc-critical',
      name: L('الحالات العاجلة', 'Urgent cases'),
      priorities: ['urgent'],
      triggers: [{ at: 0, action: 'notify', target: 'supervisor' }],
      active: true,
    },
  ]

  return { businessCalendars, slaPolicies, escalationRules }
}
