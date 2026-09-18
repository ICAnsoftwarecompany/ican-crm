import { NODE_TYPES } from '../core/nodeTypes'

/**
 * Immutable edits over a Workflow's `rootStep` tree. The Builder keeps all
 * unsaved edits in local component state (see docs "Builder State") and
 * calls these helpers to produce the next state — nothing here mutates in
 * place, so React re-renders correctly and undo/redo could be added later
 * without changing this module.
 */

function isTerminalWithoutNext(step) {
  return step.type === NODE_TYPES.CONDITION || step.type === NODE_TYPES.WAIT_FOR_EVENT || step.type === NODE_TYPES.END
}

/**
 * @param {import('../core/workflowDomainModel').Workflow} workflow
 * @param {{parent: 'root'|string, slot?: 'next'|'true'|'false'|'resolved'|'timeout'}} anchor
 */
export function setStepAtAnchor(workflow, anchor, newStep) {
  if (anchor.parent === 'root') {
    return { ...workflow, rootStep: newStep }
  }

  function recur(step) {
    if (!step) return step

    if (step.id === anchor.parent) {
      if (anchor.slot === 'next') return { ...step, next: newStep }
      return { ...step, branches: { ...step.branches, [anchor.slot]: newStep } }
    }

    if (step.branches) {
      let changed = false
      const branches = {}
      Object.entries(step.branches).forEach(([key, branchStep]) => {
        const result = recur(branchStep)
        branches[key] = result
        if (result !== branchStep) changed = true
      })
      if (changed) return { ...step, branches }
    }

    const nextResult = recur(step.next)
    return nextResult !== step.next ? { ...step, next: nextResult } : step
  }

  return { ...workflow, rootStep: recur(workflow.rootStep) }
}

/**
 * Removes one step. Its own sequential continuation (`.next`) takes its
 * place; a condition/wait-for-event/end node has no single continuation
 * to splice up, so removing one of those also removes everything under it
 * — the Canvas asks for confirmation before calling this for those types.
 */
export function removeStepById(workflow, stepId) {
  const replacement = (step) => (isTerminalWithoutNext(step) ? null : (step.next ?? null))

  if (workflow.rootStep?.id === stepId) {
    return { ...workflow, rootStep: replacement(workflow.rootStep) }
  }

  function recur(step) {
    if (!step) return step

    if (step.next?.id === stepId) {
      return { ...step, next: replacement(step.next) }
    }

    if (step.branches) {
      let changed = false
      const branches = {}
      Object.entries(step.branches).forEach(([key, branchStep]) => {
        if (branchStep?.id === stepId) {
          branches[key] = replacement(branchStep)
          changed = true
        } else {
          const result = recur(branchStep)
          branches[key] = result
          if (result !== branchStep) changed = true
        }
      })
      if (changed) return { ...step, branches }
    }

    const nextResult = recur(step.next)
    return nextResult !== step.next ? { ...step, next: nextResult } : step
  }

  return { ...workflow, rootStep: recur(workflow.rootStep) }
}

function mapStepById(workflow, stepId, transform) {
  function recur(step) {
    if (!step) return step
    if (step.id === stepId) return transform(step)

    if (step.branches) {
      let changed = false
      const branches = {}
      Object.entries(step.branches).forEach(([key, branchStep]) => {
        const result = recur(branchStep)
        branches[key] = result
        if (result !== branchStep) changed = true
      })
      if (changed) return { ...step, branches }
    }

    const nextResult = recur(step.next)
    return nextResult !== step.next ? { ...step, next: nextResult } : step
  }

  return { ...workflow, rootStep: recur(workflow.rootStep) }
}

export function updateStepConfig(workflow, stepId, patch) {
  return mapStepById(workflow, stepId, (step) => ({ ...step, config: { ...step.config, ...patch } }))
}

export function updateStepDefinition(workflow, stepId, definitionId) {
  return mapStepById(workflow, stepId, (step) => ({ ...step, definitionId, config: {} }))
}
