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
 * labelKey: 'tasks.taskable.types.deal' })` and add the label key in ar + en.
 */

const registry = new Map()

export function registerTaskableType({ id, model, labelKey }) {
  if (!id || !model || !labelKey) throw new Error('A taskable type needs an id, a model and a labelKey')
  registry.set(id, { id, model, labelKey })
}

registerTaskableType({ id: 'lead', model: 'App\\Models\\Lead', labelKey: 'tasks.taskable.types.lead' })
registerTaskableType({ id: 'customer', model: 'App\\Models\\Customer', labelKey: 'tasks.taskable.types.customer' })

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
