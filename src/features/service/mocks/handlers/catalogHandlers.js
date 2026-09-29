import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, required, requiredLabel } from '../crud'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { CAPABILITY_REGISTRY, FULFILLMENT_CREATES, SERVICE_MODELS, buildCatalogItems, buildItemTypes, buildRecordTypes } from '../seeds/catalogSeed'
import { matchesSearch, nowIso } from '../utils'
import '../state/caseConfig'

registerSeed('itemTypes', buildItemTypes)
registerSeed('recordTypes', buildRecordTypes)
registerSeed('catalogItems', buildCatalogItems)

const { settings } = serviceEndpoints
const RECORD_BACKED = ['booking', 'enrollment', 'shipment', 'project']
const collectionOrEmpty = (name) => {
  try {
    return getCollection(name) || []
  } catch {
    return []
  }
}
const uniqueKey = (name) => (body, { existing, items }) =>
  items.some((item) => item.key === body.key && item.id !== existing?.id) ? { key: ['taken'] } : {}
const inUse = (predicate, message, code = 'RESOURCE_IN_USE') => (item) => {
  if (predicate(item)) throw new MockHttpError(409, code, message)
}

/** Capabilities must exist in the registry and have their `depends_on` enabled too. */
function validateCapabilities(capabilities = []) {
  const codes = capabilities.map((entry) => entry.code)
  const unknown = codes.filter((code) => !CAPABILITY_REGISTRY.some((entry) => entry.code === code))
  if (unknown.length) return { capabilities: ['invalid'] }
  const missing = capabilities.flatMap((entry) =>
    (CAPABILITY_REGISTRY.find((registry) => registry.code === entry.code)?.depends_on || []).filter((code) => !codes.includes(code))
  )
  return missing.length ? { capabilities: ['depends_on'] } : {}
}

/** Pipelines: exactly one initial status, transitions between known statuses, keys unique. */
function validatePipeline(body) {
  const statuses = body.statuses || []
  const ids = new Set(statuses.map((status) => status.id))
  const keys = statuses.map((status) => status.key)
  const errors = {}
  if (requiredLabel(body.label)) errors.label = ['required']
  if (!statuses.length || statuses.some((status) => !status.key || requiredLabel(status.label))) errors.statuses = ['required']
  else if (new Set(keys).size !== keys.length) errors.statuses = ['taken']
  else if (statuses.filter((status) => status.is_initial).length !== 1) errors.statuses = ['initial']
  if ((body.transitions || []).some((transition) => !ids.has(transition.from) || !ids.has(transition.to))) errors.transitions = ['invalid']
  return errors
}

/** A status still used by a case or record cannot be removed (rename/recolor is fine). */
function assertStatusesKept(existing, body) {
  if (!existing || !body.statuses) return
  const kept = new Set(body.statuses.map((status) => status.id))
  const removed = existing.statuses.filter((status) => !kept.has(status.id)).map((status) => status.id)
  const used = [...collectionOrEmpty('cases'), ...collectionOrEmpty('serviceRecords')].some((item) => removed.includes(item.status_id))
  if (used) throw new MockHttpError(409, 'PIPELINE_STATUS_IN_USE', 'A removed status is still used')
}

/** Server-side id assignment for statuses created in the editor (`tmp-*`), remapping transitions. */
function assignStatusIds(pipelineId, body) {
  if (!body.statuses) return body
  const map = {}
  const statuses = body.statuses.map((status) => {
    if (!String(status.id || '').startsWith('tmp-') && status.id) return status
    const id = `${pipelineId}-${status.key}`
    map[status.id] = id
    return { ...status, id }
  })
  const transitions = (body.transitions || []).map((transition) => ({ ...transition, from: map[transition.from] || transition.from, to: map[transition.to] || transition.to }))
  return { ...body, statuses, transitions }
}

function serializeItem(item) {
  const type = getCollection('itemTypes').find((entry) => entry.id === item.service_config.item_type_id)
  return { ...item, item_type: type ? { id: type.id, key: type.key, name: type.name, kind: type.kind, service_model_preset: type.service_model_preset } : null }
}

function validateServiceConfig(config = {}) {
  const errors = {}
  const fulfillment = config.fulfillment || {}
  if (!FULFILLMENT_CREATES.includes(fulfillment.creates || 'none')) errors['fulfillment.creates'] = ['invalid']
  if (RECORD_BACKED.includes(fulfillment.creates) && !fulfillment.record_type_id) errors['fulfillment.record_type_id'] = ['required']
  const items = getCollection('catalogItems')
  if ((config.relations || []).some((relation) => !items.some((item) => item.id === relation.child_item_id))) errors.relations = ['invalid']
  if (config.item_type_id && !getCollection('itemTypes').some((type) => type.id === config.item_type_id)) errors.item_type_id = ['invalid']
  return errors
}

