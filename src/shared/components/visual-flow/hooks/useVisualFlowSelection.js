import { useCallback, useState } from 'react'

/**
 * Selection is deliberately tracked outside `@xyflow/react`'s own
 * per-node `selected` flag as the primary source of truth, so features
 * can read `selectedNodeIds`/`selectedEdgeIds` without reaching into node
 * objects — matches how the rest of ICAN CRM exposes selection (e.g.
 * DataTable's `selectedRows`).
 */
export function useVisualFlowSelection({ onSelectionChange } = {}) {
  const [selectedNodeIds, setSelectedNodeIds] = useState([])
  const [selectedEdgeIds, setSelectedEdgeIds] = useState([])

  const handleSelectionChange = useCallback(
    ({ nodes = [], edges = [] }) => {
      const nodeIds = nodes.map((node) => node.id)
      const edgeIds = edges.map((edge) => edge.id)
      setSelectedNodeIds(nodeIds)
      setSelectedEdgeIds(edgeIds)
      onSelectionChange?.({ nodeIds, edgeIds })
    },
    [onSelectionChange]
  )

  const clearSelection = useCallback(() => {
    setSelectedNodeIds([])
    setSelectedEdgeIds([])
  }, [])

  return { selectedNodeIds, selectedEdgeIds, onSelectionChange: handleSelectionChange, clearSelection }
}
