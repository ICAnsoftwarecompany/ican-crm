import { buildCustomers } from './casesSeed'
import { hoursAgo } from './seedUtils'

/**
 * Portal configuration and identities per template (spec §43–44): policies, request catalog, branding,
 * portal accounts with memberships (self / guardian / organization member).
 */
const L = (ar, en) => ({ ar, en })
const rule = (object, actions, deny = []) => ({ object, actions, deny })

const COMMON = [rule('case', ['view', 'create', 'reply']), rule('kb', ['view']), rule('feedback', ['create']), rule('catalog', ['view', 'request']), rule('document', ['view', 'upload'])]

const POLICIES = {
  devices: [
    ['pp-customer', L('عميل فرد', 'Individual customer'), [rule('record:service_contract', ['view']), rule('record_entry:visit', ['view']), rule('asset', ['view']), rule('entitlement', ['view']), rule('payment_schedule', ['view', 'pay']), rule('subscription', ['view']), rule('contract', ['view', 'download']), ...COMMON]],
  ],
  tourism: [
    ['pp-traveler', L('مسافر', 'Traveler'), [rule('record:booking', ['view']), rule('payment_schedule', ['view', 'pay']), rule('contract', ['view', 'download']), ...COMMON]],
  ],
  school: [
    ['pp-guardian', L('ولي أمر', 'Guardian'), [rule('record:enrollment', ['view'], ['edit']), rule('record_entry:attendance', ['view']), rule('record_entry:grade', ['view']), rule('payment_schedule', ['view', 'pay']), rule('subscription', ['view']), ...COMMON]],
    ['pp-student', L('طالب', 'Student'), [rule('record:enrollment', ['view']), rule('record_entry:grade', ['view']), rule('kb', ['view'])]],
  ],
  shipping: [
    ['pp-b2b-admin', L('مدير حساب الشركة', 'Company admin'), [rule('record:shipment', ['view', 'create']), rule('record_entry:delivery_attempt', ['view']), rule('remittance', ['view']), rule('org_users', ['view', 'manage']), rule('payment_schedule', ['view', 'pay']), rule('subscription', ['view']), ...COMMON]],
    ['pp-b2b-operations', L('عمليات الشركة', 'Company operations'), [rule('record:shipment', ['view', 'create']), rule('record_entry:delivery_attempt', ['view']), rule('case', ['view', 'create', 'reply']), rule('kb', ['view'])]],
    ['pp-b2b-accounting', L('حسابات الشركة', 'Company accounting'), [rule('record:shipment', ['view'], ['create']), rule('remittance', ['view']), rule('payment_schedule', ['view', 'pay'])]],
  ],
}

const field = (key, label, type, required = false, options = []) => ({ key, label, type, required, options })
const CATALOG = {
  devices: [
    ['sc-visit', L('حجز زيارة صيانة', 'Book a maintenance visit'), L('فني يزورك في الموعد اللي تختاره.', 'A technician visits at a time you choose.'), 'ct-maintenance', 'Wrench', [field('problem', L('وصف المشكلة', 'Describe the problem'), 'textarea', true), field('preferred_date', L('اليوم المفضل', 'Preferred day'), 'date')], [], 'technician'],
    ['sc-install', L('طلب تركيب', 'Installation request'), L('تركيب جهاز اشتريته منّا.', 'Install a unit you bought from us.'), 'ct-installation', 'Hammer', [field('address', L('العنوان', 'Address'), 'text', true)], [], 'technician'],
    ['sc-contract-copy', L('نسخة من العقد', 'Copy of my contract'), L('نبعتلك نسخة PDF.', 'We send you a PDF copy.'), 'ct-billing', 'FileText', [], [], null],
  ],
  tourism: [
    ['sc-change', L('تعديل حجز', 'Change my booking'), L('تغيير تاريخ أو عدد أفراد.', 'Change dates or travelers.'), 'ct-booking_change', 'CalendarClock', [field('change', L('المطلوب تغييره', 'What to change'), 'textarea', true)], [], null],
    ['sc-refund', L('طلب استرداد', 'Refund request'), L('حسب سياسة الإلغاء.', 'According to the cancellation policy.'), 'ct-refund', 'Undo2', [field('reason', L('السبب', 'Reason'), 'select', true, ['cancelled_trip', 'medical', 'other'])], ['bank_statement'], null],
  ],
  school: [
    ['sc-certificate', L('طلب شهادة قيد', 'Enrollment certificate'), L('تجهز خلال 3 أيام عمل.', 'Ready within 3 working days.'), 'ct-certificate', 'FileText', [field('purpose', L('الغرض', 'Purpose'), 'text', true)], [], null],
    ['sc-absence', L('إبلاغ عن غياب', 'Report an absence'), L('بلّغنا بغياب ابنك.', 'Tell us your child will be absent.'), 'ct-absence', 'UserX', [field('from', L('من', 'From'), 'date', true), field('to', L('إلى', 'To'), 'date', true), field('reason', L('السبب', 'Reason'), 'textarea')], ['medical_note'], null],
  ],
  shipping: [
    ['sc-pickup', L('طلب استلام شحنات', 'Request a pickup'), L('مندوب يستلم الشحنات من مخزنك.', 'A courier collects parcels from your warehouse.'), 'ct-pickup', 'PackagePlus', [field('parcels', L('عدد الشحنات', 'Parcels'), 'number', true), field('pickup_date', L('تاريخ الاستلام', 'Pickup date'), 'date', true)], [], 'courier'],
    ['sc-cod', L('استفسار تحصيل', 'COD question'), L('فرق في مبالغ التحصيل أو التحويل.', 'Difference in collected or transferred COD.'), 'ct-cod_dispute', 'Banknote', [field('reference', L('رقم الشحنة', 'Shipment reference'), 'text', true)], [], null],
  ],
}

