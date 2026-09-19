// Public API — see docs/VISUAL_FLOW_ARCHITECTURE_AR.md section "الـ Public API".
// Consumers should never import from internal paths inside visual-flow/*
// directly; everything needed is re-exported here.

export { VisualFlow } from './VisualFlow'
export { VisualFlowCanvas } from './VisualFlowCanvas'
export { VisualFlowProvider, useVisualFlowRuntime } from './VisualFlowProvider'
export { VisualFlowToolbar } from './VisualFlowToolbar'
export { VisualFlowControls } from './VisualFlowControls'
export { VisualFlowMiniMap } from './VisualFlowMiniMap'
export { VisualFlowBackground } from './VisualFlowBackground'
export { VisualFlowEmptyState } from './VisualFlowEmptyState'
export { VisualFlowLoadingState } from './VisualFlowLoadingState'
export { VisualFlowErrorState } from './VisualFlowErrorState'
export { VisualFlowErrorBoundary } from './VisualFlowErrorBoundary'

export { BaseNode, StartNode, EndNode, UnknownNode, defaultNodeComponents } from './nodes'
export { BaseEdge, defaultEdgeComponents } from './edges'

export { NodeLibraryPanel } from './panels/NodeLibraryPanel'
export { PropertiesPanel } from './panels/PropertiesPanel'
export { ExecutionPanel } from './panels/ExecutionPanel'
export { FlowValidationPanel } from './panels/FlowValidationPanel'

export { createNodeRegistry, combineNodeRegistries } from './registry/createNodeRegistry'
export { createEdgeRegistry, combineEdgeRegistries } from './registry/createEdgeRegistry'
export { defaultNodeRegistry } from './registry/defaultNodeRegistry'
export { defaultEdgeRegistry } from './registry/defaultEdgeRegistry'

export { createFlowAdapter, identityFlowAdapter } from './adapters/createFlowAdapter'
export { normalizeFlowData } from './adapters/normalizeFlowData'

export { validateConnection, validateFlow } from './utils/flowValidation'
export { applyLayout } from './utils/layoutUtils'
export { generateFlowId } from './utils/idUtils'
export { serializeFlow, deserializeFlow, migrateFlow } from './utils/serialization'
export { findNodeById, findEdgeById, getConnectedEdges, getIncomers, getOutgoers, hasCycle, duplicateNodes } from './utils/graphUtils'
export { buildEdge, isDuplicateConnection } from './utils/edgeUtils'
export { resolveNodeDefinition, getNodeCapabilities } from './utils/nodeUtils'

export { useVisualFlow } from './hooks/useVisualFlow'
export { useVisualFlowState } from './hooks/useVisualFlowState'
export { useVisualFlowSelection } from './hooks/useVisualFlowSelection'
export { useVisualFlowHistory } from './hooks/useVisualFlowHistory'
export { useVisualFlowClipboard } from './hooks/useVisualFlowClipboard'
export { useVisualFlowKeyboard } from './hooks/useVisualFlowKeyboard'
export { useVisualFlowViewport } from './hooks/useVisualFlowViewport'
export { useVisualFlowValidation } from './hooks/useVisualFlowValidation'
export { useVisualFlowPersistence } from './hooks/useVisualFlowPersistence'

export { VISUAL_FLOW_MODES, resolveCapabilities } from './constants/flowModes'
export { DEFAULT_NODE_CATEGORIES, DEFAULT_NODE_CATEGORY_LABEL_KEYS } from './constants/nodeCategories'
export { EXECUTION_STATES, EXECUTION_STATE_TONE } from './constants/executionStates'
export { CURRENT_SCHEMA_VERSION, DEFAULT_VIEWPORT, DEFAULT_PORT_IDS } from './constants/defaults'
