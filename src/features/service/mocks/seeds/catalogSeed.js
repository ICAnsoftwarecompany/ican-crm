/**
 * Catalog configuration seed (spec §25–26, §33.2): the capability registry,
 * service model presets, item types, record types and the catalog items'
 * service configuration. The registry and presets are code-owned on the
 * backend (same for every tenant); item/record types are tenant data.
 */
const L = (ar, en) => ({ ar, en })

// ─── Capability registry (backend code; the UI renders config forms from `config_fields`) ───
const field = (key, type, extra = {}) => ({ key, type, ...extra })

export const CAPABILITY_REGISTRY = [
  // Products
  { code: 'units', version: 1, applies_to: 'product', group: 'product', config_fields: [field('base_unit', 'text', { default: 'piece' })] },
  { code: 'barcode', version: 1, applies_to: 'product', group: 'product', config_fields: [field('symbology', 'select', { options: ['ean13', 'code128', 'qr'], default: 'ean13' })] },
  { code: 'serial_tracking', version: 1, applies_to: 'product', group: 'product', config_fields: [field('required', 'switch', { default: true }), field('pattern', 'text', { ltr: true, default: '' })] },
  { code: 'unique_unit', version: 1, applies_to: 'product', group: 'product', config_fields: [field('dimensions', 'multiselect', { options: ['project', 'building', 'floor', 'number'], default: ['building', 'floor', 'number'] })] },
  { code: 'availability', version: 1, applies_to: 'product', group: 'product', config_fields: [field('hold_days', 'number', { default: 7, min: 1 })] },
  { code: 'batch_lot', version: 1, applies_to: 'product', group: 'product', config_fields: [] },
  { code: 'expiry', version: 1, applies_to: 'product', group: 'product', depends_on: ['batch_lot'], config_fields: [field('alert_days', 'number', { default: 60, min: 1 }), field('block_expired_sale', 'switch', { default: true })] },
  { code: 'variants', version: 1, applies_to: 'product', group: 'product', config_fields: [field('dimensions', 'multiselect', { options: ['size', 'color', 'capacity'], default: ['size'] })] },
  { code: 'digital_delivery', version: 1, applies_to: 'product', group: 'product', config_fields: [field('delivery', 'select', { options: ['license_key', 'link'], default: 'license_key' }), field('link_valid_days', 'number', { default: 7, min: 1 })] },
  // Services
  { code: 'scheduling', version: 1, applies_to: 'service', group: 'service', config_fields: [field('duration_minutes', 'number', { default: 60, min: 5 }), field('resource_type', 'select', { options: ['technician', 'room', 'seat', 'vehicle'], default: 'technician' })] },
  { code: 'milestones', version: 1, applies_to: 'service', group: 'service', config_fields: [field('template', 'text', { default: '' })] },
  { code: 'capacity', version: 1, applies_to: 'service', group: 'service', config_fields: [field('min', 'number', { default: 1, min: 0 }), field('max', 'number', { default: 30, min: 1 })] },
  { code: 'participants', version: 1, applies_to: 'service', group: 'service', config_fields: [field('min', 'number', { default: 1, min: 0 }), field('max', 'number', { default: 10, min: 1 })] },
  { code: 'onsite', version: 1, applies_to: 'service', group: 'service', config_fields: [field('expected_minutes', 'number', { default: 90, min: 5 })] },
  { code: 'components', version: 1, applies_to: 'service', group: 'service', config_fields: [] },
  { code: 'required_documents', version: 1, applies_to: 'service', group: 'service', config_fields: [field('documents', 'multiselect', { options: ['passport', 'national_id', 'photo', 'birth_certificate', 'visa'], default: ['passport'] })] },
  { code: 'tracking', version: 1, applies_to: 'service', group: 'service', config_fields: [field('expected_days', 'number', { default: 3, min: 1 })] },
  // Shared
  { code: 'warranty', version: 1, applies_to: 'both', group: 'shared', config_fields: [field('months', 'number', { default: 12, min: 1 }), field('starts_from', 'select', { options: ['sale', 'installation', 'delivery'], default: 'sale' }), field('coverage', 'multiselect', { options: ['parts', 'labor'], default: ['parts', 'labor'] }), field('extendable', 'switch', { default: true })] },
  { code: 'recurrence', version: 1, applies_to: 'both', group: 'shared', config_fields: [field('every', 'number', { default: 1, min: 1 }), field('unit', 'select', { options: ['day', 'week', 'month', 'year'], default: 'month' }), field('auto_renew', 'switch', { default: true }), field('grace_days', 'number', { default: 7, min: 0 })] },
  { code: 'entitlements', version: 1, applies_to: 'both', group: 'shared', config_fields: [field('visits_per_year', 'number', { default: 0, min: 0 }), field('priority_support', 'switch', { default: false })] },
  { code: 'installments', version: 1, applies_to: 'both', group: 'shared', config_fields: [field('plans', 'multiselect', { options: ['monthly', 'quarterly', 'milestone_based'], default: ['monthly'] })] },
]

