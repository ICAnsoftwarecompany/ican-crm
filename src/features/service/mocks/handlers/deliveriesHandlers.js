import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildDeliveriesState } from '../seeds/deliveriesSeed'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { matchesSearch, nowIso, paginate } from '../utils'
import './recordsHandlers'
import './schedulingHandlers'

registerSeed('deliveries', (manifest) => buildDeliveriesState(manifest).deliveries)
registerSeed('codRemittances', (manifest) => buildDeliveriesState(manifest).remittances)

const D = serviceEndpoints.deliveries
const RM = serviceEndpoints.codRemittances
const OUTCOMES = ['delivered', 'no_answer', 'wrong_address', 'refused', 'rescheduled']
const MAX_ATTEMPTS = 3
// Mock pricing only: the real fees come from the merchant plan / ERP.
const FEE_PER_SHIPMENT = 55
const COD_FEE_PERCENT = 1
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const conflict = (code, message) => new MockHttpError(409, code, message)
const me = () => ({ id: getMockCurrentUser().id, name: getMockCurrentUser().name })

function recordOf(delivery) {
  return getCollection('serviceRecords').find((entry) => entry.id === delivery.record_id)
}
function serialize(delivery) {
  const record = recordOf(delivery)
  const courier = getCollection('resources').find((entry) => entry.id === delivery.courier_id)
  return {
    ...delivery,
    reference_no: record?.reference_no,
    merchant: record?.customer ? { id: record.customer.id, name: record.customer.name } : null,
    city: record?.data?.city || null,
    expected_at: record?.expected_at || null,
    courier: courier ? { id: courier.id, name: courier.name, zones: courier.zones } : null,
  }
}
function byRecord(recordId) {
  const delivery = getCollection('deliveries').find((entry) => entry.record_id === recordId || entry.id === recordId)
  if (!delivery) throw notFound('Delivery')
  return delivery
}
function addEntry(delivery, entryType, value, note) {
  getCollection('recordEntries').push({ id: mockId('entry'), record_id: delivery.record_id, entry_type: entryType, occurred_at: nowIso(), value, note: note || null, participant_id: null, created_by: me() })
}

/** Collected COD not yet remitted, grouped per merchant. */
function unremitted() {
  const groups = new Map()
  getCollection('deliveries')
    .filter((entry) => entry.status === 'delivered' && entry.cod_collected > 0 && !entry.remittance_id)
    .forEach((entry) => {
      const merchant = recordOf(entry)?.customer
      if (!merchant) return
      const group = groups.get(merchant.id) || { customer: { id: merchant.id, name: merchant.name }, count: 0, total_collected: 0, delivery_ids: [] }
      group.count += 1
      group.total_collected += entry.cod_collected
      group.delivery_ids.push(entry.id)
      groups.set(merchant.id, group)
    })
  return [...groups.values()].map((group) => {
    const fees = Math.round(group.count * FEE_PER_SHIPMENT + (group.total_collected * COD_FEE_PERCENT) / 100)
    return { ...group, fees_deducted: fees, net_amount: group.total_collected - fees }
  })
}

