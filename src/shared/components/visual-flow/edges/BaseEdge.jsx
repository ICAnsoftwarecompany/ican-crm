import { memo } from 'react'
import { BaseEdge as XyBaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import { useVisualFlowRuntime } from '../VisualFlowProvider'
import { EXECUTION_STATE_TONE } from '../constants/executionStates'

const TONE_STROKE = {
  neutral: 'var(--border)',
  info: '#93C5FD',
  warning: '#FBBF24',
  success: '#10B981',
  danger: '#EF4444',
}

/**
 * The one edge renderer for every edge type registered in
 * defaultEdgeRegistry.js (default/conditional/animated/execution) — the
 * visual difference between them comes entirely from `data`
 * (label/status/animated), matching the same "registry data drives
 * rendering, not a new component per type" principle used for nodes.
 */
function BaseEdgeComponent({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, data, selected }) {
  const { capabilities, executionState } = useVisualFlowRuntime()
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  const executionStatus = capabilities?.showExecutionState ? executionState?.edges?.[id]?.status : null
  const tone = executionStatus ? EXECUTION_STATE_TONE[executionStatus] : data?.status ? EXECUTION_STATE_TONE[data.status] : 'neutral'
  const stroke = selected ? 'var(--accent, #00C2CB)' : TONE_STROKE[tone] || TONE_STROKE.neutral

  return (
    <>
      <XyBaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke, strokeWidth: selected ? 2.5 : 1.5, animation: data?.animated ? 'visual-flow-dash 1s linear infinite' : undefined }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            className="pointer-events-none absolute rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[11px] font-bold text-[var(--text)]"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const BaseEdge = memo(BaseEdgeComponent)
