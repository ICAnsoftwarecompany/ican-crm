import { Controls } from '@xyflow/react'

/** Thin themed wrapper around xyflow's zoom in/out/fit-view/lock controls — see visual-flow.css for token overrides. */
export function VisualFlowControls({ showZoom = true, showFitView = true, showInteractive = false }) {
  return <Controls showZoom={showZoom} showFitView={showFitView} showInteractive={showInteractive} position="bottom-right" />
}