export function buildPortalPolicies(manifest) {
  return (POLICIES[manifest.template] || []).map(([id, name, rules]) => ({ id, name, rules, active: true }))
}

export function buildRequestCatalog(manifest) {
  const policies = buildPortalPolicies(manifest)
  return (CATALOG[manifest.template] || []).map(([id, name, description, caseTypeId, icon, formSchema, documents, resourceType], index) => ({
    id,
    name,
    description,
    category: index === 0 ? 'popular' : 'other',
    icon,
    case_type_id: caseTypeId,
    form_schema: formSchema,
    required_documents: documents,
    requires_payment: false,
    price: null,
    scheduling_resource_type: resourceType,
    audience_policy_ids: policies.map((policy) => policy.id),
    portal_visible: true,
    status: 'active',
  }))
}

export function buildPortalSettings(manifest) {
  return {
    brand_name: L('بوابة العملاء', 'Customer portal'),
    logo_url: '',
    primary_color: '#00C2CB',
    welcome: L('أهلًا بيك! تابع خدماتك وطلباتك من مكان واحد.', 'Welcome! Follow your services and requests in one place.'),
    sections: manifest.template === 'shipping' ? ['records', 'cases', 'payments', 'catalog', 'kb'] : ['records', 'cases', 'payments', 'assets', 'documents', 'catalog', 'kb', 'feedback'],
    default_language: 'ar',
    otp_channels: ['whatsapp', 'sms'],
    b2b_password_login: manifest.template === 'shipping',
    subdomain: 'portal',
    // F6: public help center (no sign-in) with `public` articles.
    public_help_center: true,
    // B2B admins invite company users by role; the tenant maps each role to a policy.
    role_policies: manifest.template === 'shipping' ? { admin: 'pp-b2b-admin', operations: 'pp-b2b-operations', accounting: 'pp-b2b-accounting' } : {},
  }
}

const ACCOUNTS = {
  devices: [[0, 'self', null, 'pp-customer']],
  tourism: [[0, 'self', null, 'pp-traveler'], [3, 'self', null, 'pp-traveler']],
  school: [[1, 'guardian', null, 'pp-guardian'], [4, 'guardian', null, 'pp-guardian']],
  shipping: [[2, 'organization_member', 'admin', 'pp-b2b-admin'], [2, 'organization_member', 'accounting', 'pp-b2b-accounting'], [5, 'organization_member', 'operations', 'pp-b2b-operations']],
}
const PEOPLE = ['أحمد سمير', 'منى عادل', 'كريم فؤاد', 'دينا حسن', 'عمرو ياسر', 'سلمى رضا']

export function buildPortalAccounts(manifest) {
  const customers = buildCustomers(manifest)
  const accounts = (ACCOUNTS[manifest.template] || []).map(([customerIndex, type, role, policyId], index) => {
    const customer = customers[customerIndex]
    const b2b = type === 'organization_member'
    return {
      id: `pa-${index + 1}`,
      name: b2b ? PEOPLE[index % PEOPLE.length] : customer.name,
      phone: b2b ? `+2012${String(30000000 + index * 7919)}` : customer.phone,
      email: b2b ? `user${index + 1}@merchant.example` : null,
      locale: 'ar',
      status: index === 2 && b2b ? 'invited' : 'active',
      mfa_enabled: false,
      last_login_at: index === 2 ? null : hoursAgo(10 + index * 30),
      active_sessions: index === 2 ? 0 : 1 + (index % 2),
      memberships: [{ id: `pm-${index + 1}`, customer_id: customer.id, customer: { id: customer.id, name: customer.name }, membership_type: type, role_id: role, policy_id: policyId, status: 'active' }],
      created_at: hoursAgo(24 * (60 - index)),
      version: 1,
    }
  })
  // One person with two memberships → profile switcher (e.g. a guardian who also works for a B2B customer).
  if (accounts[0]) {
    const other = customers[5]
    accounts[0].memberships.push({ id: 'pm-extra', customer_id: other.id, customer: { id: other.id, name: other.name }, membership_type: manifest.template === 'shipping' ? 'organization_member' : 'self', role_id: manifest.template === 'shipping' ? 'operations' : null, policy_id: (POLICIES[manifest.template] || [])[manifest.template === 'shipping' ? 1 : 0]?.[0] || null, status: 'active' })
  }
  return accounts
}
