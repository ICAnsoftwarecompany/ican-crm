import { buildCustomers } from './casesSeed'
import { buildRecordPipelines, buildRecordTypes } from './catalogSeed'
import { createRandom, hoursAgo } from './seedUtils'

/**
 * Service records, batches, participants, components, entries, required
 * documents and timeline per template (spec §33). Names are user data.
 */
const PEOPLE = ['أحمد سامي', 'منة الله طارق', 'يوسف إبراهيم', 'ريم عادل', 'حسن مجدي', 'سلمى خالد', 'عمر فتحي', 'نور الهدى', 'زياد محمد', 'فرح أيمن']
const CITIES = ['القاهرة', 'الإسكندرية', 'المنصورة', 'طنطا', 'أسيوط', 'الجيزة']
const DESTINATIONS = ['شرم الشيخ', 'إسطنبول', 'الغردقة', 'دبي']
const GRADES = ['KG1', 'KG2', 'الصف الأول', 'الصف الثاني']
const SUPPLIERS = { flight: 'EgyptAir', hotel: 'Rixos', transfer: 'Go Bus', tour: 'Local DMC', insurance: 'AXA' }
const DOCS = ['passport', 'photo']
const COMPONENT_STATUSES = ['requested', 'pending_supplier', 'confirmed', 'issued']

const L = (ar, en) => ({ ar, en })

function dataFor(key, random) {
  if (key === 'booking') return { destination: random.pick(DESTINATIONS), rooms: random.int(1, 3) }
  if (key === 'shipment') return { city: random.pick(CITIES), cod_amount: random.int(150, 3500), weight_kg: random.int(1, 12) }
  if (key === 'enrollment') return { grade: random.pick(GRADES), academic_year: '2026/2027' }
  return { visits_per_year: 4, covered_units: random.int(1, 3) }
}

