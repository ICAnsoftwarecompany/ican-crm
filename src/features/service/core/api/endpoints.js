/**
 * Base paths for Service Operations endpoints.
 * Contract source: docs/customer-service/SERVICE-MASTER-SPEC.md (section 51).
 * Keep paths identical to the backend contract so switching a module from
 * mock to live is a one-line change in serviceModules.js.
 */
export const TENANT_API = '/api/tenant'
export const SERVICE_API = `${TENANT_API}/service`

export const serviceEndpoints = {
  capabilities: `${TENANT_API}/me/capabilities`,
}
