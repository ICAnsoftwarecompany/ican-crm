/**
 * Mirror of docs/customer-service/SERVICE-MASTER-SPEC.md §9.4 (Business Models → Features).
 * In production the backend computes `features`; the mock does the same here
 * so the frontend exercises the real contract.
 */
export const CORE_FEATURES = ['cases', 'queues', 'sla', 'knowledge', 'feedback']

export const MODEL_FEATURES = {
  A: ['orders'],
  B: ['assets', 'warranty', 'workOrders', 'entitlements'],
  C: ['subscriptions', 'entitlements', 'billing'],
  D: ['enrollments', 'recordEntries', 'participants', 'entitlements', 'batches', 'scheduling'],
  E: ['bookings', 'components', 'requiredDocuments', 'participants', 'batches', 'scheduling'],
  F: ['shipments', 'batches', 'courierAssignment', 'participants', 'recordEntries'],
  G: ['projects', 'milestones', 'recordEntries'],
  H: ['workOrders', 'scheduling'],
}

/** @param {string[]} models */
export function featuresForModels(models) {
  const features = new Set(CORE_FEATURES)
  models.forEach((model) => (MODEL_FEATURES[model] || []).forEach((feature) => features.add(feature)))
  features.add('portal')
  return [...features]
}
