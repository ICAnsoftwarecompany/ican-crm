/**
 * Business models (service models) — presets that enable capabilities.
 * The frontend never branches on a model letter; it reads `features` from the
 * capabilities manifest. These constants exist only to label models in the UI.
 * Labels: `service.models.<code>.name` / `.description`.
 */
export const SERVICE_MODEL_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/**
 * Feature keys the backend may enable in the capabilities manifest.
 * Labels: `service.features.<key>`.
 */
export const SERVICE_FEATURE_KEYS = [
  'cases',
  'queues',
  'sla',
  'knowledge',
  'feedback',
  'orders',
  'assets',
  'warranty',
  'workOrders',
  'subscriptions',
  'entitlements',
  'enrollments',
  'recordEntries',
  'bookings',
  'components',
  'requiredDocuments',
  'shipments',
  'batches',
  'courierAssignment',
  'projects',
  'milestones',
  'participants',
  'scheduling',
  'billing',
  'portal',
]

/** Entities whose display name comes from tenant terminology. */
export const SERVICE_TERM_ENTITIES = ['customer', 'case', 'record', 'batch']
