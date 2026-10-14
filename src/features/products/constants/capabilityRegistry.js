/**
 * Capabilities the UI knows how to edit (spec §25.6, codes and configs from the Postman collection, 2026-10-06).
 *
 * The backend has no "list capabilities" endpoint yet (docs/backend/BACKEND-REQUESTS.md §D), so this registry
 * drives the forms. A capability that is not listed here can still be added by code, with its config as JSON.
 *
 * Field shape: `{ key, type: 'boolean' | 'number' | 'text' | 'select', options?, placeholder? }`.
 * Labels: `catalog.capabilities.<code>.name`, `.description`, and `catalog.capabilities.fields.<key>`.
 * `instance` marks capabilities whose products hold instances, and which instance form they use.
 * `group` orders the item type wizard (2026-10-14); `conflicts` lists codes that cannot be combined;
 * `internal` capabilities are edited by their own wizard step (not as a capability card).
 */
export const CAPABILITY_GROUPS = ['tracking', 'afterSales', 'billing', 'delivery']

export const CAPABILITY_REGISTRY = [
  { code: 'serial_tracking', group: 'tracking', conflicts: ['unique_unit'], appliesTo: 'product', instance: 'serial', fields: [{ key: 'required', type: 'boolean' }, { key: 'pattern', type: 'text', placeholder: '^[A-Z0-9]{8,12}$' }] },
  { code: 'unique_unit', group: 'tracking', conflicts: ['serial_tracking', 'batch_lot'], appliesTo: 'product', instance: 'unit', fields: [] },
  { code: 'batch_lot', group: 'tracking', conflicts: ['unique_unit'], appliesTo: 'product', instance: 'batch', fields: [] },
  { code: 'expiry', group: 'tracking', appliesTo: 'product', instance: 'batch', fields: [{ key: 'alert_days', type: 'number' }] },
  { code: 'availability', group: 'tracking', appliesTo: 'product', fields: [{ key: 'hold_days', type: 'number' }] },
  { code: 'barcode', group: 'tracking', appliesTo: 'product', fields: [] },
  { code: 'digital_delivery', group: 'delivery', appliesTo: 'product', fields: [{ key: 'delivery', type: 'select', options: ['license', 'link'] }, { key: 'link_expires_days', type: 'number' }] },
  { code: 'warranty', group: 'afterSales', appliesTo: 'both', fields: [{ key: 'months', type: 'number' }, { key: 'starts_from', type: 'select', options: ['sale', 'installation', 'delivery'] }, { key: 'extendable', type: 'boolean' }] },
  { code: 'recurrence', group: 'billing', appliesTo: 'both', fields: [{ key: 'every', type: 'number' }, { key: 'unit', type: 'select', options: ['day', 'week', 'month', 'year'] }, { key: 'auto_renew', type: 'boolean' }, { key: 'grace_days', type: 'number' }] },
  { code: 'entitlements', group: 'afterSales', appliesTo: 'both', fields: [] },
  { code: 'installments', group: 'billing', appliesTo: 'both', fields: [] },
  { code: 'scheduling', group: 'delivery', appliesTo: 'service', fields: [{ key: 'duration_minutes', type: 'number' }] },
  { code: 'onsite', group: 'delivery', appliesTo: 'service', fields: [{ key: 'expected_minutes', type: 'number' }] },
  { code: 'capacity', group: 'delivery', appliesTo: 'service', fields: [{ key: 'min', type: 'number' }, { key: 'max', type: 'number' }] },
  { code: 'participants', group: 'delivery', appliesTo: 'service', fields: [{ key: 'min', type: 'number' }, { key: 'max', type: 'number' }] },
  { code: 'milestones', group: 'delivery', appliesTo: 'service', fields: [] },
  { code: 'components', group: 'delivery', appliesTo: 'service', fields: [] },
  { code: 'required_documents', group: 'delivery', appliesTo: 'service', fields: [] },
  { code: 'tracking', group: 'delivery', appliesTo: 'service', fields: [] },
  // Default alternative units of the type: `{ alternatives: [{ unit_id, factor, is_default }] }` (spec §25.6 `units`).
  { code: 'units', group: 'tracking', appliesTo: 'both', internal: true, fields: [] },
]

const BY_CODE = new Map(CAPABILITY_REGISTRY.map((capability) => [capability.code, capability]))

export function getCapabilityDefinition(code) {
  return BY_CODE.get(code) || null
}

/** Registry entries offered for an item type of this kind. */
export function capabilitiesForKind(kind) {
  return CAPABILITY_REGISTRY.filter((capability) => {
    if (capability.internal) return false
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

/** Codes in `codes` that cannot be combined (e.g. serial numbers and unique units), as `[a, b]` pairs. */
export function capabilityConflicts(codes = []) {
  const pairs = []
  codes.forEach((code) => {
    (BY_CODE.get(code)?.conflicts || []).forEach((other) => {
      if (codes.includes(other) && !pairs.some(([a, b]) => (a === other && b === code))) pairs.push([code, other])
    })
  })
  return pairs
}

/** Capabilities to show as capabilities (internal ones such as the type's default `units` are edited elsewhere). */
export function visibleCapabilities(capabilities = []) {
  return (capabilities || []).filter((capability) => !BY_CODE.get(capability.code)?.internal)
}
