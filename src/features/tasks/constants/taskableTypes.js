/**
 * "Taskable" = the CRM record a task is linked to (lead, customer, and later deal, campaign...).
 * A task with no taskable is a personal task / To-Do.
 *
 * The UI, URLs and code use a short alias ('lead', 'customer'). Only the API layer converts it with
 * `toBackendTaskableType()`. Today the backend stores the Laravel class name (`App\Models\Lead`);
 * when it adopts `Relation::morphMap()` with the same aliases, change `model` to the alias here —
 * nothing else in the frontend changes.
 *
 * Adding an entity (e.g. deals): call `registerTaskableType({ id: 'deal', model: 'App\\Models\\Deal',
 * labelKey: 'tasks.taskable.types.deal', getPath })` and add the label key in ar + en.
 * `getPath(link, task)` returns the page of the linked record, or null when it cannot be resolved.
 * `fromRecord(record)` (optional) turns a Leads Center record (`/customers/data` row) into this type's
 * id; types that have it get the search picker in the task form, the others a plain id field.
 */

const registry = new Map()

export function registerTaskableType({ id, model, labelKey, getPath = null, fromRecord = null }) {
  if (!id || !model || !labelKey) throw new Error('A taskable type needs an id, a model and a labelKey')
  registry.set(id, { id, model, labelKey, getPath, fromRecord })
}

export function getTaskableType(value) {
  const alias = resolveTaskableAlias(value)
  return alias ? registry.get(alias) : null
}

// The lead/customer details page (`/leads/:customerId`) takes the CRM customer id. A customer link
// is that id; a lead link only knows its lead id, so it resolves the page through the lead's
// customer when the backend includes it on `task.taskable`, otherwise there is no link.
const customerRecordPath = (customerId) => (customerId ? `/leads/${customerId}` : null)

registerTaskableType({
  id: 'lead',
  model: 'App\\Models\\Lead',
  labelKey: 'tasks.taskable.types.lead',
  getPath: (link, task) => customerRecordPath(task?.taskable?.customer_id ?? task?.taskable?.customer?.id),
  fromRecord: (record) => taskableFromCrmRecord(record)?.id ?? null,
})
registerTaskableType({
  id: 'customer',
  model: 'App\\Models\\Customer',
  labelKey: 'tasks.taskable.types.customer',
  getPath: (link) => customerRecordPath(link.id),
  fromRecord: (record) => (record?.id === undefined || record?.id === null ? null : String(record.id)),
})

// Deals workspace (2026-10-03): tasks about a deal (internal work, to-dos of the deal team) and the won-flow
// follow-up tasks the backend creates on a contract (`taskable_type = Contract`). See docs/deals.
registerTaskableType({
  id: 'deal',
  model: 'App\\Models\\Deal',
  labelKey: 'tasks.taskable.types.deal',
  getPath: (link) => (link.id ? `/deals/${link.id}/tasks` : null),
})
registerTaskableType({
  id: 'contract',
  model: 'App\\Models\\Contract',
  labelKey: 'tasks.taskable.types.contract',
  getPath: (link, task) => {
    const dealId = task?.taskable?.deal_id ?? task?.taskable?.deal?.id
    return dealId ? `/deals/${dealId}/contracts?contract=${link.id}` : null
  },
})

/** Registered types in registration order: `[{ id, model, labelKey }]`. */
export function getTaskableTypes() {
  return [...registry.values()]
}

function baseName(value) {
  return String(value ?? '')
    .replace(/["']/g, '')
    .split(/[\\/]+/)
    .filter(Boolean)
    .pop()
    ?.trim()
    .toLowerCase() || ''
}

/**
 * Any spelling the backend or an old payload may send → alias, or '' when unknown.
 * Accepts the alias itself, `App\Models\Lead`, a double-escaped `App\\Models\\Lead` or a stray quote.
 */
export function resolveTaskableAlias(value) {
  const base = baseName(value)
  if (!base) return ''
  for (const entry of registry.values()) {
    if (entry.id === base || baseName(entry.model) === base) return entry.id
  }
  return ''
}

/** Alias (or any accepted spelling) → the value the backend expects today. '' when unknown. */
export function toBackendTaskableType(value) {
  const alias = resolveTaskableAlias(value)
  return alias ? registry.get(alias).model : ''
}

export function getTaskableLabelKey(value) {
  const alias = resolveTaskableAlias(value)
  return alias ? registry.get(alias).labelKey : ''
}

/** `{ type: alias, id }` for a linked task, `null` for a personal task. */
export function getTaskTaskable(task) {
  if (!task) return null
  const type = resolveTaskableAlias(task.taskable_type ?? task.taskableType)
  const id = task.taskable_id ?? task.taskableId ?? task.taskable?.id
  if (!type || id === undefined || id === null || id === '') return null
  return { type, id, name: task.taskable?.name || task.taskable?.full_name || '' }
}

export function isPersonalTask(task) {
  return getTaskTaskable(task) === null
}

/**
 * Request fields for the link. With no type or no id both fields are sent empty, so an update
 * clears an old link (Laravel turns '' into null) instead of attaching a lead with no id.
 */
export function buildTaskablePayload(type, id) {
  const model = toBackendTaskableType(type)
  const cleanId = id === undefined || id === null ? '' : String(id).trim()
  if (!model || !cleanId) return { taskable_type: '', taskable_id: '' }
  return { taskable_type: model, taskable_id: cleanId }
}

/** Page of the record a task is linked to, or null (personal task, or not resolvable). */
export function getTaskLinkPath(task) {
  const link = getTaskTaskable(task)
  if (!link) return null
  const entry = registry.get(link.type)
  return entry?.getPath ? entry.getPath(link, task) || null : null
}

/**
 * How a CRM record from the Leads Center (`/customers/data` row) is linked: tasks hang on the
 * record's lead (`lead.id`, then `lead_id`, then the record id) — the same rule the customer
 * drawer's Tasks tab has always used, so tasks created anywhere show up in that tab.
 */
export function taskableFromCrmRecord(record) {
  if (!record) return null
  const id = record.lead?.id ?? record.lead_id ?? record.id
  if (id === undefined || id === null || id === '') return null
  return { type: 'lead', id: String(id), name: record.name || record.lead?.name || '' }
}

/** True when the task is linked to exactly this record (personal tasks never match). */
export function isTaskLinkedTo(task, type, id) {
  const link = getTaskTaskable(task)
  if (!link || id === undefined || id === null || id === '') return false
  return link.type === resolveTaskableAlias(type) && String(link.id) === String(id)
}
