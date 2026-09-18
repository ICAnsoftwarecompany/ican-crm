import { useCallback, useRef } from 'react'
import { duplicateNodes } from '../utils/graphUtils'

export function useVisualFlowClipboard() {
  const clipboardRef = useRef(null)

  const copy = useCallback((nodes = [], edges = [], selectedNodeIds = []) => {
    const idSet = new Set(selectedNodeIds)
    const copiedNodes = nodes.filter((node) => idSet.has(node.id))
    const copiedEdges = edges.filter((edge) => idSet.has(edge.source) && idSet.has(edge.target))
    clipboardRef.current = { nodes: copiedNodes, edges: copiedEdges }
  }, [])

  /** Returns `{nodes, edges}` with fresh ids ready to merge into the current flow, or null if clipboard is empty. */
  const paste = useCallback(() => {
    if (!clipboardRef.current || clipboardRef.current.nodes.length === 0) return null
    return duplicateNodes(clipboardRef.current.nodes, clipboardRef.current.edges)
  }, [])

  const hasClipboardContent = useCallback(() => Boolean(clipboardRef.current?.nodes?.length), [])

  return { copy, paste, hasClipboardContent }
}
