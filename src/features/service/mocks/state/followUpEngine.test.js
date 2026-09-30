import { describe, expect, it } from 'vitest'
import { bucketOf, dueAt, parseOffset, parseRule, recordOutcome } from './followUpEngine'

const DAY = 24 * 60 * 60 * 1000
const program = {
  steps: [
    { key: 'a', offset: '+2 day', outcomes: ['ok', 'no_answer', 'issue'], on_outcome: { no_answer: 'retry:+1 day:2', issue: 'create_case:ct-complaint' } },
    { key: 'b', offset: '-7 day from end', outcomes: ['ok'] },
  ],
}
const enroll = () => ({ status: 'active', current_step: 'a', attempts: 0, retry_due_at: null, started_at: '2026-10-01T09:00:00.000Z', subject_ends_at: '2026-12-01T09:00:00.000Z', history: [] })

describe('followUpEngine', () => {
  it('parses offsets and rules', () => {
    expect(parseOffset('+7 day')).toEqual({ ms: 7 * DAY, fromEnd: false })
    expect(parseOffset('-30 day from end')).toEqual({ ms: -30 * DAY, fromEnd: true })
    expect(parseOffset('soon')).toBeNull()
    expect(parseRule('retry:+1 day:2')).toMatchObject({ type: 'retry', max: 2 })
    expect(parseRule('create_case:ct-x')).toEqual({ type: 'create_case', caseTypeId: 'ct-x' })
  })

  it('computes due dates from start or from the subject end', () => {
    const enrollment = enroll()
    expect(dueAt(enrollment, program)).toBe('2026-10-03T09:00:00.000Z')
    enrollment.current_step = 'b'
    expect(dueAt(enrollment, program)).toBe('2026-11-24T09:00:00.000Z')
  })

  it('retries up to the max, then advances', () => {
    const enrollment = enroll()
    const now = Date.parse('2026-10-03T10:00:00.000Z')
    expect(recordOutcome(enrollment, program, { outcome: 'no_answer', now }).effect).toBe('retry')
    expect(dueAt(enrollment, program)).toBe('2026-10-04T10:00:00.000Z')
    recordOutcome(enrollment, program, { outcome: 'no_answer', now })
    expect(recordOutcome(enrollment, program, { outcome: 'no_answer', now }).effect).toBe('advanced')
    expect(enrollment).toMatchObject({ current_step: 'b', attempts: 0, retry_due_at: null })
    expect(enrollment.history).toHaveLength(3)
  })

  it('opens a case on an issue and completes after the last step', () => {
    const enrollment = enroll()
    expect(recordOutcome(enrollment, program, { outcome: 'issue' })).toEqual({ effect: 'advanced', caseTypeId: 'ct-complaint' })
    expect(recordOutcome(enrollment, program, { outcome: 'ok' }).effect).toBe('completed')
    expect(enrollment.status).toBe('completed')
    expect(dueAt(enrollment, program)).toBeNull()
  })

  it('buckets by local day', () => {
    const now = new Date(2026, 9, 5, 12).getTime()
    expect(bucketOf(new Date(2026, 9, 4, 23).toISOString(), now)).toBe('overdue')
    expect(bucketOf(new Date(2026, 9, 5, 8).toISOString(), now)).toBe('due_today')
    expect(bucketOf(new Date(2026, 9, 6, 1).toISOString(), now)).toBe('upcoming')
  })
})