// Presets only: choosing a model pre-selects capabilities; code works with capabilities, never letters.
export const SERVICE_MODELS = [
  { key: 'A', capabilities: [], creates: 'order' },
  { key: 'B', capabilities: ['serial_tracking', 'warranty', 'entitlements'], creates: 'asset' },
  { key: 'C', capabilities: ['recurrence', 'entitlements'], creates: 'subscription' },
  { key: 'D', capabilities: ['participants', 'capacity', 'entitlements'], creates: 'enrollment' },
  { key: 'E', capabilities: ['scheduling', 'participants', 'components', 'required_documents'], creates: 'booking' },
  { key: 'F', capabilities: ['tracking', 'participants'], creates: 'shipment' },
  { key: 'G', capabilities: ['milestones'], creates: 'project' },
  { key: 'H', capabilities: ['onsite', 'scheduling'], creates: 'work_order' },
]

export const FULFILLMENT_CREATES = ['none', 'order', 'asset', 'subscription', 'enrollment', 'booking', 'shipment', 'project', 'work_order']

const defaultsOf = (code) =>
  Object.fromEntries((CAPABILITY_REGISTRY.find((entry) => entry.code === code)?.config_fields || []).map((entry) => [entry.key, entry.default]))
const cap = (code, config = {}) => ({ code, version: 1, config: { ...defaultsOf(code), ...config } })

// ─── Pipelines for record types (case pipeline lives in caseSetupSeed) ───
const status = (prefix, key, label, category, extra = {}) => ({ id: `${prefix}-${key}`, key, label, category, ...extra })
const chain = (ids) => ids.slice(0, -1).map((from, index) => ({ from, to: ids[index + 1], required_fields: [] }))

function recordPipeline(id, label, statuses, extraTransitions = []) {
  const ids = statuses.filter((entry) => !['cancelled'].includes(entry.category)).map((entry) => entry.id)
  const cancel = statuses.find((entry) => entry.category === 'cancelled')
  const transitions = [
    ...chain(ids),
    ...(cancel ? ids.filter((entry) => !statuses.find((s) => s.id === entry)?.is_terminal).map((from) => ({ from, to: cancel.id, required_fields: [] })) : []),
    ...extraTransitions,
  ]
  return { id, entity: 'record', key: id.replace('pl-', ''), label, version: 1, version_id: `${id}-v1`, statuses, transitions }
}

