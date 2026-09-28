import { serviceEndpoints } from '../../core/api/endpoints'
import { getMockManifest } from '../db'

/** @type {import('../router').MockRoute[]} */
export const capabilitiesHandlers = [
  {
    method: 'GET',
    path: serviceEndpoints.capabilities,
    handler: () => ({ data: getMockManifest() }),
  },
]
