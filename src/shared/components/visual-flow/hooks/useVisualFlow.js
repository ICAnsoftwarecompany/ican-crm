import { useCallback } from 'react'
import { useVisualFlowState } from './useVisualFlowState'
import { useVisualFlowSelection } from './useVisualFlowSelection'
import { useVisualFlowHistory } from './useVisualFlowHistory'
import { useVisualFlowClipboard } from './useVisualFlowClipboard'
import { useVisualFlowValidation } from './useVisualFlowValidation'
import { useVisualFlowPersistence } from './useVisualFlowPersistence'

/**
 * Convenience facade bundling the individual hooks above for the common
 * "I just want a working editor" case — equivalent to wiring
 * useVisualFlowState + Selection + History + Clipboard + Validation +
 * Persistence by hand. Advanced consumers (e.g. a feature needing custom
 * history semantics) should use the individual hooks directly instead of
 * fighting this facade's defaults — both are fully supported, this is
 * sugar, not the only path in.
 */
export function useVisualFlow({ nodes, edges, onNodesChange, onEdgesChange, defaultNodes, defaultEdges, nodeRegistry, onSelectionChange, onDirtyChange, onFlowChange, requireTrigger, preventCycles } = {}) {
  const state = useVisualFlowState({ nodes, edges, onNodesChange, onEdgesChange, defaultNodes, defaultEdges })
  const selection = useVisualFlowSelection({ onSelectionChange })
  const history = useVisualFlowHistory({ onRestore: (snapshot) => { state.setNodes(snapshot.nodes); state.setEdges(snapshot.edges) } })
  const clipboard = useVisualFlowClipboard()
  const validation = useVisualFlowValidation({ nodes: state.nodes, edges: state.edges, nodeRegistry, requireTrigger, preventCycles })
  const persistence = useVisualFlowPersistence({ nodes: state.nodes, edges: state.edges, onDirtyChange, onFlowChange })

  const commitHistory = useCallback(() => {
    history.commit({ nodes: state.nodes, edges: state.edges })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.nodes, state.edges])

  const copySelection = useCallback(() => {
    clipboard.copy(state.nodes, state.edges, selection.selectedNodeIds)
  }, [clipboard, state.nodes, state.edges, selection.selectedNodeIds])

  const pasteClipboard = useCallback(() => {
    const result = clipboard.paste()
    if (!result) return
    state.setNodes((current) => [...current, ...result.nodes])
    state.setEdges((current) => [...current, ...result.edges])
    commitHistory()
  }, [clipboard, state, commitHistory])

  return { ...state, ...selection, ...history, validation, ...persistence, commitHistory, copySelection, pasteClipboard }
}
