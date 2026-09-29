import { serviceEndpoints } from '../../core/api/endpoints'
import { crudHandlers, required, requiredLabel } from '../crud'
import { getCollection } from '../db'
import { MockHttpError } from '../errors'
import '../state/caseConfig'

const inUse = (predicate, message) => (item) => {
  if (predicate(item)) throw new MockHttpError(409, 'RESOURCE_IN_USE', message)
}

const { settings } = serviceEndpoints

/** Settings CRUD for operations configuration (F2). */
export const settingsHandlers = [
  ...crudHandlers({
    collection: 'caseTypes',
    path: settings.caseTypes,
    prefix: 'ct',
    validate: (body, { existing, items }) => ({
      ...(requiredLabel(body.label) && { label: ['required'] }),
      ...(required(body.key) && { key: ['required'] }),
      ...(items.some((item) => item.key === body.key && item.id !== existing?.id) && { key: ['taken'] }),
    }),
    canDelete: inUse((type) => getCollection('cases').some((item) => item.type_id === type.id), 'Case type has cases'),
  }),
  ...crudHandlers({
    collection: 'queues',
    path: settings.queues,
    prefix: 'q',
    validate: (body) => ({ ...(requiredLabel(body.label) && { label: ['required'] }) }),
    canDelete: inUse((queue) => getCollection('cases').some((item) => item.queue_id === queue.id), 'Queue has cases'),
  }),
  ...crudHandlers({
    collection: 'slaPolicies',
    path: settings.slaPolicies,
    prefix: 'sla',
    validate: (body) => ({
      ...(requiredLabel(body.name) && { name: ['required'] }),
      ...(!(Number(body.first_response_minutes) > 0) && { first_response_minutes: ['required'] }),
      ...(!(Number(body.resolution_minutes) > 0) && { resolution_minutes: ['required'] }),
    }),
    canDelete: inUse((policy) => getCollection('caseTypes').some((type) => type.sla_policy_id === policy.id), 'SLA policy pinned by a case type'),
  }),
  ...crudHandlers({
    collection: 'businessCalendars',
    path: settings.businessCalendars,
    prefix: 'cal',
    validate: (body) => ({ ...(requiredLabel(body.name) && { name: ['required'] }) }),
    canDelete: inUse((calendar) => getCollection('slaPolicies').some((policy) => policy.business_calendar_id === calendar.id), 'Calendar used by an SLA policy'),
  }),
  ...crudHandlers({
    collection: 'escalationRules',
    path: settings.escalationRules,
    prefix: 'esc',
    validate: (body) => ({
      ...(requiredLabel(body.name) && { name: ['required'] }),
      ...(required(body.triggers) && { triggers: ['required'] }),
    }),
  }),
]
