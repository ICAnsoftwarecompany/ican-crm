import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection } from '../db'
import { MockHttpError, notFound } from '../errors'
import { getMockCurrentUser, mockId } from '../seeds/seedUtils'
import { nowIso, paginate } from '../utils'
import { getPipeline } from '../state/caseConfig'
import { buildErrorFile, parseCsv, validateImport } from '../state/importEngine'
import './assetsHandlers'
import './catalogHandlers'
import './recordsHandlers'

const I = serviceEndpoints.imports
const MAX_ROWS = 10000
const MAX_BYTES = 5 * 1024 * 1024
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const normalizePhone = (value) => String(value || '').replace(/[\s-]/g, '')
const customerByPhone = (phone) => getCollection('customers').find((entry) => normalizePhone(entry.phone) === phone)
const recordType = (key) => getCollection('recordTypes').find((entry) => entry.key === key)
const MONEY_TYPES = { money: 'money', number: 'number', date: 'date' }

/** Importable entities: every active record type, plus assets when the tenant sells serial-tracked items. */
function entities() {
  const list = getCollection('recordTypes').filter((type) => type.active !== false).map((type) => ({ entity_type: 'record', scope_id: type.key, label: type.label }))
  if (getCollection('catalogItems').some((item) => item.service_config?.fulfillment?.creates === 'asset')) list.push({ entity_type: 'asset', scope_id: null, label: null })
  return list
}

function fieldsFor(entityType, scopeId) {
  if (entityType === 'asset') {
    return [
      { key: 'serial_number', type: 'text', required: true, matchable: true },
      { key: 'customer_phone', type: 'phone', required: true },
      { key: 'item', type: 'text', required: true },
      { key: 'installation_date', type: 'date' },
      { key: 'address', type: 'text' },
    ]
  }
  const type = recordType(scopeId)
  if (!type) throw notFound('Record type')
  const hasRecipient = (type.participant_roles || []).some((role) => role.key === 'recipient')
  return [
    { key: 'reference_no', type: 'text', matchable: true },
    { key: 'customer_phone', type: 'phone', required: true },
    { key: 'starts_at', type: 'date' },
    { key: 'expected_at', type: 'date' },
    ...(hasRecipient ? [{ key: 'recipient_name', type: 'text' }, { key: 'recipient_phone', type: 'phone' }] : []),
    ...(type.fields || []).map((field) => ({ key: `data.${field.key}`, label: field.label, type: MONEY_TYPES[field.type] || 'text' })),
  ]
}

function lookupsFor(entityType, scopeId) {
  const items = getCollection('catalogItems')
  return {
    findExisting: (value) => (entityType === 'asset' ? getCollection('assets').find((entry) => entry.serial_number === value) : getCollection('serviceRecords').find((entry) => entry.reference_no === value && recordType(scopeId)?.id === entry.record_type_id)),
    resolve: (key, value) => {
      if (key === 'customer_phone') {
        const customer = customerByPhone(value)
        return customer ? { value: customer } : { error: 'customer_not_found' }
      }
      if (key === 'item') {
        const needle = String(value).toLowerCase()
        const item = items.find((entry) => entry.id === value || [entry.name?.ar, entry.name?.en].some((name) => String(name || '').toLowerCase() === needle))
        return item && item.service_config?.fulfillment?.creates === 'asset' ? { value: item } : { error: 'item_not_found' }
      }
      return null
    },
  }
}

