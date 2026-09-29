/**
 * Objects a portal policy can grant (spec §43.3) and the actions each supports.
 * `record:<type>` / `record_entry:<type>` are expanded from the tenant's record types.
 */
export const FIXED_OBJECTS = {
  case: ['view', 'create', 'reply'],
  asset: ['view'],
  entitlement: ['view'],
  payment_schedule: ['view', 'pay'],
  subscription: ['view'],
  contract: ['view', 'download'],
  document: ['view', 'upload'],
  catalog: ['view', 'request'],
  kb: ['view'],
  feedback: ['create'],
  org_users: ['view', 'manage'],
  remittance: ['view'],
}
export const RECORD_ACTIONS = ['view', 'create', 'edit']
export const ENTRY_ACTIONS = ['view']
export const MEMBERSHIP_TYPES = ['self', 'guardian', 'organization_member']
export const ORG_ROLES = ['admin', 'operations', 'warehouse', 'customer_service', 'accounting']
export const PORTAL_SECTIONS = ['records', 'cases', 'payments', 'assets', 'documents', 'catalog', 'kb', 'feedback']
export const FORM_FIELD_TYPES = ['text', 'textarea', 'number', 'date', 'select']

/** Actions allowed for an object key (`record:enrollment` → record actions). */
export function actionsFor(object) {
  if (!object) return []
  if (object.startsWith('record:')) return RECORD_ACTIONS
  if (object.startsWith('record_entry:')) return ENTRY_ACTIONS
  return FIXED_OBJECTS[object] || []
}
