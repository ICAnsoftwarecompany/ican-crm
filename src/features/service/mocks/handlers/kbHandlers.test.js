// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb, setActiveMockTemplate } from '../db'

const call = (method, url, data, { token, params } = {}) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params, headers: token ? { Authorization: `Bearer ${token}` } : {} }, { latency: 0 })
const A = '/api/tenant/service/kb/articles'
const P = '/api/portal'

async function portalToken() {
  const account = (await call('get', '/api/tenant/portal/accounts')).data.data[0]
  await call('post', `${P}/auth/otp`, { target: account.phone })
  return (await call('post', `${P}/auth/verify`, { target: account.phone, code: '123456' })).data.data.token
}

describe('knowledge base versions, review and self-service', () => {
  beforeEach(() => {
    localStorage.clear()
    setActiveMockTemplate('devices')
    resetMockDb()
  })

  it('versions content, keeps the live version while a draft is edited, and restores', async () => {
    const created = (await call('post', A, { title: 'Reset the device', body: 'Hold the button', category_id: 'kbc-faq', visibility: 'customer', type: 'troubleshooting' })).data.data
    expect(created).toMatchObject({ status: 'draft', version: 1, live: false })
    await expect(call('post', `${A}/${created.id}/reject`, { note: 'x' })).rejects.toMatchObject({ response: { status: 409 } })
    await call('post', `${A}/${created.id}/submit-review`, { reviewer_id: 'agent-1' })
    await expect(call('post', `${A}/${created.id}/reject`, {})).rejects.toMatchObject({ response: { status: 422 } })
    const published = (await call('post', `${A}/${created.id}/publish`)).data.data
    expect(published).toMatchObject({ status: 'published', published_version: 1, live: true })

    const edited = (await call('patch', `${A}/${created.id}`, { body: 'Hold the button for 10 seconds' })).data.data
    expect(edited).toMatchObject({ status: 'draft', version: 2, published_version: 1, has_unpublished_changes: true, live: true })
    const token = await portalToken()
    const seen = (await call('get', `${P}/kb/${created.id}`, null, { token })).data.data
    expect(seen.body).toBe('Hold the button')

    const restored = (await call('post', `${A}/${created.id}/versions/1/restore`)).data.data
    expect(restored).toMatchObject({ version: 3, body: 'Hold the button' })
    expect((await call('get', `${A}/${created.id}/versions/2`)).data.data.body).toBe('Hold the button for 10 seconds')
    const counts = (await call('get', A)).data.meta.counts
    expect(counts.changes).toBeGreaterThanOrEqual(1)
  })

  it('portal shows customer/public live articles only; public help shows public only', async () => {
    const token = await portalToken()
    const portal = (await call('get', `${P}/kb`, null, { token })).data
    const ids = portal.data.map((entry) => entry.id)
    expect(ids).toEqual(expect.arrayContaining(['kb-2', 'kb-4', 'kb-6']))
    expect(ids).not.toContain('kb-1') // agent
    expect(ids).not.toContain('kb-7') // in review, never published
    const publicList = (await call('get', `${P}/public/kb`)).data.data.map((entry) => entry.id)
    expect(publicList).toEqual(['kb-6'])
    await expect(call('get', `${P}/public/kb/kb-2`)).rejects.toMatchObject({ response: { status: 404 } })
  })

  it('suggests, counts votes and deflections, and reports content gaps', async () => {
    const token = await portalToken()
    const suggestions = (await call('get', `${P}/kb/suggest`, null, { token, params: { q: 'عايز استرجاع المنتج وعندي فاتورة' } })).data.data
    expect(suggestions[0].id).toBe('kb-4')
    await call('post', `${P}/kb/kb-4/vote`, { helpful: true }, { token })
    await call('post', `${P}/kb/deflections`, { article_id: 'kb-4', query: 'استرجاع' }, { token })
    await call('get', `${P}/kb`, null, { token, params: { search: 'zzzz nothing' } })
    const stats = (await call('get', '/api/tenant/service/kb/stats')).data.data
    expect(stats.deflections_30d).toBe(8)
    expect(stats.content_gaps.map((gap) => gap.query)).toContain('zzzz nothing')
    expect(stats.content_gaps[0]).toMatchObject({ count: 2 })
  })
})