/** @type {import('../router').MockRoute[]} */
export const catalogHandlers = [
  { method: 'GET', path: serviceEndpoints.catalogCapabilities, handler: () => ({ data: CAPABILITY_REGISTRY }) },
  { method: 'GET', path: serviceEndpoints.catalogServiceModels, handler: () => ({ data: SERVICE_MODELS }) },

  ...crudHandlers({
    collection: 'itemTypes',
    path: settings.itemTypes,
    prefix: 'it',
    validate: (body, context) => ({
      ...(requiredLabel(body.name) && { name: ['required'] }),
      ...(required(body.key) && { key: ['required'] }),
      ...(!['product', 'service', 'plan', 'bundle'].includes(body.kind) && { kind: ['required'] }),
      ...uniqueKey()(body, context),
      ...validateCapabilities(body.capabilities),
    }),
    canDelete: inUse((type) => getCollection('catalogItems').some((item) => item.service_config.item_type_id === type.id), 'Item type used by catalog items'),
  }),

  ...crudHandlers({
    collection: 'recordTypes',
    path: settings.recordTypes,
    prefix: 'rt',
    validate: (body, context) => ({
      ...(requiredLabel(body.label) && { label: ['required'] }),
      ...(required(body.key) && { key: ['required'] }),
      ...(!body.pipeline_id && { pipeline_id: ['required'] }),
      ...uniqueKey()(body, context),
    }),
    canDelete: inUse((type) => collectionOrEmpty('serviceRecords').some((record) => record.record_type_id === type.id), 'Record type has records'),
  }),

  ...crudHandlers({
    collection: 'pipelines',
    path: settings.pipelines,
    prefix: 'pl',
    validate: (body) => validatePipeline(body),
    canDelete: inUse(
      (pipeline) =>
        getCollection('caseTypes').some((type) => type.pipeline_id === pipeline.id) ||
        getCollection('recordTypes').some((type) => type.pipeline_id === pipeline.id),
      'Pipeline is used by a type'
    ),
  }).map((route) => {
    if (route.method === 'PATCH') {
      // Every saved change is a new version; running cases/records keep their pipeline_version_id.
      return {
        ...route,
        handler: (context) => {
          const existing = getCollection('pipelines').find((pipeline) => pipeline.id === context.params.id)
          assertStatusesKept(existing, context.body || {})
          const version = (existing?.version || 1) + 1
          const body = assignStatusIds(context.params.id, context.body || {})
          return route.handler({ ...context, body: { ...body, version, version_id: `${context.params.id}-v${version}` } })
        },
      }
    }
    if (route.method === 'POST') {
      return {
        ...route,
        handler: (context) => {
          const key = String(context.body?.key || 'custom').replace(/[^a-z0-9_]/gi, '_')
          return route.handler({ ...context, body: { transitions: [], ...assignStatusIds(`pl-${key}`, context.body || {}), version: 1, version_id: `pl-${key}-v1` } })
        },
      }
    }
    return route
  }),

  {
    method: 'GET',
    path: serviceEndpoints.catalogItems,
    handler: ({ query }) => ({
      data: getCollection('catalogItems')
        .filter((item) => !query.kind || item.kind === query.kind)
        .filter((item) => matchesSearch([item.name?.ar, item.name?.en], query.search))
        .map(serializeItem),
    }),
  },
  {
    method: 'GET',
    path: `${serviceEndpoints.catalogItems}/:id`,
    handler: ({ params }) => {
      const item = getCollection('catalogItems').find((entry) => entry.id === params.id)
      if (!item) throw notFound('Item')
      return { data: serializeItem(item) }
    },
  },
  {
    method: 'PATCH',
    path: `${serviceEndpoints.catalogItems}/:id`,
    handler: ({ params, body = {} }) => {
      const item = getCollection('catalogItems').find((entry) => entry.id === params.id)
      if (!item) throw notFound('Item')
      const config = { ...item.service_config, ...(body.service_config || {}) }
      const errors = validateServiceConfig(config)
      if (Object.keys(errors).length) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', errors)
      item.service_config = config
      item.updated_at = nowIso()
      return { data: serializeItem(item) }
    },
  },
]
