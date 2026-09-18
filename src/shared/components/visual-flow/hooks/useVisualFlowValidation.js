import { useMemo } from 'react'
import { validateFlow } from '../utils/flowValidation'

export function useVisualFlowValidation({ nodes, edges, nodeRegistry, requireTrigger, preventCycles, enabled = true }) {
  return useMemo(() => {
    if (!enabled) return { valid: true, errors: [], warnings: [] }
    return validateFlow({ nodes, edges, nodeRegistry, requireTrigger, preventCycles })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nodes, edges, nodeRegistry, requireTrigger, preventCycles])
}
