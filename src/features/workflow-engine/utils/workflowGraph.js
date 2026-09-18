import { NODE_TYPES } from '../core/nodeTypes'
import { walkSteps } from '../core/workflowDomainModel'
import { getAction, getTrigger } from '../registry/workflowRegistry'

function missingRequiredFields(definition, config = {}) {
  return (definition?.fields || []).filter((field) => field.required && isEmptyValue(config[field.key]))
}

function isEmptyValue(value) {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

/**
 * Validates a Workflow before it may transition draft → active (see docs
 * "Save vs Activate"). Returns `errors` (block activation — missing
 * trigger, invalid registry references, incomplete required fields,
 * unresolved branches) separately from `warnings` (never block — e.g. an
 * action whose backend isn't wired up yet, per `backendSupport: false`).
 *
 * This validates the DRAFT is internally well-formed. It intentionally
 * does not and cannot validate that the workflow will actually run — no
 * backend execution engine exists yet (see
 * docs/WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md). Activation only records a
 * local status; see WorkflowBuilder's activation disclaimer.
 */
export function validateWorkflow(workflow) {
  const errors = []
  const warnings = []

  if (!workflow?.trigger?.definitionId) {
    errors.push({ path: 'trigger', messageKey: 'workflow.validation.triggerRequired' })
  } else {
    const triggerDefinition = getTrigger(workflow.trigger.definitionId)
    if (!triggerDefinition) {
      errors.push({ path: 'trigger', messageKey: 'workflow.validation.invalidTriggerReference' })
    } else {
      if (triggerDefinition.backendSupport === false) {
        warnings.push({ path: 'trigger', messageKey: 'workflow.validation.backendNotSupported' })
      }
      missingRequiredFields(triggerDefinition, workflow.trigger.config).forEach((field) => {
        errors.push({ path: `trigger.${field.key}`, messageKey: 'workflow.validation.fieldRequired', field: field.key })
      })
    }
  }

  walkSteps(workflow?.rootStep, (step, path) => {
    if (step.type === NODE_TYPES.ACTION) {
      const definition = getAction(step.definitionId)
      if (!definition) {
        errors.push({ path: step.id, messageKey: 'workflow.validation.invalidActionReference' })
        return
      }
      if (definition.backendSupport === false) {
        warnings.push({ path: step.id, messageKey: 'workflow.validation.backendNotSupported' })
      }
      missingRequiredFields(definition, step.config).forEach((field) => {
        errors.push({ path: `${step.id}.${field.key}`, messageKey: 'workflow.validation.fieldRequired', field: field.key })
      })
    }

    if (step.type === NODE_TYPES.CONDITION) {
      const rules = step.config?.conditions
      if (!Array.isArray(rules) || rules.length === 0) {
        errors.push({ path: step.id, messageKey: 'workflow.validation.conditionRulesRequired' })
      }
      if (!step.branches?.true || !step.branches?.false) {
        errors.push({ path: step.id, messageKey: 'workflow.validation.branchesRequired' })
      }
    }

    if (step.type === NODE_TYPES.WAIT) {
      const { mode, value, unit, until } = step.config || {}
      if (mode === 'duration' && (!value || !unit)) {
        errors.push({ path: step.id, messageKey: 'workflow.validation.waitDurationRequired' })
      }
      if (mode === 'until' && !until) {
        errors.push({ path: step.id, messageKey: 'workflow.validation.waitUntilRequired' })
      }
      if (!mode) {
        errors.push({ path: step.id, messageKey: 'workflow.validation.waitDurationRequired' })
      }
    }

    if (step.type === NODE_TYPES.WAIT_FOR_EVENT) {
      if (!step.config?.eventTriggerId) {
        errors.push({ path: step.id, messageKey: 'workflow.validation.waitForEventRequired' })
      }
      if (!step.branches?.resolved || !step.branches?.timeout) {
        errors.push({ path: step.id, messageKey: 'workflow.validation.branchesRequired' })
      }
      warnings.push({ path: step.id, messageKey: 'workflow.validation.waitForEventNoScheduler' })
    }
  })

  if (!workflow?.rootStep) {
    warnings.push({ path: 'root', messageKey: 'workflow.validation.emptyWorkflow' })
  }

  return { errors, warnings, isValid: errors.length === 0 }
}
