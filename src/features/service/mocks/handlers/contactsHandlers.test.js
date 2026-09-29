// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const request = (method, url, data) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined }, { latency: 0 })

describe('contacts mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('returns the primary contact first with its role', async () => {
    const contacts = (await request('get', '/api/tenant/customers/cust-1/contacts')).data.data
    expect(contacts[0].is_primary).toBe(true)
    expect(contacts[0].role?.key).toBeTruthy()
  })

  it('seeds guardian_of relationships for the school template', async () => {
    setActiveMockTemplate('school')
    const contacts = (await request('get', '/api/tenant/customers/cust-1/contacts')).data.data
    const guardian = contacts.find((contact) => contact.is_primary)
    expect(guardian.relationships[0]).toMatchObject({ relation_type: 'guardian_of', to_contact: { name: expect.any(String) } })
  })

  it('creates a related contact and validates role', async () => {
    await expect(request('post', '/api/tenant/customers/cust-2/contacts', { name: 'X', role_key: 'nope' })).rejects.toMatchObject({
      response: { status: 422, data: { errors: { role_key: ['required'] } } },
    })
    const setup = (await request('get', '/api/tenant/contacts/setup')).data.data
    const [primary] = (await request('get', '/api/tenant/customers/cust-2/contacts')).data.data
    await request('post', '/api/tenant/customers/cust-2/contacts', {
      name: 'New person',
      role_key: setup.roles[0].key,
      relation: { from_contact_id: primary.id, relation_type: 'manager_of' },
    })
    const after = (await request('get', '/api/tenant/customers/cust-2/contacts')).data.data
    expect(after.find((contact) => contact.id === primary.id).relationships.some((relation) => relation.to_contact?.name === 'New person')).toBe(true)
  })

  it('serves an empty list for unknown (real) customers', async () => {
    const contacts = (await request('get', '/api/tenant/customers/98765/contacts')).data.data
    expect(contacts).toEqual([])
  })
})
