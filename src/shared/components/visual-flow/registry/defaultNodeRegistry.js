import { createNodeRegistry } from './createNodeRegistry'
import { DEFAULT_NODE_CATEGORIES } from '../constants/nodeCategories'
import { DEFAULT_PORT_IDS } from '../constants/defaults'

/**
 * Domain-agnostic node primitives — Start/End/Group/Data/Unknown are
 * genuinely generic concepts, not specific to Workflow/Leads/Campaigns/
 * anything else, so (unlike Trigger/Action/Condition/Delay/Branch, which
 * are just BaseNode with different default styling registered by the
 * FEATURE that needs them) these live in VisualFlow core itself as an
 * opt-in default registry. A consumer is never required to use this
 * registry — `combineNodeRegistries([defaultNodeRegistry, myNodes])` is
 * opt-in, not automatic.
 */
export const defaultNodeRegistry = createNodeRegistry([
  {
    type: 'visual-flow.start',
    category: DEFAULT_NODE_CATEGORIES.FLOW_CONTROL,
    labelKey: 'visualFlow.nodes.start.label',
    icon: 'Play',
    colorToken: '--vf-node-start',
    kind: 'start',
    ports: { inputs: [], outputs: [{ id: DEFAULT_PORT_IDS.OUTPUT, kind: 'source' }] },
    properties: [],
  },
  {
    type: 'visual-flow.end',
    category: DEFAULT_NODE_CATEGORIES.FLOW_CONTROL,
    labelKey: 'visualFlow.nodes.end.label',
    icon: 'Flag',
    colorToken: '--vf-node-end',
    kind: 'end',
    ports: { inputs: [{ id: DEFAULT_PORT_IDS.INPUT, kind: 'target' }], outputs: [] },
    properties: [],
  },
  {
    type: 'visual-flow.group',
    category: DEFAULT_NODE_CATEGORIES.UTILITIES,
    labelKey: 'visualFlow.nodes.group.label',
    icon: 'Group',
    colorToken: '--vf-node-group',
    kind: 'default',
    ports: {
      inputs: [{ id: DEFAULT_PORT_IDS.INPUT, kind: 'target' }],
      outputs: [{ id: DEFAULT_PORT_IDS.OUTPUT, kind: 'source' }],
    },
    properties: [{ key: 'label', type: 'text', labelKey: 'visualFlow.nodes.group.labelField' }],
  },
  {
    type: 'visual-flow.data',
    category: DEFAULT_NODE_CATEGORIES.DATA,
    labelKey: 'visualFlow.nodes.data.label',
    icon: 'Database',
    colorToken: '--vf-node-data',
    kind: 'default',
    ports: {
      inputs: [{ id: DEFAULT_PORT_IDS.INPUT, kind: 'target' }],
      outputs: [{ id: DEFAULT_PORT_IDS.OUTPUT, kind: 'source' }],
    },
    properties: [{ key: 'label', type: 'text', labelKey: 'visualFlow.nodes.data.labelField' }],
  },
])
