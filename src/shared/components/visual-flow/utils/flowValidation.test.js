import { describe, expect, it } from 'vitest'
import { validateConnection, validateFlow } from './flowValidation'
import { createNodeRegistry } from '../registry/createNodeRegistry'

const nodeRegistry = createNodeRegistry([
  {
    type: 'trigger',
    category: 'triggers',
    labelKey: 'x',
    ports: { inputs: [], outputs: [{ id: 'output', kind: 'source' }] },
    properties: [],
  },
  {
    type: 'task',
    category: 'actions',
    labelKey: 'x',
    ports: { inputs: [{ id: 'input', kind: 'target' }], outputs: [{ id: 'output', kind: 'source' }] },
    properties: [{ key: 'title', type: 'text', required: true }],
  },
])

describe('validateConnection', () => {
  it('rejects a self-connection', () => {
    const result = validateConnection({ source: 'a', target: 'a' }, { nodes: [], edges: [], nodeRegistry })
    expect(result.valid).toBe(false)
    expect(result.reasonKey).toBe('visualFlow.validation.noSelfConnection')
  })

  it('rejects a duplicate connection', () => {
    const edges = [{ id: 'e1', source: 'a', target: 'b' }]
    const result = validateConnection({ source: 'a', target: 'b' }, { nodes: [], edges, nodeRegistry })
    expect(result.valid).toBe(false)
    expect(result.reasonKey).toBe('visualFlow.validation.duplicateConnection')
  })

  it('accepts a normal new connection', () => {
    const result = validateConnection({ source: 'a', target: 'b' }, { nodes: [], edges: [], nodeRegistry })
    expect(result.valid).toBe(true)
  })

  it('runs custom validators and honors a rejection', () => {
    const customValidators = [() => ({ valid: false, reasonKey: 'custom.rule' })]
    const result = validateConnection({ source: 'a', target: 'b' }, { nodes: [], edges: [], nodeRegistry, customValidators })
    expect(result.valid).toBe(false)
    expect(result.reasonKey).toBe('custom.rule')
  })
})

describe('validateFlow', () => {
  it('flags a missing required property as an error', () => {
    const nodes = [{ id: 'n1', type: 'task', data: {} }]
    const result = validateFlow({ nodes, edges: [], nodeRegistry })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.messageKey === 'visualFlow.validation.fieldRequired')).toBe(true)
  })

  it('passes when required properties are filled', () => {
    const nodes = [
      { id: 'trigger', type: 'trigger', data: {} },
      { id: 'n1', type: 'task', data: { title: 'Do the thing' } },
    ]
    const edges = [{ id: 'e1', source: 'trigger', target: 'n1' }]
    const result = validateFlow({ nodes, edges, nodeRegistry })
    expect(result.valid).toBe(true)
  })

  it('flags duplicate node ids', () => {
    const nodes = [
      { id: 'dup', type: 'trigger', data: {} },
      { id: 'dup', type: 'trigger', data: {} },
    ]
    const result = validateFlow({ nodes, edges: [], nodeRegistry })
    expect(result.errors.some((e) => e.messageKey === 'visualFlow.validation.duplicateId')).toBe(true)
  })

  it('requires a trigger when requireTrigger is set', () => {
    const nodes = [{ id: 'n1', type: 'task', data: { title: 'x' } }]
    const result = validateFlow({ nodes, edges: [], nodeRegistry, requireTrigger: true })
    expect(result.errors.some((e) => e.messageKey === 'visualFlow.validation.triggerRequired')).toBe(true)
  })

  it('never throws on an unregistered node type', () => {
    const nodes = [{ id: 'n1', type: 'legacy.unknown', data: {} }]
    expect(() => validateFlow({ nodes, edges: [], nodeRegistry })).not.toThrow()
  })
})
