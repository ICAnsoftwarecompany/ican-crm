import { useCallback, useMemo, useState } from 'react'
import { applyNodeChanges, applyEdgeChanges, addEdge as xyAddEdge } from '@xyflow/react'

/**
 * Controlled-first nodes/edges state (see docs "Controlled vs
 * Uncontrolled State"). When the consumer passes `nodes`/`edges` +
 * `onNodesChange`/`onEdgesChange`, this hook is a pure pass-through helper
 * (VisualFlow stays controlled by the parent). When the consumer omits
 * them (`defaultNodes`/`defaultEdges` instead), this hook owns the state
 * internally — this is the ONLY place `@xyflow/react`'s change-application
 * helpers are imported; every other file in this framework depends on
 * VisualFlow's own contracts, not the underlying library (see docs
 * "Library Decision").
 */
export function useVisualFlowState({ nodes: controlledNodes, edges: controlledEdges, onNodesChange, onEdgesChange, defaultNodes = [], defaultEdges = [] }) {
  const isControlled = controlledNodes !== undefined
  const [internalNodes, setInternalNodes] = useState(defaultNodes)
  const [internalEdges, setInternalEdges] = useState(defaultEdges)

  const nodes = isControlled ? controlledNodes : internalNodes
  const edges = isControlled ? controlledEdges : internalEdges

  const handleNodesChange = useCallback(
    (changes) => {
      if (isControlled) {
        onNodesChange?.(applyNodeChanges(changes, nodes))
      } else {
        setInternalNodes((current) => applyNodeChanges(changes, current))
      }
    },
    [isControlled, nodes, onNodesChange]
  )

  const handleEdgesChange = useCallback(
    (changes) => {
      if (isControlled) {
        onEdgesChange?.(applyEdgeChanges(changes, edges))
      } else {
        setInternalEdges((current) => applyEdgeChanges(changes, current))
      }
    },
    [isControlled, edges, onEdgesChange]
  )

  const handleConnect = useCallback(
    (connection) => {
      if (isControlled) {
        onEdgesChange?.(xyAddEdge(connection, edges))
      } else {
        setInternalEdges((current) => xyAddEdge(connection, current))
      }
    },
    [isControlled, edges, onEdgesChange]
  )

  const setNodes = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(nodes) : updater
      if (isControlled) onNodesChange?.(next)
      else setInternalNodes(next)
    },
    [isControlled, nodes, onNodesChange]
  )

  const setEdges = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(edges) : updater
      if (isControlled) onEdgesChange?.(next)
      else setInternalEdges(next)
    },
    [isControlled, edges, onEdgesChange]
  )

  return useMemo(
    () => ({ nodes, edges, onNodesChange: handleNodesChange, onEdgesChange: handleEdgesChange, onConnect: handleConnect, setNodes, setEdges }),
    [nodes, edges, handleNodesChange, handleEdgesChange, handleConnect, setNodes, setEdges]
  )
}
