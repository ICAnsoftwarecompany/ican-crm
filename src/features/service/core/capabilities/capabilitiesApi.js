import { createServiceApi } from '../api/serviceHttp'
import { serviceEndpoints } from '../api/endpoints'

const api = createServiceApi('capabilities')

/**
 * @typedef {Object<string, string>} LocalizedLabel - e.g. { ar: 'حجز', en: 'Booking' }
 *
 * @typedef {Object} ServiceCapabilitiesManifest
 * @property {string} [template] - Industry template the tenant installed from (informational).
 * @property {string[]} models - Enabled business model codes (A–H).
 * @property {string[]} features - Enabled feature keys (see SERVICE_FEATURE_KEYS).
 * @property {Object<string, string|LocalizedLabel>} terminology - entity -> term key or localized label.
 * @property {string[]} [permissions]
 */

/** @returns {Promise<ServiceCapabilitiesManifest>} */
export async function getServiceCapabilities() {
  const { data } = await api.get(serviceEndpoints.capabilities)
  return data?.data ?? data
}
