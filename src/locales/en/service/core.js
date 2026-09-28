export default {
  title: 'Customer Service',
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
  mock: {
    title: 'Demo data',
    description: '{{count}} of {{total}} service modules use demo data until the backend is ready.',
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
