import { serviceEndpoints } from '../../core/api/endpoints'
import { portalEndpoints as P } from '../../core/api/portalEndpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { getMockCurrentUser, hoursAgo, mockId } from '../seeds/seedUtils'
import { buildCases } from '../seeds/casesSeed'
import { matchesSearch, nowIso, paginate } from '../utils'
import { findStatus } from '../state/caseConfig'
import { isLive, liveContent } from '../state/kbLive'
import { resolveSession } from '../state/portalAccess'
import { addActivity, serializeCase } from './casesHandlers'
import './assetsHandlers'
import './contractsHandlers'
import './kbHandlers'
import './recordsHandlers'

const I = serviceEndpoints.incidents
const STATUSES = ['investigating', 'identified', 'monitoring', 'resolved']
const SEVERITIES = ['minor', 'major', 'critical']
const validation = (errors) => {
  if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
}
const me = () => ({ id: getMockCurrentUser().id, name: getMockCurrentUser().name })
const pick = (label, lang = 'ar') => (label && typeof label === 'object' ? label[lang] || label.en || label.ar : label || '')

registerSeed('incidents', (manifest) => {
  const open = buildCases(manifest).filter((item) => !item.resolved_at && !item.closed_at).slice(0, 3)
  const title = { devices: 'انقطاع خدمة الدعم الفني في القاهرة', tourism: 'تأخير إصدار التأشيرات', school: 'عطل في تطبيق الباص', shipping: 'تأخير التسليم في الإسكندرية' }[manifest.template] || 'انقطاع في الخدمة'
  return [{
    id: 'inc-1',
    number: 'INC-2026-007',
    title,
    severity: 'major',
    status: 'identified',
    linked_case_ids: open.map((item) => item.id),
    updates: [
      { id: 'iu-2', status: 'identified', message: 'عرفنا السبب وجاري الإصلاح. التحديث الجاي خلال ساعتين.', public: true, at: hoursAgo(2), by: { id: 'agent-1', name: 'سارة محمود' } },
      { id: 'iu-1', status: 'investigating', message: 'بنحقق في زيادة الطلبات عن نفس المشكلة.', public: false, at: hoursAgo(5), by: { id: 'agent-1', name: 'سارة محمود' } },
    ],
    started_at: hoursAgo(5),
    resolved_at: null,
    owner: { id: 'agent-1', name: 'سارة محمود' },
  }]
})

const incidentOf = (caseId) => getCollection('incidents').find((entry) => entry.status !== 'resolved' && entry.linked_case_ids.includes(caseId))
function byId(id) {
  const incident = getCollection('incidents').find((entry) => entry.id === id)
  if (!incident) throw notFound('Incident')
  return incident
}
function serialize(incident, { detail = false } = {}) {
  const cases = getCollection('cases').filter((item) => incident.linked_case_ids.includes(item.id))
  const base = { ...incident, linked_count: cases.length, open_linked: cases.filter((item) => ['open', 'in_progress', 'pending'].includes(findStatus(item.status_id)?.category)).length }
  if (!detail) {
    const { updates, ...rest } = base
    return { ...rest, last_update: updates[0] || null }
  }
  return { ...base, cases: cases.map((item) => { const full = serializeCase(item); return { id: full.id, case_number: full.case_number, subject: full.subject, customer: full.customer, status: full.status } }) }
}

/** Grouped search (spec §F6 "Global Search موسع"): each group max 5, labels resolved for the UI language. */
function search(q, lang) {
  const text = String(q || '').trim()
  if (text.length < 2) return { query: text, groups: [] }
  const take = (list) => list.slice(0, 5)
  const recordType = (id) => getCollection('recordTypes').find((type) => type.id === id)
  const groups = [
    { key: 'cases', items: take(getCollection('cases').filter((item) => matchesSearch([item.case_number, item.subject, item.customer?.name, item.customer?.phone], text)).map((item) => ({ id: item.id, title: item.subject, subtitle: `${item.case_number} · ${item.customer?.name || ''}`, href: `/service/cases/${item.id}` }))) },
    { key: 'customers', items: take(getCollection('customers').filter((item) => matchesSearch([item.name, item.phone], text)).map((item) => ({ id: item.id, title: item.name, subtitle: item.phone, href: `/service/cases?q=${encodeURIComponent(item.phone || item.name)}` }))) },
    { key: 'records', items: take(getCollection('serviceRecords').filter((item) => matchesSearch([item.reference_no, item.title, item.customer?.name], text)).map((item) => ({ id: item.id, title: item.reference_no, subtitle: pick(recordType(item.record_type_id)?.label, lang), href: `/service/records/${recordType(item.record_type_id)?.key}/${item.id}` }))) },
    { key: 'assets', items: take(getCollection('assets').filter((item) => matchesSearch([item.serial_number, item.item_name, item.customer?.name], text)).map((item) => ({ id: item.id, title: item.serial_number, subtitle: `${item.item_name || ''} · ${item.customer?.name || ''}`, href: `/service/assets/${item.id}` }))) },
    { key: 'contracts', items: take(getCollection('contracts').filter((item) => matchesSearch([item.contract_number, item.customer?.name], text)).map((item) => ({ id: item.id, title: item.contract_number, subtitle: item.customer?.name, href: `/service/contracts/${item.id}` }))) },
    { key: 'articles', items: take(getCollection('kbArticles').filter((item) => matchesSearch([item.title, item.body, ...(item.tags || [])], text)).map((item) => ({ id: item.id, title: item.title, subtitle: isLive(item) ? liveContent(item).body.split('\n')[0] : '', href: `/service/knowledge/${item.id}` }))) },
  ].filter((group) => group.items.length)
  return { query: text, groups }
}

