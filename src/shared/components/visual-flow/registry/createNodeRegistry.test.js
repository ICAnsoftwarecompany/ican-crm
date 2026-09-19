import { describe, expect, it } from 'vitest'
import { createNodeRegistry, combineNodeRegistries } from './createNodeRegistry'

describe('createNodeRegistry', () => {
  it('registers and retrieves a definition by type', () => {
    const registry = createNodeRegistry()
    registry.register({ type: 'demo.task', category: 'actions', labelKey: 'x' })
    expect(registry.has('demo.task')).toBe(true)
    expect(registry.get('demo.task').category).toBe('actions')
  })

  it('returns null for an unregistered type instead of throwing', () => {
    const registry = createNodeRegistry()
    expect(registry.get('unknown.type')).toBeNull()
  })

  it('filters by category', () => {
    const registry = createNodeRegistry([
      { type: 'a', category: 'actions' },
      { type: 'b', category: 'triggers' },
      { type: 'c', category: 'actions' },
    ])
    expect(registry.getByCategory('actions').map((d) => d.type)).toEqual(['a', 'c'])
  })

  it('unregisters a type', () => {
    const registry = createNodeRegistry([{ type: 'a', category: 'actions' }])
    registry.unregister('a')
    expect(registry.has('a')).toBe(false)
  })

  it('throws when registering a definition without a type', () => {
    const registry = createNodeRegistry()
    expect(() => registry.register({ category: 'actions' })).toThrow()
  })

  it('combines multiple registries into one (module composition)', () => {
    const core = createNodeRegistry([{ type: 'core.start', category: 'flow_control' }])
    const crm = createNodeRegistry([{ type: 'crm.change_status', category: 'actions' }])
    const combined = combineNodeRegistries([core, crm])
    expect(combined.has('core.start')).toBe(true)
    expect(combined.has('crm.change_status')).toBe(true)
    expect(combined.getAll()).toHaveLength(2)
  })

  it('also accepts plain definition arrays when combining', () => {
    const combined = combineNodeRegistries([[{ type: 'a', category: 'x' }], [{ type: 'b', category: 'y' }]])
    expect(combined.getAll()).toHaveLength(2)
  })
})
