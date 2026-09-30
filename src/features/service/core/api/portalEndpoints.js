/**
 * Customer portal API (spec §51 "Portal"). Separate base and token from the staff API: the portal app never sends
 * a staff session, and the server scopes every call by the caller's active membership.
 */
export const PORTAL_API = '/api/portal'

export const portalEndpoints = {
  publicSettings: `${PORTAL_API}/settings`,
  otp: `${PORTAL_API}/auth/otp`,
  verify: `${PORTAL_API}/auth/verify`,
  login: `${PORTAL_API}/auth/login`,
  logout: `${PORTAL_API}/auth/logout`,
  me: `${PORTAL_API}/me`,
  switchMembership: `${PORTAL_API}/me/switch`,
  records: `${PORTAL_API}/records`,
  assets: `${PORTAL_API}/assets`,
  entitlements: `${PORTAL_API}/entitlements`,
  subscriptions: `${PORTAL_API}/subscriptions`,
  cases: `${PORTAL_API}/cases`,
  schedules: `${PORTAL_API}/schedules`,
  payments: `${PORTAL_API}/payments`,
  contracts: `${PORTAL_API}/contracts`,
  documents: `${PORTAL_API}/documents`,
  documentUpload: (id) => `${PORTAL_API}/document-requirements/${id}/upload`,
  catalog: `${PORTAL_API}/catalog`,
  catalogRequest: (id) => `${PORTAL_API}/catalog/${id}/request`,
  kb: `${PORTAL_API}/kb`,
  feedback: `${PORTAL_API}/feedback`,
  remittances: `${PORTAL_API}/remittances`,
  orgUsers: `${PORTAL_API}/org/users`,
  track: `${PORTAL_API}/track`,
}
