import { describe, expect, it } from 'vitest'
import { addStatus, moveStatus, pipelineProblems, removeStatus, setInitial, toggleTransition } from './pipelineEditing'

const s = (id, key, extra = {}) => ({ id, key, label: { en: key }, category: 'open', ...extra })

describe('pipeline editing helpers', () => {
  it('adds, moves and removes statuses (with their transitions)', () => {
    const statuses = addStatus([s('a', 'a', { is_initial: true })])
    expect(statuses[1].id).toMatch(/^tmp-/)
    expect(moveStatus(statuses, 1, -1)[0].id).toBe(statuses[1].id)
    const next = removeStatus({ statuses: [s('a', 'a'), s('b', 'b')], transitions: [{ from: 'a', to: 'b' }] }, 'b')
    expect(next).toEqual({ statuses: [s('a', 'a')], transitions: [] })
  })

  it('keeps exactly one initial status', () => {
    expect(setInitial([s('a', 'a', { is_initial: true }), s('b', 'b')], 'b').map((status) => status.is_initial)).toEqual([false, true])
  })

  it('toggles transitions without duplicates', () => {
    const once = toggleTransition([], 'a', 'b', true)
    expect(toggleTransition(once, 'a', 'b', true)).toHaveLength(1)
    expect(toggleTransition(once, 'a', 'b', false)).toHaveLength(0)
  })

  it('reports problems: initial, duplicate key, unreachable', () => {
    expect(pipelineProblems({ statuses: [s('a', 'a'), s('b', 'a')], transitions: [] })).toEqual(['oneInitial', 'duplicateKey', 'unreachable'])
    expect(pipelineProblems({ statuses: [s('a', 'a', { is_initial: true }), s('b', 'b')], transitions: [{ from: 'a', to: 'b' }] })).toEqual([])
  })
})
