import { generateFlowId } from './idUtils'

export function buildEdge({ source, sourceHandle, target, targetHandle, type = 'default', data = {} }) {
  return { id: generateFlowId('edge'), source, sourceHandle, target, targetHandle, type, data }
}

export function isDuplicateConnection(edges = [], { source, sourceHandle, target, targetHandle }) {
  return edges.some(
    (edge) =>
      edge.source === source &&
      edge.target === target &&
      (edge.sourceHandle || null) === (sourceHandle || null) &&
      (edge.targetHandle || null) === (targetHandle || null)
  )
}
