import { buildCustomers } from './casesSeed'
import { hoursAgo } from './seedUtils'
import { addPeriod } from '../state/paymentPlanEngine'
import { zonedToUtc } from '../state/schedulingEngine'
import { todayIso } from '../state/billingLedger'

/**
 * Scheduling resources, reservations and work orders per template (spec §19, §38).
 * Times are wall-clock in the main business calendar (Africa/Cairo).
 */
const L = (ar, en) => ({ ar, en })
const TZ = 'Africa/Cairo'

const RESOURCES = {
  devices: [
    ['res-t1', 'technician', L('محمود الفني', 'Mahmoud (technician)'), ['ac', 'installation'], ['cairo', 'giza'], 'agent-5'],
    ['res-t2', 'technician', L('حسن الفني', 'Hassan (technician)'), ['ac', 'maintenance'], ['cairo'], 'agent-6'],
    ['res-t3', 'technician', L('سامي الفني', 'Sami (technician)'), ['ac', 'installation', 'maintenance'], ['alex'], null],
  ],
  tourism: [
    ['res-g1', 'guide', L('مرشد: نادر', 'Guide: Nader'), ['en', 'ar'], ['luxor', 'aswan'], null],
    ['res-g2', 'guide', L('مرشدة: ليلى', 'Guide: Laila'), ['fr', 'ar'], ['cairo'], null],
    ['res-v1', 'vehicle', L('أتوبيس 50 راكب', 'Coach, 50 seats'), [], ['cairo', 'luxor'], null],
  ],
  school: [
    ['res-r1', 'room', L('قاعة الأنشطة', 'Activity hall'), [], [], null],
    ['res-r2', 'room', L('معمل العلوم', 'Science lab'), [], [], null],
  ],
  shipping: [
    ['res-c1', 'courier', L('مندوب: كريم', 'Courier: Karim'), ['cod'], ['nasr_city', 'heliopolis'], 'agent-7'],
    ['res-c2', 'courier', L('مندوب: وليد', 'Courier: Walid'), ['cod', 'fragile'], ['maadi', 'downtown'], 'agent-8'],
    ['res-c3', 'courier', L('مندوب: شريف', 'Courier: Sherif'), [], ['giza', 'october'], null],
  ],
}

export function buildResources(manifest) {
  return (RESOURCES[manifest.template] || []).map(([id, type, name, skills, zones, userId]) => ({
    id,
    type,
    name,
    user_id: userId,
    capacity: 1,
    calendar_id: 'cal-main',
    skills,
    zones,
    vehicle: type === 'courier' ? (id === 'res-c2' ? 'van' : 'motorcycle') : null,
    daily_capacity: type === 'courier' ? 30 : null,
    status: 'active',
  }))
}

/** Next working day (not Friday) `offset` days from today. */
function workDay(offset) {
  let date = addPeriod(todayIso(), offset, 'day')
  while (new Date(`${date}T12:00:00Z`).getUTCDay() === 5) date = addPeriod(date, 1, 'day')
  return date
}
const at = (date, time) => zonedToUtc(date, time, TZ)
const plus = (iso, minutes) => new Date(Date.parse(iso) + minutes * 60 * 1000).toISOString()

const WO_PLAN = [
  // [type, status, dayOffset, time, resource, assetIndex, entitlement, completion]
  ['installation', 'scheduled', 0, '10:00', 'res-t1', 2, null],
  ['maintenance', 'in_progress', 0, '12:00', 'res-t2', 4, 'ent-v-4'],
  ['repair', 'on_the_way', 0, '14:00', 'res-t1', 3, null],
  ['maintenance', 'scheduled', 1, '09:30', 'res-t2', 7, 'ent-v-7'],
  ['inspection', 'new', null, null, null, 5, null],
  ['repair', 'new', null, null, null, 8, null],
  ['maintenance', 'completed', -3, '11:00', 'res-t3', 1, 'ent-v-1', 'completed'],
  ['repair', 'completed', -5, '13:00', 'res-t2', 6, null, 'failed'],
]

