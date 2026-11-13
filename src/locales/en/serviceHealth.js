export default {
  title: 'Overview',
  description: 'Track the completion of each setting and its currently available types from live data.',
  progress: 'Verified configuration completion',
  refresh: 'Refresh status',
  coverage: '{{completed}} configured requirements out of {{units}} verified, across {{verified}} of {{total}} settings',
  loading: 'Checking settings...',
  unknownNote: 'Some settings could not be verified and were excluded from the percentage.',
  discoveryNote: 'Assignment and distribution types are currently discovered from existing records; required types without records may be invisible. A future authoritative types API can make coverage complete.',
  configure: 'Open setting',
  resources: { assignmentRules: 'Assignment rules', distributionSettings: 'Distribution settings' },
  status: { complete: 'Configured for known types', missing: 'Needs configuration', unknown: 'Unable to verify' },
  disclaimer: 'This score measures active configuration and discovered types, not full operational readiness.',
}
