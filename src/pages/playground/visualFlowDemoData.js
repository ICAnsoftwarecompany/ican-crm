import { createNodeRegistry, combineNodeRegistries } from '../../shared/components/visual-flow/registry/createNodeRegistry'
import { createEdgeRegistry } from '../../shared/components/visual-flow/registry/createEdgeRegistry'
import { defaultNodeRegistry } from '../../shared/components/visual-flow/registry/defaultNodeRegistry'

/**
 * Sample DOMAIN definitions for the /playground/visual-flow demos. These
 * intentionally live in `pages/playground/`, NOT inside
 * `shared/components/visual-flow/` — proving the framework's own rule
 * that domain node definitions are feature-owned, never part of core.
 */

// ---------------------------------------------------------------------------
// 1) Workflow Editor demo (edit mode)
// ---------------------------------------------------------------------------
export const demoWorkflowNodeRegistry = combineNodeRegistries([
  defaultNodeRegistry,
  createNodeRegistry([
    {
      type: 'demo.trigger.lead_created',
      category: 'triggers',
      labelKey: 'visualFlowDemo.nodes.leadCreated',
      icon: 'Zap',
      colorToken: '--vf-node-trigger',
      kind: 'default',
      ports: { inputs: [], outputs: [{ id: 'output', kind: 'source' }] },
      properties: [],
    },
    {
      type: 'demo.logic.check_source',
      category: 'logic',
      labelKey: 'visualFlowDemo.nodes.checkSource',
      icon: 'GitBranch',
      colorToken: '--vf-node-condition',
      kind: 'default',
      ports: {
        inputs: [{ id: 'input', kind: 'target' }],
        outputs: [
          { id: 'facebook', labelKey: 'visualFlowDemo.branches.facebook', kind: 'source' },
          { id: 'other', labelKey: 'visualFlowDemo.branches.other', kind: 'source' },
        ],
      },
      properties: [{ key: 'field', type: 'text', labelKey: 'visualFlowDemo.fields.field' }],
    },
    {
      type: 'demo.action.create_task',
      category: 'actions',
      labelKey: 'visualFlowDemo.nodes.createTask',
      icon: 'CheckSquare',
      colorToken: '--vf-node-action',
      kind: 'default',
      ports: { inputs: [{ id: 'input', kind: 'target' }], outputs: [{ id: 'output', kind: 'source' }] },
      properties: [
        { key: 'title', type: 'text', labelKey: 'visualFlowDemo.fields.title', required: true },
        { key: 'priority', type: 'select', labelKey: 'visualFlowDemo.fields.priority', options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ] },
      ],
    },
  ]),
])

export const demoEdgeRegistry = createEdgeRegistry([
  { type: 'default', colorToken: '--vf-edge-default' },
  { type: 'conditional', colorToken: '--vf-edge-conditional' },
])

export const demoWorkflowNodes = [
  { id: 'trigger', type: 'demo.trigger.lead_created', position: { x: 0, y: 0 }, data: {} },
  { id: 'condition', type: 'demo.logic.check_source', position: { x: 0, y: 140 }, data: { field: 'lead.source' } },
  { id: 'task', type: 'demo.action.create_task', position: { x: -140, y: 300 }, data: { title: 'Follow up new Facebook lead', priority: 'high' } },
  { id: 'end', type: 'visual-flow.end', position: { x: 140, y: 300 }, data: {} },
]

export const demoWorkflowEdges = [
  { id: 'e1', source: 'trigger', target: 'condition', type: 'default', data: {} },
  { id: 'e2', source: 'condition', sourceHandle: 'facebook', target: 'task', type: 'conditional', data: { label: 'Facebook' } },
  { id: 'e3', source: 'condition', sourceHandle: 'other', target: 'end', type: 'conditional', data: { label: 'Other' } },
]

// ---------------------------------------------------------------------------
// 2) Generic readonly "approval process" demo
// ---------------------------------------------------------------------------
export const approvalProcessRegistry = combineNodeRegistries([
  defaultNodeRegistry,
  createNodeRegistry([
    {
      type: 'demo.approval.step',
      category: 'flow_control',
      labelKey: 'visualFlowDemo.nodes.genericStep',
      icon: 'CircleDot',
      colorToken: '--vf-node-data',
      kind: 'default',
      ports: { inputs: [{ id: 'input', kind: 'target' }], outputs: [{ id: 'output', kind: 'source' }] },
      properties: [],
    },
  ]),
])

