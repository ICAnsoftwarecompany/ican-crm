import { describe, expect, it } from 'vitest'
import { extractMentions } from './normalizeMentions'

describe('extractMentions', () => {
  it('handles arrays and paginated wrappers', () => {
    const list = [{ id: 1 }]
    expect(extractMentions(list)).toEqual(list)
    expect(extractMentions({ data: list })).toEqual(list)
    expect(extractMentions({ data: { data: list } })).toEqual(list)
    expect(extractMentions({ data: { mentions: list } })).toEqual(list)
  })
  it('returns an empty list for missing or unknown responses', () => {
    expect(extractMentions(null)).toEqual([])
    expect(extractMentions({ success: false })).toEqual([])
  })
})
