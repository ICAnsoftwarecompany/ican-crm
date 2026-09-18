import { NODE_TYPES, CONDITION_BRANCH_KEYS, WAIT_FOR_EVENT_BRANCH_KEYS } from './nodeTypes'

/**
 * Frontend domain model for a Workflow. This is a CONTRACT, not a backend
 * implementation — no backend workflow API exists today (see
 * docs/WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md). Nothing here persists to
 * a server; `hooks/useWorkflowStore.js` only persists locally.
 *
 * @typedef {Object} WorkflowContext
 * @property {string} module - Registered module id, e.g. 'leads', 'outreach-campaigns'.
 * @property {string} entity - Entity this workflow is about, e.g. 'lead', 'campaign'.
 * @property {string|number} [entityId] - Specific record id when opened in context mode from a record's own page.
 * @property {string} [source] - Free-form breadcrumb hint, e.g. 'campaign-details'.
 *
 * @typedef {Object} WorkflowStep
 * @property {string} id
 * @property {'action'|'wait'|'wait_for_event'|'condition'|'end'} type
 * @property {string} [definitionId] - Action definition id (see registry) — only for type 'action'.
 * @property {Object} config - Field values keyed by the definition's `fields[].key`, or wait/condition config.
 * @property {WorkflowStep|null} [next] - Sequential next step. Absent for 'condition'/'wait_for_event' (they use `branches`) and 'end'.
 * @property {Object.<string, WorkflowStep|null>} [branches] - Keyed by CONDITION_BRANCH_KEYS or WAIT_FOR_EVENT_BRANCH_KEYS.
 *
 * @typedef {Object} Workflow
 * @property {string|number|null} id - null until saved (even locally).
 * @property {string} name
 * @property {string} description
 * @property {string} module
 * @property {WorkflowContext} context
 * @property {'draft'|'active'|'paused'|'archived'} status
 * @property {{definitionId: string, config: Object}|null} trigger
 * @property {WorkflowStep|null} rootStep - First step after the trigger. The builder edits this tree directly.
 * @property {Object} settings - Reserved for future frequency/consent rules (see docs, not enforced anywhere today).
 * @property {number|null} createdBy
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 */

let localIdCounter = 0
export function createLocalId(prefix = 'step') {
  localIdCounter += 1
  return `${prefix}_${Date.now().toString(36)}_${localIdCounter}`
}

/** @param {WorkflowContext} context @returns {Workflow} */
export function createEmptyWorkflow(context) {
  const now = new Date().toISOString()
  return {
    id: null,
    name: '',
    description: '',
    module: context?.module || '',
    context: context || null,
    status: 'draft',
    trigger: null,
    rootStep: null,
    settings: {},
    createdBy: null,
    createdAt: now,
    updatedAt: now,
  }
}

export function createStep(type, overrides = {}) {
  return {
    id: createLocalId(type),
    type,
    definitionId: overrides.definitionId,
    config: overrides.config || {},
    next: overrides.next ?? (type === 'condition' || type === 'wait_for_event' || type === 'end' ? undefined : null),
    branches:
      overrides.branches ??
      (type === 'condition'
        ? { [CONDITION_BRANCH_KEYS.TRUE]: null, [CONDITION_BRANCH_KEYS.FALSE]: null }
        : type === 'wait_for_event'
          ? { [WAIT_FOR_EVENT_BRANCH_KEYS.RESOLVED]: null, [WAIT_FOR_EVENT_BRANCH_KEYS.TIMEOUT]: null }
          : undefined),
  }
}

/**
 * Depth-first walk over the step tree (trigger excluded — call the
 * visitor with the trigger separately if needed). Used by validation and
 * by the nodes/edges converter below.
 */
export function walkSteps(step, visitor, path = []) {
  if (!step) return
  visitor(step, path)

  if (step.type === NODE_TYPES.CONDITION || step.type === NODE_TYPES.WAIT_FOR_EVENT) {
    Object.entries(step.branches || {}).forEach(([branchKey, branchStep]) => {
      walkSteps(branchStep, visitor, [...path, branchKey])
    })
    return
  }

  walkSteps(step.next, visitor, path)
}

export function findStepById(rootStep, stepId) {
  let found = null
  walkSteps(rootStep, (step) => {
    if (step.id === stepId) found = step
  })
  return found
}

/**
 * Converts the editable step-tree into the flat `nodes`/`edges` shape named
 * in the product spec's domain model (`Workflow.nodes`, `Workflow.edges`).
 * This is the shape a future backend persistence API would receive — the
 * builder itself edits the tree (see WorkflowStep) because a tree is
 * sufficient to represent every workflow this engine currently supports
 * (sequential steps + two-way branches, no arbitrary graph merges/loops).
 */
export function workflowToNodesEdges(workflow) {
  const nodes = []
  const edges = []

  if (workflow?.trigger) {
    nodes.push({ id: 'trigger', type: NODE_TYPES.TRIGGER, definitionId: workflow.trigger.definitionId, config: workflow.trigger.config })
  }

  let previousId = workflow?.trigger ? 'trigger' : null

  function visit(step, parentId, branchLabel) {
    if (!step) return

    nodes.push({ id: step.id, type: step.type, definitionId: step.definitionId, config: step.config })
    if (parentId) edges.push({ from: parentId, to: step.id, branch: branchLabel ?? null })

    if (step.type === NODE_TYPES.CONDITION || step.type === NODE_TYPES.WAIT_FOR_EVENT) {
      Object.entries(step.branches || {}).forEach(([branchKey, branchStep]) => {
        visit(branchStep, step.id, branchKey)
      })
      return
    }

    visit(step.next, step.id, null)
  }

  visit(workflow?.rootStep, previousId, null)

  return { nodes, edges }
}
