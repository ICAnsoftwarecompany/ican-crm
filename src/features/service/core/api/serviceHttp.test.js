// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../../services/httpClient', () => ({
  default: {
    get: vi.fn((url, config) => Promise.resolve({ url, config })),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const { isModuleMocked, withServiceTransport, createServiceApi } = await import('./serviceHttp')

describe('isModuleMocked', () => {
  it('auto mode follows the module registry', () => {
    expect(isModuleMocked('capabilities', 'auto')).toBe(true)
    expect(isModuleMocked('unknown-module', 'auto')).toBe(true)
  })

  it('all / none override the registry', () => {
    expect(isModuleMocked('capabilities', 'none')).toBe(false)
    expect(isModuleMocked('capabilities', 'all')).toBe(true)
  })
})

describe('withServiceTransport', () => {
  it('adds the mock adapter only for mocked modules', () => {
    const config = withServiceTransport('capabilities', { params: { a: 1 } })
    expect(typeof config.adapter).toBe('function')
    expect(config.params).toEqual({ a: 1 })
  })
})

describe('createServiceApi', () => {
  it('delegates to the shared httpClient with the same URL', async () => {
    const api = createServiceApi('capabilities')
    const result = await api.get('/api/tenant/me/capabilities')
    expect(result.url).toBe('/api/tenant/me/capabilities')
    expect(typeof result.config.adapter).toBe('function')
  })
})
