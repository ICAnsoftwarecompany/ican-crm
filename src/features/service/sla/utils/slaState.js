/**
 * SLA presentation. States come from the server (`case.sla.state`); the
 * frontend never computes SLA — it only colors and labels what it receives.
 */
export const SLA_STATES = ['on_track', 'at_risk', 'breached', 'paused', 'met']

export const SLA_TEXT_TONE = {
  on_track: 'text-sla-on-track',
  at_risk: 'text-sla-at-risk',
  breached: 'text-sla-breached',
  paused: 'text-sla-paused',
  met: 'text-sla-on-track',
}

export const SLA_BG_TONE = {
  on_track: 'bg-sla-on-track',
  at_risk: 'bg-sla-at-risk',
  breached: 'bg-sla-breached',
  paused: 'bg-sla-paused',
  met: 'bg-sla-on-track',
}

/** Running metric = has a due date and is not completed. */
export const isRunning = (metric) => Boolean(metric?.due_at && !metric.completed_at)
