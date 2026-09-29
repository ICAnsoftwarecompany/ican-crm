import { getMockCurrentUser } from './seedUtils'

/**
 * Case setup per industry template: case types, pipeline (statuses +
 * transitions), queues, agents and resolution codes. Mirrors what the backend
 * will return from GET /service/cases/setup (tenant configuration).
 */

const L = (ar, en) => ({ ar, en })

export const DEFAULT_PIPELINE_VERSION = 'pv-case-default-1'

const STATUSES = [
  { id: 'st-new', key: 'new', label: L('جديد', 'New'), category: 'open', is_initial: true },
  { id: 'st-open', key: 'open', label: L('مفتوح', 'Open'), category: 'open' },
  { id: 'st-progress', key: 'in_progress', label: L('قيد التنفيذ', 'In progress'), category: 'in_progress' },
  { id: 'st-pending-customer', key: 'pending_customer', label: L('بانتظار العميل', 'Waiting on customer'), category: 'pending', sla_behavior: 'pause' },
  { id: 'st-pending-internal', key: 'pending_internal', label: L('بانتظار فريق داخلي', 'Waiting on internal team'), category: 'pending' },
  { id: 'st-resolved', key: 'resolved', label: L('تم الحل', 'Resolved'), category: 'resolved' },
  { id: 'st-closed', key: 'closed', label: L('مغلق', 'Closed'), category: 'closed', is_terminal: true },
  { id: 'st-cancelled', key: 'cancelled', label: L('ملغي', 'Cancelled'), category: 'cancelled', is_terminal: true },
]

const RESOLVE_FIELDS = ['resolution_code', 'resolution_summary']

const TRANSITIONS = [
  ['st-new', ['st-open', 'st-progress', 'st-pending-customer', 'st-cancelled']],
  ['st-open', ['st-progress', 'st-pending-customer', 'st-pending-internal', 'st-resolved', 'st-cancelled']],
  ['st-progress', ['st-pending-customer', 'st-pending-internal', 'st-resolved', 'st-cancelled']],
  ['st-pending-customer', ['st-progress', 'st-resolved', 'st-cancelled']],
  ['st-pending-internal', ['st-progress', 'st-resolved', 'st-cancelled']],
  ['st-resolved', ['st-closed', 'st-open']],
].flatMap(([from, targets]) =>
  targets.map((to) => ({ from, to, required_fields: to === 'st-resolved' ? RESOLVE_FIELDS : [] }))
)

export const DEFAULT_PIPELINE = { version_id: DEFAULT_PIPELINE_VERSION, statuses: STATUSES, transitions: TRANSITIONS }

const RESOLUTION_CODES = [
  { key: 'fixed', label: L('تم الإصلاح', 'Fixed') },
  { key: 'answered', label: L('تم الرد على الاستفسار', 'Question answered') },
  { key: 'workaround', label: L('حل مؤقت', 'Workaround provided') },
  { key: 'duplicate', label: L('مكرر', 'Duplicate') },
  { key: 'not_reproducible', label: L('تعذر تكرار المشكلة', 'Could not reproduce') },
  { key: 'no_response', label: L('لا يوجد رد من العميل', 'No customer response') },
]

const TEMPLATE_SETUP = {
  devices: {
    types: [
      ['maintenance', L('طلب صيانة', 'Maintenance request'), 'Wrench', 'high'],
      ['warranty_claim', L('مطالبة ضمان', 'Warranty claim'), 'ShieldCheck', 'normal'],
      ['installation', L('تركيب', 'Installation'), 'Hammer', 'normal'],
      ['billing', L('استفسار مالي', 'Billing question'), 'Receipt', 'low'],
      ['complaint', L('شكوى', 'Complaint'), 'MessageSquareWarning', 'high'],
    ],
    queues: [
      ['technical', L('الدعم الفني', 'Technical support')],
      ['field', L('الزيارات الميدانية', 'Field visits')],
      ['billing', L('الحسابات', 'Billing')],
    ],
  },
  tourism: {
    types: [
      ['booking_change', L('تعديل حجز', 'Booking change'), 'CalendarClock', 'normal'],
      ['documents', L('مشكلة مستندات', 'Documents issue'), 'FileWarning', 'high'],
      ['refund', L('طلب استرداد', 'Refund request'), 'Undo2', 'normal'],
      ['complaint', L('شكوى', 'Complaint'), 'MessageSquareWarning', 'high'],
      ['inquiry', L('استفسار', 'Inquiry'), 'HelpCircle', 'low'],
    ],
    queues: [
      ['reservations', L('الحجوزات', 'Reservations')],
      ['visa', L('التأشيرات', 'Visa desk')],
      ['vip', L('كبار العملاء', 'VIP travelers')],
    ],
  },
  school: {
    types: [
      ['absence', L('غياب', 'Absence'), 'UserX', 'normal'],
      ['fees', L('استفسار مصروفات', 'Fees question'), 'Receipt', 'normal'],
      ['transport', L('الباص', 'Transport'), 'Bus', 'high'],
      ['complaint', L('شكوى', 'Complaint'), 'MessageSquareWarning', 'high'],
      ['certificate', L('طلب شهادة', 'Certificate request'), 'FileText', 'low'],
    ],
    queues: [
      ['student_affairs', L('شؤون الطلاب', 'Student affairs')],
      ['accounts', L('الحسابات', 'Accounts')],
      ['transport', L('الحركة', 'Transport')],
    ],
  },
  shipping: {
    types: [
      ['delivery_issue', L('مشكلة توصيل', 'Delivery issue'), 'Truck', 'high'],
      ['damaged', L('شحنة تالفة', 'Damaged shipment'), 'PackageX', 'urgent'],
      ['cod_dispute', L('خلاف تحصيل', 'COD dispute'), 'Banknote', 'high'],
      ['pickup', L('طلب استلام', 'Pickup request'), 'PackagePlus', 'normal'],
      ['inquiry', L('استفسار', 'Inquiry'), 'HelpCircle', 'low'],
    ],
    queues: [
      ['operations', L('العمليات', 'Operations')],
      ['merchants', L('دعم التجار', 'Merchant support')],
      ['finance', L('التسويات', 'Settlements')],
    ],
  },
}

const AGENT_NAMES = ['سارة محمود', 'أحمد علي', 'منى حسن', 'كريم سمير']

/** @param {{ template: string }} manifest */
export function buildCaseSetup(manifest) {
  const config = TEMPLATE_SETUP[manifest.template] || TEMPLATE_SETUP.devices
  const me = getMockCurrentUser()
  return {
    case_types: config.types.map(([key, label, icon, priority]) => ({
      id: `ct-${key}`,
      key,
      label,
      icon,
      default_priority: priority,
      pipeline: DEFAULT_PIPELINE,
    })),
    queues: config.queues.map(([key, label]) => ({ id: `q-${key}`, key, label })),
    agents: [me, ...AGENT_NAMES.map((name, index) => ({ id: `agent-${index + 1}`, name }))],
    resolution_codes: RESOLUTION_CODES,
    priorities: ['low', 'normal', 'high', 'urgent'],
    severities: ['minor', 'moderate', 'major', 'critical'],
    channels: ['whatsapp', 'messenger', 'email', 'phone', 'portal', 'internal'],
  }
}