function applyRow(job, entry) {
  const { values } = entry
  const customer = values.customer_phone
  if (job.entity_type === 'asset') {
    const existing = getCollection('assets').find((asset) => asset.serial_number === values.serial_number)
    const patch = { customer_id: customer.id, customer: { id: customer.id, name: customer.name, phone: customer.phone }, item_id: values.item.id, item_name: values.item.name, name: values.item.name, installation_date: values.installation_date ? `${values.installation_date}T00:00:00.000Z` : existing?.installation_date || null, ...(values.address ? { location: { address: values.address } } : {}) }
    if (existing) Object.assign(existing, patch, { version: existing.version + 1 })
    else getCollection('assets').push({ id: mockId('asset'), serial_number: values.serial_number, model_number: null, purchase_date: null, status: 'active', linked_case_ids: [], transfers: [], location: { address: values.address || '' }, asset_type: null, ...patch, source: { type: 'import', id: job.id }, version: 1 })
    return
  }
  const type = recordType(job.scope_id)
  const data = Object.fromEntries(Object.entries(values).filter(([key]) => key.startsWith('data.')).map(([key, value]) => [key.slice(5), value]))
  const existing = values.reference_no ? getCollection('serviceRecords').find((record) => record.reference_no === values.reference_no && record.record_type_id === type.id) : null
  const dates = { ...(values.starts_at && { starts_at: `${values.starts_at}T00:00:00.000Z` }), ...(values.expected_at && { expected_at: `${values.expected_at}T00:00:00.000Z` }) }
  let record = existing
  if (existing) Object.assign(existing, { ...dates, customer_id: customer.id, customer: { id: customer.id, name: customer.name, phone: customer.phone }, data: { ...existing.data, ...data }, updated_at: nowIso(), version: existing.version + 1 })
  else {
    const pipeline = getPipeline(type.pipeline_id)
    record = { id: mockId('rec'), record_type_id: type.id, reference_no: values.reference_no || `${type.key.slice(0, 2).toUpperCase()}-2026-${String(2000 + getCollection('serviceRecords').length)}`, customer_id: customer.id, customer: { id: customer.id, name: customer.name, phone: customer.phone }, status_id: pipeline.statuses.find((status) => status.is_initial).id, pipeline_version_id: pipeline.version_id, batch_id: null, assigned_user_id: null, source_type: 'import', source_id: job.id, starts_at: null, ends_at: null, expected_at: null, ...dates, data, created_at: nowIso(), updated_at: nowIso(), version: 1 }
    getCollection('serviceRecords').push(record)
  }
  if (values.recipient_name && !getCollection('recordParticipants').some((entry) => entry.record_id === record.id && entry.role === 'recipient')) {
    getCollection('recordParticipants').push({ id: mockId('part'), record_id: record.id, role: 'recipient', name: values.recipient_name, phone: values.recipient_phone || null, identifier: null, data: {} })
  }
}

const summary = ({ results, rows, headers, ...job }) => job

