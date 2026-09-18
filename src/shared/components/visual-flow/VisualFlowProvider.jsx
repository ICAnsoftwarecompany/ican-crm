import { createContext, useContext, useMemo } from 'react'
import { ReactFlowProvider } from '@xyflow/react'

/**
 * `@xyflow/react`'s custom node/edge components only ever receive
 * `{id, data, selected, ...}` — there is no prop channel for "the current
 * node registry" or "the current execution state". This context is how
 * BaseNode/BaseEdge reach those without every feature having to stuff
 * them into every single node's `data` (which would duplicate the same
 * registry reference hundreds of times and make swapping the registry at
 * runtime impossible).
 */
const VisualFlowRuntimeContext = createContext(null)

export function useVisualFlowRuntime() {
  const context = useContext(VisualFlowRuntimeContext)
  if (!context) {
    throw new Error('useVisualFlowRuntime must be used within <VisualFlowProvider>/<VisualFlow>')
  }
  return context
}

/**
 * Wraps `@xyflow/react`'s own `ReactFlowProvider` (required for
 * `useReactFlow`/`useVisualFlowViewport` to work) plus VisualFlow's own
 * runtime context. `<VisualFlow>` renders this internally — a consumer
 * only needs it directly when composing a fully custom layout around
 * `<VisualFlowCanvas>` instead of using `<VisualFlow>` as a whole.
 */
export function VisualFlowProvider({ nodeRegistry, edgeRegistry, capabilities, executionState, mode, resolveIcon, children }) {
  const runtime = useMemo(
    () => ({ nodeRegistry, edgeRegistry, capabilities, executionState, mode, resolveIcon }),
    [nodeRegistry, edgeRegistry, capabilities, executionState, mode, resolveIcon]
  )

  return (
    <ReactFlowProvider>
      <VisualFlowRuntimeContext.Provider value={runtime}>{children}</VisualFlowRuntimeContext.Provider>
    </ReactFlowProvider>
  )
}
