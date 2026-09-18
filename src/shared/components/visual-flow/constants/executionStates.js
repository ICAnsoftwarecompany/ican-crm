/**
 * Generic per-node execution states for `mode="live"`. VisualFlow only
 * renders these — it never produces them. The consuming feature's own
 * realtime hook computes `executionState` and passes it down as a prop.
 * See docs section "Live Execution" / "Realtime Integration".
 */
export const EXECUTION_STATES = {
  IDLE: 'idle',
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  WAITING: 'waiting',
  CANCELLED: 'cancelled',
}

export const EXECUTION_STATE_TONE = {
  [EXECUTION_STATES.IDLE]: 'neutral',
  [EXECUTION_STATES.QUEUED]: 'info',
  [EXECUTION_STATES.RUNNING]: 'warning',
  [EXECUTION_STATES.SUCCESS]: 'success',
  [EXECUTION_STATES.FAILED]: 'danger',
  [EXECUTION_STATES.SKIPPED]: 'neutral',
  [EXECUTION_STATES.WAITING]: 'info',
  [EXECUTION_STATES.CANCELLED]: 'neutral',
}

/**
 * @typedef {Object} VisualFlowNodeExecution
 * @property {string} status - One of EXECUTION_STATES.
 * @property {string} [startedAt]
 * @property {string} [completedAt]
 * @property {Object} [output]
 * @property {string} [error]
 *
 * @typedef {Object} VisualFlowExecutionState
 * @property {string} [executionId]
 * @property {string} [startedAt]
 * @property {string} [finishedAt]
 * @property {string} [status]
 * @property {Object.<string, VisualFlowNodeExecution>} nodes - Keyed by node id.
 */
