import { buildCaseSetup } from './caseSetupSeed'
import { hoursAgo } from './seedUtils'

/**
 * Saved replies, macros and knowledge base seed. Generic wording so every
 * industry template reads naturally; articles link to case types by index.
 */
const L = (ar, en) => ({ ar, en })

export function buildSavedReplies() {
  return [
    {
      id: 'sr-greeting',
      title: L('ترحيب واستلام الطلب', 'Greeting & acknowledgement'),
      body: L(
        'أهلاً {{customer.name}}، استلمنا طلبك رقم {{case.number}} وجاري المتابعة. معك {{agent.name}}.',
        'Hi {{customer.name}}, we received your request {{case.number}} and are on it. This is {{agent.name}}.'
      ),
      case_type_ids: [],
      channels: [],
      owner_type: 'tenant',
      active: true,
    },
    {
      id: 'sr-need-info',
      title: L('طلب معلومات إضافية', 'Ask for more details'),
      body: L(
        'من فضلك ابعت لنا صور أو تفاصيل أكثر عن المشكلة علشان نقدر نساعدك بسرعة.',
        'Could you send photos or more details about the issue so we can help you faster?'
      ),
      case_type_ids: [],
      channels: [],
      owner_type: 'tenant',
      active: true,
    },
    {
      id: 'sr-resolved',
      title: L('تأكيد الحل', 'Resolution confirmation'),
      body: L(
        'تم حل طلبك {{case.number}}. لو المشكلة رجعت تاني رد على الرسالة دي وهنفتح الطلب فورًا.',
        'Your request {{case.number}} is resolved. If the issue comes back, just reply here and we will reopen it.'
      ),
      case_type_ids: [],
      channels: [],
      owner_type: 'tenant',
      active: true,
    },
    {
      id: 'sr-delay',
      title: L('اعتذار عن التأخير', 'Apology for the delay'),
      body: L(
        'نعتذر عن التأخير يا {{customer.name}}. طلبك له أولوية وهنرجع لك بتحديث خلال اليوم.',
        'Sorry for the delay, {{customer.name}}. Your request is prioritised and we will update you today.'
      ),
      case_type_ids: [],
      channels: [],
      owner_type: 'tenant',
      active: true,
    },
  ]
}

export function buildMacros() {
  return [
    {
      id: 'macro-need-info',
      name: L('بانتظار معلومات من العميل', 'Waiting for customer info'),
      description: L('يرسل طلب معلومات ويحوّل الحالة إلى بانتظار العميل (يوقف SLA).', 'Asks for details and sets Waiting on customer (pauses SLA).'),
      actions: [
        { type: 'reply', body: L('من فضلك ابعت لنا تفاصيل أكثر علشان نكمل.', 'Please send us more details so we can continue.') },
        { type: 'set_status', status_id: 'st-pending-customer' },
      ],
      active: true,
    },
    {
      id: 'macro-escalate',
      name: L('تصعيد للمشرف', 'Escalate to supervisor'),
      description: L('يرفع الأولوية لعاجل ويضيف ملاحظة داخلية.', 'Raises priority to urgent and adds an internal note.'),
      actions: [
        { type: 'set_priority', priority: 'urgent' },
        { type: 'add_note', body: L('تم التصعيد للمشرف للمتابعة.', 'Escalated to the supervisor for follow-up.') },
      ],
      active: true,
    },
  ]
}

export function buildKbCategories() {
  return [
    { id: 'kbc-faq', label: L('أسئلة شائعة', 'FAQ'), visibility: 'customer' },
    { id: 'kbc-troubleshooting', label: L('حل المشكلات', 'Troubleshooting'), visibility: 'agent' },
    { id: 'kbc-procedures', label: L('إجراءات داخلية', 'Internal procedures'), visibility: 'internal' },
  ]
}

export function buildKbArticles(manifest) {
  const types = buildCaseSetup(manifest).case_types
  const typeId = (index) => (types[index % types.length] ? [types[index % types.length].id] : [])
  const article = (id, categoryId, title, body, extra = {}) => ({
    id,
    category_id: categoryId,
    title,
    body,
    language: 'ar',
    visibility: 'agent',
    status: 'published',
    tags: [],
    related_case_type_ids: [],
    version: 1,
    published_at: hoursAgo(24 * 20),
    updated_at: hoursAgo(24 * 5),
    ...extra,
  })

  return [
    article(
      'kb-1',
      'kbc-troubleshooting',
      'خطوات التشخيص الأولى قبل تحويل الطلب',
      'اسأل العميل عن آخر مرة كانت الخدمة تعمل بشكل طبيعي.\nاطلب صورة أو فيديو قصير للمشكلة.\nتأكد من بيانات التواصل والعنوان.\nلو المشكلة متكررة، راجع الطلبات السابقة للعميل من صفحة العميل.',
      { related_case_type_ids: typeId(0), tags: ['تشخيص'] }
    ),
    article(
      'kb-2',
      'kbc-faq',
      'How long does a request take?',
      'Most requests get a first response within business hours.\nUrgent requests are handled first.\nThe customer receives an update whenever the status changes.',
      { language: 'en', visibility: 'customer', related_case_type_ids: typeId(1) }
    ),
    article(
      'kb-3',
      'kbc-procedures',
      'متى أصعّد الطلب للمشرف؟',
      'صعّد الطلب إذا:\n- تجاوز وقت الحل المتفق عليه.\n- العميل طلب التحدث مع مسؤول.\n- يوجد تعويض مالي أو استثناء من السياسة.\nأضف ملاحظة داخلية توضح السبب قبل التصعيد.',
      { visibility: 'internal', related_case_type_ids: typeId(2) }
    ),
    article(
      'kb-4',
      'kbc-faq',
      'سياسة الاسترجاع والاستبدال',
      'يمكن للعميل طلب الاسترجاع خلال المدة المحددة في العقد أو الفاتورة.\nيجب إرفاق صورة الفاتورة.\nيتم الرد خلال يومي عمل.',
      { visibility: 'customer', related_case_type_ids: typeId(3) }
    ),
    article(
      'kb-5',
      'kbc-troubleshooting',
      'مسودة: التعامل مع شكوى متكررة',
      'راجع سجل الطلبات السابقة.\nاتصل بالعميل هاتفيًا بدلاً من الرسائل.\nاعرض متابعة بعد الحل بثلاثة أيام.',
      { status: 'draft', published_at: null, related_case_type_ids: typeId(4) }
    ),
  ]
}
