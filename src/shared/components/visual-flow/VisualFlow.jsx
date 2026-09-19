import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ListTree, PanelRightOpen } from 'lucide-react'
import { AppDrawer } from '../overlays/AppDrawer'
import { Button } from '../ui/Button'
import { VisualFlowProvider } from './VisualFlowProvider'
import { VisualFlowCanvas } from './VisualFlowCanvas'
import { VisualFlowToolbar } from './VisualFlowToolbar'
import { VisualFlowBackground } from './VisualFlowBackground'
import { VisualFlowControls } from './VisualFlowControls'
import { VisualFlowMiniMap } from './VisualFlowMiniMap'
import { VisualFlowEmptyState } from './VisualFlowEmptyState'
import { VisualFlowLoadingState } from './VisualFlowLoadingState'
import { VisualFlowErrorState } from './VisualFlowErrorState'
import { VisualFlowErrorBoundary } from './VisualFlowErrorBoundary'
import { NodeLibraryPanel } from './panels/NodeLibraryPanel'
import { PropertiesPanel } from './panels/PropertiesPanel'
import { ExecutionPanel } from './panels/ExecutionPanel'
import { useVisualFlowState } from './hooks/useVisualFlowState'
import { useVisualFlowSelection } from './hooks/useVisualFlowSelection'
import { useVisualFlowHistory } from './hooks/useVisualFlowHistory'
import { useVisualFlowClipboard } from './hooks/useVisualFlowClipboard'
import { useVisualFlowKeyboard } from './hooks/useVisualFlowKeyboard'
import { useVisualFlowValidation } from './hooks/useVisualFlowValidation'
import { useVisualFlowPersistence } from './hooks/useVisualFlowPersistence'
import { resolveCapabilities, VISUAL_FLOW_MODES } from './constants/flowModes'
import { applyLayout } from './utils/layoutUtils'
import { generateFlowId } from './utils/idUtils'

/**
 * The public VisualFlow component — see docs/VISUAL_FLOW_ARCHITECTURE_AR.md
 * for the full contract. It is domain-agnostic: it never imports or
 * references Leads/Opportunities/Campaigns/Workflow-specific concepts.
 * Everything domain-specific arrives via `nodeRegistry`/`edgeRegistry`/
 * `context` props from the CONSUMING feature.
 */
