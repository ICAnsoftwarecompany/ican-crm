import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { buildRecordsState } from '../seeds/recordsSeed'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { findStatus, getCaseSetup, getPipeline } from '../state/caseConfig'
import { matchesSearch, nowIso, paginate } from '../utils'
import './catalogHandlers'
import { findOrAdoptCustomer } from './casesHandlers'

const seeded = (key) => (manifest) => buildRecordsState(manifest)[key]
registerSeed('serviceRecords', seeded('records'))
registerSeed('serviceBatches', seeded('batches'))
registerSeed('recordParticipants', seeded('participants'))
registerSeed('recordComponents', seeded('components'))
registerSeed('recordEntries', seeded('entries'))
registerSeed('recordDocuments', seeded('documents'))
registerSeed('recordTimeline', seeded('timeline'))

const R = serviceEndpoints.records
const B = serviceEndpoints.batches
const OPEN = ['open', 'in_progress', 'pending']
const COMPONENT_STATUSES = ['requested', 'pending_supplier', 'confirmed', 'issued', 'completed', 'cancelled']

const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const typeOf = (id) => getCollection('recordTypes').find((type) => type.id === id || type.key === id)
const pipelineOf = (type) => getPipeline(type?.pipeline_id)

function getRecord(id) {
  const record = getCollection('serviceRecords').find((entry) => entry.id === id)
  if (!record) throw notFound('Record')
  return record
}

function assertVersion(item, version) {
  if (version != null && Number(version) !== item.version) throw new MockHttpError(409, 'CONFLICT_VERSION', 'Changed by someone else')
}

function touch(item) {
  item.version += 1
  item.updated_at = nowIso()
}

function addTimeline(recordId, event) {
  const me = getMockCurrentUser()
  const entry = { id: mockId('tl'), subject_type: 'record', subject_id: recordId, title: null, body: null, visibility: 'internal', actor: { type: 'user', name: me.name }, payload: {}, occurred_at: nowIso(), ...event }
  getCollection('recordTimeline').push(entry)
  return entry
}

function serializeRecord(record, { detail = false } = {}) {
  const type = typeOf(record.record_type_id)
  const status = findStatus(record.status_id)
  const batch = getCollection('serviceBatches').find((entry) => entry.id === record.batch_id)
  const agent = getCaseSetup().agents.find((entry) => entry.id === record.assigned_user_id)
  const participants = getCollection('recordParticipants').filter((entry) => entry.record_id === record.id)
  const components = getCollection('recordComponents').filter((entry) => entry.record_id === record.id)
  const documents = getCollection('recordDocuments').filter((entry) => entry.record_id === record.id)
  const base = {
    ...record,
    record_type: type ? { id: type.id, key: type.key, label: type.label, icon: type.icon } : null,
    status: status ? { id: status.id, key: status.key, label: status.label, category: status.category } : null,
    batch: batch ? { id: batch.id, reference_no: batch.reference_no, name: batch.name } : null,
    assigned_user: agent ? { id: agent.id, name: agent.name } : null,
    counts: {
      participants: participants.length,
      components: components.length,
      components_pending: components.filter((entry) => ['requested', 'pending_supplier'].includes(entry.status)).length,
      documents_missing: documents.filter((entry) => ['missing', 'rejected'].includes(entry.status)).length,
    },
  }
  return detail ? { ...base, participants } : base
}

function listRecords(query) {
  const type = query.type ? typeOf(query.type) : null
  const items = getCollection('serviceRecords')
    .filter((record) => !type || record.record_type_id === type.id)
    .filter((record) => !query.batch_id || record.batch_id === query.batch_id)
    .filter((record) => !query.customer_id || String(record.customer_id) === String(query.customer_id))
    .filter((record) => {
      const category = findStatus(record.status_id)?.category
      if (query.view === 'active') return OPEN.includes(category)
      if (query.view === 'done') return !OPEN.includes(category)
      if (query.view === 'attention') {
        const counts = serializeRecord(record).counts
        return OPEN.includes(category) && (counts.documents_missing > 0 || counts.components_pending > 0)
      }
      return true
    })
    .filter((record) => !query.status_id || record.status_id === query.status_id)
    .filter((record) => {
      const people = getCollection('recordParticipants').filter((entry) => entry.record_id === record.id).map((entry) => entry.name)
      return matchesSearch([record.reference_no, record.customer?.name, ...people], query.search)
    })
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
  const page = paginate(items, query)
  return { data: page.data.map((record) => serializeRecord(record)), meta: page.meta }
}

