import { describe, expect, it } from 'vitest'
import { buildWorkflowVisualGraph } from './workflowVisualGraph'

const t = (key) => key

describe('buildWorkflowVisualGraph', () => {
  it('keeps the trigger and an editable root slot for an empty workflow', () => {
    const { nodes, edges } = buildWorkflowVisualGraph({ trigger: null, rootStep: null }, t)
    expect(nodes.map((node) => node.id)).toEqual(['add:root:root', 'trigger'])
    expect(edges).toMatchObject([{ source: 'trigger', sourceHandle: 'next', target: 'add:root:root' }])
    expect(nodes[1].position.x).toBe(nodes[0].position.x)
  })

  it('preserves both branch anchors and labels without changing the workflow tree', () => {
    const workflow = {
      trigger: { definitionId: 'test.trigger', config: {} },
      rootStep: {
        id: 'condition-1',
        type: 'condition',
        config: {},
        branches: {
          true: { id: 'end-1', type: 'end', config: {} },
          false: null,
        },
      },
    }
    const original = JSON.stringify(workflow)
    const { nodes, edges } = buildWorkflowVisualGraph(workflow, t)

    expect(nodes.map((node) => node.id)).toEqual(['condition-1', 'end-1', 'add:condition-1:false', 'trigger'])
    expect(nodes[2].data.anchor).toEqual({ parent: 'condition-1', slot: 'false' })
    expect(edges.find((edge) => edge.sourceHandle === 'true')).toMatchObject({ target: 'end-1', data: { label: 'workflow.builder.branch.true' } })
    expect(edges.find((edge) => edge.sourceHandle === 'false')).toMatchObject({ target: 'add:condition-1:false', data: { label: 'workflow.builder.branch.false' } })
    expect(JSON.stringify(workflow)).toBe(original)
  })
})
