import { describe, expect, it } from 'vitest'
import { renderTemplate, repliesForCase } from './renderTemplate'

describe('renderTemplate', () => {
  it('fills known variables and keeps unknown ones', () => {
    const text = renderTemplate('Hi {{customer.name}} {{case.number}} {{ agent.name }} {{item.name}}', {
      caseItem: { customer: { name: 'Sara' }, case_number: 'CS-1' },
      agentName: 'Omar',
    })
    expect(text).toBe('Hi Sara CS-1 Omar {{item.name}}')
  })
})

describe('repliesForCase', () => {
  it('filters by case type and channel, empty lists mean all', () => {
    const replies = [
      { id: 'all' },
      { id: 'type', case_type_ids: ['t1'] },
      { id: 'other', case_type_ids: ['t2'] },
      { id: 'wa', channels: ['whatsapp'] },
      { id: 'off', active: false },
    ]
    const ids = repliesForCase(replies, { type: { id: 't1' }, source_channel: 'whatsapp' }).map((reply) => reply.id)
    expect(ids).toEqual(['all', 'type', 'wa'])
  })
})
