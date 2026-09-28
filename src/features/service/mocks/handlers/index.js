import { capabilitiesHandlers } from './capabilitiesHandlers'

/**
 * Every mock route of the Service area. A new sub-module adds ONE line here
 * with its `<module>Handlers.js` file.
 * @type {import('../router').MockRoute[]}
 */
export const mockRoutes = [
  ...capabilitiesHandlers,
]
