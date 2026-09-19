import { describe, expect, it } from 'vitest'
import { serializeFlow, deserializeFlow } from './serialization'
import { normalizeFlowData } from '../adapters/normalizeFlowData'
import { CURRENT_SCHEMA_VERSION } from '../constants/defaults'

describe('normalizeFlowData', () => {
  it('fills missing ids and positions without throwing', () => {
    const result = normalizeFlowData({ nodes: [{ type: 'task' }], edges: [{ source: 'a', target: 'b' }] })
    expect(result.nodes[0].id).toBeTruthy()
    expect(result.nodes[0].position).toEqual({ x: 0, y: 0 })
    expect(result.edges[0].id).toBeTruthy()
    expect(result.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('tolerates completely empty input', () => {
    expect(normalizeFlowData()).toEqual({ schemaVersion: CURRENT_SCHEMA_VERSION, metadata: {}, viewport: { x: 0, y: 0, zoom: 1 }, nodes: [], edges: [] })
  })

  it('defaults an unrecognized node type to visual-flow.unknown rather than dropping it', () => {
    const result = normalizeFlowData({ nodes: [{ id: 'n1' }] })
    expect(result.nodes[0].type).toBe('visual-flow.unknown')
  })
})

describe('serializeFlow / deserializeFlow', () => {
  it('round-trips a flow through JSON', () => {
    const flow = { nodes: [{ id: 'n1', type: 'task', position: { x: 5, y: 5 }, data: { title: 'x' } }], edges: [] }
    const raw = serializeFlow(flow)
    expect(typeof raw).toBe('string')
    const restored = deserializeFlow(raw)
    expect(restored.nodes[0].id).toBe('n1')
    expect(restored.nodes[0].position).toEqual({ x: 5, y: 5 })
    expect(restored.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })
})
