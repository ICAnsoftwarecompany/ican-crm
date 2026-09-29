import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, requiredLabel, required } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildContractTypes, buildContractsState } from '../seeds/contractsSeed'
import { getCaseSetup } from '../state/caseConfig'
import { processHandoff } from '../state/handoffProcessor'
import { createScheduleFromContract } from '../state/billingSchedules'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { matchesSearch, nowIso, paginate } from '../utils'
import { findOrAdoptCustomer } from './casesHandlers'
import './assetsHandlers'
import './recordsHandlers'

registerSeed('contractTypes', buildContractTypes)
registerSeed('contracts', (manifest) => buildContractsState(manifest).contracts)
registerSeed('handoffs', (manifest) => buildContractsState(manifest).handoffs)

const C = serviceEndpoints.contracts
const H = serviceEndpoints.handoffs
const SIGNED = ['signed', 'active', 'expiring', 'expired', 'terminated', 'renewed']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const conflict = (code, message) => new MockHttpError(409, code, message)
const byId = (collection, id, label) => {
  const found = getCollection(collection).find((entry) => entry.id === id)
  if (!found) throw notFound(label)
  return found
}
const checkVersion = (item, version) => {
  if (version != null && Number(version) !== item.version) throw conflict('CONFLICT_VERSION', 'Changed')
}
const touch = (item) => {
  item.version += 1
  item.updated_at = nowIso()
}

function buildLines(items = []) {
  const catalog = getCollection('catalogItems')
  return items.map((line, index) => {
    const item = catalog.find((entry) => entry.id === line.item_id)
    const quantity = Math.max(Number(line.quantity) || 1, 1)
    const unitPrice = line.unit_price != null ? Number(line.unit_price) : item?.price || 0
    const discount = Number(line.discount) || 0
    return { id: line.id || mockId(`line${index}`), item_id: line.item_id, name: item?.name || line.name, kind: item?.kind, quantity, unit_price: unitPrice, discount, total: unitPrice * quantity - discount, fulfillment_status: 'pending' }
  })
}

function serializeContract(contract, { detail = false } = {}) {
  const type = getCollection('contractTypes').find((entry) => entry.id === contract.type_id)
  const handoff = getCollection('handoffs').find((entry) => entry.contract_id === contract.id)
  const schedule = getCollection('paymentSchedules').filter((entry) => entry.contract_id === contract.id).find((entry) => !entry.replaced_by_schedule_id)
  const base = { ...contract, payment_schedule: schedule ? { id: schedule.id, schedule_number: schedule.schedule_number, status: schedule.status } : null, type: type ? { id: type.id, key: type.key, label: type.label, requires_signature: type.requires_signature } : null, handoff: handoff ? { id: handoff.id, status: handoff.status } : null }
  if (!detail) {
    const { items, versions, signatures, amendments, parties, ...rest } = base
    return { ...rest, items_count: items.length }
  }
  return base
}

function serializeHandoff(handoff) {
  const contract = getCollection('contracts').find((entry) => entry.id === handoff.contract_id)
  return { ...handoff, contract: contract ? { id: contract.id, contract_number: contract.contract_number, total_value: contract.total_value, currency: contract.currency, status: contract.status } : null, customer: contract?.customer || null }
}

/** Customer + company signatures complete the version; then the handoff runs. */
function sign(contract, body) {
  if (!['sent', 'partially_signed'].includes(contract.status)) throw conflict('CONTRACT_NOT_SIGNABLE', 'Send the contract before signing')
  validation({ ...(!['customer', 'company'].includes(body.signer_type) && { signer_type: ['required'] }), ...(!String(body.signer_name || '').trim() && { signer_name: ['required'] }) })
  if (contract.signatures.some((entry) => entry.version === contract.effective_version && entry.signer_type === body.signer_type)) throw conflict('ALREADY_SIGNED', 'Already signed by this party')
  contract.signatures.push({ version: contract.effective_version, signer_type: body.signer_type, signer_name: body.signer_name, method: body.method || 'e_sign', signed_at: nowIso() })
  const signedBy = new Set(contract.signatures.filter((entry) => entry.version === contract.effective_version).map((entry) => entry.signer_type))
  if (signedBy.has('customer') && signedBy.has('company')) {
    contract.status = 'signed'
    contract.signed_at = nowIso()
    contract.versions.forEach((version) => version.version === contract.effective_version && (version.status = 'signed'))
    processHandoff(contract)
    createScheduleFromContract(contract)
  } else contract.status = 'partially_signed'
}