export const approvalProcessNodes = [
  { id: 'start', type: 'visual-flow.start', position: { x: 140, y: 0 }, data: { label: 'Submitted' } },
  { id: 'submitted', type: 'demo.approval.step', position: { x: 0, y: 100 }, data: { label: 'Submitted', summary: 'Proposal submitted for review' } },
  { id: 'review', type: 'demo.approval.step', position: { x: 0, y: 220 }, data: { label: 'Under Review', summary: 'Manager reviewing terms' } },
  { id: 'approved', type: 'demo.approval.step', position: { x: 0, y: 340 }, data: { label: 'Approved', summary: 'Ready to send to customer' } },
  { id: 'end', type: 'visual-flow.end', position: { x: 140, y: 460 }, data: { label: 'Done' } },
]

export const approvalProcessEdges = [
  { id: 'a1', source: 'start', target: 'submitted', type: 'default', data: {} },
  { id: 'a2', source: 'submitted', target: 'review', type: 'default', data: {} },
  { id: 'a3', source: 'review', target: 'approved', type: 'default', data: {} },
  { id: 'a4', source: 'approved', target: 'end', type: 'default', data: {} },
]

// ---------------------------------------------------------------------------
// 3) Lead Journey demo (readonly, linear entity lifecycle)
// ---------------------------------------------------------------------------
export const leadJourneyRegistry = combineNodeRegistries([
  defaultNodeRegistry,
  createNodeRegistry([
    {
      type: 'lead-journey.stage',
      category: 'data',
      labelKey: 'visualFlowDemo.nodes.leadStage',
      icon: 'UserCheck',
      colorToken: '--vf-node-data',
      kind: 'default',
      ports: { inputs: [{ id: 'input', kind: 'target' }], outputs: [{ id: 'output', kind: 'source' }] },
      properties: [],
    },
  ]),
])

const LEAD_STAGES = ['New Lead', 'Assigned', 'Contacted', 'Interested', 'Proposal', 'Won']

export const leadJourneyNodes = LEAD_STAGES.map((label, index) => ({
  id: `stage_${index}`,
  type: 'lead-journey.stage',
  position: { x: 0, y: index * 120 },
  data: { label },
}))

export const leadJourneyEdges = LEAD_STAGES.slice(1).map((_, index) => ({
  id: `stage_edge_${index}`,
  source: `stage_${index}`,
  target: `stage_${index + 1}`,
  type: 'default',
  data: {},
}))

// ---------------------------------------------------------------------------
// 4) Opportunity Journey demo (readonly/live, branching)
// ---------------------------------------------------------------------------
export const opportunityJourneyRegistry = combineNodeRegistries([
  defaultNodeRegistry,
  createNodeRegistry([
    {
      type: 'opportunity-journey.step',
      category: 'ai',
      labelKey: 'visualFlowDemo.nodes.genericStep',
      icon: 'Sparkles',
      colorToken: '--vf-node-data',
      kind: 'default',
      ports: { inputs: [{ id: 'input', kind: 'target' }], outputs: [{ id: 'output', kind: 'source' }] },
      properties: [],
    },
  ]),
])

export const opportunityJourneyNodes = [
  { id: 'detected', type: 'opportunity-journey.step', position: { x: 100, y: 0 }, data: { label: 'Opportunity Detected' } },
  { id: 'analysis', type: 'opportunity-journey.step', position: { x: 100, y: 120 }, data: { label: 'AI Analysis' } },
  { id: 'score', type: 'opportunity-journey.step', position: { x: 100, y: 240 }, data: { label: 'Score' } },
  { id: 'high', type: 'opportunity-journey.step', position: { x: 0, y: 360 }, data: { label: 'Create Task', summary: 'High score' } },
  { id: 'low', type: 'opportunity-journey.step', position: { x: 220, y: 360 }, data: { label: 'Monitor', summary: 'Low score' } },
]

export const opportunityJourneyEdges = [
  { id: 'o1', source: 'detected', target: 'analysis', type: 'default', data: {} },
  { id: 'o2', source: 'analysis', target: 'score', type: 'default', data: {} },
  { id: 'o3', source: 'score', target: 'high', type: 'conditional', data: { label: 'High' } },
  { id: 'o4', source: 'score', target: 'low', type: 'conditional', data: { label: 'Low' } },
]

// ---------------------------------------------------------------------------
// 5) Live execution demo — same workflow graph, only executionState differs
// ---------------------------------------------------------------------------
export const demoExecutionState = {
  executionId: 'exec_demo_1',
  startedAt: '2026-09-19 10:00:00',
  status: 'running',
  nodes: {
    trigger: { status: 'success', startedAt: '10:00:00', completedAt: '10:00:01' },
    condition: { status: 'success', startedAt: '10:00:01', completedAt: '10:00:01', output: { source: 'facebook' } },
    task: { status: 'running', startedAt: '10:00:02' },
    end: { status: 'idle' },
  },
}