/** @type {import('../router').MockRoute[]} */
export const importsHandlers = [
  { method: 'GET', path: `${I}/entities`, handler: () => ({ data: entities() }) },
  { method: 'GET', path: `${I}/fields`, handler: ({ query }) => ({ data: fieldsFor(query.entity_type, query.scope_id) }) },
  {
    method: 'GET',
    path: `${I}/mappings`,
    handler: ({ query }) => ({ data: getCollection('importMappings').filter((entry) => entry.entity_type === query.entity_type && (entry.scope_id || null) === (query.scope_id || null)) }),
  },
  {
    method: 'POST',
    path: `${I}/files`,
    handler: ({ body = {} }) => {
      const content = String(body.content || '')
      validation({ ...(!/\.csv$/i.test(body.file_name || '') && { file: ['csv_only'] }), ...(content.length > MAX_BYTES && { file: ['too_large'] }) })
      const parsed = parseCsv(content)
      validation({ ...(!parsed.headers.length && { file: ['empty'] }), ...(parsed.rows.length > MAX_ROWS && { file: ['too_many_rows'] }) })
      const file = { id: mockId('file'), file_name: body.file_name, headers: parsed.headers, rows: parsed.rows, created_at: nowIso() }
      getCollection('importFiles').push(file)
      return { status: 201, body: { data: { file_id: file.id, file_name: file.file_name, headers: file.headers, sample: file.rows.slice(0, 5), row_count: file.rows.length } } }
    },
  },
  { method: 'GET', path: I, handler: ({ query }) => paginate(getCollection('importJobs').map(summary).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))), query) },
  {
    method: 'POST',
    path: I,
    handler: ({ body = {} }) => {
      const file = getCollection('importFiles').find((entry) => entry.id === body.file_id)
      validation({ ...(!file && { file_id: ['required'] }), ...(!['record', 'asset'].includes(body.entity_type) && { entity_type: ['required'] }), ...(!['create', 'upsert'].includes(body.mode) && { mode: ['required'] }) })
      const fields = fieldsFor(body.entity_type, body.scope_id)
      const matchKey = body.match_key && fields.find((field) => field.key === body.match_key && field.matchable) ? body.match_key : null
      validation(body.mode === 'upsert' && !matchKey ? { match_key: ['required'] } : {})
      const check = validateImport({ fields, mapping: body.mapping, headers: file.headers, rows: file.rows, mode: body.mode, matchKey, lookups: lookupsFor(body.entity_type, body.scope_id) })
      const me = getMockCurrentUser()
      const job = {
        id: mockId('imp'),
        entity_type: body.entity_type,
        scope_id: body.scope_id || null,
        file_id: file.id,
        file_name: file.file_name,
        mode: body.mode,
        match_key: matchKey,
        mapping: body.mapping,
        status: 'validated',
        dry_run: true,
        total: check.total,
        valid: check.valid,
        failed: check.failed,
        to_create: check.to_create,
        to_update: check.to_update,
        succeeded: 0,
        errors_preview: check.results.filter((entry) => entry.errors.length).slice(0, 50).map((entry) => ({ row: entry.row, errors: entry.errors })),
        created_by: { id: me.id, name: me.name },
        created_at: nowIso(),
        completed_at: null,
        results: check.results,
        rows: file.rows,
        headers: file.headers,
      }
      getCollection('importJobs').push(job)
      if (String(body.save_mapping_as || '').trim()) getCollection('importMappings').push({ id: mockId('map'), entity_type: job.entity_type, scope_id: job.scope_id, name: body.save_mapping_as.trim(), columns: body.mapping, match_key: matchKey, mode: body.mode })
      return { status: 201, body: { data: summary(job) } }
    },
  },
  {
    method: 'GET',
    path: `${I}/:id/error-file`,
    handler: ({ params }) => {
      const job = getCollection('importJobs').find((entry) => entry.id === params.id)
      if (!job) throw notFound('Import')
      return { data: { file_name: job.file_name.replace(/\.csv$/i, '-errors.csv'), content: buildErrorFile(job.headers, job.rows, job.results, (error) => `${error.field}: ${error.code}`) } }
    },
  },
  {
    method: 'GET',
    path: `${I}/:id`,
    handler: ({ params }) => {
      const job = getCollection('importJobs').find((entry) => entry.id === params.id)
      if (!job) throw notFound('Import')
      return { data: summary(job) }
    },
  },
  {
    method: 'POST',
    path: `${I}/:id/execute`,
    handler: ({ params }) => {
      const job = getCollection('importJobs').find((entry) => entry.id === params.id)
      if (!job) throw notFound('Import')
      if (job.status !== 'validated') throw new MockHttpError(409, 'IMPORT_ALREADY_RUN', 'This import already ran')
      if (!job.valid) throw new MockHttpError(409, 'IMPORT_NOTHING_VALID', 'No valid rows')
      // The server runs this asynchronously in batches (tenant fairness) and emits one event per record.
      job.results.filter((entry) => !entry.errors.length).forEach((entry) => applyRow(job, entry))
      Object.assign(job, { status: job.failed ? 'completed_with_errors' : 'completed', dry_run: false, succeeded: job.valid, completed_at: nowIso() })
      return { data: summary(job) }
    },
  },
]
