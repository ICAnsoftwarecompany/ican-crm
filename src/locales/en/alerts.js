export default {
  title: 'Operational alerts',
  fallbackTitle: 'Operational alert',
  activeCount: '{{count}} active alert',
  indicatorLabel: '{{count}} operational alert requiring attention',
  more: '+ {{count}} more alerts',
  actions: { acknowledge: 'Acknowledge', openLead: 'View lead', openEntity: 'View details' },
  severity: { critical: 'Critical', danger: 'Danger', high: 'High', warning: 'Warning', medium: 'Medium', info: 'Information', low: 'Low' },
  errors: { acknowledge: 'Could not acknowledge the alert. Please try again.' },
}