export function buildRecordsState(manifest) {
  const random = createRandom(`records-${manifest.template}`)
  const [type] = buildRecordTypes(manifest)
  const [pipeline] = buildRecordPipelines(manifest)
  const customers = buildCustomers(manifest)
  const statuses = pipeline.statuses
  const live = statuses.filter((status) => status.category !== 'cancelled')
  const prefix = { booking: 'BK', shipment: 'SH', enrollment: 'EN', service_contract: 'SC' }[type.key] || 'SR'

  const batches = type.batch_enabled
    ? [0, 1, 2].map((index) => ({
        id: `batch-${index + 1}`,
        record_type_id: type.id,
        reference_no: `${prefix}-B-${String(100 + index)}`,
        name: type.key === 'booking' ? L(`رحلة ${DESTINATIONS[index]} — أكتوبر`, `${['Sharm', 'Istanbul', 'Hurghada'][index]} — October`) : type.key === 'enrollment' ? L(`فصل ${GRADES[index]} / أ`, `${GRADES[index]} / A`) : L(`${type.batch_label.ar} ${100 + index}`, `${type.batch_label.en} ${100 + index}`),
        customer_id: type.key === 'shipment' ? customers[2].id : null,
        status: index === 0 ? 'open' : index === 1 ? 'in_progress' : 'completed',
        starts_at: hoursAgo(-24 * (5 - index * 4)),
        capacity: type.key === 'booking' ? 45 : type.key === 'enrollment' ? 30 : null,
        version: 1,
      }))
    : []

  const records = []
  const participants = []
  const components = []
  const entries = []
  const documents = []
  const timeline = []

  Array.from({ length: 16 }).forEach((_, index) => {
    const id = `rec-${index + 1}`
    const status = index % 7 === 6 && statuses.find((entry) => entry.category === 'cancelled') ? statuses.find((entry) => entry.category === 'cancelled') : live[Math.min(Math.floor(random.next() * live.length), live.length - 1)]
    const customer = random.pick(customers)
    const openedHours = random.int(24, 24 * 40)
    const batch = batches.length && random.chance(0.6) ? random.pick(batches) : null
    const record = {
      id,
      record_type_id: type.id,
      reference_no: `${prefix}-2026-${String(2000 + index)}`,
      customer_id: customer.id,
      customer,
      status_id: status.id,
      pipeline_version_id: pipeline.version_id,
      batch_id: batch?.id || null,
      assigned_user_id: random.chance(0.7) ? `agent-${random.int(1, 4)}` : null,
      source_type: random.pick(['contract_line', 'manual', 'import']),
      starts_at: type.key === 'booking' ? hoursAgo(-24 * random.int(3, 40)) : hoursAgo(openedHours),
      ends_at: type.key === 'booking' ? hoursAgo(-24 * random.int(45, 50)) : null,
      expected_at: type.key === 'shipment' ? hoursAgo(-24 * random.int(1, 3)) : null,
      data: dataFor(type.key, random),
      created_at: hoursAgo(openedHours),
      updated_at: hoursAgo(random.int(1, 72)),
      version: 1,
    }
    records.push(record)

    // Participants per configured role (min..max, capped for the demo).
    type.participant_roles.forEach((role) => {
      const count = Math.min(role.max, Math.max(role.min, role.key === 'traveler' ? random.int(1, 3) : 1))
      Array.from({ length: count }).forEach((__, n) => {
        const participantId = `${id}-p-${role.key}-${n + 1}`
        participants.push({
          id: participantId,
          record_id: id,
          role: role.key,
          name: random.pick(PEOPLE),
          phone: `+2011${String(random.int(10000000, 99999999))}`,
          identifier: role.key === 'traveler' || role.key === 'lead_traveler' ? `A${random.int(1000000, 9999999)}` : null,
          data: role.key === 'recipient' ? { address: `${random.pick(CITIES)} — ${random.int(1, 90)} ش النصر` } : {},
        })
        if (role.key === 'traveler' || role.key === 'lead_traveler') {
          DOCS.forEach((doc) => {
            const docStatus = random.pick(['missing', 'missing', 'uploaded', 'verified'])
            documents.push({
              id: `${participantId}-${doc}`,
              record_id: id,
              participant_id: participantId,
              document_type: doc,
              status: docStatus,
              file_name: docStatus === 'missing' ? null : `${doc}-${n + 1}.pdf`,
              rejection_reason: null,
            })
          })
        }
      })
    })

    type.component_types.forEach((componentType, n) => {
      if (componentType.key === 'insurance' && random.chance(0.5)) return
      const cost = random.int(1500, 9000)
      components.push({
        id: `${id}-c-${n + 1}`,
        record_id: id,
        component_type: componentType.key,
        title: componentType.label,
        supplier_name: SUPPLIERS[componentType.key] || null,
        supplier_reference: random.chance(0.5) ? `REF${random.int(10000, 99999)}` : null,
        status: random.pick(COMPONENT_STATUSES),
        starts_at: record.starts_at,
        ends_at: record.ends_at,
        cost_amount: cost,
        sell_amount: Math.round(cost * (1.1 + random.next() * 0.3)),
        currency: 'EGP',
        version: 1,
      })
    })

    type.entry_types.forEach((entryType) => {
      const count = entryType.key === 'delivery_attempt' ? random.int(0, 2) : random.int(2, 5)
      Array.from({ length: count }).forEach((__, n) => {
        entries.push({
          id: `${id}-e-${entryType.key}-${n + 1}`,
          record_id: id,
          entry_type: entryType.key,
          occurred_at: hoursAgo(24 * (count - n) + random.int(0, 12)),
          value: entryType.key === 'attendance' ? random.pick(['present', 'present', 'present', 'absent', 'late']) : entryType.key === 'grade' ? String(random.int(12, 20)) : entryType.key === 'delivery_attempt' ? random.pick(['no_answer', 'rescheduled', 'wrong_address']) : 'done',
          note: null,
          participant_id: null,
          created_by: { id: 'agent-1', name: 'سارة محمود' },
        })
      })
    })

    timeline.push(
      { id: `${id}-t-1`, subject_type: 'record', subject_id: id, event_type: 'created', title: null, body: null, visibility: 'internal', actor: { type: 'system', name: null }, payload: { source: record.source_type }, occurred_at: record.created_at },
      ...(status.is_initial ? [] : [{ id: `${id}-t-2`, subject_type: 'record', subject_id: id, event_type: 'status_change', title: null, body: null, visibility: 'customer', actor: { type: 'user', name: 'أحمد علي' }, payload: { to: { key: status.key, label: status.label } }, occurred_at: record.updated_at }]),
      ...(random.chance(0.4)
        ? [{ id: `${id}-t-3`, subject_type: 'record', subject_id: id, event_type: 'customer_update', title: null, body: 'تم تحديث بيانات الخدمة، وهنبلغ حضرتك بأي جديد أول بأول.', visibility: 'customer', actor: { type: 'user', name: 'منى حسن' }, payload: { sent_via: 'whatsapp' }, occurred_at: record.updated_at }]
        : [])
    )
  })

  return { records, batches, participants, components, entries, documents, timeline }
}