function transitionRecord(record, toStatusId) {
  const pipeline = pipelineOf(typeOf(record.record_type_id))
  const allowed = pipeline?.transitions.some((transition) => transition.from === record.status_id && transition.to === toStatusId)
  if (!allowed) throw new MockHttpError(409, 'RECORD_TRANSITION_NOT_ALLOWED', 'Transition not allowed')
  const to = findStatus(toStatusId)
  record.status_id = toStatusId
  touch(record)
  addTimeline(record.id, { event_type: 'status_change', visibility: 'customer', payload: { to: { key: to.key, label: to.label } } })
}

/** Nested CRUD under a record (participants, components). */
function nested(collection, path, prefix, validate, { onCreate } = {}) {
  const list = (recordId) => getCollection(collection).filter((entry) => entry.record_id === recordId)
  const find = (recordId, id) => {
    const found = list(recordId).find((entry) => entry.id === id)
    if (!found) throw notFound(collection)
    return found
  }
  return [
    { method: 'GET', path: `${R}/:id/${path}`, handler: ({ params }) => (getRecord(params.id), { data: list(params.id) }) },
    {
      method: 'POST',
      path: `${R}/:id/${path}`,
      handler: ({ params, body = {} }) => {
        const record = getRecord(params.id)
        validation(validate(body, record))
        const created = { ...body, id: mockId(prefix), record_id: record.id, version: 1 }
        getCollection(collection).push(created)
        onCreate?.(created, record)
        touch(record)
        return { status: 201, body: { data: created } }
      },
    },
    {
      method: 'PATCH',
      path: `${R}/:id/${path}/:itemId`,
      handler: ({ params, body = {} }) => {
        const record = getRecord(params.id)
        const item = find(params.id, params.itemId)
        validation(validate({ ...item, ...body }, record))
        Object.assign(item, body, { id: item.id, record_id: item.record_id, version: (item.version || 1) + 1 })
        touch(record)
        return { data: item }
      },
    },
    {
      method: 'DELETE',
      path: `${R}/:id/${path}/:itemId`,
      handler: ({ params }) => {
        const record = getRecord(params.id)
        const items = getCollection(collection)
        items.splice(items.indexOf(find(params.id, params.itemId)), 1)
        touch(record)
        return { status: 204, body: null }
      },
    },
  ]
}

const validateParticipant = (body, record) => {
  const role = typeOf(record.record_type_id)?.participant_roles.find((entry) => entry.key === body.role)
  const errors = {}
  if (!String(body.name || '').trim()) errors.name = ['required']
  if (!role) errors.role = ['required']
  else {
    const others = getCollection('recordParticipants').filter((entry) => entry.record_id === record.id && entry.role === role.key && entry.id !== body.id)
    if (others.length + 1 > role.max) errors.role = ['max']
  }
  return errors
}

const validateComponent = (body, record) => {
  const allowed = typeOf(record.record_type_id)?.component_types.some((entry) => entry.key === body.component_type)
  return {
    ...(!allowed && { component_type: ['required'] }),
    ...(!COMPONENT_STATUSES.includes(body.status) && { status: ['required'] }),
    ...(body.sell_amount != null && Number(body.sell_amount) < 0 && { sell_amount: ['invalid'] }),
  }
}

function serializeBatch(batch) {
  const records = getCollection('serviceRecords').filter((record) => record.batch_id === batch.id)
  const type = typeOf(batch.record_type_id)
  return { ...batch, record_type: type ? { id: type.id, key: type.key, label: type.label, batch_label: type.batch_label } : null, records_count: records.length }
}

