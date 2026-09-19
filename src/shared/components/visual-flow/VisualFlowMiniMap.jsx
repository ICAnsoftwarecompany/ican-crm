import { MiniMap } from '@xyflow/react'

/** Thin themed wrapper — see visual-flow.css for token overrides. */
export function VisualFlowMiniMap({ pannable = true, zoomable = true }) {
  return <MiniMap pannable={pannable} zoomable={zoomable} position="bottom-left" />
}
