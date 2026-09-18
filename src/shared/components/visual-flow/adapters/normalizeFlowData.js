import { CURRENT_SCHEMA_VERSION, DEFAULT_VIEWPORT } from '../constants/defaults'
import { generateFlowId } from '../utils/idUtils'

/**
 * Tolerantly normalizes arbitrary/partial input into the canonical
 * `VisualFlowModel` shape (see types.js). Never throws on malformed input
 * — a node missing a position gets one, an edge missing an id gets one,
 * an unregistered node `type` is left as-is (BaseNode/UnknownNode decide
 * what to render, this function only guarantees shape, not that every
 * `type` resolves in some registry). See docs "Unknown Nodes" and
 * "Schema Versioning".
 *
 * @param {Partial<import('../types').VisualFlowModel>} input
 * @returns {import('../types').VisualFlowModel}
 */
export function normalizeFlowData(input = {}) {
  const nodes = Array.isArray(input.nodes) ? input.nodes.map(normalizeNode) : []
  const edges = Array.isArray(input.edges) ? input.edges.map(normalizeEdge) : []

  return {
    schemaVersion: input.schemaVersion || CURRENT_SCHEMA_VERSION,
    metadata: input.metadata || {},
    viewport: input.viewport || DEFAULT_VIEWPORT,
    nodes,
    edges,
  }
}

function normalizeNode(node = {}) {
  return {
    id: node.id || generateFlowId('node'),
    type: node.type || 'visual-flow.unknown',
    position: {
      x: Number.isFinite(node.position?.x) ? node.position.x : 0,
      y: Number.isFinite(node.position?.y) ? node.position.y : 0,
    },
    data: node.data || {},
    metadata: node.metadata || {},
    selected: Boolean(node.selected),
  }
}

function normalizeEdge(edge = {}) {
  return {
    id: edge.id || generateFlowId('edge'),
    source: edge.source,
    sourceHandle: edge.sourceHandle,
    target: edge.target,
    targetHandle: edge.targetHandle,
    type: edge.type || 'default',
    data: edge.data || {},
  }
}
