import { describe, expect, it } from 'vitest'
import { buildQuickTaskPayload, quickTaskValues } from './taskQuickAdd'

const NOW = new Date(2026, 9, 7, 10, 0)

describe('quick task', () => {
  it('a title is enough: a follow-up due today, shared, assigned to me, no link, no reminder', () => {
    expect(buildQuickTaskPayload({ title: '  Call back Mona ' }, { currentUserId: 9, now: NOW })).toMatchObject({
      title: 'Call back Mona',
      type: 'follow_up',
      visibility: 'shared',
      due_date: '2026-10-07',
      due_time: '',
      reminder_before: '',
      taskable_type: '',
      taskable_id: '',
      users: [9],
    })
  })

  it('kind and when', () => {
    expect(buildQuickTaskPayload({ title: 'x', type: 'call', when: 'tomorrow' }, { now: NOW })).toMatchObject({ type: 'call', due_date: '2026-10-08' })
    expect(buildQuickTaskPayload({ title: 'x', when: 'none' }, { now: NOW })).toMatchObject({ due_date: '' })
    expect(buildQuickTaskPayload({ title: 'x', type: 'todo' }, { now: NOW }).type).toBe('follow_up')
  })

  it('"More details" carries the same values into the full form', () => {
    expect(quickTaskValues({ title: 'Offer', type: 'meeting', when: 'today' }, NOW)).toMatchObject({ title: 'Offer', type: 'meeting', due_date: '2026-10-07' })
  })
})
