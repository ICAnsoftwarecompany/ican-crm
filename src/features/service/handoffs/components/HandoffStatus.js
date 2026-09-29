export const HANDOFF_STATUS_TONE = {
  pending: 'text-status-new',
  needs_review: 'text-sla-at-risk',
  accepted: 'text-sla-on-track',
  onboarding: 'text-status-qualified',
  active: 'text-sla-on-track',
  rejected: 'text-sla-breached',
}

/** Where a created entity opens (records route by type key; others by id). */
export function entityPath(entity, { recordTypeKeyOf } = {}) {
  if (entity.type === 'asset') return `/service/assets/${entity.id}`
  if (['booking', 'enrollment', 'shipment', 'project'].includes(entity.type)) {
    const key = entity.record_type_key || recordTypeKeyOf?.(entity.type)
    return key ? `/service/records/${key}/${entity.id}` : null
  }
  if (entity.type === 'entitlement') return '/service/entitlements'
  return null
}