export function buildSchedulingState(manifest) {
  const reservations = []
  const workOrders = []
  if (manifest.template === 'devices') {
    const customers = buildCustomers(manifest)
    WO_PLAN.forEach(([type, status, dayOffset, time, resourceId, assetIndex, entitlementId, completion], index) => {
      const id = `wo-${index + 1}`
      const customer = customers[(assetIndex - 1) % customers.length]
      const scheduled = dayOffset != null ? at(workDay(dayOffset), time) : null
      const end = scheduled ? plus(scheduled, type === 'installation' ? 120 : 90) : null
      let reservationId = null
      if (scheduled) {
        reservationId = `rsv-${index + 1}`
        reservations.push({ id: reservationId, resource_id: resourceId, subject_type: 'work_order', subject_id: id, starts_at: scheduled, ends_at: end, quantity: 1, status: status === 'completed' ? 'confirmed' : 'confirmed', hold_expires_at: null, note: null, created_by: { id: 'agent-1', name: 'سارة محمود' }, created_at: hoursAgo(48) })
      }
      const done = status === 'completed'
      workOrders.push({
        id,
        number: `WO-2026-${String(700 + index)}`,
        type,
        case_id: null,
        asset_id: `asset-${assetIndex}`,
        service_record_id: null,
        contract_id: null,
        customer: { id: customer.id, name: customer.name, phone: customer.phone },
        customer_id: customer.id,
        assigned_resource_id: resourceId,
        reservation_id: reservationId,
        scheduled_start: scheduled,
        scheduled_end: end,
        duration_minutes: type === 'installation' ? 120 : 90,
        location: { address: ['مدينة نصر — 12', 'المعادي — 7', 'الشيخ زايد — 30', 'سموحة — 4'][index % 4], zone: resourceId === 'res-t3' ? 'alex' : 'cairo' },
        status,
        parts: done ? [{ name: 'فريون R410', quantity: 1 }] : [],
        labor_minutes: done ? 75 : null,
        check_in_at: ['in_progress', 'completed'].includes(status) ? plus(scheduled, 5) : null,
        check_out_at: done ? plus(scheduled, 80) : null,
        work_notes: done ? (completion === 'failed' ? 'القطعة غير متوفرة' : 'تنظيف الفلاتر وشحن فريون') : null,
        completion_status: done ? completion : null,
        failure_reason: completion === 'failed' ? 'part_unavailable' : null,
        signature_name: done && completion === 'completed' ? customer.name : null,
        entitlement_id: entitlementId,
        entitlement_transaction_id: null,
        billable: !entitlementId,
        notes: null,
        events: [{ type: 'created', at: hoursAgo(72), by: { id: 'agent-1', name: 'سارة محمود' } }],
        version: 1,
      })
    })
    // A hold that expires in two hours and one that already expired (spec §19.3).
    reservations.push({ id: 'rsv-hold-1', resource_id: 'res-t3', subject_type: 'manual', subject_id: null, starts_at: at(workDay(1), '11:00'), ends_at: at(workDay(1), '12:30'), quantity: 1, status: 'hold', hold_expires_at: hoursAgo(-2), note: 'حجز مبدئي لعميل بيأكد', created_by: { id: 'agent-1', name: 'سارة محمود' }, created_at: hoursAgo(20) })
    reservations.push({ id: 'rsv-hold-2', resource_id: 'res-t1', subject_type: 'manual', subject_id: null, starts_at: at(workDay(1), '15:00'), ends_at: at(workDay(1), '16:00'), quantity: 1, status: 'hold', hold_expires_at: hoursAgo(1), note: null, created_by: { id: 'agent-1', name: 'سارة محمود' }, created_at: hoursAgo(30) })
  } else if (manifest.template === 'tourism') {
    reservations.push({ id: 'rsv-g1', resource_id: 'res-g1', subject_type: 'batch', subject_id: null, starts_at: at(workDay(2), '08:00'), ends_at: at(workDay(2), '17:00'), quantity: 1, status: 'confirmed', hold_expires_at: null, note: 'رحلة الأقصر', created_by: { id: 'agent-1', name: 'سارة محمود' }, created_at: hoursAgo(40) })
    reservations.push({ id: 'rsv-v1', resource_id: 'res-v1', subject_type: 'batch', subject_id: null, starts_at: at(workDay(2), '07:00'), ends_at: at(workDay(2), '18:00'), quantity: 1, status: 'hold', hold_expires_at: hoursAgo(-24 * 3), note: 'في انتظار تأكيد شركة النقل', created_by: { id: 'agent-1', name: 'سارة محمود' }, created_at: hoursAgo(10) })
  } else if (manifest.template === 'school') {
    reservations.push({ id: 'rsv-r1', resource_id: 'res-r1', subject_type: 'manual', subject_id: null, starts_at: at(workDay(1), '10:00'), ends_at: at(workDay(1), '12:00'), quantity: 1, status: 'confirmed', hold_expires_at: null, note: 'اجتماع أولياء الأمور', created_by: { id: 'agent-1', name: 'سارة محمود' }, created_at: hoursAgo(40) })
  }
  return { reservations, workOrders }
}
