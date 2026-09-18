/**
 * The single central Workflow Registry. Every module registers its
 * capabilities here once (see docs "طريقة إضافة Module جديد"); the Builder,
 * Node Library, and Properties panel all read from this registry and never
 * hard-code a module's triggers/actions/conditions.
 *
 * @typedef {Object} WorkflowFieldDefinition
 * @property {string} key
 * @property {'text'|'number'|'select'|'multiselect'|'date'|'datetime'|'boolean'|'user'|'team'|'template'|'channel'|'variable_text'} type
 * @property {string} [labelKey]
 * @property {string} [source] - Data-source key resolved via hooks/useDataSourceOptions.js (e.g. 'users', 'lead_statuses'). Required for 'select'/'multiselect'/'user'/'team'/'template'/'channel'.
 * @property {boolean} [required]
 * @property {string[]} [operators] - Restrict which CONDITION_OPERATORS apply (condition fields only).
 *
 * @typedef {Object} WorkflowDefinitionEntry
 * @property {string} id - Globally unique, `entity.event` style for triggers (e.g. 'lead.status_changed'), `entity.action` for actions (e.g. 'task.create').
 * @property {'trigger'|'condition'|'action'} type
 * @property {string} module - Owning module id.
 * @property {string} labelKey
 * @property {string} [descriptionKey]
 * @property {string} [icon] - lucide-react icon name (resolved by the UI layer, kept as a string so this file has no React/JSX dependency).
 * @property {string} [category]
 * @property {string} [eventName] - Triggers only — the domain event name (see docs "Events").
 * @property {WorkflowFieldDefinition[]} [fields]
 * @property {boolean} backendSupport - Whether the underlying business operation has a real, callable API today (informational — see docs "Backend Gaps"). This is independent from whether workflow EXECUTION works, which nothing in this app supports yet.
 * @property {boolean} [recommended] - Surface first in the Node Library / getActionsForContext() when true and module matches context.
 *
 * @typedef {Object} WorkflowVariableEntry
 * @property {string} key - e.g. 'customer.name'
 * @property {string} labelKey
 *
 * @typedef {Object} WorkflowModuleDefinition
 * @property {string} module - Unique id, e.g. 'leads'.
 * @property {string} labelKey
 * @property {string} [icon]
 * @property {WorkflowDefinitionEntry[]} [triggers]
 * @property {WorkflowDefinitionEntry[]} [conditions]
 * @property {WorkflowDefinitionEntry[]} [actions]
 * @property {WorkflowVariableEntry[]} [variables]
 */

const modules = new Map()
const dataSources = new Map()

function assertShape(definition) {
  if (!definition?.module) throw new Error('registerWorkflowModule: `module` is required')
}

/** @param {WorkflowModuleDefinition} definition */
export function registerWorkflowModule(definition) {
  assertShape(definition)
  modules.set(definition.module, {
    module: definition.module,
    labelKey: definition.labelKey,
    icon: definition.icon || null,
    triggers: definition.triggers || [],
    conditions: definition.conditions || [],
    actions: definition.actions || [],
    variables: definition.variables || [],
  })
}

export function getModule(moduleId) {
  return modules.get(moduleId) || null
}

export function getModules() {
  return Array.from(modules.values())
}

function collect(moduleId, key) {
  if (moduleId) return getModule(moduleId)?.[key] || []
  return getModules().flatMap((module) => module[key] || [])
}

export function getTriggers(moduleId) {
  return collect(moduleId, 'triggers')
}

export function getConditions(moduleId) {
  return collect(moduleId, 'conditions')
}

export function getActions(moduleId) {
  return collect(moduleId, 'actions')
}

export function getVariables(moduleId) {
  return collect(moduleId, 'variables')
}

export function getTrigger(id) {
  return getTriggers().find((trigger) => trigger.id === id) || null
}

export function getAction(id) {
  return getActions().find((action) => action.id === id) || null
}

export function getCondition(id) {
  return getConditions().find((condition) => condition.id === id) || null
}

/**
 * Groups actions the way the Node Library / properties panel present them:
 * this module's actions first (marked `recommended` surfaced separately),
 * then every other module's actions kept fully available — cross-module
 * workflows are a required capability, not an opt-in. See docs
 * "Cross-module Actions".
 */
export function getActionsForContext({ module } = {}) {
  const ownModule = getModule(module)
  const recommended = (ownModule?.actions || []).filter((action) => action.recommended)
  const ownActions = (ownModule?.actions || []).filter((action) => !action.recommended)

  const crossModule = getModules()
    .filter((entry) => entry.module !== module)
    .map((entry) => ({ module: entry.module, labelKey: entry.labelKey, actions: entry.actions }))
    .filter((entry) => entry.actions.length > 0)

  return { recommended, ownActions, crossModule }
}

export function getTriggersForContext({ module } = {}) {
  const ownModule = getModule(module)
  const own = ownModule?.triggers || []
  const others = getModules()
    .filter((entry) => entry.module !== module)
    .map((entry) => ({ module: entry.module, labelKey: entry.labelKey, triggers: entry.triggers }))
    .filter((entry) => entry.triggers.length > 0)

  return { own, others }
}

/**
 * Data-source registry: records WHICH source keys exist and a display
 * label, for introspection/docs. Actual fetching is done by
 * hooks/useDataSourceOptions.js, which maps these same keys to real
 * project hooks (useUsers, useTeams, ...) — kept separate so this file
 * never imports React/TanStack Query (registry stays a plain data module).
 */
export function registerDataSource(key, { labelKey } = {}) {
  dataSources.set(key, { key, labelKey: labelKey || key })
}

export function getDataSource(key) {
  return dataSources.get(key) || null
}

export function getDataSources() {
  return Array.from(dataSources.values())
}

/** Test-only: clears the registry. Never call from application code. */
export function __resetWorkflowRegistryForTests() {
  modules.clear()
  dataSources.clear()
}
