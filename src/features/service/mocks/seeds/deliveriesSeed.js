import { buildRecordsState } from './recordsSeed'
import { hoursAgo } from './seedUtils'

/**
 * Courier dispatch state per shipment record (spec §38.4) and COD remittances (§29.14).
 * One row per shipment; attempts / proof of delivery live as record entries.
 */
const PLAN = ['unassigned', 'unassigned', 'unassigned', 'assigned', 'assigned', 'out_for_delivery', 'out_for_delivery', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'failed', 'assigned', 'delivered', 'out_for_delivery']
const COURIERS = ['res-c1', 'res-c2', 'res-c3']

export function buildDeliveriesState(manifest) {
  if (manifest.template !== 'shipping') return { deliveries: [], remittances: [] }
  const { records, participants } = buildRecordsState(manifest)
  const deliveries = records.map((record, index) => {
    const status = PLAN[index % PLAN.length]
    const recipient = participants.find((entry) => entry.record_id === record.id && entry.role === 'recipient')
    const delivered = status === 'delivered'
    return {
      id: `dl-${index + 1}`,
      record_id: record.id,
      courier_id: status === 'unassigned' ? null : COURIERS[index % COURIERS.length],
      status,
      assigned_at: status === 'unassigned' ? null : hoursAgo(30 - index),
      recipient: recipient ? { name: recipient.name, phone: recipient.phone, address: recipient.data?.address || null } : null,
      cod_amount: Number(record.data?.cod_amount) || 0,
      cod_collected: delivered ? Number(record.data?.cod_amount) || 0 : null,
      delivered_at: delivered ? hoursAgo(20 - index) : null,
      pod: delivered ? { method: index % 2 ? 'otp' : 'signature', receiver_name: recipient?.name || null, at: hoursAgo(20 - index) } : null,
      attempts: status === 'failed' ? 3 : delivered && index % 3 === 0 ? 2 : delivered ? 1 : 0,
      remittance_id: null,
      version: 1,
    }
  })
  // One merchant already got a paid remittance for part of its collected COD; the rest is waiting.
  const firstDelivered = deliveries.find((entry) => entry.status === 'delivered')
  const merchant = records.find((record) => record.id === firstDelivered?.record_id)?.customer
  const remitted = deliveries.filter((entry) => entry.status === 'delivered' && records.find((record) => record.id === entry.record_id)?.customer_id === merchant?.id).slice(0, 2)
  remitted.forEach((entry) => (entry.remittance_id = 'rm-1'))
  const total = remitted.reduce((sum, entry) => sum + entry.cod_collected, 0)
  const remittances = merchant && remitted.length
    ? [{ id: 'rm-1', number: 'RM-2026-001', customer_id: merchant.id, customer: merchant, period: { from: hoursAgo(24 * 7), to: hoursAgo(12) }, lines: remitted.map((entry) => ({ delivery_id: entry.id, record_id: entry.record_id, amount: entry.cod_collected })), total_collected: total, fees_deducted: Math.round(remitted.length * 55 + total * 0.01), net_amount: total - Math.round(remitted.length * 55 + total * 0.01), status: 'paid', paid_at: hoursAgo(6), external_ref: 'TRX-88213', created_at: hoursAgo(10), created_by: { id: 'agent-4', name: 'كريم عادل' } }]
    : []
  return { deliveries, remittances }
}
