import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { VisualFlow, createNodeRegistry } from '../../../shared/components/visual-flow'
import { resolveWorkflowIcon } from '../utils/resolveIcon'
import { buildWorkflowVisualGraph } from '../utils/workflowVisualGraph'
import { WorkflowAddVisualNode } from '../nodes/WorkflowAddVisualNode'

const INPUT = [{ id: 'in', kind: 'target' }]
const NEXT = [{ id: 'next', kind: 'source' }]
const BRANCHES = (keys) => keys.map((id) => ({ id, kind: 'source', labelKey: `workflow.builder.branch.${id}` }))

const registry = createNodeRegistry([
  { type: 'workflow.trigger', category: 'workflow', labelKey: 'workflow.builder.triggerLabel', icon: 'Zap', ports: { inputs: [], outputs: NEXT } },
  { type: 'workflow.action', category: 'workflow', labelKey: 'workflow.builder.actionLabel', icon: 'Play', ports: { inputs: INPUT, outputs: NEXT } },
  { type: 'workflow.condition', category: 'workflow', labelKey: 'workflow.builder.conditionLabel', icon: 'GitBranch', ports: { inputs: INPUT, outputs: BRANCHES(['true', 'false']) } },
  { type: 'workflow.wait', category: 'workflow', labelKey: 'workflow.builder.waitLabel', icon: 'Clock', ports: { inputs: INPUT, outputs: NEXT } },
  { type: 'workflow.wait_for_event', category: 'workflow', labelKey: 'workflow.builder.waitForEventLabel', icon: 'Clock', ports: { inputs: INPUT, outputs: BRANCHES(['resolved', 'timeout']) } },
  { type: 'workflow.end', category: 'workflow', labelKey: 'workflow.builder.endLabel', icon: 'CircleStop', ports: { inputs: INPUT, outputs: [] } },
  { type: 'workflow.add', category: 'workflow', labelKey: 'workflow.builder.addStep', kind: 'add', ports: { inputs: INPUT, outputs: [] } },
])

const nodeComponents = { add: WorkflowAddVisualNode }
const capabilities = { canMoveNodes: false, canConnectNodes: false, canDeleteNodes: false, canAddNodes: false, canCopy: false, canPaste: false }
const toolbar = { minimap: true }

export function WorkflowVisualCanvas({ workflow, selection, onSelect, onAddStep }) {
  const { t } = useTranslation()
  const graph = useMemo(() => buildWorkflowVisualGraph(workflow, t), [workflow, t])
  const nodes = useMemo(() => graph.nodes.map((node) => ({
    ...node,
    selected: node.id === 'trigger'
      ? selection?.kind === 'trigger'
      : selection?.kind === 'step' && selection.stepId === node.id,
  })), [graph.nodes, selection])
  const graphKey = JSON.stringify([
    ...graph.nodes.map((node) => [node.id, node.type, node.data.label]),
    ...graph.edges.map((edge) => edge.id),
  ])

  return (
    <VisualFlow
      key={graphKey}
      defaultNodes={nodes}
      defaultEdges={graph.edges}
      nodeRegistry={registry}
      nodeComponents={nodeComponents}
      resolveIcon={resolveWorkflowIcon}
      mode="readonly"
      capabilities={capabilities}
      leftPanel={null}
      rightPanel={null}
      toolbar={toolbar}
      onNodeClick={(_, node) => {
        if (node.data?.anchor) onAddStep(node.data.anchor)
        else if (node.id === 'trigger') onSelect({ kind: 'trigger' })
        else onSelect({ kind: 'step', stepId: node.id })
      }}
      className="min-h-[480px]"
    />
  )
}
