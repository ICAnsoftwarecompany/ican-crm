import { expect, it, vi } from 'vitest'
vi.mock('../tasks', async () => import('../tasks/utils/taskPayload'))
import { buildLeadTaskPayload, createLeadTaskCopies, leadTaskTargets } from './leadTaskModel'

it('uses real lead IDs, deduplicates them and never falls back to customer or deal pivot IDs', () => {
  expect(leadTaskTargets([{ id: 70, lead_id: 15, name: 'A' }, { lead: { id: 15 } }, { id: 88 }, null])).toEqual([{ id: '15', name: 'A', dealId: undefined, dealLeadId: null }])
  expect(leadTaskTargets([{ id: 101, leadId: 15, name: 'A' }], 14)[0]).toMatchObject({ id: '15', dealId: 14, dealLeadId: 101 })
})

it('uses supported task fields and preserves checklist, file, priority and deal context', () => {
  const file = { name: 'quote.pdf' }
  const result = buildLeadTaskPayload({ title: ' Call ', description: 'Details', priority: 'urgent', due_date: '2026-10-25', due_time: '14:30', reminder: true, reminder_before: '15', items: [{ text: 'First', done: false }, { text: 'Second', done: true }, { text: ' ', done: false }], attachments: [file] }, { id: '15', dealId: 14, dealLeadId: 101 }, 2)
  expect(result).toMatchObject({ title: 'Call', type: 'follow_up', taskable_type: 'App\\Models\\Lead', taskable_id: '15', priority: 'urgent', users: [2], reminder_before: '15', attachments: [file] })
  expect(result.description).toBe('Details\n\n- [ ] First\n- [x] Second\n\n/deals/14/leads/101')
  expect(buildLeadTaskPayload({ title: 'Undated', reminder: false, reminder_before: '30' }, { id: '15' }, 2)).toMatchObject({ due_date: '', due_time: '', reminder_before: '' })
  expect(buildLeadTaskPayload({ title: 'Date only', due_date: '2026-10-25', reminder: true, reminder_before: '30' }, { id: '15' }, 2).reminder_before).toBe('')
})

it('retries only unfinished copies after partial failure', async () => {
  const done = new Set()
  const targets = [{ id: '1' }, { id: '2' }, { id: '3' }]
  const create = vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Unavailable'))
  await expect(createLeadTaskCopies(targets, done, create, (target) => target)).rejects.toThrow('Unavailable')
  expect([...done]).toEqual(['1'])
  const retry = vi.fn().mockResolvedValue({})
  await createLeadTaskCopies(targets, done, retry, (target) => target)
  expect(retry.mock.calls.map(([payload]) => payload.id)).toEqual(['2', '3'])
  expect([...done]).toEqual(['1', '2', '3'])
})
