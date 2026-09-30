import { describe, expect, it } from 'vitest'
import { ensureVersioned, isLive, liveContent, rankArticles } from './kbLive'

const article = (extra) => ensureVersioned({ id: 'a', title: 'Refund policy', body: 'Ask for the invoice', status: 'published', version: 1, visibility: 'customer', updated_at: '2026-01-01T00:00:00Z', ...extra })

describe('kbLive', () => {
  it('serves the published version even while a newer draft exists', () => {
    const item = article()
    item.versions.push({ version: 2, title: 'Refund policy (draft)', body: 'New text' })
    Object.assign(item, { version: 2, title: 'Refund policy (draft)', status: 'draft' })
    expect(liveContent(item)).toMatchObject({ title: 'Refund policy', version: 1 })
    expect(isLive(item)).toBe(true)
  })

  it('hides archived, expired and never-published articles', () => {
    expect(isLive(article({ status: 'archived' }))).toBe(false)
    expect(isLive(article({ expires_at: '2020-01-01T00:00:00Z' }))).toBe(false)
    expect(isLive(article({ status: 'draft' }))).toBe(false)
  })

  it('ranks by title words, body words and case type', () => {
    const a = article({ id: 'a', related_case_type_ids: ['ct-1'] })
    const b = article({ id: 'b', title: 'Delivery times', body: 'refund after delivery' })
    expect(rankArticles([a, b], 'refund please', { typeId: 'ct-1' }).map((entry) => entry.article.id)).toEqual(['a', 'b'])
    expect(rankArticles([a, b], 'nothing here')).toEqual([])
  })
})
