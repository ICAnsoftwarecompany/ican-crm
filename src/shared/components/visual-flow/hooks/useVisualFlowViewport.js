import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'

/**
 * Thin viewport wrapper — must be called from inside `<VisualFlowProvider>`
 * (which wraps `@xyflow/react`'s `ReactFlowProvider`). This is the only
 * other file besides useVisualFlowState.js allowed to import from
 * `@xyflow/react` directly; every panel/toolbar/consumer goes through
 * this hook instead.
 */
export function useVisualFlowViewport() {
  const instance = useReactFlow()

  const zoomIn = useCallback(() => instance.zoomIn(), [instance])
  const zoomOut = useCallback(() => instance.zoomOut(), [instance])
  const fitView = useCallback((options) => instance.fitView(options), [instance])
  const setViewport = useCallback((viewport, options) => instance.setViewport(viewport, options), [instance])
  const getViewport = useCallback(() => instance.getViewport(), [instance])

  return { zoomIn, zoomOut, fitView, setViewport, getViewport }
}
