/**
 * Capabilities the UI knows how to edit (spec §25.6, codes and configs from the Postman collection, 2026-10-06).
 *
 * The backend has no "list capabilities" endpoint yet (docs/backend/BACKEND-REQUESTS.md §D), so this registry
 * drives the forms. A capability that is not listed here can still be added by code, with its config as JSON.
 *
 * Field shape: `{ key, type: 'boolean' | 'number' | 'text' | 'select', options?, placeholder? }`.
 * Labels: `catalog.capabilities.<code>.name`, `.description`, and `catalog.capabilities.fields.<key>`.
 * `instance` marks capabilities whose products hold instances, and which instance form they use.
 */
export const CAPABILITY_REGISTRY = [
  { code: 'serial_tracking', appliesTo: 'product', instance: 'serial', fields: [{ key: 'required', type: 'boolean' }, { key: 'pattern', type: 'text', placeholder: '^[A-Z0-9]{8,12}$' }] },
  { code: 'unique_unit', appliesTo: 'product', instance: 'unit', fields: [] },
  { code: 'batch_lot', appliesTo: 'product', instance: 'batch', fields: [] },
  { code: 'expiry', appliesTo: 'product', instance: 'batch', fields: [{ key: 'alert_days', type: 'number' }] },
  { code: 'availability', appliesTo: 'product', fields: [{ key: 'hold_days', type: 'number' }] },
  { code: 'barcode', appliesTo: 'product', fields: [] },
  { code: 'digital_delivery', appliesTo: 'product', fields: [{ key: 'delivery', type: 'select', options: ['license', 'link'] }, { key: 'link_expires_days', type: 'number' }] },
  { code: 'warranty', appliesTo: 'both', fields: [{ key: 'months', type: 'number' }, { key: 'starts_from', type: 'select', options: ['sale', 'installation', 'delivery'] }, { key: 'extendable', type: 'boolean' }] },
  { code: 'recurrence', appliesTo: 'both', fields: [{ key: 'every', type: 'number' }, { key: 'unit', type: 'select', options: ['day', 'week', 'month', 'year'] }, { key: 'auto_renew', type: 'boolean' }, { key: 'grace_days', type: 'number' }] },
  { code: 'entitlements', appliesTo: 'both', fields: [] },
  { code: 'installments', appliesTo: 'both', fields: [] },
  { code: 'scheduling', appliesTo: 'service', fields: [{ key: 'duration_minutes', type: 'number' }] },
  { code: 'onsite', appliesTo: 'service', fields: [{ key: 'expected_minutes', type: 'number' }] },
  { code: 'capacity', appliesTo: 'service', fields: [{ key: 'min', type: 'number' }, { key: 'max', type: 'number' }] },
  { code: 'participants', appliesTo: 'service', fields: [{ key: 'min', type: 'number' }, { key: 'max', type: 'number' }] },
  { code: 'milestones', appliesTo: 'service', fields: [] },
  { code: 'components', appliesTo: 'service', fields: [] },
  { code: 'required_documents', appliesTo: 'service', fields: [] },
  { code: 'tracking', appliesTo: 'service', fields: [] },
]

const BY_CODE = new Map(CAPABILITY_REGISTRY.map((capability) => [capability.code, capability]))

export function getCapabilityDefinition(code) {
  return BY_CODE.get(code) || null
}

/** Registry entries offered for an item type of this kind. */
export function capabilitiesForKind(kind) {
  return CAPABILITY_REGISTRY.filter((capability) => {
    if (capability.appliesTo === 'both') return true
    if (kind === 'service') return capability.appliesTo === 'service'
    if (kind === 'product') return capability.appliesTo === 'product'
    return true
  })
}

/** Instance forms a set of capability codes allows (`serial`, `unit`, `batch`), in registry order. */
export function instanceModesFor(codes = []) {
  const modes = []
  codes.forEach((code) => {
    const mode = BY_CODE.get(code)?.instance
    if (mode && !modes.includes(mode)) modes.push(mode)
  })
  return modes
}
