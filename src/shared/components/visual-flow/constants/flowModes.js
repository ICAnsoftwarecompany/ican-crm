/**
 * VisualFlow modes and the capabilities each one resolves to. UI code must
 * never scatter `mode === 'edit'` checks — always read from
 * `resolveCapabilities()` (or the `capabilities` a consumer explicitly
 * overrides), so adding a future mode (e.g. `debug`) never requires
 * touching every component that currently branches on mode.
 */
export const VISUAL_FLOW_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
  READONLY: 'readonly',
  LIVE: 'live',
  PREVIEW: 'preview',
}

export const VISUAL_FLOW_MODE_LIST = Object.values(VISUAL_FLOW_MODES)

/**
 * @typedef {Object} VisualFlowCapabilities
 * @property {boolean} canAddNodes
 * @property {boolean} canDeleteNodes
 * @property {boolean} canMoveNodes
 * @property {boolean} canConnectNodes
 * @property {boolean} canEditProperties
 * @property {boolean} canSelect
 * @property {boolean} canMultiSelect
 * @property {boolean} canCopy
 * @property {boolean} canPaste
 * @property {boolean} canUndo
 * @property {boolean} canRedo
 * @property {boolean} canRun
 * @property {boolean} showExecutionState
 * @property {boolean} showNodeLibrary
 * @property {boolean} showToolbarEditActions
 */

const BASE_CAPABILITIES = {
  canAddNodes: false,
  canDeleteNodes: false,
  canMoveNodes: false,
  canConnectNodes: false,
  canEditProperties: false,
  canSelect: true,
  canMultiSelect: false,
  canCopy: false,
  canPaste: false,
  canUndo: false,
  canRedo: false,
  canRun: false,
  showExecutionState: false,
  showNodeLibrary: false,
  showToolbarEditActions: false,
}

const EDIT_CAPABILITIES = {
  ...BASE_CAPABILITIES,
  canAddNodes: true,
  canDeleteNodes: true,
  canMoveNodes: true,
  canConnectNodes: true,
  canEditProperties: true,
  canMultiSelect: true,
  canCopy: true,
  canPaste: true,
  canUndo: true,
  canRedo: true,
  showNodeLibrary: true,
  showToolbarEditActions: true,
}

/** @type {Record<string, VisualFlowCapabilities>} */
const CAPABILITIES_BY_MODE = {
  [VISUAL_FLOW_MODES.CREATE]: EDIT_CAPABILITIES,
  [VISUAL_FLOW_MODES.EDIT]: EDIT_CAPABILITIES,
  [VISUAL_FLOW_MODES.READONLY]: { ...BASE_CAPABILITIES },
  [VISUAL_FLOW_MODES.PREVIEW]: { ...BASE_CAPABILITIES, canSelect: false },
  [VISUAL_FLOW_MODES.LIVE]: { ...BASE_CAPABILITIES, showExecutionState: true, canRun: true },
}

/**
 * @param {string} mode
 * @param {Partial<VisualFlowCapabilities>} [overrides] - Explicit per-instance overrides (e.g. a readonly flow that still allows copy for inspection). Always wins over the mode default.
 * @returns {VisualFlowCapabilities}
 */
export function resolveCapabilities(mode, overrides) {
  const base = CAPABILITIES_BY_MODE[mode] || CAPABILITIES_BY_MODE[VISUAL_FLOW_MODES.READONLY]
  return { ...base, ...(overrides || {}) }
}
