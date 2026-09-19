import { getAction, getTrigger } from '../registry/workflowRegistry'

const HORIZONTAL_GAP = 300
const VERTICAL_GAP = 176

const BRANCH_LABEL_KEYS = {
  true: 'workflow.builder.branch.true',
  false: 'workflow.builder.branch.false',
  resolved: 'workflow.builder.branch.resolved',
  timeout: 'workflow.builder.branch.timeout',
}

export function buildWorkflowVisualGraph(workflow, t) {
  const nodes = []
  const edges = []
  let leafIndex = 0

  function addEdge(parentId, nodeId, branch) {
    if (!parentId) return
    edges.push({
      id: `${parentId}:${branch || 'next'}:${nodeId}`,
      source: parentId,
      sourceHandle: branch || 'next',
      target: nodeId,
      targetHandle: 'in',
      data: branch ? { label: t(BRANCH_LABEL_KEYS[branch]) } : {},
    })
  }

  function visit(step, anchor, parentId, branch, depth) {
    if (!step) {
      const x = leafIndex++ * HORIZONTAL_GAP
      const id = `add:${anchor.parent}:${anchor.slot || 'root'}`
      nodes.push({ id, type: 'workflow.add', position: { x, y: depth * VERTICAL_GAP }, data: { anchor } })
      addEdge(parentId, id, branch)
      return x
    }

    const definition = step.type === 'action' ? getAction(step.definitionId) : null
    const labelKey = definition?.labelKey || {
      action: 'workflow.builder.selectAction',
      condition: 'workflow.builder.conditionLabel',
      wait: 'workflow.builder.waitLabel',
      wait_for_event: 'workflow.builder.waitForEventLabel',
      end: 'workflow.builder.endLabel',
    }[step.type]

    const node = {
      id: step.id,
      type: `workflow.${step.type}`,
      position: { x: 0, y: depth * VERTICAL_GAP },
      data: {
        label: labelKey ? t(labelKey) : step.type,
        portLabels: step.type === 'condition'
          ? { true: t(BRANCH_LABEL_KEYS.true), false: t(BRANCH_LABEL_KEYS.false) }
          : step.type === 'wait_for_event'
            ? { resolved: t(BRANCH_LABEL_KEYS.resolved), timeout: t(BRANCH_LABEL_KEYS.timeout) }
            : undefined,
      },
    }
    nodes.push(node)
    addEdge(parentId, node.id, branch)

    let childPositions = []
    if (step.type === 'condition' || step.type === 'wait_for_event') {
      const branchKeys = step.type === 'condition' ? ['true', 'false'] : ['resolved', 'timeout']
      childPositions = branchKeys.map((key) => visit(step.branches?.[key], { parent: step.id, slot: key }, step.id, key, depth + 1))
    } else if (step.type !== 'end') {
      childPositions = [visit(step.next, { parent: step.id, slot: 'next' }, step.id, null, depth + 1)]
    }

    const x = childPositions.length
      ? (childPositions[0] + childPositions[childPositions.length - 1]) / 2
      : leafIndex++ * HORIZONTAL_GAP
    node.position.x = x
    return x
  }

  const rootX = visit(workflow?.rootStep, { parent: 'root' }, 'trigger', null, 1)
  const triggerDefinition = workflow?.trigger?.definitionId ? getTrigger(workflow.trigger.definitionId) : null
  nodes.push({
    id: 'trigger',
    type: 'workflow.trigger',
    position: { x: rootX, y: 0 },
    data: { label: t(triggerDefinition?.labelKey || 'workflow.builder.selectTrigger') },
  })

  return { nodes, edges }
}