/** @type {import('../router').MockRoute[]} */
export const searchIncidentHandlers = [
  { method: 'GET', path: serviceEndpoints.search, handler: ({ query }) => ({ data: search(query.q, query.lang) }) },
  {
    method: 'GET',
    path: I,
    handler: ({ query }) => {
      const items = getCollection('incidents').filter((entry) => !query.status || (query.status === 'active' ? entry.status !== 'resolved' : entry.status === query.status)).sort((a, b) => String(b.started_at).localeCompare(String(a.started_at))).map((entry) => serialize(entry))
      return paginate(items, { per_page: 50, ...query })
    },
  },
  {
    method: 'POST',
    path: I,
    handler: ({ body = {} }) => {
      validation({ ...(!String(body.title || '').trim() && { title: ['required'] }), ...(!SEVERITIES.includes(body.severity) && { severity: ['required'] }) })
      const list = getCollection('incidents')
      const incident = { id: mockId('inc'), number: `INC-2026-${String(8 + list.length).padStart(3, '0')}`, title: body.title.trim(), severity: body.severity, status: 'investigating', linked_case_ids: [...new Set(body.case_ids || [])], updates: body.message ? [{ id: mockId('iu'), status: 'investigating', message: body.message, public: Boolean(body.public), at: nowIso(), by: me() }] : [], started_at: nowIso(), resolved_at: null, owner: me() }
      list.unshift(incident)
      incident.linked_case_ids.forEach((caseId) => addActivity(caseId, { type: 'field_change', metadata: { field: 'incident', value: incident.number } }))
      return { status: 201, body: { data: serialize(incident, { detail: true }) } }
    },
  },
  { method: 'GET', path: `${I}/:id`, handler: ({ params }) => ({ data: serialize(byId(params.id), { detail: true }) }) },
  {
    method: 'POST',
    path: `${I}/:id/updates`,
    handler: ({ params, body = {} }) => {
      const incident = byId(params.id)
      if (incident.status === 'resolved') throw new MockHttpError(409, 'INCIDENT_RESOLVED', 'Incident is resolved')
      validation({ ...(!STATUSES.includes(body.status) && { status: ['required'] }), ...(!String(body.message || '').trim() && { message: ['required'] }) })
      incident.updates.unshift({ id: mockId('iu'), status: body.status, message: body.message.trim(), public: Boolean(body.public), at: nowIso(), by: me() })
      incident.status = body.status
      if (body.status === 'resolved') incident.resolved_at = nowIso()
      // A public update is posted to every linked open request as a customer-visible message (server: messaging policy).
      if (body.public && body.notify_linked) incident.linked_case_ids.forEach((caseId) => addActivity(caseId, { type: 'reply', visibility: 'customer', body: body.message.trim(), metadata: { incident: incident.number } }))
      return { data: serialize(incident, { detail: true }) }
    },
  },
  {
    method: 'POST',
    path: `${I}/:id/link`,
    handler: ({ params, body = {} }) => {
      const incident = byId(params.id)
      const cases = getCollection('cases')
      const ids = (body.case_numbers || []).map((number) => cases.find((item) => item.case_number === String(number).trim() || item.id === number)?.id).filter(Boolean)
      validation(ids.length ? {} : { case_numbers: ['not_found'] })
      ids.filter((id) => !incident.linked_case_ids.includes(id)).forEach((id) => {
        incident.linked_case_ids.push(id)
        addActivity(id, { type: 'field_change', metadata: { field: 'incident', value: incident.number } })
      })
      return { data: serialize(incident, { detail: true }) }
    },
  },
  {
    method: 'GET',
    path: P.incidents,
    handler: ({ headers }) => {
      resolveSession(headers)
      return { data: getCollection('incidents').filter((entry) => entry.status !== 'resolved').map((entry) => ({ id: entry.id, title: entry.title, status: entry.status, update: entry.updates.find((update) => update.public) || null })).filter((entry) => entry.update) }
    },
  },
]

/** Case payload helper: the active incident a case is linked to (for the case banner). */
export const caseIncident = (caseId) => {
  const incident = incidentOf(caseId)
  return incident ? { id: incident.id, number: incident.number, title: incident.title, status: incident.status } : null
}
