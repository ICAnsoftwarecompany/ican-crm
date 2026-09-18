import { generateFlowId } from './idUtils'

export function findNodeById(nodes = [], id) {
  return nodes.find((node) => node.id === id) || null
}

export function findEdgeById(edges = [], id) {
  return edges.find((edge) => edge.id === id) || null
}

export function getConnectedEdges(edges = [], nodeIds = []) {
  const idSet = new Set(nodeIds)
  return edges.filter((edge) => idSet.has(edge.source) || idSet.has(edge.target))
}

export function getOutgoers(nodeId, nodes = [], edges = []) {
  const targetIds = new Set(edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target))
  return nodes.filter((node) => targetIds.has(node.id))
}

export function getIncomers(nodeId, nodes = [], edges = []) {
  const sourceIds = new Set(edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source))
  return nodes.filter((node) => sourceIds.has(node.id))
}

/** DFS cycle detection — used only when a consumer opts into "prevent circular flows" validation (not all VisualFlow use cases forbid cycles). */
export function hasCycle(nodes = [], edges = []) {
  const adjacency = new Map(nodes.map((node) => [node.id, []]))
  edges.forEach((edge) => adjacency.get(edge.source)?.push(edge.target))

  const visiting = new Set()
  const visited = new Set()

  function visit(nodeId) {
    if (visited.has(nodeId)) return false
    if (visiting.has(nodeId)) return true
    visiting.add(nodeId)
    const next = adjacency.get(nodeId) || []
    const found = next.some((targetId) => visit(targetId))
    visiting.delete(nodeId)
    visited.add(nodeId)
    return found
  }

  return nodes.some((node) => visit(node.id))
}

/**
 * Duplicates a set of nodes for clipboard paste (see docs "Clipboard"):
 * fresh ids, edges INTERNAL to the copied set are preserved (remapped to
 * the new ids), edges crossing the boundary are dropped, and positions
 * are offset so pasted nodes don't stack exactly on top of the originals.
 */
export function duplicateNodes(nodes = [], edges = [], { offset = { x: 40, y: 40 } } = {}) {
  const idMap = new Map(nodes.map((node) => [node.id, generateFlowId('node')]))

  const newNodes = nodes.map((node) => ({
    ...node,
    id: idMap.get(node.id),
    position: { x: node.position.x + offset.x, y: node.position.y + offset.y },
    selected: true,
  }))

  const newEdges = edges
    .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
    .map((edge) => ({
      ...edge,
      id: generateFlowId('edge'),
      source: idMap.get(edge.source),
      target: idMap.get(edge.target),
    }))

  return { nodes: newNodes, edges: newEdges }
}
