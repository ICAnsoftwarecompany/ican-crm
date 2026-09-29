import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, requiredLabel } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildResources, buildSchedulingState } from '../seeds/schedulingSeed'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { matchesSearch, nowIso, paginate } from '../utils'
import { availability, expireHolds, hasConflict, zonedParts } from '../state/schedulingEngine'
import { entitlementState } from './assetsHandlers'
import { findOrAdoptCustomer } from './casesHandlers'
import './settingsHandlers'

registerSeed('resources', buildResources)
registerSeed('reservations', (manifest) => buildSchedulingState(manifest).reservations)
registerSeed('workOrders', (manifest) => buildSchedulingState(manifest).workOrders)

const E = serviceEndpoints
const WO_TYPES = ['installation', 'repair', 'maintenance', 'inspection', 'delivery', 'pickup', 'custom']
const RESERVATION_TTL_MINUTES = 60 * 24
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const conflict = (code, message) => new MockHttpError(409, code, message)
const me = () => ({ id: getMockCurrentUser().id, name: getMockCurrentUser().name })
const minutes = (value) => value * 60 * 1000

function reservationsNow() {
  const reservations = getCollection('reservations')
  expireHolds(reservations)
  return reservations
}
function resourceById(id) {
  const resource = getCollection('resources').find((entry) => entry.id === id)
  if (!resource) throw notFound('Resource')
  return resource
}
function serializeReservation(reservation) {
  const resource = getCollection('resources').find((entry) => entry.id === reservation.resource_id)
  const workOrder = reservation.subject_type === 'work_order' ? getCollection('workOrders').find((entry) => entry.id === reservation.subject_id) : null
  return { ...reservation, resource: resource ? { id: resource.id, name: resource.name, type: resource.type } : null, subject: workOrder ? { number: workOrder.number, customer: workOrder.customer, type: workOrder.type, status: workOrder.status } : null }
}

/** Creates a reservation after the capacity check (the server does this in a transaction with a lock). */
export function reserve({ resourceId, startsAt, endsAt, quantity = 1, status = 'confirmed', holdMinutes, subjectType = 'manual', subjectId = null, note = null, excludeId = null }) {
  const resource = resourceById(resourceId)
  validation({
    ...(!startsAt && { starts_at: ['required'] }),
    ...(!endsAt && { ends_at: ['required'] }),
    ...(startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt) && { ends_at: ['after_start'] }),
  })
  const candidate = { starts_at: new Date(startsAt).toISOString(), ends_at: new Date(endsAt).toISOString(), quantity }
  if (hasConflict(reservationsNow(), resource, candidate, excludeId)) throw conflict('RESERVATION_CONFLICT', 'The resource is already booked in this period')
  const reservation = {
    id: mockId('rsv'),
    resource_id: resource.id,
    subject_type: subjectType,
    subject_id: subjectId,
    ...candidate,
    status,
    hold_expires_at: status === 'hold' ? new Date(Date.now() + minutes(Number(holdMinutes) || RESERVATION_TTL_MINUTES)).toISOString() : null,
    note,
    created_by: me(),
    created_at: nowIso(),
  }
  getCollection('reservations').push(reservation)
  return reservation
}

function release(reservationId) {
  const reservation = getCollection('reservations').find((entry) => entry.id === reservationId)
  if (reservation && ['hold', 'confirmed'].includes(reservation.status)) Object.assign(reservation, { status: 'released', released_at: nowIso() })
}

// ---- work orders ------------------------------------------------------------------------------

