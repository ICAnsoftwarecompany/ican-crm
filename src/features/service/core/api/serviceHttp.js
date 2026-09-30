import httpClient from '../../../../services/httpClient'

import { isModuleMocked, withServiceTransport } from './mockTransport'

export { isModuleMocked, withServiceTransport }

/**
 * HTTP client for one Service sub-module.
 *
 * Always goes through the shared `httpClient` (interceptors add the bearer
 * token and api_password). When the module is mocked, only the Axios adapter
 * changes — URLs, payloads and error shapes stay exactly as the real API, so
 * hooks and pages never know the difference.
 *
 * @param {string} moduleKey - Key from SERVICE_MODULES.
 */
export function createServiceApi(moduleKey) {
  return {
    get: (url, config) => httpClient.get(url, withServiceTransport(moduleKey, config)),
    post: (url, data, config) => httpClient.post(url, data, withServiceTransport(moduleKey, config)),
    put: (url, data, config) => httpClient.put(url, data, withServiceTransport(moduleKey, config)),
    patch: (url, data, config) => httpClient.patch(url, data, withServiceTransport(moduleKey, config)),
    delete: (url, config) => httpClient.delete(url, withServiceTransport(moduleKey, config)),
  }
}
