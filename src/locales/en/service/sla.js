/** `service.sla.*` — SLA presentation (F2). */
export default {
  sla: {
    title: 'Service level (SLA)',
    column: 'SLA',
    none: 'No SLA policy applies to this request.',
    policy: 'Policy: {{name}}',
    badgeTitle: '{{state}} · next target {{due}}',
    dueAt: 'Due {{time}}',
    completedAt: 'Done {{time}}',
    pausedHint: 'Clock stopped while waiting for the customer',
    states: {
      on_track: 'On track',
      at_risk: 'At risk',
      breached: 'Breached',
      paused: 'Paused',
      met: 'Met',
    },
    metrics: {
      first_response: 'First response',
      resolution: 'Resolution',
    },
    activity: {
      escalated: '{{percent}}% of {{metric}} time elapsed: {{action}} {{target}}',
    },
  },
}
