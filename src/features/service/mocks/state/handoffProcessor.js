import { getCollection } from '../db'
import { mockId } from '../seeds/seedUtils'
import { getPipeline } from './caseConfig'
import { nowIso } from '../utils'

/**
 * Mock of the backend Handoff Processor (spec §32). Idempotent per
 * (contract_id, contract_version): lines already fulfilled are skipped.
 * A line without fulfillment config / record type → `needs_review` with an
 * error; everything else that can be created is created.
 */
const RECORD_BACKED = ['booking', 'enrollment', 'shipment', 'project']
const itemById = (id) => getCollection('catalogItems').find((item) => item.id === id)
const itemTypeOf = (item) => getCollection('itemTypes').find((type) => type.id === item?.service_config?.item_type_id)
const capability = (item, code) => itemTypeOf(item)?.capabilities?.find((entry) => entry.code === code)

function createForLine(contract, line) {
  const item = itemById(line.item_id)
  const creates = item?.service_config?.fulfillment?.creates
  if (!item || !creates) return { error: 'MISSING_FULFILLMENT_CONFIG' }
  const customer = contract.customer
  const created = []

  if (creates === 'asset') {
    for (let n = 0; n < line.quantity; n += 1) {
      const assetId = mockId('asset')
      getCollection('assets').push({
        id: assetId,
        customer_id: customer.id,
        customer,
        item_id: item.id,
        item_name: item.name,
        asset_type: itemTypeOf(item)?.key || 'asset',
        name: item.name,
        serial_number: null,
        model_number: null,
        purchase_date: contract.signed_at || nowIso(),
        installation_date: null,
        status: 'active',
        location: {},
        linked_case_ids: [],
        transfers: [],
        contract_id: contract.id,
        version: 1,
      })
      created.push({ type: 'asset', id: assetId, label: item.name })
      const warranty = capability(item, 'warranty')
      if (warranty) {
        const months = Number(warranty.config?.months) || 12
        const warrantyId = mockId('war')
        const ends = new Date()
        ends.setMonth(ends.getMonth() + months)
        getCollection('warranties').push({ id: warrantyId, asset_id: assetId, type: 'standard', source_type: 'contract', source_id: contract.id, starts_at: nowIso(), ends_at: ends.toISOString(), coverage: { parts: true, labor: true }, status: 'active' })
        getCollection('entitlements').push({ id: mockId('ent'), customer_id: customer.id, asset_id: assetId, warranty_id: warrantyId, type: 'warranty_service', quota: null, period: 'per_term', starts_at: nowIso(), ends_at: ends.toISOString(), case_type_ids: [], sla_policy_id: null, source_type: 'warranty', source_id: warrantyId, status: 'active', version: 1 })
        created.push({ type: 'warranty', id: warrantyId, label: item.name })
      }
    }
  } else if (RECORD_BACKED.includes(creates)) {
    const type = getCollection('recordTypes').find((entry) => entry.id === item.service_config.fulfillment.record_type_id)
    if (!type) return { error: 'MISSING_RECORD_TYPE' }
    const pipeline = getPipeline(type.pipeline_id)
    const recordId = mockId('rec')
    getCollection('serviceRecords').push({
      id: recordId,
      record_type_id: type.id,
      reference_no: `${type.key.slice(0, 2).toUpperCase()}-${contract.contract_number}`,
      customer_id: customer.id,
      customer,
      status_id: pipeline.statuses.find((status) => status.is_initial).id,
      pipeline_version_id: pipeline.version_id,
      batch_id: null,
      assigned_user_id: null,
      source_type: 'contract_line',
      source_id: line.id,
      starts_at: contract.start_date,
      ends_at: contract.end_date,
      expected_at: null,
      data: {},
      created_at: nowIso(),
      updated_at: nowIso(),
      version: 1,
    })
    created.push({ type: creates, id: recordId, label: item.name, record_type_key: type.key })
  } else if (creates === 'subscription') {
    const entitlements = capability(item, 'entitlements')
    const subscriptionId = mockId('sub')
    created.push({ type: 'subscription', id: subscriptionId, label: item.name })
    if (entitlements) {
      const entitlementId = mockId('ent')
      getCollection('entitlements').push({ id: entitlementId, customer_id: customer.id, asset_id: null, warranty_id: null, type: Number(entitlements.config?.visits_per_year) ? 'visits' : 'support', quota: Number(entitlements.config?.visits_per_year) || null, period: 'per_year', starts_at: contract.start_date, ends_at: contract.end_date, case_type_ids: [], sla_policy_id: null, source_type: 'subscription', source_id: subscriptionId, status: 'active', version: 1 })
      created.push({ type: 'entitlement', id: entitlementId, label: item.name })
    }
  } else if (creates === 'work_order') {
    created.push({ type: 'work_order', id: mockId('wo'), label: item.name })
  }
  return { created }
}

/** Runs the processor for a contract; creates or updates its handoff. */
export function processHandoff(contract, { onlyLines } = {}) {
  const handoffs = getCollection('handoffs')
  let handoff = handoffs.find((entry) => entry.contract_id === contract.id)
  if (!handoff) {
    const type = getCollection('contractTypes').find((entry) => entry.id === contract.type_id)
    handoff = {
      id: mockId('ho'),
      contract_id: contract.id,
      contract_version: contract.effective_version,
      customer_id: contract.customer_id,
      status: 'pending',
      sales_owner: contract.sales_owner || null,
      cs_owner: null,
      notes: null,
      promises: [],
      checklist: (type?.checklist || []).map((entry) => ({ ...entry, done: false })),
      created_entities: [],
      errors: [],
      amendments_applied: [],
      created_at: nowIso(),
      version: 1,
    }
    handoffs.push(handoff)
  }
  const lines = contract.items.filter((line) => (onlyLines ? onlyLines.includes(line.id) : line.fulfillment_status !== 'fulfilled'))
  const errors = []
  lines.forEach((line) => {
    const result = createForLine(contract, line)
    if (result.error) {
      errors.push({ line_id: line.id, code: result.error, item: line.name })
      line.fulfillment_status = 'needs_review'
    } else {
      handoff.created_entities.push(...result.created.map((entry) => ({ ...entry, line_id: line.id })))
      line.fulfillment_status = 'fulfilled'
    }
  })
  handoff.errors = [...handoff.errors.filter((error) => !lines.some((line) => line.id === error.line_id)), ...errors]
  if (handoff.errors.length) handoff.status = 'needs_review'
  else if (handoff.status === 'needs_review') handoff.status = 'pending'
  handoff.version += 1
  return handoff
}
