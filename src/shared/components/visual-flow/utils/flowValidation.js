import { isDuplicateConnection } from './edgeUtils'
import { getIncomers, getOutgoers, hasCycle } from './graphUtils'

/**
 * Generic connection-time validation (called from VisualFlowCanvas's
 * `isValidConnection`, before an edge is even created). Combines built-in
 * generic rules with any domain-specific validators a feature supplies —
 * VisualFlow core never assumes what "invalid" means beyond structural
 * rules (self-connection, port capacity, port type compatibility).
 *
 * @param {{source:string, sourceHandle?:string, target:string, targetHandle?:string}} connection
 * @param {{nodes: import('../types').VisualFlowNode[], edges: import('../types').VisualFlowEdge[], nodeRegistry: ReturnType<typeof import('../registry/createNodeRegistry').createNodeRegistry>, customValidators?: Function[]}} context
 * @returns {{valid: boolean, reasonKey?: string}}
 */
export function validateConnection(connection, context) {
  const { source, sourceHandle, target, targetHandle } = connection
  const { nodes, edges, nodeRegistry, customValidators = [] } = context

  if (source === target) {
    return { valid: false, reasonKey: 'visualFlow.validation.noSelfConnection' }
  }

  if (isDuplicateConnection(edges, connection)) {
    return { valid: false, reasonKey: 'visualFlow.validation.duplicateConnection' }
  }

  const sourceNode = nodes.find((node) => node.id === source)
  const targetNode = nodes.find((node) => node.id === target)
  const sourceDefinition = nodeRegistry?.get(sourceNode?.type)
  const targetDefinition = nodeRegistry?.get(targetNode?.type)

  const sourcePort = sourceDefinition?.ports?.outputs?.find((port) => port.id === (sourceHandle || 'output'))
  const targetPort = targetDefinition?.ports?.inputs?.find((port) => port.id === (targetHandle || 'input'))

  if (sourcePort?.maxConnections) {
    const existingFromPort = edges.filter((edge) => edge.source === source && (edge.sourceHandle || 'output') === (sourceHandle || 'output'))
    if (existingFromPort.length >= sourcePort.maxConnections) {
      return { valid: false, reasonKey: 'visualFlow.validation.portMaxConnections' }
    }
  }

  if (targetPort?.maxConnections) {
    const existingToPort = edges.filter((edge) => edge.target === target && (edge.targetHandle || 'input') === (targetHandle || 'input'))
    if (existingToPort.length >= targetPort.maxConnections) {
      return { valid: false, reasonKey: 'visualFlow.validation.portMaxConnections' }
    }
  }

  if (sourcePort?.accepts && !sourcePort.accepts.includes(targetHandle || 'input')) {
    return { valid: false, reasonKey: 'visualFlow.validation.portTypeMismatch' }
  }

  for (const validator of customValidators) {
    const result = validator({ source, sourceHandle, target, targetHandle, nodes, edges, sourceNode, targetNode })
    if (result && result.valid === false) return result
  }

  return { valid: true }
}

/**
 * Whole-flow validation, run before allowing an "activate"-style
 * transition (mirrors the same errors/warnings split used by the
 * Workflow Engine's own validator — see docs "Flow Validation").
 *
 * @param {{nodes: import('../types').VisualFlowNode[], edges: import('../types').VisualFlowEdge[], nodeRegistry: ReturnType<typeof import('../registry/createNodeRegistry').createNodeRegistry>, requireTrigger?: boolean, preventCycles?: boolean}} params
 * @returns {import('../types').VisualFlowValidationResult}
 */
export function validateFlow({ nodes = [], edges = [], nodeRegistry, requireTrigger = false, preventCycles = false }) {
  const errors = []
  const warnings = []

  const idCounts = new Map()
  nodes.forEach((node) => idCounts.set(node.id, (idCounts.get(node.id) || 0) + 1))
  idCounts.forEach((count, id) => {
    if (count > 1) errors.push({ nodeId: id, messageKey: 'visualFlow.validation.duplicateId' })
  })

  nodes.forEach((node) => {
    const definition = nodeRegistry?.get(node.type)
    if (!definition) return // unknown/unregistered node types are a rendering concern (UnknownNode), not a validation error by themselves

    ;(definition.properties || []).forEach((field) => {
      if (field.required && isEmpty(node.data?.[field.key])) {
        errors.push({ nodeId: node.id, messageKey: 'visualFlow.validation.fieldRequired', messageParams: { field: field.key } })
      }
    })

    if (typeof definition.validate === 'function') {
      const result = definition.validate(node.data)
      if (result && result.valid === false) {
        (result.errors || []).forEach((message) =>
          errors.push({ nodeId: node.id, messageKey: 'visualFlow.validation.customError', messageParams: { message } })
        )
      }
    }

    const requiredInputs = (definition.ports?.inputs || []).length > 0
    if (requiredInputs && getIncomers(node.id, nodes, edges).length === 0 && definition.kind !== 'start') {
      warnings.push({ nodeId: node.id, messageKey: 'visualFlow.validation.disconnectedNode' })
    }

    const hasOutputs = (definition.ports?.outputs || []).length > 0
    if (hasOutputs && getOutgoers(node.id, nodes, edges).length === 0 && definition.kind !== 'end') {
      warnings.push({ nodeId: node.id, messageKey: 'visualFlow.validation.noOutgoingConnection' })
    }
  })

  if (requireTrigger) {
    const hasTrigger = nodes.some((node) => nodeRegistry?.get(node.type)?.category === 'triggers')
    if (!hasTrigger) errors.push({ messageKey: 'visualFlow.validation.triggerRequired' })
  }

  if (preventCycles && hasCycle(nodes, edges)) {
    errors.push({ messageKey: 'visualFlow.validation.cycleDetected' })
  }

  return { valid: errors.length === 0, errors, warnings }
}

function isEmpty(value) {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}
