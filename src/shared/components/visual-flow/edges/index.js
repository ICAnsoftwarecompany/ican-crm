import { BaseEdge } from './BaseEdge'

/** Every registered edge type (default/conditional/animated/execution) renders through the same component — see BaseEdge.jsx. */
export const defaultEdgeComponents = {
  default: BaseEdge,
}

export { BaseEdge }