/** @type {import('../router').MockRoute[]} */
export const recordsHandlers = [
  {
    method: 'GET',
    path: `${R}/setup`,
    handler: ({ query }) => {
      const types = getCollection('recordTypes').filter((type) => type.active !== false)
      return {
        data: {
          record_types: types.map((type) => {
            const pipeline = pipelineOf(type)
            return { ...type, pipeline: pipeline ? { version_id: pipeline.version_id, statuses: pipeline.statuses, transitions: pipeline.transitions } : null }
          }),
          agents: getCaseSetup().agents,
          document_types: ['passport', 'national_id', 'photo', 'birth_certificate', 'visa'],
          component_statuses: COMPONENT_STATUSES,
          selected: query.type || types[0]?.key || null,
        },
      }
    },
  },
  {
    method: 'GET',
    path: `${R}/summary`,
    handler: ({ query }) => {
      const views = Object.fromEntries(['active', 'attention', 'done', 'all'].map((view) => [view, listRecords({ ...query, view, per_page: 1 }).meta.total]))
      return { data: { views } }
    },
  },
  { method: 'GET', path: R, handler: ({ query }) => listRecords(query) },
  {
    method: 'POST',
    path: R,
    handler: ({ body = {} }) => {
      const type = typeOf(body.record_type_id)
      const customer = findOrAdoptCustomer(body.customer_id)
      validation({ ...(!type && { record_type_id: ['required'] }), ...(!customer && { customer_id: ['required'] }) })
      const pipeline = pipelineOf(type)
      const initial = pipeline.statuses.find((status) => status.is_initial)
      const count = getCollection('serviceRecords').length
      const record = {
        id: mockId('rec'),
        record_type_id: type.id,
        reference_no: `${type.key.slice(0, 2).toUpperCase()}-2026-${String(2000 + count)}`,
        customer_id: customer.id,
        customer: { id: customer.id, name: customer.name, phone: customer.phone },
        status_id: initial.id,
        pipeline_version_id: pipeline.version_id,
        batch_id: body.batch_id || null,
        assigned_user_id: body.assigned_user_id || null,
        source_type: 'manual',
        starts_at: body.starts_at || null,
        ends_at: body.ends_at || null,
        expected_at: body.expected_at || null,
        data: body.data || {},
        created_at: nowIso(),
        updated_at: nowIso(),
        version: 1,
      }
      getCollection('serviceRecords').push(record)
      addTimeline(record.id, { event_type: 'created', payload: { source: 'manual' } })
      return { status: 201, body: { data: serializeRecord(record, { detail: true }) } }
    },
  },
  { method: 'GET', path: `${R}/:id`, handler: ({ params }) => ({ data: serializeRecord(getRecord(params.id), { detail: true }) }) },
  {
    method: 'PATCH',
    path: `${R}/:id`,
    handler: ({ params, body = {} }) => {
      const record = getRecord(params.id)
      assertVersion(record, body.version)
      ;['starts_at', 'ends_at', 'expected_at', 'assigned_user_id', 'batch_id', 'data'].forEach((field) => {
        if (body[field] !== undefined) record[field] = body[field]
      })
      touch(record)
      return { data: serializeRecord(record, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: `${R}/:id/transition`,
    handler: ({ params, body = {} }) => {
      const record = getRecord(params.id)
      assertVersion(record, body.version)
      transitionRecord(record, body.to_status_id)
      return { data: serializeRecord(record, { detail: true }) }
    },
  },
  ...nested('recordParticipants', 'participants', 'part', validateParticipant),
  ...nested('recordComponents', 'components', 'comp', validateComponent),
  {
    method: 'GET',
    path: `${R}/:id/entries`,
    handler: ({ params }) => ({
      data: getCollection('recordEntries').filter((entry) => entry.record_id === getRecord(params.id).id).sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at))),
    }),
  },
  {
    method: 'POST',
    path: `${R}/:id/entries`,
    handler: ({ params, body = {} }) => {
      const record = getRecord(params.id)
      const allowed = typeOf(record.record_type_id)?.entry_types.some((entry) => entry.key === body.entry_type)
      validation({ ...(!allowed && { entry_type: ['required'] }), ...(!String(body.value ?? '').trim() && { value: ['required'] }) })
      const me = getMockCurrentUser()
      const entry = { id: mockId('entry'), record_id: record.id, entry_type: body.entry_type, value: String(body.value), note: body.note || null, participant_id: body.participant_id || null, occurred_at: body.occurred_at || nowIso(), created_by: { id: me.id, name: me.name } }
      getCollection('recordEntries').push(entry)
      touch(record)
      return { status: 201, body: { data: entry } }
    },
  },
  { method: 'GET', path: `${R}/:id/documents`, handler: ({ params }) => ({ data: getCollection('recordDocuments').filter((entry) => entry.record_id === getRecord(params.id).id) }) },
  {
    method: 'POST',
    path: `${R}/:id/documents/:docId/:action`,
    handler: ({ params, body = {} }) => {
      const record = getRecord(params.id)
      const doc = getCollection('recordDocuments').find((entry) => entry.id === params.docId && entry.record_id === record.id)
      if (!doc) throw notFound('Document')
      if (params.action === 'upload') Object.assign(doc, { status: 'uploaded', file_name: body.file_name || 'document.pdf', rejection_reason: null })
      else if (params.action === 'verify') {
        if (doc.status !== 'uploaded') throw new MockHttpError(409, 'DOCUMENT_NOT_UPLOADED', 'Nothing to verify')
        doc.status = 'verified'
      } else if (params.action === 'reject') {
        validation({ ...(!String(body.reason || '').trim() && { reason: ['required'] }) })
        Object.assign(doc, { status: 'rejected', rejection_reason: body.reason })
      } else throw notFound('Action')
      touch(record)
      return { data: doc }
    },
  },
  {
    method: 'GET',
    path: `${R}/:id/timeline`,
    handler: ({ params }) => ({
      data: getCollection('recordTimeline').filter((entry) => entry.subject_id === getRecord(params.id).id).sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at))),
    }),
  },
  {
    method: 'POST',
    path: `${R}/:id/updates`,
    handler: ({ params, body = {} }) => {
      const record = getRecord(params.id)
      validation({ ...(!String(body.body || '').trim() && { body: ['required'] }) })
      const entry = addTimeline(record.id, { event_type: 'customer_update', body: body.body.trim(), visibility: 'customer', payload: { sent_via: body.notify ? body.channel || 'whatsapp' : null } })
      return { status: 201, body: { data: entry } }
    },
  },

  // Batches
  {
    method: 'GET',
    path: B,
    handler: ({ query }) => {
      const type = query.type ? typeOf(query.type) : null
      return { data: getCollection('serviceBatches').filter((batch) => !type || batch.record_type_id === type.id).map(serializeBatch) }
    },
  },
  {
    method: 'POST',
    path: B,
    handler: ({ body = {} }) => {
      const type = typeOf(body.record_type_id)
      validation({
        ...(!type?.batch_enabled && { record_type_id: ['required'] }),
        ...(!String(body.name?.ar || body.name?.en || '').trim() && { name: ['required'] }),
      })
      const batch = { id: mockId('batch'), record_type_id: type.id, reference_no: `B-${getCollection('serviceBatches').length + 101}`, name: body.name, customer_id: body.customer_id || null, status: 'open', starts_at: body.starts_at || null, capacity: body.capacity || null, version: 1 }
      getCollection('serviceBatches').push(batch)
      return { status: 201, body: { data: serializeBatch(batch) } }
    },
  },
  {
    method: 'GET',
    path: `${B}/:id`,
    handler: ({ params }) => {
      const batch = getCollection('serviceBatches').find((entry) => entry.id === params.id)
      if (!batch) throw notFound('Batch')
      return { data: serializeBatch(batch) }
    },
  },
  {
    method: 'POST',
    path: `${B}/:id/bulk-status`,
    handler: ({ params, body = {} }) => {
      const batch = getCollection('serviceBatches').find((entry) => entry.id === params.id)
      if (!batch) throw notFound('Batch')
      const results = { updated: [], skipped: [] }
      getCollection('serviceRecords')
        .filter((record) => record.batch_id === batch.id)
        .forEach((record) => {
          try {
            transitionRecord(record, body.to_status_id)
            results.updated.push(record.id)
          } catch {
            results.skipped.push(record.id)
          }
        })
      return { data: results }
    },
  },
]
