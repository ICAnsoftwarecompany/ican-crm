export default {
  title: 'Customer Hub',
  overview: {
    title: 'Service Operations',
    subtitle: 'What this workspace enables, how it is named, and where each part of the build stands.',
    models: 'Business models',
    features: 'Enabled features',
    featuresHint: 'Features come from the enabled business models and the tenant package.',
    terminology: 'Terminology',
    entities: {
      customer: 'Customer',
      case: 'Case',
      record: 'Service record',
      batch: 'Batch',
    },
  },
  errors: {
    PIPELINE_STATUS_IN_USE: 'A status you removed is still used by requests or records. Move them first or keep the status.',
    generic: 'Something went wrong. Please try again.',
    CONFLICT_VERSION: 'Someone else changed this record. The latest version was loaded, please try again.',
    CASE_TRANSITION_NOT_ALLOWED: 'This status change is not allowed from the current status.',
    VALIDATION_FAILED: 'Please complete the required fields.',
    NOT_FOUND: 'This record no longer exists.',
    FORBIDDEN: 'You do not have permission to do this.',
    FEATURE_DISABLED: 'This feature is not enabled for your workspace.',
    MOCK_ROUTE_NOT_FOUND: 'Demo data is not available for this action yet.',
    RESOURCE_IN_USE: 'This item is in use by other records. Deactivate it instead of deleting it.',
  },
  mock: {
    title: 'Demo data',
    description: '{{count}} of {{total}} Customer Hub modules use demo data until the backend is ready.',
    template: 'Industry preview',
    templates: {
      devices: 'Devices & maintenance',
      tourism: 'Tourism & travel',
      school: 'School',
      shipping: 'Shipping',
    },
  },
  roadmap: {
    title: 'Build roadmap',
    milestones: {
      mvp1: 'MVP 1',
      mvp2: 'MVP 2',
    },
    source: {
      mock: 'demo',
      live: 'live',
    },
  },
}
