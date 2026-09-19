import { BaseNode } from './BaseNode'
import { StartNode } from './StartNode'
import { EndNode } from './EndNode'
import { UnknownNode } from './UnknownNode'

/**
 * Maps a node definition's `kind` (see types.js — 'start'|'end'|'unknown'|
 * 'default') to the `@xyflow/react` node component that renders it. This
 * is the full list of visual "shapes" VisualFlow ships; everything that
 * isn't structurally different from a standard card (Trigger, Action,
 * Condition, Delay, Branch, Data, Group, ...) uses 'default' → BaseNode,
 * driven entirely by registry data (icon/color/ports/summary) — see
 * BaseNode.jsx's doc comment for why those don't get their own files.
 */
export const defaultNodeComponents = {
  default: BaseNode,
  start: StartNode,
  end: EndNode,
  unknown: UnknownNode,
}

export { BaseNode, StartNode, EndNode, UnknownNode }
