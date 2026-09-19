import { describe, expect, it } from 'vitest'
import { duplicateNodes, findEdgeById, findNodeById, getIncomers, getOutgoers, hasCycle } from './graphUtils'

const nodes = [
  { id: 'a', position: { x: 0, y: 0 }, data: {} },
  { id: 'b', position: { x: 0, y: 100 }, data: {} },
  { id: 'c', position: { x: 0, y: 200 }, data: {} },
]
const edges = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
]

describe('graphUtils', () => {
  it('finds nodes and edges by id', () => {
    expect(findNodeById(nodes, 'b').id).toBe('b')
    expect(findEdgeById(edges, 'e1').source).toBe('a')
    expect(findNodeById(nodes, 'missing')).toBeNull()
  })

  it('resolves incomers/outgoers', () => {
    expect(getOutgoers('a', nodes, edges).map((n) => n.id)).toEqual(['b'])
    expect(getIncomers('c', nodes, edges).map((n) => n.id)).toEqual(['b'])
    expect(getIncomers('a', nodes, edges)).toEqual([])
  })

  it('detects no cycle in a linear chain', () => {
    expect(hasCycle(nodes, edges)).toBe(false)
  })

  it('detects a real cycle', () => {
    const cyclicEdges = [...edges, { id: 'e3', source: 'c', target: 'a' }]
    expect(hasCycle(nodes, cyclicEdges)).toBe(true)
  })

  it('duplicates nodes with fresh ids, preserves internal edges, drops boundary-crossing edges, offsets position', () => {
    const result = duplicateNodes([nodes[0], nodes[1]], edges, { offset: { x: 10, y: 10 } })
    expect(result.nodes).toHaveLength(2)
    expect(result.nodes[0].id).not.toBe('a')
    expect(result.nodes[0].position).toEqual({ x: 10, y: 10 })
    expect(result.edges).toHaveLength(1) // only e1 (a->b) is internal; e2 (b->c) crosses the boundary
    expect(result.edges[0].source).toBe(result.nodes[0].id)
    expect(result.edges[0].target).toBe(result.nodes[1].id)
  })
})