export function VisualFlow({
  // Data (controlled or uncontrolled — see useVisualFlowState)
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  defaultNodes,
  defaultEdges,

  // Registries
  nodeRegistry,
  edgeRegistry,

  // Mode / capabilities
  mode = VISUAL_FLOW_MODES.READONLY,
  capabilities: capabilityOverrides,

  // Live mode
  executionState,

  // Rendering
  resolveIcon,
  resolveFieldOptions,
  nodeComponents,
  edgeComponents,
  customConnectionValidators,

  // Async states
  isLoading,
  error,
  onRetry,

  // Panels — explicit slots always win over the built-in defaults.
  leftPanel,
  rightPanel,
  bottomPanel,
  showNodeLibrary,
  showProperties,
  showExecutionPanel,

  // Toolbar
  toolbar,

  // Callbacks
  onNodeClick,
  onSelectionChange,
  onSave,
  onDirtyChange,
  onFlowChange,
  requireTrigger,
  preventCycles,

  // Canvas
  fitView = true,
  showBackground = true,
  showControls = true,
  showMiniMap = false,
  className,
}) {
  const { t } = useTranslation()
  const capabilities = useMemo(() => resolveCapabilities(mode, capabilityOverrides), [mode, capabilityOverrides])
  const hasRightPanel = rightPanel !== null && (rightPanel !== undefined || (showProperties ?? capabilities.canEditProperties) || (showExecutionPanel ?? capabilities.showExecutionState))

  const [minimapVisible, setMinimapVisible] = useState(showMiniMap)
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true))
  const [mobilePane, setMobilePane] = useState(null)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event) => setIsDesktop(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const isDesktopRef = useRef(isDesktop)
  isDesktopRef.current = isDesktop

  const openMobilePane = useCallback((pane) => {
    setMobilePane((current) => (isDesktopRef.current ? current : pane))
  }, [])

  const state = useVisualFlowState({ nodes, edges, onNodesChange, onEdgesChange, defaultNodes, defaultEdges })

  // `@xyflow/react` re-invokes its own internal selection-change effect
  // whenever the `onSelectionChange` callback IDENTITY changes — not only
  // when the actual selection changes. An inline arrow here would be a
  // new function every render, causing xyflow's effect to keep firing,
  // which updates local selection state, which re-renders this component,
  // which recreates the inline arrow again — an infinite loop. Memoizing
  // it (stable across renders unless `onSelectionChange` prop itself
  // changes) is required, not just tidiness. See docs "Anti-patterns".
  const handleSelectionChange = useCallback(
    (payload) => {
      onSelectionChange?.(payload)
      if (payload.nodeIds.length === 1 && hasRightPanel) openMobilePane('properties')
    },
    [hasRightPanel, onSelectionChange, openMobilePane]
  )
  const selection = useVisualFlowSelection({ onSelectionChange: handleSelectionChange })

  const handleRestoreHistory = useCallback((snapshot) => {
    state.setNodes(snapshot.nodes)
    state.setEdges(snapshot.edges)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const history = useVisualFlowHistory({ onRestore: handleRestoreHistory })
  const clipboard = useVisualFlowClipboard()
  const validation = useVisualFlowValidation({
    nodes: state.nodes,
    edges: state.edges,
    nodeRegistry,
    requireTrigger,
    preventCycles,
    enabled: capabilities.showToolbarEditActions,
  })
  const persistence = useVisualFlowPersistence({ nodes: state.nodes, edges: state.edges, onDirtyChange, onFlowChange })

  const selectedNode = state.nodes.find((node) => node.id === selection.selectedNodeIds[0]) || null

  const commit = () => history.commit({ nodes: state.nodes, edges: state.edges })

  useVisualFlowKeyboard({
    enabled: capabilities.canDeleteNodes || capabilities.canCopy,
    onDelete: capabilities.canDeleteNodes
      ? () => {
          state.setNodes((current) => current.filter((node) => !selection.selectedNodeIds.includes(node.id)))
          state.setEdges((current) =>
            current.filter((edge) => !selection.selectedEdgeIds.includes(edge.id) && !selection.selectedNodeIds.includes(edge.source) && !selection.selectedNodeIds.includes(edge.target))
          )
          commit()
        }
      : undefined,
    onCopy: capabilities.canCopy ? () => clipboard.copy(state.nodes, state.edges, selection.selectedNodeIds) : undefined,
    onPaste: capabilities.canPaste
      ? () => {
          const result = clipboard.paste()
          if (!result) return
          state.setNodes((current) => [...current, ...result.nodes])
          state.setEdges((current) => [...current, ...result.edges])
          commit()
        }
      : undefined,
    onUndo: capabilities.canUndo ? history.undo : undefined,
    onRedo: capabilities.canRedo ? history.redo : undefined,
    onEscape: () => selection.clearSelection(),
  })

  const handleDropNode = (type, position) => {
    if (!capabilities.canAddNodes) return
    const definition = nodeRegistry?.get(type)
    state.setNodes((current) => [...current, { id: generateFlowId('node'), type, position, data: { ...(definition?.defaultData || {}) } }])
    commit()
  }

  const handleAutoLayout = () => {
    state.setNodes((current) => applyLayout({ nodes: current, edges: state.edges, direction: 'TB' }))
    commit()
  }

  const handlePropertyChange = (nodeId, patch) => {
    state.setNodes((current) => current.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...patch } } : node)))
  }

  const handleSave = () => {
    onSave?.({ nodes: state.nodes, edges: state.edges })
    persistence.markClean()
  }

  const resolvedShowLibrary = showNodeLibrary ?? capabilities.showNodeLibrary
  const resolvedShowProperties = showProperties ?? capabilities.canEditProperties
  const resolvedShowExecution = showExecutionPanel ?? capabilities.showExecutionState

  const resolvedLeftPanel = leftPanel !== undefined ? leftPanel : resolvedShowLibrary ? <NodeLibraryPanel onNodePick={(type) => handleDropNode(type, { x: 120, y: 120 })} /> : null

  const resolvedRightPanel =
    rightPanel !== undefined
      ? rightPanel
      : resolvedShowProperties
        ? <PropertiesPanel node={selectedNode} nodeRegistry={nodeRegistry} onChange={handlePropertyChange} resolveFieldOptions={resolveFieldOptions} onClose={() => setMobilePane(null)} />
        : resolvedShowExecution
          ? <ExecutionPanel executionState={executionState} selectedNodeId={selectedNode?.id} onClose={() => setMobilePane(null)} />
          : null

  if (isLoading) return <VisualFlowLoadingState />
  if (error) return <VisualFlowErrorState error={error} onRetry={onRetry} />
  if ((state.nodes || []).length === 0 && !capabilities.canAddNodes) return <VisualFlowEmptyState />

  return (
    <VisualFlowErrorBoundary>
      <VisualFlowProvider nodeRegistry={nodeRegistry} edgeRegistry={edgeRegistry} capabilities={capabilities} executionState={executionState} mode={mode} resolveIcon={resolveIcon}>
        <div className={`flex h-full min-h-[480px] flex-col ${className || ''}`}>
          <VisualFlowToolbar
            toolbar={toolbar}
            capabilities={capabilities}
            canUndo={history.canUndo}
            canRedo={history.canRedo}
            onUndo={history.undo}
            onRedo={history.redo}
            onAutoLayout={handleAutoLayout}
            onValidate={() => {}}
            onToggleMiniMap={() => setMinimapVisible((value) => !value)}
            isDirty={persistence.isDirty}
            onSave={handleSave}
          />

          <div
            className="grid min-h-0 flex-1 grid-cols-1"
            style={isDesktop ? { gridTemplateColumns: buildDesktopColumns(resolvedLeftPanel, resolvedRightPanel) } : undefined}
          >
            {isDesktop && resolvedLeftPanel && <aside className="overflow-y-auto border-e border-[var(--border)] bg-[var(--surface-2)]">{resolvedLeftPanel}</aside>}

            <main className="relative min-h-0">
              <VisualFlowCanvas
                nodes={state.nodes}
                edges={state.edges}
                onNodesChange={state.onNodesChange}
                onEdgesChange={state.onEdgesChange}
                onConnect={(connection) => {
                  state.onConnect(connection)
                  commit()
                }}
                onNodeClick={(event, node) => {
                  selection.onSelectionChange({ nodes: [node], edges: [] })
                  onNodeClick?.(event, node)
                }}
                onPaneClick={() => selection.clearSelection()}
                onSelectionChange={selection.onSelectionChange}
                onDropNode={handleDropNode}
                nodeRegistry={nodeRegistry}
                edgeRegistry={edgeRegistry}
                capabilities={capabilities}
                customConnectionValidators={customConnectionValidators}
                nodeComponents={nodeComponents}
                edgeComponents={edgeComponents}
                fitView={fitView}
                backgroundSlot={showBackground ? <VisualFlowBackground /> : null}
                controlsSlot={showControls ? <VisualFlowControls /> : null}
                miniMapSlot={minimapVisible ? <VisualFlowMiniMap /> : null}
              />
            </main>

            {isDesktop && resolvedRightPanel && <aside className="overflow-y-auto border-s border-[var(--border)] bg-[var(--surface-2)]">{resolvedRightPanel}</aside>}
          </div>

          {bottomPanel && <div className="border-t border-[var(--border)]">{bottomPanel}</div>}

          {!isDesktop && (resolvedLeftPanel || resolvedRightPanel) && (
            <div className="flex items-center justify-center gap-3 border-t border-[var(--border)] p-2">
              {resolvedLeftPanel && (
                <Button variant="outline" size="sm" onClick={() => setMobilePane('library')}>
                  <ListTree size={14} />
                  {t('visualFlow.library.title')}
                </Button>
              )}
              {resolvedRightPanel && (
                <Button variant="outline" size="sm" onClick={() => setMobilePane('properties')} disabled={!selectedNode && !executionState}>
                  <PanelRightOpen size={14} />
                  {t('visualFlow.properties.title')}
                </Button>
              )}
            </div>
          )}

          <AppDrawer open={mobilePane === 'library'} onClose={() => setMobilePane(null)} title={t('visualFlow.library.title')} size="md">
            {resolvedLeftPanel}
          </AppDrawer>
          <AppDrawer open={mobilePane === 'properties' && Boolean(resolvedRightPanel)} onClose={() => setMobilePane(null)} title={t('visualFlow.properties.title')} size="md">
            {resolvedRightPanel}
          </AppDrawer>
        </div>
      </VisualFlowProvider>
    </VisualFlowErrorBoundary>
  )
}

function buildDesktopColumns(left, right) {
  const leftCol = left ? '260px ' : ''
  const rightCol = right ? ' 300px' : ''
  return `${leftCol}minmax(0,1fr)${rightCol}`
}
