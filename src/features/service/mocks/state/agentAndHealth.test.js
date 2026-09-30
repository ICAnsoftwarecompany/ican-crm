import { describe, expect, it } from 'vitest'
import { agentReply, detectIntent } from './aiAgent'
import { healthScore } from './healthScore'
import { prorate } from './proration'

const settings = { blocked_topics: ['lawyer'], handoff_topics: ['money', 'complaint', 'cancellation'] }
const tools = {
  records: () => [{ reference: 'SH-1', status: 'Out for delivery', expected_at: '2026-10-02' }],
  nextPayment: () => ({ amount: '1,500 EGP', date: '2026-10-05' }),
  openCases: () => [],
  searchKb: (q) => (q.includes('ساعات') ? { id: 'kb', title: 'مواعيد العمل', body: 'من 9 لـ 5', score: 4 } : null),
}

describe('AI agent (demo)', () => {
  it('answers from customer-scoped tools', () => {
    expect(detectIntent(' شحنتي فين ')).toBe('record_status')
    expect(agentReply({ message: 'شحنتي فين؟', settings, tools })).toMatchObject({ handoff: false, tools_used: ['read_records'], text: expect.stringContaining('SH-1') })
    expect(agentReply({ message: 'when is my next installment?', settings, tools }).text).toContain('1,500 EGP')
    expect(agentReply({ message: 'مواعيد العمل كام ساعات', settings, tools })).toMatchObject({ tools_used: ['search_kb'] })
  })

  it('hands over on request, sensitive topics, blocked words and repeated low confidence', () => {
    expect(agentReply({ message: 'عايز اكلم موظف', settings, tools })).toMatchObject({ handoff: true, handoff_reason: 'customer_asked' })
    expect(agentReply({ message: 'I want a refund', settings, tools })).toMatchObject({ handoff: true, handoff_reason: 'sensitive_money' })
    expect(agentReply({ message: 'my lawyer will call', settings, tools })).toMatchObject({ handoff: true, handoff_reason: 'blocked_topic' })
    expect(agentReply({ message: 'blue sky', settings, tools })).toMatchObject({ handoff: false, unsure: true })
    expect(agentReply({ message: 'blue sky', settings, tools, unsureCount: 1 })).toMatchObject({ handoff: true, handoff_reason: 'low_confidence' })
  })
})

describe('health score', () => {
  it('scores and explains', () => {
    const good = healthScore({ openCases: 0, negativeSignals: 0, csatAverage: 5, lastNps: 10, overdueLines: 0, subscriptionTrouble: false, activity90d: 3, followUpIssues: 0 })
    expect(good).toMatchObject({ band: 'healthy' })
    expect(good.score).toBeGreaterThanOrEqual(90)
    const bad = healthScore({ openCases: 3, negativeSignals: 2, csatAverage: 2, lastNps: 3, overdueLines: 2, subscriptionTrouble: true, activity90d: 1, followUpIssues: 1 })
    expect(bad.band).toBe('at_risk')
    expect(bad.factors[0].key).toBe('overdue_payments')
  })
})

describe('proration', () => {
  it('credits the unused old price and charges the unused new price', () => {
    expect(prorate({ periodStart: '2026-10-01', periodEnd: '2026-10-31', oldPrice: 300, newPrice: 600, today: '2026-10-16' })).toEqual({ period_days: 30, days_left: 15, credit_unused: 150, charge_new: 300, net: 150 })
    expect(prorate({ periodStart: '2026-10-01', periodEnd: '2026-10-31', oldPrice: 600, newPrice: 300, today: '2026-10-31' }).net).toBe(0)
  })
})
