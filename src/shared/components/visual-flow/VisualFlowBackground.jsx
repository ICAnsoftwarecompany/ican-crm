import { Background, BackgroundVariant } from '@xyflow/react'

/** Thin themed wrapper — see visual-flow.css for the `--xy-background-*` token overrides that make this match ICAN CRM instead of xyflow's defaults. */
export function VisualFlowBackground({ variant = BackgroundVariant.Dots, gap = 20, size = 1 }) {
  return <Background variant={variant} gap={gap} size={size} />
}
