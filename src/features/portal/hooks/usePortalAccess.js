import { usePortalSession } from '../store/portalSessionStore'

/** Permission checks for UI only — the portal API enforces the policy on every call. */
export function usePortalAccess() {
  const me = usePortalSession((state) => state.me)
  const permissions = me?.permissions || {}
  const can = (object, action = 'view') => Boolean(permissions[object]?.includes(action))
  const membership = me?.memberships?.find((entry) => entry.id === me.active_membership_id) || null
  return { me, membership, can, recordTypes: me?.record_types || [] }
}
