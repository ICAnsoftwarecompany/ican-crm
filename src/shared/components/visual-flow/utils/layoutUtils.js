import { DEFAULT_LAYOUT_SPACING } from '../constants/defaults'

/**
 * A small, dependency-free layered layout (BFS depth → column, order
 * within depth → row). This intentionally does not attempt a full
 * Sugiyama/DAG layout — it is enough for the "manual / vertical /
 * horizontal" layouts required today. If a future flow needs proper edge-
 * crossing minimization, swap this function's internals for a real layout
 * library (e.g. `dagre`) — every call site goes through this one
 * function, so that would be a localized change, not a VisualFlow core
 * rewrite. See docs "Auto Layout".
 *
 * @param {{nodes: import('../types').VisualFlowNode[], edges: import('../types').VisualFlowEdge[], direction?: 'TB'|'LR'}} params
 * @returns {import('../types').VisualFlowNode[]} nodes with updated `position`
 */
export function applyLayout({ nodes = [], edges = [], direction = 'TB' }) {
  if (nodes.length === 0) return nodes

  const incomingCount = new Map(nodes.map((node) => [node.id, 0]))
  edges.forEach((edge) => {
    if (incomingCount.has(edge.target)) incomingCount.set(edge.target, incomingCount.get(edge.target) + 1)
  })

  const depthById = new Map()
  const queue = nodes.filter((node) => incomingCount.get(node.id) === 0).map((node) => node.id)
  queue.forEach((id) => depthById.set(id, 0))

  const adjacency = new Map(nodes.map((node) => [node.id, []]))
  edges.forEach((edge) => adjacency.get(edge.source)?.push(edge.target))

  let cursor = 0
  while (cursor < queue.length) {
    const currentId = queue[cursor]
    cursor += 1
    const currentDepth = depthById.get(currentId)
    ;(adjacency.get(currentId) || []).forEach((targetId) => {
      const nextDepth = currentDepth + 1
      if (!depthById.has(targetId) || depthById.get(targetId) < nextDepth) {
        depthById.set(targetId, nextDepth)
        queue.push(targetId)
      }
    })
  }

  // Any node unreachable from a root (e.g. a disconnected island) still needs a depth.
  nodes.forEach((node) => {
    if (!depthById.has(node.id)) depthById.set(node.id, 0)
  })

  const nodesByDepth = new Map()
  nodes.forEach((node) => {
    const depth = depthById.get(node.id)
    if (!nodesByDepth.has(depth)) nodesByDepth.set(depth, [])
    nodesByDepth.get(depth).push(node)
  })

  const spacing = DEFAULT_LAYOUT_SPACING
  const isHorizontal = direction === 'LR'

  return nodes.map((node) => {
    const depth = depthById.get(node.id)
    const siblings = nodesByDepth.get(depth)
    const indexInDepth = siblings.indexOf(node)
    const position = isHorizontal
      ? { x: depth * spacing.x, y: indexInDepth * spacing.y }
      : { x: indexInDepth * spacing.x, y: depth * spacing.y }
    return { ...node, position }
  })
}
