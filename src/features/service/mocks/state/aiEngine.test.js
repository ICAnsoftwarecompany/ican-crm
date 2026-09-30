import { describe, expect, it } from 'vitest'
import { assignmentSuggestions, draftReply, duplicates, signals, summarize, triage } from './aiEngine'

const types = [
  { id: 'ct-maintenance', key: 'maintenance', default_priority: 'high' },
  { id: 'ct-billing', key: 'billing', default_priority: 'low' },
  { id: 'ct-complaint', key: 'complaint', default_priority: 'high' },
]

describe('aiEngine (demo)', () => {
  it('reads sentiment, urgency and sensitive topics in Arabic and English', () => {
    expect(signals('الجهاز بايظ ومش شغال وعايز حد ييجي حالا')).toMatchObject({ sentiment: 'negative', urgency: 'high' })
    expect(signals('I want a refund, this is the worst service')).toMatchObject({ sentiment: 'negative', topics: ['money'] })
    expect(signals('شكرا جدا الخدمة ممتازة')).toMatchObject({ sentiment: 'positive', urgency: 'low' })
    expect(signals('عايز الغي الاشتراك').topics).toContain('cancellation')
  })

  it('triages to a type with confidence and reasons, never deciding alone', () => {
    const result = triage('التكييف فيه عطل ومحتاج صيانة', types)
    expect(result).toMatchObject({ type_id: 'ct-maintenance', priority: 'high' })
    expect(result.confidence).toBeGreaterThan(0.6)
    expect(result.reasons).toEqual(expect.arrayContaining(['عطل', 'صيانة']))
    expect(triage('hello there', types)).toMatchObject({ type_id: null, confidence: 0 })
  })

  it('summarizes who is waiting and finds duplicates', () => {
    const item = { id: 'a', subject: 'التكييف مش شغال', description: 'التكييف مش شغال من امبارح.', customer: { id: 'c1' }, type_id: 't' }
    const summary = summarize(item, [{ type: 'inbound', body: 'لسه مش شغال', occurred_at: '2' }, { type: 'reply', body: 'هنبعت فني', occurred_at: '1' }])
    expect(summary).toMatchObject({ ask: 'التكييف مش شغال من امبارح', waiting_on: 'team', customer_messages: 1, replies: 1 })
    const found = duplicates(item, [item, { id: 'b', subject: 'التكييف مش شغال خالص', customer: { id: 'c1' }, type_id: 't' }, { id: 'c', subject: 'فاتورة', customer: { id: 'c2' }, type_id: 'x' }])
    expect(found.map((entry) => entry.case.id)).toEqual(['b'])
    expect(found[0].reasons).toEqual(expect.arrayContaining(['same_customer', 'similar_text']))
  })

  it('ranks agents by portfolio, queue and load; drafts a reply with KB steps', () => {
    const ranked = assignmentSuggestions({ assignee_id: null }, { agents: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }], openLoad: { a1: 5, a2: 1, a3: 0 }, queueAgentIds: ['a2'], portfolioOwnerId: 'a1' })
    expect(ranked.map((entry) => entry.agent.id)).toEqual(['a1', 'a2', 'a3'])
    const draft = draftReply({ subject: 'Refund', customer: { name: 'Sara Ali' } }, { article: { body: 'Attach the invoice\nWe reply in 2 days' }, language: 'en', tone: 'formal' })
    expect(draft.body).toContain('Dear Sara')
    expect(draft.body).toContain('- Attach the invoice')
  })
})
