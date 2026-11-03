import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../services/httpClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import httpClient from '../../../services/httpClient'
import { mentionsApi } from './mentionsApi'

describe('mentionsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    httpClient.get.mockResolvedValue({ data: { success: true } })
    httpClient.post.mockResolvedValue({ data: { success: true } })
    httpClient.delete.mockResolvedValue({ data: { success: true } })
  })

  it('fetches entity mentions through query parameters', async () => {
    await mentionsApi.getEntity('deal', 42)
    expect(httpClient.get).toHaveBeenCalledWith('/api/tenant/mentions/entity', {
      params: { entity_type: 'deal', entity_id: 42 },
    })
  })

  it('creates a mention without rewriting the backend payload', async () => {
    const payload = { entity_type: 'lead', entity_id: 21, type: 'view' }
    await mentionsApi.create(payload)
    expect(httpClient.post).toHaveBeenCalledWith('/api/tenant/mentions', payload)
  })

  it('marks a single mention seen', async () => {
    await mentionsApi.markSeen(7)
    expect(httpClient.post).toHaveBeenCalledWith('/api/tenant/mentions/7/seen')
  })

  it('marks many mentions seen using the documented endpoint', async () => {
    const payload = { entity_type: 'deal', entity_id: 12 }
    await mentionsApi.markManySeen(payload)
    expect(httpClient.post).toHaveBeenCalledWith('/api/tenant/mentions/seen', payload)
  })

  it('removes a mention', async () => {
    await mentionsApi.remove(7)
    expect(httpClient.delete).toHaveBeenCalledWith('/api/tenant/mentions/7')
  })
})