// ─── Per-template tenant data ───
const TEMPLATES = {
  devices: {
    recordTypes: [
      {
        key: 'service_contract',
        fields: [['visits_per_year', L('زيارات في السنة', 'Visits per year'), 'number'], ['covered_units', L('عدد الأجهزة المغطاة', 'Covered units'), 'number']],
        label: L('عقد صيانة', 'Maintenance contract'),
        icon: 'FileText',
        statuses: [
          ['draft', L('مسودة', 'Draft'), 'open', { is_initial: true }],
          ['active', L('ساري', 'Active'), 'in_progress'],
          ['expiring', L('قارب على الانتهاء', 'Expiring'), 'pending'],
          ['expired', L('منتهي', 'Expired'), 'closed', { is_terminal: true }],
          ['cancelled', L('ملغي', 'Cancelled'), 'cancelled', { is_terminal: true }],
        ],
        roles: [],
        components: [],
        entries: [['visit', L('زيارة', 'Visit')]],
        batch: { key: 'visit_batch', label: L('دفعة زيارات', 'Visit batch') },
      },
    ],
    itemTypes: [
      { key: 'air_conditioner', name: L('تكييف', 'Air conditioner'), kind: 'product', preset: 'B', caps: [cap('serial_tracking'), cap('barcode'), cap('warranty', { months: 24, starts_from: 'installation' }), cap('installments'), cap('entitlements', { visits_per_year: 2 })] },
      { key: 'installation', name: L('تركيب', 'Installation'), kind: 'service', preset: 'H', caps: [cap('onsite'), cap('scheduling', { duration_minutes: 120 })] },
      { key: 'maintenance_plan', name: L('عقد صيانة سنوي', 'Annual maintenance plan'), kind: 'plan', preset: 'C', caps: [cap('recurrence', { unit: 'year' }), cap('entitlements', { visits_per_year: 4 })], record: 'service_contract' },
    ],
    items: [
      ['p-ac-15', L('تكييف 1.5 حصان', 'AC 1.5 HP'), 'product', 'air_conditioner', 'asset', 18500],
      ['p-ac-3', L('تكييف 3 حصان', 'AC 3 HP'), 'product', 'air_conditioner', 'asset', 32000],
      ['s-install', L('تركيب مجاني', 'Free installation'), 'service', 'installation', 'work_order', 0],
      ['s-amc', L('عقد صيانة سنوي', 'Annual maintenance contract'), 'service', 'maintenance_plan', 'subscription', 1800],
      ['p-filter', L('فلتر هواء', 'Air filter'), 'product', null, null, 250],
    ],
    relations: [['p-ac-15', 's-install', 'included', 1], ['p-ac-15', 's-amc', 'optional', 1], ['p-ac-3', 's-install', 'included', 1]],
  },
  tourism: {
    recordTypes: [
      {
        key: 'booking',
        fields: [['destination', L('الوجهة', 'Destination'), 'text'], ['rooms', L('عدد الغرف', 'Rooms'), 'number']],
        label: L('حجز', 'Booking'),
        icon: 'CalendarClock',
        statuses: [
          ['inquiry', L('استفسار', 'Inquiry'), 'open', { is_initial: true }],
          ['confirmed', L('مؤكد', 'Confirmed'), 'in_progress'],
          ['documents', L('استكمال المستندات', 'Documents'), 'pending'],
          ['traveling', L('في الرحلة', 'Traveling'), 'in_progress'],
          ['completed', L('انتهت', 'Completed'), 'resolved', { is_terminal: true }],
          ['cancelled', L('ملغي', 'Cancelled'), 'cancelled', { is_terminal: true }],
        ],
        roles: [['traveler', L('مسافر', 'Traveler'), 1, 9], ['lead_traveler', L('المسافر المسؤول', 'Lead traveler'), 1, 1]],
        components: [['flight', L('طيران', 'Flight')], ['hotel', L('فندق', 'Hotel')], ['transfer', L('انتقالات', 'Transfer')], ['tour', L('جولة', 'Tour')], ['insurance', L('تأمين', 'Insurance')]],
        entries: [],
        batch: { key: 'trip_group', label: L('مجموعة رحلة', 'Trip group') },
      },
    ],
    itemTypes: [
      { key: 'package', name: L('باقة سياحية', 'Travel package'), kind: 'service', preset: 'E', caps: [cap('scheduling'), cap('participants', { max: 9 }), cap('components'), cap('required_documents', { documents: ['passport', 'photo'] }), cap('capacity', { max: 45 })], record: 'booking' },
      { key: 'insurance', name: L('تأمين سفر', 'Travel insurance'), kind: 'plan', preset: 'A', caps: [] },
    ],
    items: [
      ['s-sharm5', L('شرم الشيخ 5 أيام', 'Sharm El Sheikh 5 days'), 'service', 'package', 'booking', 14500],
      ['s-turkey7', L('تركيا 7 أيام', 'Turkey 7 days'), 'service', 'package', 'booking', 42000],
      ['s-ins', L('تأمين سفر', 'Travel insurance'), 'service', 'insurance', 'none', 900],
    ],
    relations: [['s-turkey7', 's-ins', 'optional', 1]],
  },
  school: {
    recordTypes: [
      {
        key: 'enrollment',
        fields: [['grade', L('الصف', 'Grade'), 'text'], ['academic_year', L('العام الدراسي', 'Academic year'), 'text']],
        label: L('قيد دراسي', 'Enrollment'),
        icon: 'FileText',
        statuses: [
          ['applied', L('تقديم', 'Applied'), 'open', { is_initial: true }],
          ['enrolled', L('مقيد', 'Enrolled'), 'in_progress'],
          ['suspended', L('موقوف', 'Suspended'), 'pending'],
          ['graduated', L('أنهى السنة', 'Completed year'), 'resolved', { is_terminal: true }],
          ['withdrawn', L('منسحب', 'Withdrawn'), 'cancelled', { is_terminal: true }],
        ],
        roles: [['student', L('طالب', 'Student'), 1, 1], ['guardian', L('ولي أمر', 'Guardian'), 1, 2]],
        components: [],
        entries: [['attendance', L('حضور', 'Attendance')], ['grade', L('درجة', 'Grade')]],
        batch: { key: 'class', label: L('فصل', 'Class') },
      },
    ],
    itemTypes: [
      { key: 'school_year', name: L('سنة دراسية', 'School year'), kind: 'service', preset: 'D', caps: [cap('participants', { max: 1 }), cap('entitlements'), cap('installments', { plans: ['monthly', 'quarterly'] })], record: 'enrollment' },
      { key: 'bus', name: L('اشتراك الباص', 'Bus subscription'), kind: 'plan', preset: 'C', caps: [cap('recurrence', { unit: 'month' })] },
    ],
    items: [
      ['s-kg1', L('KG1 — 2026/2027', 'KG1 — 2026/2027'), 'service', 'school_year', 'enrollment', 65000],
      ['s-g1', L('الصف الأول — 2026/2027', 'Grade 1 — 2026/2027'), 'service', 'school_year', 'enrollment', 72000],
      ['s-bus', L('اشتراك الباص', 'Bus subscription'), 'service', 'bus', 'subscription', 1200],
    ],
    relations: [['s-g1', 's-bus', 'optional', 1]],
  },
  shipping: {
    recordTypes: [
      {
        key: 'shipment',
        fields: [['city', L('المدينة', 'City'), 'text'], ['cod_amount', L('مبلغ التحصيل', 'COD amount'), 'money'], ['weight_kg', L('الوزن (كجم)', 'Weight (kg)'), 'number']],
        label: L('شحنة', 'Shipment'),
        icon: 'Truck',
        statuses: [
          ['created', L('تم الإنشاء', 'Created'), 'open', { is_initial: true }],
          ['picked_up', L('تم الاستلام', 'Picked up'), 'in_progress'],
          ['in_transit', L('في الطريق', 'In transit'), 'in_progress'],
          ['out_for_delivery', L('خرجت للتوصيل', 'Out for delivery'), 'in_progress'],
          ['delivered', L('تم التسليم', 'Delivered'), 'resolved', { is_terminal: true }],
          ['returned', L('مرتجع', 'Returned'), 'cancelled', { is_terminal: true }],
        ],
        roles: [['sender', L('الراسل', 'Sender'), 1, 1], ['recipient', L('المستلم', 'Recipient'), 1, 1]],
        components: [],
        entries: [['delivery_attempt', L('محاولة توصيل', 'Delivery attempt')]],
        batch: { key: 'manifest', label: L('مانيفست', 'Manifest') },
      },
    ],
    itemTypes: [
      { key: 'parcel', name: L('طرد', 'Parcel'), kind: 'service', preset: 'F', caps: [cap('tracking', { expected_days: 2 }), cap('participants', { max: 2 })], record: 'shipment' },
      { key: 'merchant_plan', name: L('باقة تاجر', 'Merchant plan'), kind: 'plan', preset: 'C', caps: [cap('recurrence'), cap('entitlements', { priority_support: true })] },
    ],
    items: [
      ['s-express', L('شحن سريع داخل القاهرة', 'Express Cairo delivery'), 'service', 'parcel', 'shipment', 55],
      ['s-gov', L('شحن للمحافظات', 'Governorates delivery'), 'service', 'parcel', 'shipment', 75],
      ['s-merchant', L('باقة تاجر شهرية', 'Monthly merchant plan'), 'service', 'merchant_plan', 'subscription', 999],
    ],
    relations: [],
  },
}

