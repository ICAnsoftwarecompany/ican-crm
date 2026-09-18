/**
 * VisualFlow contracts, documented via JSDoc so the codebase stays
 * TypeScript-ready without requiring a JS→TS migration today. This file
 * exports nothing executable — it exists purely for the typedefs below,
 * referenced from other files via `@param {import('.../types').X}`.
 *
 * @typedef {Object} VisualFlowPosition
 * @property {number} x
 * @property {number} y
 *
 * @typedef {Object} VisualFlowNode
 * @property {string} id
 * @property {string} type - Registry type id (e.g. 'lead.status_changed', 'task.create'). NOT a rendering component name.
 * @property {VisualFlowPosition} position
 * @property {Object} data - Arbitrary node data (config values, label overrides). Domain-specific, opaque to VisualFlow itself.
 * @property {Object} [metadata] - Non-visual bookkeeping (createdAt, source, etc.) a feature may want to round-trip.
 * @property {boolean} [selected]
 *
 * @typedef {Object} VisualFlowEdge
 * @property {string} id
 * @property {string} source
 * @property {string} [sourceHandle]
 * @property {string} target
 * @property {string} [targetHandle]
 * @property {string} [type] - Edge registry type id (e.g. 'conditional', 'animated'). Defaults to 'default'.
 * @property {Object} [data] - e.g. { label: 'True', status: 'success' }.
 *
 * @typedef {Object} VisualFlowModel
 * @property {number} schemaVersion
 * @property {Object} [metadata] - { name, version, ... } — flow-level, not backend envelope.
 * @property {VisualFlowPosition & {zoom:number}} [viewport]
 * @property {VisualFlowNode[]} nodes
 * @property {VisualFlowEdge[]} edges
 *
 * @typedef {Object} VisualFlowPortDefinition
 * @property {string} id
 * @property {string} [labelKey]
 * @property {'source'|'target'} kind
 * @property {number} [maxConnections] - Omit for unlimited.
 * @property {string[]} [accepts] - Restrict which port ids on the other side this port may connect to. Omit to accept any.
 *
 * @typedef {Object} VisualFlowPropertyField
 * @property {string} key
 * @property {'text'|'textarea'|'number'|'select'|'multiselect'|'boolean'|'date'|'datetime'|'duration'|'user'|'team'|'entity'|'template'|'custom'} type
 * @property {string} [labelKey]
 * @property {boolean} [required]
 * @property {{value:string,label:string}[]} [options] - For 'select'/'multiselect' when options are static (not data-source driven).
 * @property {string} [source] - Data-source key resolved by the CONSUMING feature (VisualFlow core never fetches data itself).
 * @property {React.ComponentType} [component] - Required when type === 'custom'.
 *
 * @typedef {Object} VisualFlowNodeDefinition
 * @property {string} type - Unique id across the whole registry.
 * @property {string} category
 * @property {string} labelKey
 * @property {string} [descriptionKey]
 * @property {string} [icon] - Icon name resolved by the consuming feature's icon resolver (VisualFlow core stays icon-library-agnostic — see docs).
 * @property {string} [colorToken] - A CSS custom property name (e.g. '--accent'), never a literal hex baked into core.
 * @property {'start'|'end'|'unknown'|'default'} [kind] - Selects which built-in node component renders it; 'default' (BaseNode) unless the node needs a genuinely distinct shape.
 * @property {Object} [defaultData]
 * @property {{inputs: VisualFlowPortDefinition[], outputs: VisualFlowPortDefinition[]}} [ports]
 * @property {VisualFlowPropertyField[]} [properties]
 * @property {(data: Object) => {valid: boolean, errors?: string[]}} [validate]
 * @property {Object} [capabilities] - Per-definition capability overrides (e.g. a locked/system node that can't be deleted even in edit mode).
 * @property {boolean} [recommended]
 * @property {boolean} [disabled]
 * @property {string} [disabledReasonKey]
 *
 * @typedef {Object} VisualFlowEdgeDefinition
 * @property {string} type
 * @property {string} [labelKey]
 * @property {boolean} [animated]
 * @property {string} [colorToken]
 *
 * @typedef {Object} VisualFlowValidationIssue
 * @property {string} [nodeId]
 * @property {string} [edgeId]
 * @property {string} messageKey
 * @property {Object} [messageParams]
 *
 * @typedef {Object} VisualFlowValidationResult
 * @property {boolean} valid
 * @property {VisualFlowValidationIssue[]} errors
 * @property {VisualFlowValidationIssue[]} warnings
 *
 * @typedef {Object} VisualFlowAdapter
 * @property {(apiData: any) => VisualFlowModel} fromApi
 * @property {(flow: VisualFlowModel) => any} toApi
 */

export {}
