/**
 * Core node types owned by the Workflow Engine itself. These are generic
 * containers — a module never introduces a new node TYPE (no
 * "WhatsAppNode"/"TicketNode"); it only registers definitions (see
 * registry/workflowRegistry.js) that get placed inside a `action`/`trigger`/
 * `condition` node. See docs/WORKFLOW_ENGINE_ARCHITECTURE_AR.md, section
 * "الفرق بين Node Types و Module Definitions".
 */
export const NODE_TYPES = {
  TRIGGER: 'trigger',
  CONDITION: 'condition',
  ACTION: 'action',
  WAIT: 'wait',
  WAIT_FOR_EVENT: 'wait_for_event',
  END: 'end',
}

export const NODE_TYPE_LIST = Object.values(NODE_TYPES)

export const WAIT_UNITS = ['minutes', 'hours', 'days']

export const CONDITION_BRANCH_KEYS = { TRUE: 'true', FALSE: 'false' }
export const WAIT_FOR_EVENT_BRANCH_KEYS = { RESOLVED: 'resolved', TIMEOUT: 'timeout' }
