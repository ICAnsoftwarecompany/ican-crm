import { buildCaseSetup } from './caseSetupSeed'
import { createRandom, hoursAgo } from './seedUtils'

/**
 * Demo customers and cases per industry template. Subjects and names are
 * user data (never translated in the UI), written the way Egyptian tenants
 * would type them.
 */

const CUSTOMER_NAMES = [
  'محمد عبد الله', 'ياسمين فؤاد', 'شركة النور للتجارة', 'عمر خالد', 'هبة مصطفى',
  'مؤسسة الأمل', 'إسلام سعيد', 'دينا رمضان', 'مصطفى جمال', 'نورهان عادل',
]

const SUBJECTS = {
  maintenance: ['التكييف مش بيبرد', 'صوت عالي في الوحدة الخارجية', 'تسريب مياه من التكييف'],
  warranty_claim: ['الجهاز عطل تاني خلال الضمان', 'تغيير قطعة تحت الضمان'],
  installation: ['تحديد ميعاد تركيب', 'تركيب جهاز إضافي'],
  billing: ['استفسار عن القسط الجاي', 'الفاتورة فيها مبلغ زيادة'],
  complaint: ['الفني ما حضرش في الميعاد', 'تأخير في الرد على الطلب'],
  booking_change: ['تغيير ميعاد رحلة شرم', 'إضافة فرد للحجز'],
  documents: ['الباسبور قرب يخلص', 'مستندات التأشيرة ناقصة'],
  refund: ['استرداد مبلغ رحلة ملغية', 'استرداد فرق الغرفة'],
  inquiry: ['استفسار عن مواعيد الشحن', 'استفسار عن البرنامج'],
  absence: ['الطالب غايب بقاله يومين', 'إذن غياب لظرف عائلي'],
  fees: ['استفسار عن قسط الترم التاني', 'طلب تقسيط المصروفات'],
  transport: ['الباص اتأخر النهارده', 'تغيير عنوان الباص'],
  certificate: ['طلب شهادة قيد', 'طلب بيان درجات'],
  delivery_issue: ['الشحنة ما وصلتش', 'المندوب ما ردش على التليفون'],
  damaged: ['الشحنة وصلت مكسورة', 'الكرتونة مفتوحة'],
  cod_dispute: ['التحصيل ناقص عن الفاتورة', 'تأخير تحويل مبالغ التحصيل'],
  pickup: ['طلب استلام شحنات من المخزن', 'تغيير ميعاد الاستلام'],
}

const CHANNELS = ['whatsapp', 'whatsapp', 'messenger', 'email', 'phone', 'portal']

export function buildCustomers(manifest) {
  const random = createRandom(`customers-${manifest.template}`)
  return CUSTOMER_NAMES.map((name, index) => ({
    id: `cust-${index + 1}`,
    name,
    phone: `+2010${String(random.int(10000000, 99999999))}`,
  }))
}

function pickStatus(random, statuses) {
  const weighted = ['st-new', 'st-open', 'st-open', 'st-progress', 'st-progress', 'st-pending-customer', 'st-pending-internal', 'st-resolved', 'st-closed']
  const statusId = random.pick(weighted)
  return statuses.find((status) => status.id === statusId)
}

export function buildCases(manifest) {
  const setup = buildCaseSetup(manifest)
  const customers = buildCustomers(manifest)
  const random = createRandom(`cases-${manifest.template}`)
  const statuses = setup.case_types[0].pipeline.statuses

  return Array.from({ length: 28 }, (_, index) => {
    const type = random.pick(setup.case_types)
    const status = pickStatus(random, statuses)
    // Mostly recent cases so the SLA states (on track / at risk / breached) all show up.
    const openedHours = random.chance(0.6) ? random.int(1, 30) : random.int(1, 240)
    const resolved = status.category === 'resolved' || status.category === 'closed'
    const assignee = random.chance(0.8) ? random.pick(setup.agents) : null
    return {
      id: `case-${index + 1}`,
      case_number: `CS-2026-${String(1040 + index).padStart(5, '0')}`,
      subject: random.pick(SUBJECTS[type.key] || SUBJECTS.inquiry),
      description: '',
      customer: random.pick(customers),
      contact: null,
      type_id: type.id,
      status_id: status.id,
      pipeline_version_id: type.pipeline.version_id,
      priority: random.chance(0.3) ? random.pick(['high', 'urgent']) : type.default_priority,
      severity: random.pick(['minor', 'moderate', 'moderate', 'major']),
      queue_id: random.pick(setup.queues).id,
      assignee_id: assignee?.id ?? null,
      source_channel: random.pick(CHANNELS),
      conversation_id: null,
      opened_at: hoursAgo(openedHours),
      first_response_at: status.key === 'new' ? null : hoursAgo(openedHours - 1),
      resolved_at: resolved ? hoursAgo(random.int(0, Math.max(openedHours - 2, 0))) : null,
      closed_at: status.category === 'closed' ? hoursAgo(0) : null,
      updated_at: hoursAgo(random.int(0, Math.min(openedHours, 48))),
      resolution_code: resolved ? 'fixed' : null,
      resolution_summary: resolved ? 'تم حل المشكلة ومتابعة العميل' : null,
      reopened_count: 0,
      version: 1,
    }
  })
}

export function buildActivities(manifest) {
  return buildCases(manifest).flatMap((item) => {
    const base = [
      {
        id: `act-${item.id}-1`,
        case_id: item.id,
        type: 'created',
        visibility: 'internal',
        author: { type: 'system', id: null, name: null },
        body: null,
        metadata: { channel: item.source_channel },
        occurred_at: item.opened_at,
      },
      {
        id: `act-${item.id}-2`,
        case_id: item.id,
        type: 'inbound',
        visibility: 'customer',
        channel: item.source_channel,
        author: { type: 'customer', id: item.customer.id, name: item.customer.name },
        body: item.subject,
        metadata: {},
        occurred_at: item.opened_at,
      },
    ]
    if (item.first_response_at) {
      base.push({
        id: `act-${item.id}-3`,
        case_id: item.id,
        type: 'reply',
        visibility: 'customer',
        channel: item.source_channel,
        author: { type: 'user', id: item.assignee_id, name: null },
        body: 'أهلاً بحضرتك، استلمنا طلبك وجاري المتابعة.',
        metadata: {},
        occurred_at: item.first_response_at,
      })
    }
    return base
  })
}
