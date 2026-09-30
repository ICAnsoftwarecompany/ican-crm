import { getServiceModule } from '../constants/serviceModules'

/**
 * Which modules are served by the mock layer.
 *
 * `VITE_SERVICE_MOCKS`:
 * - `auto` (default): a module is mocked while its `backend` is 'mock' in serviceModules.js
 * - `all`: every Service module is mocked (demos, backend down)
 * - `none`: nothing is mocked (verify against the real backend)
 *
 * @param {string} moduleKey
 * @param {string} [mode]
 */
export function isModuleMocked(moduleKey, mode = import.meta.env.VITE_SERVICE_MOCKS || 'auto') {
  if (mode === 'all') return true
  if (mode === 'none') return false
  const definition = getServiceModule(moduleKey)
  return !definition || definition.backend !== 'live'
}

/** Lazily loaded so mock code and seed data stay out of the main bundle. */
function lazyMockAdapter(config) {
  return import('../../mocks/mockAdapter').then(({ mockAdapter }) => mockAdapter(config))
}

/**
 * @param {string} moduleKey
 * @param {Object} [config]
 */
export function withServiceTransport(moduleKey, config = {}) {
  return isModuleMocked(moduleKey) ? { ...config, adapter: lazyMockAdapter } : config
}