function workOrderById(id) {
  const workOrder = getCollection('workOrders').find((entry) => entry.id === id)
  if (!workOrder) throw notFound('Work order')
  return workOrder
}
function serializeWorkOrder(workOrder, { detail = false } = {}) {
  const resource = getCollection('resources').find((entry) => entry.id === workOrder.assigned_resource_id)
  const asset = getCollection('assets').find((entry) => entry.id === workOrder.asset_id)
  const entitlement = getCollection('entitlements').find((entry) => entry.id === workOrder.entitlement_id)
  const base = {
    ...workOrder,
    resource: resource ? { id: resource.id, name: resource.name, type: resource.type } : null,
    asset: asset ? { id: asset.id, name: asset.name, serial_number: asset.serial_number } : null,
    entitlement: entitlement ? { id: entitlement.id, type: entitlement.type, state: entitlementState(entitlement) } : null,
  }
  if (!detail) {
    const { events, parts, ...rest } = base
    return rest
  }
  return base
}
function transition(workOrder, from, to, extra = {}, reason = null) {
  if (!from.includes(workOrder.status)) throw conflict('WORK_ORDER_INVALID_STATE', `Not allowed from ${workOrder.status}`)
  const previous = workOrder.status
  Object.assign(workOrder, extra, { status: to })
  workOrder.events.unshift({ type: to, from: previous, at: nowIso(), by: me(), reason })
  workOrder.version += 1
}
const guardVersion = (workOrder, body) => {
  if (body.version != null && Number(body.version) !== workOrder.version) throw conflict('CONFLICT_VERSION', 'Changed')
}

/** Completing a visit consumes one unit of the linked entitlement into the ledger (spec §38.3, F4 acceptance). */
function consumeEntitlement(workOrder) {
  const entitlement = getCollection('entitlements').find((entry) => entry.id === workOrder.entitlement_id)
  if (!entitlement) return null
  if (entitlementState(entitlement) !== 'active') {
    workOrder.billable = true
    return { warning: 'ENTITLEMENT_NOT_AVAILABLE' }
  }
  const entry = { id: mockId('tx'), entitlement_id: entitlement.id, type: 'consume', quantity: 1, source_type: 'work_order', source_id: workOrder.id, reason: { ar: `إكمال ${workOrder.number}`, en: `Completed ${workOrder.number}` }, created_by: me(), created_at: nowIso() }
  getCollection('entitlementTransactions').push(entry)
  workOrder.entitlement_transaction_id = entry.id
  return { transaction_id: entry.id }
}