/** @type {import('../router').MockRoute[]} */
export const contractsHandlers = [
  ...crudHandlers({
    collection: 'contractTypes',
    path: serviceEndpoints.settings.contractTypes,
    prefix: 'ctt',
    validate: (body) => ({ ...(requiredLabel(body.label) && { label: ['required'] }), ...(required(body.key) && { key: ['required'] }) }),
    canDelete: (type) => {
      if (getCollection('contracts').some((contract) => contract.type_id === type.id)) throw conflict('RESOURCE_IN_USE', 'Type has contracts')
    },
  }),

  {
    method: 'GET',
    path: C,
    handler: ({ query }) => {
      const items = getCollection('contracts')
        .filter((contract) => !query.status || contract.status === query.status)
        .filter((contract) => !query.customer_id || String(contract.customer_id) === String(query.customer_id))
        .filter((contract) => matchesSearch([contract.contract_number, contract.customer?.name], query.search))
        .sort((a, b) => String(b.start_date).localeCompare(String(a.start_date)))
      const page = paginate(items, query)
      return { data: page.data.map((contract) => serializeContract(contract)), meta: page.meta }
    },
  },
  {
    method: 'POST',
    path: C,
    handler: ({ body = {} }) => {
      const customer = findOrAdoptCustomer(body.customer_id)
      const type = getCollection('contractTypes').find((entry) => entry.id === body.type_id)
      validation({ ...(!customer && { customer_id: ['required'] }), ...(!type && { type_id: ['required'] }), ...(!body.items?.length && { items: ['required'] }) })
      const items = buildLines(body.items)
      const contract = {
        id: mockId('ctr'),
        contract_number: `CT-2026-${String(300 + getCollection('contracts').length)}`,
        type_id: type.id,
        customer_id: customer.id,
        customer: { id: customer.id, name: customer.name, phone: customer.phone },
        deal_id: body.deal_id || null,
        payment_plan_id: body.payment_plan_id || null,
        plan_overrides: body.plan_overrides || null,
        start_date: body.start_date || nowIso(),
        end_date: body.end_date || null,
        status: 'draft',
        currency: 'EGP',
        total_value: items.reduce((sum, line) => sum + line.total, 0),
        renewal_type: body.renewal_type || type.renewal_type,
        signed_at: null,
        activated_at: null,
        effective_version: 1,
        parent_contract_id: body.parent_contract_id || null,
        parties: [{ party_type: 'customer', name: customer.name, role: 'buyer' }, { party_type: 'company', name: 'ICAN', role: 'seller' }],
        items,
        versions: [{ version: 1, status: 'draft', summary: { ar: 'النسخة الأولى', en: 'First version' }, created_at: nowIso() }],
        signatures: [],
        amendments: [],
        terminated_reason: null,
        sales_owner: getMockCurrentUser(),
        version: 1,
      }
      getCollection('contracts').push(contract)
      return { status: 201, body: { data: serializeContract(contract, { detail: true }) } }
    },
  },
  { method: 'GET', path: `${C}/:id`, handler: ({ params }) => ({ data: serializeContract(byId('contracts', params.id, 'Contract'), { detail: true }) }) },
  {
    method: 'PATCH',
    path: `${C}/:id`,
    handler: ({ params, body = {} }) => {
      const contract = byId('contracts', params.id, 'Contract')
      checkVersion(contract, body.version)
      // Signed versions are immutable snapshots: changes after signing go through amendments.
      if (SIGNED.includes(contract.status) || contract.status === 'partially_signed') throw conflict('CONTRACT_LOCKED', 'Signed contracts change through amendments')
      if (body.items) {
        contract.items = buildLines(body.items)
        contract.total_value = contract.items.reduce((sum, line) => sum + line.total, 0)
      }
      ;['start_date', 'end_date', 'renewal_type'].forEach((field) => body[field] !== undefined && (contract[field] = body[field]))
      if (contract.status === 'sent') {
        // Editing a sent contract creates a new version to re-send.
        contract.effective_version += 1
        contract.versions.push({ version: contract.effective_version, status: 'draft', summary: body.version_note || { ar: 'تعديل', en: 'Revision' }, created_at: nowIso() })
        contract.status = 'draft'
      }
      touch(contract)
      return { data: serializeContract(contract, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: `${C}/:id/:action`,
    handler: ({ params, body = {} }) => {
      const contract = byId('contracts', params.id, 'Contract')
      checkVersion(contract, body.version)
      switch (params.action) {
        case 'send':
          if (contract.status !== 'draft') throw conflict('CONTRACT_INVALID_STATE', 'Only drafts can be sent')
          contract.status = 'sent'
          contract.versions.forEach((version) => version.version === contract.effective_version && (version.status = 'sent'))
          break
        case 'sign':
          sign(contract, body)
          break
        case 'activate':
          if (contract.status !== 'signed') throw conflict('CONTRACT_INVALID_STATE', 'Sign before activating')
          Object.assign(contract, { status: 'active', activated_at: nowIso() })
          break
        case 'terminate':
          if (!['active', 'expiring', 'signed'].includes(contract.status)) throw conflict('CONTRACT_INVALID_STATE', 'Not active')
          validation({ ...(!String(body.reason || '').trim() && { reason: ['required'] }) })
          Object.assign(contract, { status: 'terminated', terminated_reason: body.reason })
          break
        case 'cancel':
          if (SIGNED.includes(contract.status)) throw conflict('CONTRACT_INVALID_STATE', 'Signed contracts are terminated, not cancelled')
          contract.status = 'cancelled'
          break
        case 'renew': {
          if (!['active', 'expiring', 'expired'].includes(contract.status)) throw conflict('CONTRACT_INVALID_STATE', 'Nothing to renew')
          const renewal = {
            ...structuredClone(contract),
            id: mockId('ctr'),
            contract_number: `CT-2026-${String(300 + getCollection('contracts').length)}`,
            status: 'draft',
            signed_at: null,
            activated_at: null,
            effective_version: 1,
            parent_contract_id: contract.id,
            versions: [{ version: 1, status: 'draft', summary: { ar: 'تجديد', en: 'Renewal' }, created_at: nowIso() }],
            signatures: [],
            amendments: [],
            items: contract.items.map((line) => ({ ...line, id: mockId('line'), fulfillment_status: 'pending' })),
            version: 1,
          }
          getCollection('contracts').push(renewal)
          contract.status = 'renewed'
          touch(contract)
          return { status: 201, body: { data: serializeContract(renewal, { detail: true }) } }
        }
        case 'amendments': {
          if (!SIGNED.includes(contract.status) || ['terminated', 'renewed'].includes(contract.status)) throw conflict('CONTRACT_INVALID_STATE', 'Amend signed contracts only')
          validation({ ...(requiredLabel(body.summary) && !String(body.summary || '').trim() && { summary: ['required'] }), ...(!body.changes?.add_items?.length && !body.changes?.end_date && { changes: ['required'] }) })
          contract.amendments.push({ id: mockId('amd'), number: contract.amendments.length + 1, summary: body.summary, changes: body.changes, status: 'draft', effective_date: body.effective_date || nowIso(), signed_at: null })
          break
        }
        default:
          throw notFound('Action')
      }
      touch(contract)
      return { data: serializeContract(contract, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: `${C}/:id/amendments/:amendmentId/sign`,
    handler: ({ params }) => {
      const contract = byId('contracts', params.id, 'Contract')
      const amendment = contract.amendments.find((entry) => entry.id === params.amendmentId)
      if (!amendment) throw notFound('Amendment')
      if (amendment.status === 'signed') throw conflict('ALREADY_SIGNED', 'Amendment already signed')
      Object.assign(amendment, { status: 'signed', signed_at: nowIso() })
      // Apply only the difference; the processor handles the new lines.
      const added = buildLines(amendment.changes?.add_items || [])
      contract.items.push(...added)
      contract.total_value = contract.items.reduce((sum, line) => sum + line.total, 0)
      if (amendment.changes?.end_date) contract.end_date = amendment.changes.end_date
      if (added.length) {
        const handoff = processHandoff(contract, { onlyLines: added.map((line) => line.id) })
        handoff.amendments_applied.push({ amendment_id: amendment.id, number: amendment.number, lines: added.map((line) => line.id), applied_at: nowIso() })
      }
      touch(contract)
      return { data: serializeContract(contract, { detail: true }) }
    },
  },

  // Handoffs
  {
    method: 'GET',
    path: H,
    handler: ({ query }) => {
      const all = getCollection('handoffs')
      const items = all.filter((entry) => !query.status || entry.status === query.status).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      const counts = Object.fromEntries(['pending', 'needs_review', 'accepted', 'active', 'rejected'].map((status) => [status, all.filter((entry) => entry.status === status).length]))
      const page = paginate(items, query)
      return { data: page.data.map(serializeHandoff), meta: { ...page.meta, counts } }
    },
  },
  { method: 'GET', path: `${H}/:id`, handler: ({ params }) => ({ data: serializeHandoff(byId('handoffs', params.id, 'Handoff')) }) },
  {
    method: 'PATCH',
    path: `${H}/:id`,
    handler: ({ params, body = {} }) => {
      const handoff = byId('handoffs', params.id, 'Handoff')
      checkVersion(handoff, body.version)
      ;['checklist', 'notes', 'promises'].forEach((field) => body[field] !== undefined && (handoff[field] = body[field]))
      handoff.version += 1
      return { data: serializeHandoff(handoff) }
    },
  },
  {
    method: 'POST',
    path: `${H}/:id/:action`,
    handler: ({ params, body = {} }) => {
      const handoff = byId('handoffs', params.id, 'Handoff')
      checkVersion(handoff, body.version)
      if (params.action === 'accept') {
        if (!['pending', 'needs_review'].includes(handoff.status)) throw conflict('HANDOFF_INVALID_STATE', 'Already handled')
        if (handoff.errors.length) throw conflict('HANDOFF_HAS_ERRORS', 'Resolve review items first')
        const agent = getCaseSetup().agents.find((entry) => entry.id === body.cs_owner_id)
        validation({ ...(!agent && { cs_owner_id: ['required'] }) })
        Object.assign(handoff, { status: 'accepted', cs_owner: { id: agent.id, name: agent.name } })
      } else if (params.action === 'reject') {
        if (!['pending', 'needs_review'].includes(handoff.status)) throw conflict('HANDOFF_INVALID_STATE', 'Already handled')
        validation({ ...(!String(body.reason || '').trim() && { reason: ['required'] }) })
        Object.assign(handoff, { status: 'rejected', rejection_reason: body.reason })
      } else if (params.action === 'reprocess') {
        const contract = byId('contracts', handoff.contract_id, 'Contract')
        processHandoff(contract, { onlyLines: handoff.errors.map((error) => error.line_id) })
      } else throw notFound('Action')
      handoff.version += 1
      return { data: serializeHandoff(handoff) }
    },
  },
]
