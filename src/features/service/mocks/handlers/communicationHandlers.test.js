// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { mockAdapter } from '../mockAdapter'
import { resetMockDb } from '../db'

const request = (method, url, data, params) =>
  mockAdapter({ method, url, data: data ? JSON.stringify(data) : undefined, params }, { latency: 0 })

const api = '/api/tenant/service'

async function openCase() {
  const { data } = await request('get', `${api}/cases`, null, { view: 'all', per_page: 100 })
  return data.data.find((item) => ['st-open', 'st-progress'].includes(item.status.id))
}

describe('replies, macros and knowledge base mock handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMockDb()
  })

  it('lists saved replies and macros', async () => {
    expect((await request('get', `${api}/saved-replies`)).data.data.length).toBeGreaterThan(0)
    expect((await request('get', `${api}/macros`)).data.data.length).toBeGreaterThan(0)
  })

  it('applies a macro: status change + rendered reply + activity', async () => {
    const item = await openCase()
    const { data } = await request('post', `${api}/cases/${item.id}/apply-macro`, { macro_id: 'macro-need-info', version: item.version, language: 'en' })
    expect(data.data.status.key).toBe('pending_customer')
    expect(data.data.sla.state).toBe('paused')
    const activities = (await request('get', `${api}/cases/${item.id}/activities`)).data.data
    expect(activities.some((entry) => entry.type === 'macro_applied')).toBe(true)
    expect(activities.some((entry) => entry.type === 'reply' && entry.body.startsWith('Please send'))).toBe(true)
  })

  it('rejects a macro on a stale version', async () => {
    const item = await openCase()
    await expect(request('post', `${api}/cases/${item.id}/apply-macro`, { macro_id: 'macro-escalate', version: item.version - 1 })).rejects.toMatchObject({
      response: { status: 409, data: { code: 'CONFLICT_VERSION' } },
    })
  })

  it('creates articles as drafts, publishes them and filters by status', async () => {
    const created = await request('post', `${api}/kb/articles`, { title: 'New', body: 'Body', category_id: 'kbc-faq', status: 'published' })
    expect(created.data.data.status).toBe('draft')
    const published = await request('post', `${api}/kb/articles/${created.data.data.id}/publish`)
    expect(published.data.data.status).toBe('published')
    const drafts = (await request('get', `${api}/kb/articles`, null, { status: 'draft' })).data.data
    drafts.forEach((article) => expect(article.status).toBe('draft'))
  })

  it('suggests only published articles', async () => {
    const { data } = await request('get', `${api}/cases`, null, { view: 'all', per_page: 100 })
    for (const item of data.data.slice(0, 10)) {
      const suggested = (await request('get', `${api}/cases/${item.id}/suggested-articles`)).data.data
      suggested.forEach((article) => expect(article.status).toBe('published'))
    }
  })

  it('refuses to delete a KB category that has articles', async () => {
    await expect(request('delete', `${api}/kb/categories/kbc-faq`)).rejects.toMatchObject({ response: { status: 409 } })
  })
})
