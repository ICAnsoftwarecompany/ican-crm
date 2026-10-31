import { describe, expect, it, vi } from 'vitest'
import { fetchAllCustomers, readCustomerFile } from './customerTransfer'
const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('../../../services/httpClient', () => ({ default: { get } }))

describe('customer file transfer', () => {
  it('exports all cursor pages rather than just loaded table rows', async () => {
    get.mockResolvedValueOnce({ data: { data: [{ id: 1 }], has_more: true, next_cursor: 'next' } }).mockResolvedValueOnce({ data: { data: [{ id: 2 }], has_more: false } })
    expect(await fetchAllCustomers()).toEqual([{ id: 1 }, { id: 2 }])
    expect(get).toHaveBeenLastCalledWith('/api/tenant/customers/data', { params: { cursor: 'next' } })
  })
  it('parses CSV with a structured parser and preserves leading phone zeroes', async () => {
    const file = { arrayBuffer: async () => new TextEncoder().encode('name,phone,email\nAhmed,012345,ahmed@example.com').buffer }
    expect(await readCustomerFile(file)).toEqual([expect.objectContaining({ name: 'Ahmed', phone: '012345' })])
  })
})
