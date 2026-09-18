import { createEdgeRegistry } from './createEdgeRegistry'

export const defaultEdgeRegistry = createEdgeRegistry([
  { type: 'default', colorToken: '--vf-edge-default' },
  { type: 'conditional', colorToken: '--vf-edge-conditional' },
  { type: 'animated', animated: true, colorToken: '--vf-edge-animated' },
  { type: 'execution', colorToken: '--vf-edge-execution' },
])
