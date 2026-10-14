import { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactFlow, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { defaultNodeComponents } from './nodes'
import { defaultEdgeComponents } from './edges'
import { validateConnection } from './utils/flowValidation'
import { generateFlowId } from './utils/idUtils'
import './visual-flow.css'

/**
 * The actual `@xyflow/react` instance. This is the ONLY file besides
 * useVisualFlowState.js/useVisualFlowViewport.js allowed to import
 * `ReactFlow` directly — `<VisualFlow>` composes this with panels/toolbar,
 * and a feature should reach for `<VisualFlow>` first; use this directly
 * only when building a fully custom layout (see docs "Panel System").
 */
export function VisualFlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onSelectionChange,
  onDropNode,
  nodeRegistry,
  edgeRegistry,
  capabilities,
  customConnectionValidators = [],
  nodeComponents,
  edgeComponents,
  showBackground = true,
  backgroundSlot,
  controlsSlot,
  miniMapSlot,
  fitView = true,
  snapToGrid = false,
}) {
  const { t } = useTranslation()
  const { screenToFlowPosition } = useReactFlow()
  const wrapperRef = useRef(null)
  const nodeCacheRef = useRef(new Map())
  const edgeCacheRef = useRef(new Map())

  const nodeTypes = useMemo(() => ({ ...defaultNodeComponents, ...(nodeComponents || {}) }), [nodeComponents])
  const edgeTypes = useMemo(() => ({ ...defaultEdgeComponents, ...(edgeComponents || {}) }), [edgeComponents])

  // `@xyflow/react` re-measures a node's DOM dimensions whenever it
  // receives a node object it hasn't seen before (by reference). Once it
  // measures, it reports the result back via `onNodesChange` (a
  // "dimensions" change), which we apply and hand back to the consumer's
  // controlled state — producing a NEW `nodes` array reference every time,
  // even though nothing about the node actually changed. Rebuilding a
  // brand-new object per node on every recompute (the naive version of
  // this map) therefore never lets React Flow's measurement stabilize:
  // new object → re-measure → onNodesChange → new object → re-measure →
  // ... forever ("Maximum update depth exceeded"). The fix is to keep
  // returning the SAME object reference for a given node id as long as
  // the fields VisualFlow actually derives its rendering from haven't
  // changed — xyflow-internal bookkeeping fields (`measured`, etc.)
  // riding along on the input node are irrelevant to that comparison.
  const flowNodes = useMemo(() => {
    const cache = nodeCacheRef.current
    const nextCache = new Map()

    const result = (nodes || []).map((node) => {
      const definition = nodeRegistry?.get(node.type)
      const fingerprint = JSON.stringify([
        node.type,
        node.position,
        node.data,
        node.selected,
        capabilities?.canMoveNodes,
        capabilities?.canConnectNodes,
        capabilities?.canDeleteNodes,
      ])

      const cached = cache.get(node.id)
      if (cached && cached.fingerprint === fingerprint) {
        nextCache.set(node.id, cached)
        return cached.flowNode
      }

      const flowNode = {
        ...node,
        type: definition?.kind || 'default',
        draggable: capabilities?.canMoveNodes,
        connectable: capabilities?.canConnectNodes,
        deletable: capabilities?.canDeleteNodes,
        data: {
          ...node.data,
          type: node.type,
          resolvedLabel: definition?.labelKey ? t(definition.labelKey) : undefined,
        },
      }
      nextCache.set(node.id, { fingerprint, flowNode })
      return flowNode
    })

    nodeCacheRef.current = nextCache
    return result
  }, [nodes, nodeRegistry, capabilities, t])

  const flowEdges = useMemo(() => {
    const cache = edgeCacheRef.current
    const nextCache = new Map()

    const result = (edges || []).map((edge) => {
      const definition = edgeRegistry?.get(edge.type)
      const fingerprint = JSON.stringify([edge.source, edge.sourceHandle, edge.target, edge.targetHandle, edge.type, edge.data, capabilities?.canDeleteNodes])

      const cached = cache.get(edge.id)
      if (cached && cached.fingerprint === fingerprint) {
        nextCache.set(edge.id, cached)
        return cached.flowEdge
      }

      const flowEdge = {
        ...edge,
        type: 'default',
        deletable: capabilities?.canDeleteNodes,
        animated: definition?.animated || edge.data?.animated,
        data: { ...edge.data, label: edge.data?.label },
      }
      nextCache.set(edge.id, { fingerprint, flowEdge })
      return flowEdge
    })

    edgeCacheRef.current = nextCache
    return result
  }, [edges, edgeRegistry, capabilities])

  const isValidConnection = useCallback(
    (connection) => {
      const result = validateConnection(connection, { nodes, edges, nodeRegistry, customValidators: customConnectionValidators })
      return result.valid
    },
    [nodes, edges, nodeRegistry, customConnectionValidators]
  )

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/visual-flow-node-type')
      if (!type || !onDropNode) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      onDropNode(type, position)
    },
    [onDropNode, screenToFlowPosition]
  )

  return (
    <div ref={wrapperRef} className="ican-visual-flow h-full w-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={capabilities?.canConnectNodes ? onConnect : undefined}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodesDraggable={capabilities?.canMoveNodes}
        nodesConnectable={capabilities?.canConnectNodes}
        elementsSelectable={capabilities?.canSelect}
        multiSelectionKeyCode={capabilities?.canMultiSelect ? ['Shift', 'Meta', 'Control'] : null}
        selectionOnDrag={capabilities?.canMultiSelect}
        panOnDrag
        fitView={fitView}
        snapToGrid={snapToGrid}
        snapGrid={[16, 16]}
        proOptions={{ hideAttribution: true }}
      >
        {showBackground && (backgroundSlot ?? null)}
        {controlsSlot}
        {miniMapSlot}
      </ReactFlow>
    </div>
  )
}
