import { Building2, Handshake, Home, Presentation, Target, Users } from 'lucide-react'

const ADDITIONAL_NOTES_FIELD = {
  key: 'additional_notes',
  label: 'ملاحظات إضافية',
  type: 'textarea',
}

function withAdditionalNotes(fields) {
  if (fields.some((field) => field.key === ADDITIONAL_NOTES_FIELD.key)) return fields
  return [...fields, ADDITIONAL_NOTES_FIELD]
}

export const AFTER_MEETING_TEMPLATES = [
  {
    id: 'real-estate-discovery-result',
    title: 'نتيجة اجتماع استكشاف عميل عقاري',
    description: 'مناسب لتوثيق أول اجتماع مع عميل عقاري بعد معرفة احتياجاته.',
    category: 'real_estate',
    icon: Home,
    fields: withAdditionalNotes([
      { key: 'meeting_summary', label: 'ملخص الاجتماع', type: 'textarea', required: true },
      {
        key: 'confirmed_property_type',
        label: 'نوع العقار المؤكد',
        type: 'select',
        required: true,
        options: ['شقة', 'فيلا', 'تاون هاوس', 'دوبلكس', 'شاليه', 'مكتب إداري', 'محل تجاري', 'أرض', 'غير محدد'],
      },
      { key: 'confirmed_location', label: 'المناطق أو المشروعات المناسبة', type: 'textarea' },
      { key: 'confirmed_budget', label: 'الميزانية المؤكدة', type: 'text' },
      {
        key: 'payment_preference',
        label: 'طريقة الدفع المناسبة',
        type: 'select',
        options: ['كاش', 'تقسيط', 'كاش أو تقسيط', 'غير محدد'],
      },
      {
        key: 'customer_interest_level',
        label: 'مستوى اهتمام العميل',
        type: 'select',
        required: true,
        options: ['مرتفع جدا', 'مرتفع', 'متوسط', 'منخفض', 'غير مهتم'],
      },
      { key: 'customer_objections', label: 'اعتراضات العميل', type: 'textarea' },
      { key: 'decision_maker', label: 'صاحب القرار', type: 'text' },
      { key: 'information_needed', label: 'معلومات أو تفاصيل طلبها العميل', type: 'textarea' },
      { key: 'next_step', label: 'الخطوة التالية المتفق عليها', type: 'textarea', required: true },
    ]),
  },
  {
    id: 'property-presentation-result',
    title: 'نتيجة عرض الوحدات العقارية',
    description: 'مناسب بعد عرض مشروع أو مجموعة وحدات على العميل.',
    category: 'real_estate',
    icon: Building2,
    fields: withAdditionalNotes([
      { key: 'meeting_summary', label: 'ملخص الاجتماع', type: 'textarea', required: true },
      { key: 'properties_presented', label: 'الوحدات أو المشروعات التي تم عرضها', type: 'textarea', required: true },
      { key: 'preferred_property', label: 'الوحدة أو المشروع المفضل لدى العميل', type: 'text' },
      { key: 'customer_feedback', label: 'رأي العميل في الوحدات المعروضة', type: 'textarea', required: true },
      { key: 'preferred_features', label: 'المميزات التي أعجبت العميل', type: 'textarea' },
      { key: 'rejected_features', label: 'النقاط التي لم تناسب العميل', type: 'textarea' },
      { key: 'price_feedback', label: 'رأي العميل في السعر', type: 'textarea' },
      { key: 'payment_feedback', label: 'رأي العميل في نظام الدفع', type: 'textarea' },
      { key: 'customer_objections', label: 'الاعتراضات الرئيسية', type: 'textarea' },
      { key: 'follow_up_requirement', label: 'المطلوب قبل المتابعة القادمة', type: 'textarea' },
      {
        key: 'next_step',
        label: 'الخطوة التالية',
        type: 'select',
        required: true,
        options: ['إرسال وحدات إضافية', 'إرسال تفاصيل الأسعار', 'ترتيب معاينة', 'التفاوض على السعر', 'حجز مبدئي', 'اجتماع متابعة', 'لا توجد متابعة حاليا'],
      },
    ]),
  },
  {
    id: 'real-estate-negotiation-result',
    title: 'نتيجة تفاوض صفقة عقارية',
    description: 'مناسب بعد اجتماع تفاوض أو محاولة إغلاق صفقة عقارية.',
    category: 'real_estate',
    icon: Handshake,
    fields: withAdditionalNotes([
      { key: 'meeting_summary', label: 'ملخص الاجتماع', type: 'textarea', required: true },
      { key: 'property', label: 'الوحدة أو المشروع محل التفاوض', type: 'text', required: true },
      { key: 'initial_price', label: 'السعر قبل التفاوض', type: 'text' },
      { key: 'negotiated_price', label: 'السعر بعد التفاوض', type: 'text' },
      { key: 'agreed_down_payment', label: 'المقدم المتفق عليه', type: 'text' },
      { key: 'agreed_installment_period', label: 'مدة التقسيط المتفق عليها', type: 'text' },
      { key: 'customer_objections', label: 'اعتراضات العميل', type: 'textarea' },
      { key: 'concessions_offered', label: 'التسهيلات أو التنازلات التي تم تقديمها', type: 'textarea' },
      {
        key: 'deal_status',
        label: 'حالة الصفقة',
        type: 'select',
        required: true,
        options: ['تم الاتفاق', 'موافقة مبدئية', 'يحتاج موافقة شريك', 'يحتاج موافقة الإدارة', 'يحتاج وقت للتفكير', 'التفاوض مستمر', 'الصفقة مرفوضة', 'تم إغلاق الصفقة'],
      },
      { key: 'expected_close_date', label: 'موعد الإغلاق المتوقع', type: 'date' },
      { key: 'next_step', label: 'الخطوة التالية', type: 'textarea', required: true },
    ]),
  },
  {
    id: 'general-sales-result',
    title: 'نتيجة اجتماع مبيعات عام',
    description: 'قالب عام لتوثيق نتائج اجتماعات المبيعات والمتابعة.',
    category: 'general',
    icon: Users,
    fields: withAdditionalNotes([
      { key: 'meeting_summary', label: 'ملخص الاجتماع', type: 'textarea', required: true },
      { key: 'customer_needs', label: 'الاحتياجات التي أكدها العميل', type: 'textarea' },
      { key: 'customer_feedback', label: 'رأي العميل', type: 'textarea' },
      { key: 'interested_products', label: 'المنتجات أو الخدمات المهتم بها', type: 'textarea' },
      { key: 'customer_objections', label: 'اعتراضات العميل', type: 'textarea' },
      { key: 'budget_discussed', label: 'الميزانية التي تمت مناقشتها', type: 'text' },
      { key: 'decision_maker', label: 'صاحب القرار', type: 'text' },
      { key: 'decision_timeline', label: 'موعد اتخاذ القرار المتوقع', type: 'text' },
      {
        key: 'deal_probability',
        label: 'احتمالية إتمام الصفقة',
        type: 'select',
        options: ['عالية جدا', 'عالية', 'متوسطة', 'منخفضة', 'غير متوقعة'],
      },
      {
        key: 'next_step',
        label: 'الخطوة التالية',
        type: 'select',
        required: true,
        options: ['مكالمة متابعة', 'اجتماع متابعة', 'إرسال عرض سعر', 'إرسال معلومات', 'إرسال Proposal', 'تجربة / Demo', 'بدء التفاوض', 'إغلاق الصفقة', 'لا توجد متابعة'],
      },
      { key: 'follow_up_date', label: 'موعد المتابعة', type: 'date' },
    ]),
  },
  {
    id: 'demo-presentation-result',
    title: 'نتيجة العرض أو الـ Demo',
    description: 'مناسب بعد عرض منتج أو خدمة أو Demo للعميل.',
    category: 'general',
    icon: Presentation,
    fields: withAdditionalNotes([
      { key: 'meeting_summary', label: 'ملخص الاجتماع', type: 'textarea', required: true },
      { key: 'features_presented', label: 'المميزات التي تم عرضها', type: 'textarea' },
      { key: 'customer_liked', label: 'المميزات التي أعجبت العميل', type: 'textarea' },
      { key: 'customer_concerns', label: 'المخاوف أو الاعتراضات', type: 'textarea' },
      { key: 'questions_asked', label: 'الأسئلة التي طرحها العميل', type: 'textarea' },
      { key: 'missing_requirements', label: 'المتطلبات غير المتوفرة أو المطلوب إضافتها', type: 'textarea' },
      {
        key: 'customer_interest_level',
        label: 'مستوى اهتمام العميل',
        type: 'select',
        required: true,
        options: ['مرتفع جدا', 'مرتفع', 'متوسط', 'منخفض', 'غير مهتم'],
      },
      {
        key: 'proposal_requested',
        label: 'هل طلب العميل عرض سعر؟',
        type: 'select',
        options: ['نعم', 'لا', 'سيتم التحديد لاحقا'],
      },
      {
        key: 'trial_requested',
        label: 'هل طلب العميل تجربة أو Trial؟',
        type: 'select',
        options: ['نعم', 'لا', 'غير متاح'],
      },
      {
        key: 'next_step',
        label: 'الخطوة التالية',
        type: 'select',
        required: true,
        options: ['إرسال عرض سعر', 'إرسال Proposal', 'إرسال معلومات إضافية', 'Trial', 'اجتماع تقني', 'اجتماع تفاوض', 'متابعة لاحقة', 'إغلاق الصفقة', 'لا يوجد'],
      },
      { key: 'follow_up_date', label: 'موعد المتابعة', type: 'date' },
    ]),
  },
]

export function getAfterMeetingTemplateById(id) {
  return AFTER_MEETING_TEMPLATES.find((template) => template.id === id)
}

export function getAfterMeetingCategoryLabel(category) {
  return category === 'real_estate' ? 'عقارات' : 'عام'
}