/** @type {import('../router').MockRoute[]} */
export const schedulingHandlers = [
  ...crudHandlers({
    collection: 'resources',
    path: E.schedulingResources,
    prefix: 'res',
    validate: (body) => ({
      ...(requiredLabel(body.name) && { name: ['required'] }),
      ...(!body.type && { type: ['required'] }),
      ...(!(Number(body.capacity) >= 1) && { capacity: ['required'] }),
    }),
    canDelete: (resource) => {
      if (getCollection('reservations').some((entry) => entry.resource_id === resource.id && ['hold', 'confirmed'].includes(entry.status) && Date.parse(entry.ends_at) > Date.now())) throw new MockHttpError(409, 'RESOURCE_IN_USE', 'Resource has upcoming reservations')
    },
  }),
  {
    method: 'GET',
    path: E.schedulingAvailability,
    handler: ({ query }) => {
      validation(query.date ? {} : { date: ['required'] })
      const resources = getCollection('resources')
        .filter((resource) => resource.status !== 'inactive')
        .filter((resource) => !query.resource_type || resource.type === query.resource_type)
        .filter((resource) => !query.resource_id || resource.id === query.resource_id)
        .filter((resource) => !query.skill || resource.skills?.includes(query.skill))
        .filter((resource) => !query.zone || resource.zones?.includes(query.zone))
      return { data: availability({ resources, calendars: getCollection('businessCalendars'), reservations: reservationsNow(), date: query.date, duration: Number(query.duration) || 60, step: Number(query.step) || 30 }) }
    },
  },
  {
    method: 'GET',
    path: E.reservations,
    handler: ({ query }) => {
      const tz = getCollection('businessCalendars')[0]?.timezone || 'UTC'
      const items = reservationsNow()
        .filter((entry) => !query.resource_id || entry.resource_id === query.resource_id)
        .filter((entry) => !query.status || entry.status === query.status)
        .filter((entry) => !query.date || zonedParts(entry.starts_at, tz).date === query.date)
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
        .map(serializeReservation)
      return paginate(items, { per_page: 200, ...query })
    },
  },
  {
    method: 'POST',
    path: E.reservations,
    handler: ({ body = {} }) => {
      validation(body.resource_id ? {} : { resource_id: ['required'] })
      const reservation = reserve({ resourceId: body.resource_id, startsAt: body.starts_at, endsAt: body.ends_at, quantity: Number(body.quantity) || 1, status: body.status === 'hold' ? 'hold' : 'confirmed', holdMinutes: body.hold_minutes, subjectType: body.subject_type || 'manual', subjectId: body.subject_id || null, note: body.note || null })
      return { status: 201, body: { data: serializeReservation(reservation) } }
    },
  },
  {
    method: 'POST',
    path: `${E.reservations}/:id/confirm`,
    handler: ({ params }) => {
      const reservation = reservationsNow().find((entry) => entry.id === params.id)
      if (!reservation) throw notFound('Reservation')
      if (reservation.status !== 'hold') throw conflict('RESERVATION_NOT_HOLD', `Reservation is ${reservation.status}`)
      Object.assign(reservation, { status: 'confirmed', hold_expires_at: null, confirmed_at: nowIso() })
      return { data: serializeReservation(reservation) }
    },
  },
  {
    method: 'DELETE',
    path: `${E.reservations}/:id`,
    handler: ({ params }) => {
      const reservation = reservationsNow().find((entry) => entry.id === params.id)
      if (!reservation) throw notFound('Reservation')
      if (!['hold', 'confirmed'].includes(reservation.status)) throw conflict('RESERVATION_NOT_ACTIVE', `Reservation is ${reservation.status}`)
      if (reservation.subject_type === 'work_order') throw conflict('RESERVATION_OWNED', 'Reschedule or cancel the work order instead')
      release(reservation.id)
      return { data: serializeReservation(reservation) }
    },
  },

  // Work orders
  {
    method: 'GET',
    path: E.workOrders,
    handler: ({ query }) => {
      reservationsNow()
      const items = getCollection('workOrders')
        .filter((entry) => !query.status || entry.status === query.status || (query.status === 'open' && !['completed', 'cancelled'].includes(entry.status)))
        .filter((entry) => !query.resource_id || entry.assigned_resource_id === query.resource_id)
        .filter((entry) => !query.customer_id || entry.customer_id === query.customer_id)
        .filter((entry) => !query.asset_id || entry.asset_id === query.asset_id)
        .filter((entry) => matchesSearch([entry.number, entry.customer?.name, entry.customer?.phone, entry.location?.address], query.search))
        .sort((a, b) => String(a.scheduled_start || '9999').localeCompare(String(b.scheduled_start || '9999')))
        .map((entry) => serializeWorkOrder(entry))
      return paginate(items, query)
    },
  },
  { method: 'GET', path: `${E.workOrders}/:id`, handler: ({ params }) => ({ data: serializeWorkOrder(workOrderById(params.id), { detail: true }) }) },
  {
    method: 'POST',
    path: E.workOrders,
    handler: ({ body = {} }) => {
      const customer = (body.customer_id && findOrAdoptCustomer(body.customer_id)) || getCollection('assets').find((entry) => entry.id === body.asset_id)?.customer
      validation({ ...(!WO_TYPES.includes(body.type) && { type: ['required'] }), ...(!customer && { customer_id: ['required'] }) })
      const workOrder = {
        id: mockId('wo'),
        number: `WO-2026-${String(700 + getCollection('workOrders').length)}`,
        type: body.type,
        case_id: body.case_id || null,
        asset_id: body.asset_id || null,
        service_record_id: body.service_record_id || null,
        contract_id: body.contract_id || null,
        customer: { id: customer.id, name: customer.name, phone: customer.phone },
        customer_id: customer.id,
        assigned_resource_id: null,
        reservation_id: null,
        scheduled_start: null,
        scheduled_end: null,
        duration_minutes: Number(body.duration_minutes) || 60,
        location: { address: body.address || '', zone: body.zone || '' },
        status: 'new',
        parts: [],
        labor_minutes: null,
        check_in_at: null,
        check_out_at: null,
        work_notes: null,
        completion_status: null,
        failure_reason: null,
        signature_name: null,
        entitlement_id: body.entitlement_id || null,
        entitlement_transaction_id: null,
        billable: !body.entitlement_id,
        notes: body.notes || null,
        events: [{ type: 'created', at: nowIso(), by: me() }],
        version: 1,
      }
      getCollection('workOrders').unshift(workOrder)
      return { status: 201, body: { data: serializeWorkOrder(workOrder, { detail: true }) } }
    },
  },
  {
    method: 'PATCH',
    path: `${E.workOrders}/:id`,
    handler: ({ params, body = {} }) => {
      // Assign + schedule (or reschedule): the server books the resource slot as a confirmed reservation.
      const workOrder = workOrderById(params.id)
      guardVersion(workOrder, body)
      if (!['new', 'scheduled'].includes(workOrder.status)) throw conflict('WORK_ORDER_INVALID_STATE', `Not allowed from ${workOrder.status}`)
      validation({ ...(!body.resource_id && { resource_id: ['required'] }), ...(!body.scheduled_start && { scheduled_start: ['required'] }) })
      const end = body.scheduled_end || new Date(Date.parse(body.scheduled_start) + minutes(workOrder.duration_minutes)).toISOString()
      const reservation = reserve({ resourceId: body.resource_id, startsAt: body.scheduled_start, endsAt: end, subjectType: 'work_order', subjectId: workOrder.id, excludeId: workOrder.reservation_id })
      if (workOrder.reservation_id) release(workOrder.reservation_id)
      transition(workOrder, ['new', 'scheduled'], 'scheduled', { assigned_resource_id: body.resource_id, reservation_id: reservation.id, scheduled_start: reservation.starts_at, scheduled_end: reservation.ends_at })
      return { data: serializeWorkOrder(workOrder, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: `${E.workOrders}/:id/:action`,
    handler: ({ params, body = {} }) => {
      const workOrder = workOrderById(params.id)
      guardVersion(workOrder, body)
      let result = null
      switch (params.action) {
        case 'on-the-way':
          transition(workOrder, ['scheduled'], 'on_the_way')
          break
        case 'check-in':
          transition(workOrder, ['scheduled', 'on_the_way'], 'in_progress', { check_in_at: nowIso(), check_in_location: body.location || null })
          break
        case 'check-out':
          if (workOrder.status !== 'in_progress') throw conflict('WORK_ORDER_INVALID_STATE', 'Check in first')
          Object.assign(workOrder, { check_out_at: nowIso(), work_notes: body.work_notes ?? workOrder.work_notes, parts: body.parts ?? workOrder.parts, labor_minutes: body.labor_minutes ?? workOrder.labor_minutes })
          workOrder.version += 1
          break
        case 'complete': {
          const status = body.completion_status
          validation({
            ...(!['completed', 'partial', 'failed', 'rescheduled'].includes(status) && { completion_status: ['required'] }),
            ...(['partial', 'failed'].includes(status) && !body.failure_reason && { failure_reason: ['required'] }),
          })
          const details = { check_out_at: workOrder.check_out_at || nowIso(), work_notes: body.work_notes ?? workOrder.work_notes, parts: body.parts ?? workOrder.parts, labor_minutes: body.labor_minutes ?? workOrder.labor_minutes, signature_name: body.signature_name || null, failure_reason: body.failure_reason || null, completion_status: status }
          if (status === 'rescheduled') {
            release(workOrder.reservation_id)
            transition(workOrder, ['in_progress', 'on_the_way', 'scheduled'], 'new', { ...details, reservation_id: null, scheduled_start: null, scheduled_end: null }, body.failure_reason)
          } else {
            transition(workOrder, ['in_progress'], 'completed', details, body.failure_reason)
            if (status === 'completed') result = consumeEntitlement(workOrder)
          }
          break
        }
        case 'cancel':
          validation(String(body.reason || '').trim() ? {} : { reason: ['required'] })
          release(workOrder.reservation_id)
          transition(workOrder, ['new', 'scheduled', 'on_the_way'], 'cancelled', {}, body.reason)
          break
        default:
          throw notFound('Action')
      }
      return { data: { ...serializeWorkOrder(workOrder, { detail: true }), entitlement_result: result } }
    },
  },
]