const templateOf = (manifest) => TEMPLATES[manifest.template] || TEMPLATES.devices

export function buildRecordPipelines(manifest) {
  return templateOf(manifest).recordTypes.map((type) =>
    recordPipeline(
      `pl-${type.key}`,
      type.label,
      type.statuses.map(([key, label, category, extra]) => status(`rs-${type.key}`, key, label, category, extra))
    )
  )
}

export function buildRecordTypes(manifest) {
  return templateOf(manifest).recordTypes.map((type) => ({
    id: `rt-${type.key}`,
    key: type.key,
    label: type.label,
    icon: type.icon,
    pipeline_id: `pl-${type.key}`,
    participant_roles: type.roles.map(([key, label, min, max]) => ({ key, label, min, max })),
    component_types: type.components.map(([key, label]) => ({ key, label })),
    entry_types: type.entries.map(([key, label]) => ({ key, label })),
    batch_enabled: Boolean(type.batch),
    batch_label: type.batch?.label || { ar: '', en: '' },
    fields: (type.fields || []).map(([key, label, fieldType]) => ({ key, label, type: fieldType })),
    portal_visible: true,
    active: true,
  }))
}

export function buildItemTypes(manifest) {
  return templateOf(manifest).itemTypes.map((type) => ({
    id: `it-${type.key}`,
    key: type.key,
    name: type.name,
    kind: type.kind,
    service_model_preset: type.preset,
    capabilities: type.caps,
    record_type_id: type.record ? `rt-${type.record}` : null,
    default_case_type_ids: [],
    active: true,
  }))
}

/**
 * Catalog items = the existing Products & Services, joined with their service
 * configuration (spec §25.8–25.10). Only `service_config` is editable here.
 */
export function buildCatalogItems(manifest) {
  const template = templateOf(manifest)
  return template.items.map(([id, name, kind, typeKey, creates, price]) => {
    const type = template.itemTypes.find((entry) => entry.key === typeKey)
    return {
      id,
      name,
      kind,
      price,
      currency: 'EGP',
      service_config: {
        item_type_id: typeKey ? `it-${typeKey}` : null,
        capability_overrides: [],
        fulfillment: {
          creates: creates || 'none',
          record_type_id: type?.record ? `rt-${type.record}` : null,
          default_queue_id: null,
          allowed_case_type_ids: [],
          portal_visible: true,
        },
        relations: template.relations
          .filter(([parent]) => parent === id)
          .map(([, child, inclusion, quantity]) => ({ child_item_id: child, inclusion, quantity, price_override: null, auto_add: inclusion === 'included' })),
      },
    }
  })
}