/** @type {import('../router').MockRoute[]} */
export const deliveriesHandlers = [
  {
    method: 'GET',
    path: D,
    handler: ({ query }) => {
      const all = getCollection('deliveries').map(serialize)
      const summary = {
        unassigned: all.filter((entry) => entry.status === 'unassigned').length,
        assigned: all.filter((entry) => entry.status === 'assigned').length,
        out_for_delivery: all.filter((entry) => entry.status === 'out_for_delivery').length,
        delivered: all.filter((entry) => entry.status === 'delivered').length,
        failed: all.filter((entry) => entry.status === 'failed').length,
        cod_to_remit: unremitted().reduce((sum, group) => sum + group.total_collected, 0),
      }
      const items = all
        .filter((entry) => !query.status || entry.status === query.status)
        .filter((entry) => !query.courier_id || entry.courier_id === query.courier_id)
        .filter((entry) => matchesSearch([entry.reference_no, entry.merchant?.name, entry.recipient?.name, entry.recipient?.phone, entry.city], query.search))
      return { ...paginate(items, query), summary }
    },
  },
  {
    method: 'POST',
    path: `${D}/:id/assign`,
    handler: ({ params, body = {} }) => {
      const delivery = byRecord(params.id)
      if (!['unassigned', 'assigned', 'out_for_delivery'].includes(delivery.status)) throw conflict('DELIVERY_INVALID_STATE', delivery.status)
      const courier = getCollection('resources').find((entry) => entry.id === body.courier_id && entry.type === 'courier')
      validation(courier ? {} : { courier_id: ['required'] })
      const load = getCollection('deliveries').filter((entry) => entry.courier_id === courier.id && ['assigned', 'out_for_delivery'].includes(entry.status) && entry.id !== delivery.id).length
      if (courier.daily_capacity && load >= courier.daily_capacity) throw conflict('COURIER_AT_CAPACITY', 'Courier is full for today')
      Object.assign(delivery, { courier_id: courier.id, status: delivery.status === 'unassigned' ? 'assigned' : delivery.status, assigned_at: nowIso() })
      delivery.version += 1
      return { data: serialize(delivery) }
    },
  },
  {
    method: 'POST',
    path: `${D}/:id/out-for-delivery`,
    handler: ({ params }) => {
      const delivery = byRecord(params.id)
      if (delivery.status !== 'assigned') throw conflict('DELIVERY_INVALID_STATE', delivery.status)
      Object.assign(delivery, { status: 'out_for_delivery', out_at: nowIso() })
      delivery.version += 1
      return { data: serialize(delivery) }
    },
  },
  {
    method: 'POST',
    path: `${D}/:id/attempts`,
    handler: ({ params, body = {} }) => {
      const delivery = byRecord(params.id)
      if (delivery.status !== 'out_for_delivery') throw conflict('DELIVERY_INVALID_STATE', delivery.status)
      validation(OUTCOMES.includes(body.outcome) ? {} : { outcome: ['required'] })
      delivery.attempts += 1
      addEntry(delivery, 'delivery_attempt', body.outcome, body.note)
      if (body.outcome === 'delivered') {
        const pod = body.pod || {}
        const collected = Number(body.cod_collected)
        validation({
          ...(!['signature', 'photo', 'otp'].includes(pod.method) && { pod_method: ['required'] }),
          ...(!String(pod.receiver_name || '').trim() && { receiver_name: ['required'] }),
          // The server verifies the OTP sent to the recipient; the mock accepts any 4 digits.
          ...(pod.method === 'otp' && !/^\d{4}$/.test(String(pod.otp || '')) && { otp: ['invalid'] }),
          ...(delivery.cod_amount > 0 && collected !== delivery.cod_amount && { cod_collected: ['cod_mismatch'] }),
        })
        Object.assign(delivery, { status: 'delivered', delivered_at: nowIso(), pod: { method: pod.method, receiver_name: pod.receiver_name, at: nowIso() }, cod_collected: delivery.cod_amount > 0 ? collected : null })
        addEntry(delivery, 'proof_of_delivery', pod.method, pod.receiver_name)
      } else {
        // After the last allowed attempt the shipment fails (a workflow opens a "Delivery issue" case on the server).
        delivery.status = delivery.attempts >= MAX_ATTEMPTS ? 'failed' : 'assigned'
      }
      delivery.version += 1
      return { data: serialize(delivery) }
    },
  },

  // COD remittances
  { method: 'GET', path: `${RM}/pending`, handler: () => ({ data: unremitted() }) },
  {
    method: 'GET',
    path: RM,
    handler: ({ query }) => paginate(getCollection('codRemittances').filter((entry) => !query.status || entry.status === query.status), query),
  },
  {
    method: 'POST',
    path: RM,
    handler: ({ body = {} }) => {
      const group = unremitted().find((entry) => entry.customer.id === body.customer_id)
      if (!group) throw conflict('NOTHING_TO_REMIT', 'No collected COD waiting for this merchant')
      const id = mockId('rm')
      const deliveries = getCollection('deliveries').filter((entry) => group.delivery_ids.includes(entry.id))
      deliveries.forEach((entry) => (entry.remittance_id = id))
      const remittance = {
        id,
        number: `RM-2026-${String(getCollection('codRemittances').length + 1).padStart(3, '0')}`,
        customer_id: group.customer.id,
        customer: group.customer,
        period: { from: deliveries.map((entry) => entry.delivered_at).sort()[0], to: nowIso() },
        lines: deliveries.map((entry) => ({ delivery_id: entry.id, record_id: entry.record_id, amount: entry.cod_collected })),
        total_collected: group.total_collected,
        fees_deducted: group.fees_deducted,
        net_amount: group.net_amount,
        status: 'draft',
        paid_at: null,
        external_ref: null,
        created_at: nowIso(),
        created_by: me(),
      }
      getCollection('codRemittances').unshift(remittance)
      return { status: 201, body: { data: remittance } }
    },
  },
  {
    method: 'POST',
    path: `${RM}/:id/pay`,
    handler: ({ params, body = {} }) => {
      const remittance = getCollection('codRemittances').find((entry) => entry.id === params.id)
      if (!remittance) throw notFound('Remittance')
      if (remittance.status !== 'draft') throw conflict('REMITTANCE_INVALID_STATE', remittance.status)
      Object.assign(remittance, { status: 'paid', paid_at: nowIso(), external_ref: body.external_ref || null })
      return { data: remittance }
    },
  },
  {
    method: 'DELETE',
    path: `${RM}/:id`,
    handler: ({ params }) => {
      const list = getCollection('codRemittances')
      const index = list.findIndex((entry) => entry.id === params.id)
      if (index < 0) throw notFound('Remittance')
      if (list[index].status !== 'draft') throw conflict('REMITTANCE_INVALID_STATE', list[index].status)
      getCollection('deliveries').filter((entry) => entry.remittance_id === params.id).forEach((entry) => (entry.remittance_id = null))
      list.splice(index, 1)
      return { status: 204, body: null }
    },
  },
]
