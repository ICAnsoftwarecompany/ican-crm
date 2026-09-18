/**
 * Workflow DEFINITION status — never mix with execution status below (spec
 * requirement: these are deliberately separate concepts).
 */
export const WORKFLOW_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
}

export const WORKFLOW_STATUS_CONFIG = {
  draft: { labelKey: 'workflow.status.draft', tone: 'neutral' },
  active: { labelKey: 'workflow.status.active', tone: 'success' },
  paused: { labelKey: 'workflow.status.paused', tone: 'warning' },
  archived: { labelKey: 'workflow.status.archived', tone: 'neutral' },
}

export function getWorkflowStatusConfig(status) {
  return WORKFLOW_STATUS_CONFIG[status] || WORKFLOW_STATUS_CONFIG.draft
}

/**
 * Workflow EXECUTION status. Nothing in this codebase produces executions
 * today (no backend engine) — this exists only so the domain model and any
 * future execution-log UI have a name for these states ready to go. See
 * docs/WORKFLOW_ENGINE_BACKEND_REQUIREMENTS.md.
 */
export const WORKFLOW_EXECUTION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  WAITING: 'waiting',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
}
