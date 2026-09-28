import { describe, expect, it } from 'vitest'
import { mergeInfoIntoCachedResponse, upsertMessageIntoCachedResponse } from './messengerCachedResponses'

const existing = { id: 'm_1', body: 'Hello', status: 'sent' }
const update = { id: 'm_1', status: 'read' }
const added = { id: 'm_2', body: 'New' }

describe('upsertMessageIntoCachedResponse', () => {
  it.each([
    ['array', [existing], (messages) => messages],
    ['{ data: [] }', { success: true, data: [existing] }, (messages) => ({ success: true, data: messages })],
    ['{ messages: [] }', { messages: [existing] }, (messages) => ({ messages })],
  ])('keeps the %s response shape', (_, current, wrap) => {
    expect(upsertMessageIntoCachedResponse(current, update)).toEqual(wrap([{ ...existing, status: 'read' }]))
    expect(upsertMessageIntoCachedResponse(current, added)).toEqual(wrap([existing, added]))
  })

  it('keeps the paginated { data: { data: [] } } shape', () => {
    const current = { data: { data: [existing], meta: { total: 1 } } }
    expect(upsertMessageIntoCachedResponse(current, added)).toEqual({ data: { data: [existing, added], meta: { total: 1 } } })
  })

  it('starts a list when the cache is empty', () => {
    expect(upsertMessageIntoCachedResponse(undefined, added)).toEqual([added])
  })
})

describe('mergeInfoIntoCachedResponse', () => {
  it('returns the cache untouched without a patch', () => {
    const current = { data: { id: 51 } }
    expect(mergeInfoIntoCachedResponse(current, null)).toBe(current)
  })

  it('wraps the patch when nothing is cached', () => {
    expect(mergeInfoIntoCachedResponse(undefined, { id: 51 })).toEqual({ success: true, data: { id: 51 } })
  })

  it('merges into { data } or into the flat object', () => {
    expect(mergeInfoIntoCachedResponse({ success: true, data: { id: 51, status: 'open' } }, { status: 'closed' }))
      .toEqual({ success: true, data: { id: 51, status: 'closed' } })
    expect(mergeInfoIntoCachedResponse({ id: 51, status: 'open' }, { status: 'closed' })).toEqual({ id: 51, status: 'closed' })
  })
})
