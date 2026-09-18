/**
 * Default, domain-agnostic node categories. Feature modules registering
 * definitions may use these OR register their own category ids — the
 * NodeLibraryPanel groups strictly by whatever category id a definition
 * declares, it does not require this list to be exhaustive.
 */
export const DEFAULT_NODE_CATEGORIES = {
  TRIGGERS: 'triggers',
  LOGIC: 'logic',
  ACTIONS: 'actions',
  TIMING: 'timing',
  DATA: 'data',
  FLOW_CONTROL: 'flow_control',
  AI: 'ai',
  UTILITIES: 'utilities',
}

export const DEFAULT_NODE_CATEGORY_LABEL_KEYS = {
  [DEFAULT_NODE_CATEGORIES.TRIGGERS]: 'visualFlow.categories.triggers',
  [DEFAULT_NODE_CATEGORIES.LOGIC]: 'visualFlow.categories.logic',
  [DEFAULT_NODE_CATEGORIES.ACTIONS]: 'visualFlow.categories.actions',
  [DEFAULT_NODE_CATEGORIES.TIMING]: 'visualFlow.categories.timing',
  [DEFAULT_NODE_CATEGORIES.DATA]: 'visualFlow.categories.data',
  [DEFAULT_NODE_CATEGORIES.FLOW_CONTROL]: 'visualFlow.categories.flowControl',
  [DEFAULT_NODE_CATEGORIES.AI]: 'visualFlow.categories.ai',
  [DEFAULT_NODE_CATEGORIES.UTILITIES]: 'visualFlow.categories.utilities',
}
