/**
 * Public entry for OTHER APPS (the customer portal): the portal API contract and the mock switch, without pulling
 * the staff `httpClient` or any CRM screen into the portal bundle. Keep it tiny.
 */
export { portalEndpoints, PORTAL_API } from './core/api/portalEndpoints'
export { withServiceTransport, isModuleMocked } from './core/api/mockTransport'
