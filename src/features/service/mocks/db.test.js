// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { getActiveMockTemplate, getCollection, getMockManifest, registerSeed, resetMockDb, setActiveMockTemplate } from './db'

describe('mock db', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('defaults to the devices template', () => {
    expect(getActiveMockTemplate()).toBe('devices')
    expect(getMockManifest().features).toContain('assets')
  })

  it('switches template, persists it and derives features from models', () => {
    setActiveMockTemplate('tourism')
    expect(getMockManifest().models).toEqual(['E'])
    expect(getMockManifest().features).toContain('bookings')
    expect(getMockManifest().features).not.toContain('assets')
    resetMockDb()
    expect(getActiveMockTemplate()).toBe('tourism')
  })

  it('reseeds registered collections on template switch', () => {
    registerSeed('samples', (manifest) => [{ template: manifest.template }])
    expect(getCollection('samples')[0].template).toBe('devices')
    setActiveMockTemplate('shipping')
    expect(getCollection('samples')[0].template).toBe('shipping')
  })
})
