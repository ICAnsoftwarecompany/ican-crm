import { describe, expect, it } from 'vitest'
import { mockAdapter } from './mockAdapter'
import { MockHttpError } from './errors'

const routes = [
  { method: 'GET', path: '/api/tenant/service/items/:id', handler: ({ params }) => ({ data: { id: params.id } }) },
  { method: 'POST', path: '/api/tenant/service/items', handler: ({ body }) => ({ status: 201, body: { data: body } }) },
  {
    method: 'PATCH',
    path: '/api/tenant/service/items/:id',
    handler: () => {
      throw new MockHttpError(409, 'CONFLICT_VERSION', 'Stale version')
    },
  },
]

const options = { routes, latency: 0 }

describe('mockAdapter', () => {
  it('returns handler data with params', async () => {
    const response = await mockAdapter({ method: 'get', url: '/api/tenant/service/items/5' }, options)
    expect(response.status).toBe(200)
    expect(response.data).toEqual({ data: { id: '5' } })
  })

  it('supports custom status and parses JSON bodies', async () => {
    const response = await mockAdapter(
      { method: 'post', url: '/api/tenant/service/items', data: JSON.stringify({ name: 'x' }) },
      options
    )
    expect(response.status).toBe(201)
    expect(response.data).toEqual({ data: { name: 'x' } })
  })

  it('rejects with the unified backend error shape', async () => {
    await expect(mockAdapter({ method: 'patch', url: '/api/tenant/service/items/5' }, options)).rejects.toMatchObject({
      response: { status: 409, data: { success: false, code: 'CONFLICT_VERSION' } },
    })
  })

  it('rejects unknown routes with 404', async () => {
    await expect(mockAdapter({ method: 'get', url: '/api/tenant/service/unknown' }, options)).rejects.toMatchObject({
      response: { status: 404, data: { code: 'MOCK_ROUTE_NOT_FOUND' } },
    })
  })
})
